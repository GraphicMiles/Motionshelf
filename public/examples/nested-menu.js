
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


const parent=$('#parent'),menu=$('#submenu'),status=$('#status'),result=$('#nmResult');
let open=false;
const items=()=>$$('[role=menuitem]',menu);

function set(next,focus){
  open=next;
  menu.hidden=!next;
  parent.setAttribute('aria-expanded',String(next));
  if(next){
    (focus||items()[0]).focus();
    status.textContent='Menu open · '+items().length+' actions';
  }else{
    parent.focus();
    status.textContent='Closed — press ↓ or click to open.';
  }
}
parent.addEventListener('click',()=>set(!open));
parent.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowRight'||e.key==='Enter'||e.key===' '){
    e.preventDefault();if(!open)set(true);
  }
});
menu.addEventListener('keydown',e=>{
  const all=items(),i=all.indexOf(document.activeElement);
  if(e.key==='ArrowDown'){e.preventDefault();all[(i+1)%all.length].focus()}
  if(e.key==='ArrowUp'){e.preventDefault();all[(i-1+all.length)%all.length].focus()}
  if(e.key==='Escape'||e.key==='ArrowLeft'){e.preventDefault();set(false)}
  if(e.key==='Tab'){set(false)}
  if(e.key==='Home'){e.preventDefault();all[0].focus()}
  if(e.key==='End'){e.preventDefault();all[all.length-1].focus()}
});
items().forEach(b=>b.addEventListener('click',()=>{
  result.hidden=false;
  result.innerHTML='<span class="dot dot-ok"></span><span>'+b.dataset.action+' selected</span>';
  status.textContent=b.dataset.action+' selected';
  set(false);
  parent.focus();
}));
document.addEventListener('click',e=>{if(open&&!e.target.closest('.nm'))set(false,false)});

document.body.dataset.ready="true";
