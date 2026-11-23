
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


const toggle=$('#toggle'),drawer=$('#drawer'),closeBtn=$('#close'),scrim=$('#ndScrim'),
      status=$('#status'),crumb=$('#ndCrumb'),body=$('#ndBody');
let open=false;

function set(next,restoreFocus){
  open=next;
  drawer.classList.toggle('open',next);
  drawer.setAttribute('aria-hidden',String(!next));
  toggle.setAttribute('aria-expanded',String(next));
  scrim.hidden=!next;
  if(next){
    drawer.querySelector('a').focus();
  }else if(restoreFocus!==false){
    toggle.focus();
  }
  status.textContent=next?'Menu open':'Menu closed';
}
toggle.addEventListener('click',()=>set(!open));
closeBtn.addEventListener('click',()=>set(false));
scrim.addEventListener('click',()=>set(false));
document.addEventListener('keydown',e=>{
  if(!open)return;
  if(e.key==='Escape'){e.preventDefault();set(false);return}
  if(e.key==='Tab'){
    const f=$$('a[href],button',drawer).filter(el=>el.offsetParent!==null);
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
$$('#ndLinks a').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  $$('#ndLinks a').forEach(x=>x.classList.toggle('current',x===a));
  crumb.textContent=a.dataset.page;
  body.querySelector('.nd-hero h2').textContent=a.dataset.page;
  body.querySelector('.nd-hero p').textContent=
    {Overview:'Four pages · 12 members',Activity:'8 events today',Components:'28 documented',Settings:'Workspace preferences'}[a.dataset.page]||'';
  set(false,false);
  toggle.focus();
  status.textContent=a.dataset.page+' selected';
}));
$$('#ndLinks a')[0].classList.add('current');

document.body.dataset.ready="true";
