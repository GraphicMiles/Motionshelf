import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {loadCatalog,validateResource} from './validation.js';
const allowedOrigin=process.env.FRONTEND_ORIGIN || '';
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
export const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  if(origin && allowedOrigin && origin===allowedOrigin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}
  if(req.method==='OPTIONS'){res.writeHead(origin===allowedOrigin?204:403);return res.end();}
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(req.method==='GET' && pathname==='/health')return json(res,200,{status:'ok'});
  if(req.method==='GET' && pathname==='/api/resources')return json(res,200,loadCatalog());
  if(req.method==='POST' && pathname==='/api/submissions') {
    if(origin && allowedOrigin && origin!==allowedOrigin)return json(res,403,{errors:['Origin not allowed']});
    let body=''; try {for await(const chunk of req){body+=chunk;if(body.length>30000)throw Error('Submission too large');}const data=JSON.parse(body);
      const errors=validateResource(data,loadCatalog());if(errors.length)return json(res,422,{errors});
      const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if(!url || !key)return json(res,503,{errors:['Submission storage is not configured']});
      if(process.env.RENDER && !url.startsWith('https://'))return json(res,503,{errors:['Submission storage URL must use HTTPS']});
      const endpoint=new URL('/rest/v1/resource_submissions',url).toString();
      const headers={apikey:key,'Content-Type':'application/json',Prefer:'return=minimal'};
      if(!key.startsWith('sb_secret_'))headers.Authorization=`Bearer ${key}`;
      const response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({slug:data.slug,repository:data.repository.toLowerCase(),metadata:{...data,verified:{repository:false,license:false}},status:'pending'}),signal:AbortSignal.timeout(10000)});
      if(response.status===409)return json(res,409,{errors:['Duplicate slug or repository']});
      if(!response.ok){console.error('Submission storage error:',response.status);return json(res,502,{errors:['Submission storage unavailable. Please retry later.']});}
      return json(res,201,{message:'Submission saved for review. It is not published or verified yet.',slug:data.slug});
    }catch(e){if(e.name==='TimeoutError' || e.name==='AbortError' || e instanceof TypeError){console.error('Submission storage request failed:',e.name);return json(res,502,{errors:['Submission storage unavailable. Please retry later.']});}return json(res,e.message==='Submission too large'?413:400,{errors:[e.message]});}
  }
  return json(res,404,{errors:['Not found']});
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('MotionShelf API listening on '+(process.env.PORT||3000)));
