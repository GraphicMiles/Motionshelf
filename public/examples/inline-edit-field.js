
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


const view=$('#ieView'),form=$('#form'),value=$('#value'),draft=$('#draft'),
      edit=$('#edit'),cancel=$('#cancel'),status=$('#status'),
      count=$('#ieCount'),err=$('#ieErr'),history=$('#ieHistory'),log=$('#ieLog');
let history_=[],open=false;

function open_(){
  if(open)return;
  open=true;
  draft.value=value.textContent;
  draft.dataset.original=value.textContent;
  view.hidden=true;form.hidden=false;
  tick();draft.focus();draft.select();
}
function close(save){
  open=false;
  form.hidden=true;view.hidden=false;
  edit.focus();
  if(!save)status.textContent='Changes discarded.';
}
function tick(){
  const n=draft.value.length;
  count.textContent=n+'/60';
  count.classList.toggle('warn',n>50);
  const bad=!draft.value.trim();
  err.textContent=bad&&draft.value.length?'A title is required.':'';
  draft.setAttribute('aria-invalid',String(bad&&draft.value.length>0));
}
edit.addEventListener('click',open_);
cancel.addEventListener('click',()=>close(false));
draft.addEventListener('input',tick);
draft.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close(false)}
  if(e.key==='Enter'){e.preventDefault();form.requestSubmit()}
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const next=draft.value.trim();
  if(!next){err.textContent='A title is required.';draft.setAttribute('aria-invalid','true');
    draft.classList.add('anim-shake');setTimeout(()=>draft.classList.remove('anim-shake'),400);draft.focus();return}
  if(next===draft.dataset.original){close(false);status.textContent='No changes to save.';return}
  history_.unshift([draft.dataset.original,next,new Date()]);
  value.textContent=next;
  render_();
  close(true);
  status.textContent='Saved “'+next+'”.';
});
function render_(){
  history.hidden=!history_.length;
  log.replaceChildren(...history_.slice(0,3).map(([a,b,t])=>{
    const li=document.createElement('li');
    const time=t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    li.innerHTML='<span class="old">'+a.replace(/</g,'&lt;')+'</span><span>→</span><span class="new">'+b.replace(/</g,'&lt;')+'</span><time>'+time+'</time>';
    return li;
  }));
}

document.body.dataset.ready="true";
