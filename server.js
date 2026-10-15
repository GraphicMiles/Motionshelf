import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {loadCatalog,validateResource} from './validation.js';
import {db,credentials,identity,published,verifyUpstream,burstAllowed,turnstile} from './moderation.js';
const allowedOrigin=process.env.FRONTEND_ORIGIN || '';
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
async function parse(req){if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))throw Object.assign(Error('Submit JSON metadata. File uploads are not supported.'),{status:415});let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>30000)throw Object.assign(Error('Submission too large'),{status:413});chunks.push(chunk)}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw Object.assign(Error('Invalid JSON'),{status:400})}}
const error=(res,e)=>{if(e.status&&[400,413,415].includes(e.status))return json(res,e.status,{errors:[e.message]});console.error('API dependency failure:',e.name,e.status||'');return json(res,502,{errors:['Service temporarily unavailable. Please retry later.']})};
export const server=http.createServer(async(req,res)=>{
 const origin=req.headers.origin;
 if(origin&&allowedOrigin&&origin===allowedOrigin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');}
 if(req.method==='OPTIONS'){res.writeHead(origin===allowedOrigin?204:403);return res.end()}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&pathname==='/health')return json(res,200,{status:'ok'});
 if(req.method==='GET'&&pathname==='/health/storage'){
  try{const snapshot=await db('/rest/v1/rpc/motionshelf_storage_snapshot',{method:'POST'});const percent=Math.round(snapshot.databaseBytes/(500*1024*1024)*100);const status=percent>=80?'critical':percent>=70?'warning':'ok';return json(res,status==='critical'?503:200,{status,storage:'reachable',databaseBytes:snapshot.databaseBytes,quotaBytes:500*1024*1024,percent,pending:snapshot.pending,oldestPending:snapshot.oldestPending,budgetThisHour:snapshot.budgetThisHour||0})}catch(e){return json(res,503,{status:'degraded',storage:'unavailable'})}
 }
 if(req.method==='GET'&&pathname==='/api/resources'){
  try{return json(res,200,await published())}catch(e){console.error('Catalog storage failure:',e.name,e.status||'');return json(res,200,loadCatalog())}
 }
 if(pathname.startsWith('/api/')&&origin&&allowedOrigin&&origin!==allowedOrigin)return json(res,403,{errors:['Origin not allowed']});
 if(req.method==='POST'&&pathname==='/api/submissions'){
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||''))return json(res,415,{errors:['Submit JSON metadata. File uploads are not supported.']});
  if(!burstAllowed(req))return json(res,429,{errors:['Too many attempts. Try again in 10 minutes.']});
  try{
   const data=await parse(req);const errors=validateResource(data,loadCatalog());if(errors.length)return json(res,422,{errors});
  if(!credentials().url||!credentials().key)return json(res,503,{errors:['Submission storage is not configured']});
  if(process.env.RENDER&&!credentials().url.startsWith('https://'))return json(res,503,{errors:['Submission storage URL must use HTTPS']});
   const budget=await db('/rest/v1/rpc/motionshelf_take_budget',{method:'POST',body:{p_limit:120}});
   if(budget!==true)return json(res,429,{errors:['Submission capacity reached. Try again next hour.']});
   const ip=(req.headers['x-forwarded-for']||'').split(',').at(-1)?.trim()||req.socket.remoteAddress;
   if(!await turnstile(data.turnstileToken,ip))return json(res,403,{errors:['Bot check failed or expired. Please retry.']});
   const metadata=Object.fromEntries(Object.entries(data).filter(([key])=>key!=='turnstileToken'));
   try{await db('/rest/v1/resource_submissions',{method:'POST',headers:{Prefer:'return=minimal'},body:{slug:data.slug,repository:data.repository.toLowerCase(),metadata:{...metadata,verified:{repository:false,license:false}},status:'pending'}})}
   catch(e){if(e.status===409)return json(res,409,{errors:['Duplicate slug or repository']});throw e}
   return json(res,201,{message:'Submission saved for review. It is not published or verified yet.',slug:data.slug});
  }catch(e){return error(res,e)}
 }
 if(req.method==='POST'&&pathname==='/api/admin/login'){
  if(!burstAllowed(req))return json(res,429,{errors:['Too many login attempts. Try again later.']});
  try{const body=await parse(req);if(typeof body.email!=='string'||typeof body.password!=='string'||body.password.length>256)return json(res,400,{errors:['Invalid credentials']});
   const {url,key}=credentials();if(!url||!key)throw Error('Storage not configured');
   const response=await fetch(new URL('/auth/v1/token?grant_type=password',url),{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email:body.email,password:body.password}),signal:AbortSignal.timeout(10000)});
   if(!response.ok)return json(res,401,{errors:['Invalid credentials']});const session=await response.json();
   const user=await identity(session.access_token);if(!user)return json(res,403,{errors:['Not authorized as a maintainer']});
   return json(res,200,{access_token:session.access_token,expires_in:session.expires_in,email:user.email});
  }catch(e){return error(res,e)}
 }
 if(pathname.startsWith('/api/admin/')){
  const token=/^Bearer (\S+)$/i.exec(req.headers.authorization||'')?.[1];
  try{
   const user=await identity(token);if(!user)return json(res,401,{errors:['Maintainer authentication required']});
   if(req.method==='POST'&&pathname==='/api/admin/password'){
    const body=await parse(req);if(typeof body.password!=='string'||body.password.length<12||body.password.length>128)return json(res,422,{errors:['Use a password of 12–128 characters']});
    const {url,key}=credentials();const response=await fetch(new URL('/auth/v1/user',url),{method:'PUT',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({password:body.password}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Password update failed');return json(res,200,{message:'Password set. Sign in to review submissions.'});
   }
   if(req.method==='GET'&&pathname==='/api/admin/submissions'){
    const rows=await db('/rest/v1/resource_submissions?select=id,slug,repository,metadata,status,created_at,verification,reviewed_at&order=created_at.desc&limit=100');return json(res,200,rows);
   }
   if(req.method==='POST'&&/^\/api\/admin\/submissions\/\d+\/decision$/.test(pathname)){
    const id=Number(pathname.split('/')[4]);if(!Number.isSafeInteger(id)||id<1)return json(res,400,{errors:['Invalid submission ID']});
    const body=await parse(req);if(!['approved','rejected'].includes(body.decision))return json(res,422,{errors:['Invalid decision']});
    const rows=await db(`/rest/v1/resource_submissions?id=eq.${id}&select=id,metadata,status&limit=1`);const row=rows?.[0];if(!row||row.status!=='pending')return json(res,409,{errors:['Submission is no longer pending']});
    const verification=await verifyUpstream(row.metadata);
    if(body.decision==='approved'&&!verification.ok)return json(res,422,{errors:['Upstream verification failed',...(verification.errors||[])]});
    if(body.decision==='approved'){
     const current=await published();const duplicate=validateResource(row.metadata,current);if(duplicate.length)return json(res,422,{errors:duplicate});
    }
    const done=await db('/rest/v1/rpc/motionshelf_decide',{method:'POST',body:{p_id:id,p_reviewer:user.id,p_decision:body.decision,p_verification:verification}});
    if(!done)return json(res,409,{errors:['Submission already reviewed']});return json(res,200,{message:body.decision==='approved'?'Published to the catalog.':'Submission rejected.',verification});
   }
   return json(res,404,{errors:['Not found']});
  }catch(e){return error(res,e)}
 }
 return json(res,404,{errors:['Not found']});
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('MotionShelf API listening on '+(process.env.PORT||3000)));
