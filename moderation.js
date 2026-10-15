import {createHash} from 'node:crypto';
import {validateResource,loadCatalog} from './validation.js';
export const credentials=()=>({url:process.env.SUPABASE_URL,key:process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY});
export async function db(path,{method='GET',body,headers={}}={}){
 const {url,key}=credentials();if(!url||!key||process.env.RENDER&&!url.startsWith('https://'))throw Error('Storage not configured');
 const h={apikey:key,...headers};if(!key.startsWith('sb_secret_'))h.Authorization=`Bearer ${key}`;
 const response=await fetch(new URL(path,url),{method,headers:{...h,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
 if(!response.ok){const e=Error('Storage request failed');e.status=response.status;throw e;}
 return response.status===204||method==='HEAD'||headers.Prefer==='return=minimal'?null:response.json();
}
export async function identity(token){
 if(!token||token.length>4096)return null;
 const {url,key}=credentials();if(!url||!key)return null;
 const res=await fetch(new URL('/auth/v1/user',url),{headers:{apikey:key,Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)});
 if(!res.ok)return null;
 const user=await res.json();if(!user.id||!user.email_confirmed_at)return null;
 const rows=await db(`/rest/v1/motionshelf_maintainers?user_id=eq.${encodeURIComponent(user.id)}&select=user_id,email&limit=1`);
 return rows?.[0]?.email?.toLowerCase()===user.email?.toLowerCase()?user:null;
}
export function publicMetadata(row){const m=row.metadata;return {...m,verified:{repository:true,license:true},verification:undefined};}
export async function published(){const rows=await db('/rest/v1/resource_submissions?status=eq.approved&select=metadata,verification&limit=200&order=created_at.desc');const staticCatalog=loadCatalog();const used=new Set(staticCatalog.map(r=>r.slug));for(const row of rows){const m=publicMetadata(row);if(row.verification?.repository?.ok&&row.verification?.license?.ok&&!validateResource(m,staticCatalog).length&&!used.has(m.slug)){staticCatalog.push(m);used.add(m.slug)}}return staticCatalog;}
export async function verifyUpstream(metadata){
 const errors=validateResource(metadata,loadCatalog());if(errors.length)return {ok:false,errors};
 const repo=new URL(metadata.repository), source=new URL(metadata.source);
 if(repo.hostname!=='github.com')return {ok:false,errors:['Automated verification currently supports GitHub only; use rejection or verify in a future provider integration.']};
 const [owner,name]=repo.pathname.split('/').filter(Boolean);
 const api=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
 async function github(path){const res=await fetch(api+path,{headers:{Accept:'application/vnd.github+json','User-Agent':'MotionShelf-Review'},signal:AbortSignal.timeout(8000),redirect:'error'});if(!res.ok)throw Error(`GitHub verification returned ${res.status}`);return res.json();}
 try{
  const details=await github('');
  if(details.private||details.archived||details.disabled||details.full_name?.toLowerCase()!==`${owner}/${name}`.toLowerCase())throw Error('Repository is private, archived, disabled, or redirects to another repository');
  const license=await github('/license');
  const spdx=license.license?.spdx_id;
  if(!spdx||spdx==='NOASSERTION'||spdx.toLowerCase()!==metadata.license.trim().toLowerCase())throw Error(`Upstream SPDX license does not match the submitted identifier (${spdx||'unknown'})`);
  if(source.pathname.toLowerCase()!==repo.pathname.toLowerCase()){
    const extra=source.pathname.split('/').filter(Boolean).slice(2);
    if(extra[0]!=='tree'&&extra[0]!=='blob')throw Error('Source must be a repository root or GitHub tree/blob path');
    if(extra.length<3)throw Error('Source URL needs a branch and file or directory');
    // GitHub refs may contain slashes: prefer API request using the full tree path; manual review remains mandatory.
    const check=await github('/contents/'+extra.slice(2).map(encodeURIComponent).join('/')+'?ref='+encodeURIComponent(extra[1]));
    if(!check||(!Array.isArray(check)&&!check.type))throw Error('Source path is not accessible upstream');
  }
  return {ok:true,repository:{ok:true,url:details.html_url,checkedAt:new Date().toISOString()},license:{ok:true,spdx,checkedAt:new Date().toISOString()},source:{ok:true,url:metadata.source}};
 }catch(e){return {ok:false,errors:[e.message]};}
}
// IP is a coarse burst guard, never an authorization principal. Use the rightmost forwarded
// value (the edge-appended hop); the shared DB budget remains effective if headers are spoofed.
const attempts=new Map();
export function burstAllowed(req){const raw=(req.headers['x-forwarded-for']||'').split(',').at(-1)?.trim()||req.socket.remoteAddress||'unknown';const key=createHash('sha256').update(raw).digest('hex');const now=Date.now();if(attempts.size>3000)for(const [k,v] of attempts)if(v.until<now)attempts.delete(k);const v=attempts.get(key);if(!v||v.until<now){attempts.set(key,{count:1,until:now+600000});return true}v.count++;return v.count<=20;}
export async function turnstile(token,ip){const secret=process.env.TURNSTILE_SECRET_KEY;if(!secret)return true;if(!token||typeof token!=='string')return false;
 const params=new URLSearchParams({secret,response:token,remoteip:ip||''});const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:params,signal:AbortSignal.timeout(8000)});if(!res.ok)return false;const result=await res.json();const host=process.env.FRONTEND_ORIGIN?new URL(process.env.FRONTEND_ORIGIN).hostname:null;return result.success===true&&(!host||result.hostname===host)&&result.action==='submission';}
