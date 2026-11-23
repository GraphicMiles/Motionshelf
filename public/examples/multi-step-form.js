
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


const panels=$$('[data-panel]'),steps=$$('#msSteps li'),fill=$('#msFill'),
      back=$('#back'),next=$('#next'),hint=$('#msHint'),status=$('#status'),
      review=$('#msReview'),form=$('#wizard');
const data={name:'',role:'',email:'',team:'1–5'};
let index=0,dir=1;

function paint(){
  steps.forEach((li,i)=>{
    li.dataset.state=i<index?'done':i===index?'active':'todo';
    const b=li.querySelector('.ms-bullet');
    b.textContent=i<index?'✓':String(i+1);
  });
  fill.style.width=(index/2*100)+'%';
  panels.forEach((p,i)=>{p.hidden=i!==index;p.dataset.dir=dir<0?'back':'fwd'});
  back.hidden=index===0;
  next.textContent=index===2?'Create project':'Continue';
  hint.textContent='Step '+(index+1)+' of 3';
  if(index===2)buildReview();
}
function buildReview(){
  review.innerHTML=[
    ['Name',data.name],['Role',data.role],['Email',data.email],['Team',data.team+' people']
  ].map(([k,v])=>'<div class="ms-rrow"><dt>'+k+'</dt><dd>'+(v||'—').replace(/</g,'&lt;')+'</dd></div>').join('');
  review.innerHTML='<dl class="ms-dl">'+review.innerHTML+'</dl>';
}
function valid(){
  if(index===0){
    const n=$('#fullName');
    if(!n.value.trim()){n.setAttribute('aria-invalid','true');n.classList.add('anim-shake');
      setTimeout(()=>n.classList.remove('anim-shake'),400);n.focus();
      status.textContent='Enter your name to continue.';return false}
    n.removeAttribute('aria-invalid');
    data.name=n.value.trim();data.role=$('#role').value;
  }
  if(index===1){
    const e=$('#email');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.value.trim())){
      e.setAttribute('aria-invalid','true');e.classList.add('anim-shake');
      setTimeout(()=>e.classList.remove('anim-shake'),400);e.focus();
      status.textContent='Enter a valid email address.';return false}
    e.removeAttribute('aria-invalid');data.email=e.value.trim();
  }
  return true;
}
next.addEventListener('click',()=>{
  if(index===2){status.textContent='Project created for '+data.email+'.';next.textContent='Created ✓';
    next.classList.add('btn-primary');setTimeout(()=>{index=0;next.textContent='Continue';paint()},1200);return}
  if(!valid())return;
  dir=1;index++;paint();status.textContent='Step '+(index+1)+' of 3.';
  const first=panels[index].querySelector('input');if(first)first.focus();
});
back.addEventListener('click',()=>{dir=-1;index--;paint();status.textContent='Step '+(index+1)+' of 3.'});
$$('#team [role=radio]').forEach(b=>{
  b.addEventListener('click',()=>{
    $$('#team [role=radio]').forEach(x=>x.setAttribute('aria-checked',String(x===b)));
    data.team=b.dataset.v;
  });
});
paint();

document.body.dataset.ready="true";
