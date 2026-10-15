const $=s=>document.querySelector(s);
let lastStarCheck=0,starRequest=null,starOutbound=false;
$('.github-pill').addEventListener('click',()=>{starOutbound=true});
async function loadStars(force=false){
 if(document.hidden||starRequest||(!force&&Date.now()-lastStarCheck<60000)||force&&!starOutbound&&Date.now()-lastStarCheck<15000)return;
 const returningFromStar=starOutbound;lastStarCheck=Date.now();
 starRequest=(async()=>{try{
  const response=await fetch((window.MOTIONSHELF_API_BASE||'')+'/api/github-stars'+(starOutbound?'?refresh=1':''),{cache:'no-store',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('GitHub unavailable');const data=await response.json();if(!Number.isSafeInteger(data.count)||data.count<0)throw Error('Invalid count');
  starOutbound=false;$('#githubStars').textContent=new Intl.NumberFormat('en').format(data.count);$('#githubStars').hidden=false;
  $('.github-pill').setAttribute('aria-label',`Star MotionShelf on GitHub, ${data.count} ${data.count===1?'star':'stars'}`);
 }catch{if(!$('#githubStars').textContent)$('#githubStars').hidden=true}})();
 try{await starRequest}finally{starRequest=null;if(returningFromStar)setTimeout(()=>{starOutbound=true;loadStars(true)},6500)}
}
loadStars();
window.addEventListener('focus',()=>loadStars(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadStars(true)});
window.addEventListener('pageshow',e=>{if(e.persisted)loadStars(true)});
setInterval(()=>{if(!document.hidden)loadStars()},60000);
