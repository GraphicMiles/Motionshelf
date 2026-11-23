
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


const form=$('#form'),box=$('#errors'),list=$('#vsList'),status=$('#status'),
      pill=$('#vsPill'),count=$('#vsCount'),title=$('#vsTitle');
const FIELDS=[
 {id:'name',label:'Full name',test:v=>v.trim()?null:'Enter your full name'},
 {id:'email',label:'Email',test:v=>!v.trim()?'Enter your email':/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())?null:'Use a valid email like you@studio.com'},
 {id:'handle',label:'Handle',test:v=>!v.trim()?'Pick a handle':/^[a-z0-9_]{3,15}$/.test(v.trim())?null:'3–15 characters, lowercase letters, numbers or _'}
];
function validate(show){
  const problems=[];
  for(const f of FIELDS){
    const el=document.getElementById(f.id);
    const msg=f.test(el.value);
    const err=document.getElementById(f.id+'Err');
    el.setAttribute('aria-invalid',String(!!msg&&show));
    el.dataset.ok=String(!msg&&el.value.trim()!=='');
    if(err){err.hidden=!msg||!show;if(msg&&show)err.textContent=msg}
    if(msg)problems.push({...f,msg,el});
  }
  const valid=FIELDS.length-problems.length;
  pill.textContent=valid+' of 3 valid';
  pill.className='vs-pill'+(valid===3?' done':valid?' partial':'');
  return {problems,valid};
}
function render(problems,valid){
  if(!problems.length){
    box.hidden=true;
    count.textContent='All fields valid';
    return;
  }
  title.textContent='Please fix '+problems.length+' field'+(problems.length===1?'':'s');
  count.textContent=problems.length+' field'+(problems.length===1?'':'s')+' need attention';
  list.replaceChildren(...problems.map(p=>{
    const li=document.createElement('li');
    const a=document.createElement('a');a.href='#'+p.id;
    a.textContent=p.label+': '+p.msg;
    a.addEventListener('click',e=>{e.preventDefault();p.el.focus();p.el.scrollIntoView({block:'nearest'})});
    li.append(a);return li;
  }));
  box.hidden=false;
  box.classList.remove('anim-shake');void box.offsetWidth;box.classList.add('anim-shake');
}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const {problems,valid}=validate(true);
  if(problems.length){render(problems,valid);box.focus();status.textContent='Fix the highlighted fields.';return}
  box.hidden=true;
  status.textContent='Account created. Welcome aboard.';
  pill.className='vs-pill done';
});
FIELDS.forEach(f=>{
  const el=document.getElementById(f.id);
  el.addEventListener('input',()=>{
    const {problems,valid}=validate(false);
    if(!box.hidden&&problems.length)render(problems,valid);
    if(!problems.length){box.hidden=true;count.textContent='All fields valid'}
  });
  el.addEventListener('blur',()=>{
    const msg=f.test(el.value);
    const err=document.getElementById(f.id+'Err');
    el.setAttribute('aria-invalid',String(!!msg));
    if(err){err.hidden=!msg;if(msg)err.textContent=msg}
  });
});
validate(false);

document.body.dataset.ready="true";
