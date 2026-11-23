
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


const fold=$('#fold'),expand=$('#expand'),status=$('#status');
const hiddenSegs=[$('#m1'),$('#s1'),$('#m2'),$('#s2')];
let open=false;
function set(next){
  open=next;
  expand.setAttribute('aria-expanded',String(next));
  hiddenSegs.forEach(el=>{el.hidden=!next});
  expand.textContent=next?'‹‹':'···';
  expand.setAttribute('aria-label',next?'Collapse 2 breadcrumbs':'Show 2 hidden breadcrumbs');
  status.textContent=next?'Full path shown':'Two segments collapsed';
  if(next)(hiddenSegs[0].querySelector('a')).focus();
}
expand.addEventListener('click',()=>set(!open));

document.body.dataset.ready="true";
