
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


const reader=$('#reader'),list=$('#tocList'),prog=$('#tocProg'),status=$('#status');
const sections=$$('section',reader);
const LABELS={intro:'Introduction',details:'How it works',summary:'Summary'};

list.innerHTML=sections.map((s,i)=>
  '<li class="toc-item"><a href="#'+s.id+'" data-go="'+s.id+'"><span>'+LABELS[s.id]+'</span>'+
  '<span class="n">0'+(i+1)+'</span></a></li>').join('');

function active(id,announce){
  $$('[data-go]',list).forEach(a=>a.setAttribute('aria-current',String(a.dataset.go===id)));
  if(announce)status.textContent=LABELS[id]+' section';
}
$$('[data-go]',list).forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  const s=document.getElementById(a.dataset.go);
  reader.scrollTo({top:s.offsetTop-reader.offsetTop,behavior:reduce.matches?'auto':'smooth'});
  active(a.dataset.go,true);
}));
reader.addEventListener('scroll',()=>{
  const top=reader.scrollTop+18;
  let current=sections[0];
  for(const s of sections){if(s.offsetTop-reader.offsetTop<=top)current=s}
  active(current.id);
  const max=reader.scrollHeight-reader.clientHeight;
  prog.style.width=(max>0?Math.min(100,reader.scrollTop/max*100):0)+'%';
},{passive:true});
active('intro');

document.body.dataset.ready="true";
