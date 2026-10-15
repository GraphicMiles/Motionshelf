// The count comes only from GitHub. Keep one shared, short-lived result so visitors
// do not exhaust GitHub's unauthenticated API quota.
let snapshot=null,expires=0,inflight=null,lastAttempt=0;
const repo='https://github.com/GraphicMiles/Motionshelf';
async function readCount(){
 try{
  const response=await fetch('https://api.github.com/repos/GraphicMiles/Motionshelf?fresh='+Date.now(),{headers:{Accept:'application/vnd.github+json','User-Agent':'MotionShelf'},signal:AbortSignal.timeout(8000)});
  if(response.ok){const data=await response.json();if(Number.isSafeInteger(data.stargazers_count)&&data.stargazers_count>=0)return data.stargazers_count}
 }catch{}
 // GitHub's own repository page remains public when the 60/hour REST quota is hit.
 const response=await fetch(repo+'?fresh='+Date.now(),{headers:{'User-Agent':'MotionShelf'},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('GitHub unavailable');
 const match=(await response.text()).match(/"stargazerCount":(\d+)/);
 const value=match&&Number(match[1]);if(!Number.isSafeInteger(value)||value<0)throw Error('GitHub count unavailable');
 return value;
}
export async function githubStars(refresh=false){
 const now=Date.now();
 if(snapshot&&(!refresh&&now<expires||refresh&&now-lastAttempt<5000))return refresh?{...snapshot,stale:true}:snapshot;
 if(!snapshot&&now-lastAttempt<5000)throw Error('GitHub temporarily unavailable');
 if(inflight)return inflight;
 lastAttempt=now;
 inflight=(async()=>{const count=await readCount();snapshot={count,updatedAt:new Date().toISOString()};expires=Date.now()+60000;return snapshot})();
 try{return await inflight}catch(e){if(snapshot)return {...snapshot,stale:true};throw e}finally{inflight=null}
}
