
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const raf=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));
const bump=(el,cls='anim-shake')=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
const glider=(el,fn)=>{ // move a shared indicator to a target, in one frame
  const t=fn(); if(!t||!el) return;
  el.style.transform='translate('+t.x+'px,'+t.y+'px)';
  el.style.width=t.w+'px'; el.style.height=t.h+'px';
};


const N=10000,ROW=32;
const EVENTS=['updated the token file','published a release','opened a pull request','commented on the spec',
 'archived a workspace','invited a member','changed the theme','deleted 4 rows','exported a CSV','created a branch'];
const WHO=['amara','kai','mira','tobi','len','sana'];
const viewport=$('#viewport'),spacer=$('#spacer'),win=$('#window'),
      range=$('#vlRange'),status=$('#status'),badge=$('#vlBadge');
spacer.style.height=N*ROW+'px';
badge.textContent=N.toLocaleString('en-US');

function record(i){
  // deterministic so scrolling never reshuffles
  const ev=EVENTS[(i*7)%EVENTS.length],who=WHO[(i*13)%WHO.length];
  const min=String((i*17)%60).padStart(2,'0');
  return {i,ev,who,time:'0'+(1+(i%9))+':'+min,
    tone:i%17===0?'dot-danger':i%11===0?'dot-warn':'dot-ok'};
}
function draw(){
  const h=viewport.clientHeight||180;
  const start=Math.max(0,Math.floor(viewport.scrollTop/ROW)-3);
  const count=Math.ceil(h/ROW)+6;
  const end=Math.min(N,start+count);
  win.style.transform='translateY('+(start*ROW)+'px)';
  const frag=document.createDocumentFragment();
  for(let i=start;i<end;i++){
    const r=record(i);
    const row=document.createElement('div');
    row.className='vl-row';row.setAttribute('role','listitem');
    row.setAttribute('aria-posinset',String(i+1));
    row.setAttribute('aria-setsize',String(N));
    row.innerHTML='<span class="ix">'+String(i+1).padStart(5,'0')+'</span>'+
      '<span class="dot '+r.tone+'"></span>'+
      '<span class="ev">'+r.who+' '+r.ev+'</span>'+
      '<span class="who">'+r.time+'</span>';
    frag.append(row);
  }
  win.replaceChildren(frag);
  range.textContent='Rows '+(start+1).toLocaleString('en-US')+'–'+end.toLocaleString('en-US')+' of '+N.toLocaleString('en-US');
}
let queued=false;
viewport.addEventListener('scroll',()=>{
  if(queued)return;
  queued=true;requestAnimationFrame(()=>{queued=false;draw()});
},{passive:true});
$('#vlTop').addEventListener('click',()=>{viewport.scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'});status.textContent='Jumped to top'});
new ResizeObserver(draw).observe(viewport);
draw();

document.body.dataset.ready="true";
