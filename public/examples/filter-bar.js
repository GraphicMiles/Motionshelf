
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


const TASKS=[
 {name:'Design tokens pass',type:'design',owner:'AR'},
 {name:'Build sidebar shell',type:'code',owner:'KO'},
 {name:'Review colour contrast',type:'review',owner:'MI'},
 {name:'Polish button states',type:'design',owner:'AR'},
 {name:'Wire filter logic',type:'code',owner:'KO'},
 {name:'Audit focus rings',type:'review',owner:'MI'},
 {name:'Ship dark palette',type:'design',owner:'AR'},
 {name:'Refactor date utils',type:'code',owner:'KO'}
];
const list=$('#items'),status=$('#status'),activeBox=$('#fbActive'),chips=$('#fbChips'),clearBtn=$('#fbClear');
let selected=new Set(['all']);

function counts(){
  const all=TASKS.length;
  const d=TASKS.filter(t=>t.type==='design').length;
  const c=TASKS.filter(t=>t.type==='code').length;
  const r=TASKS.filter(t=>t.type==='review').length;
  $$('.fb-n').forEach(n=>n.textContent={all,d,c,r}[n.dataset.n]??'');
}
function draw(){
  const filters=[...selected];
  const showAll=filters.includes('all')||!filters.length;
  const visible=showAll?TASKS:TASKS.filter(t=>filters.includes(t.type));
  list.replaceChildren(...visible.map((t,i)=>{
    const li=document.createElement('li');li.className='fb-item';
    li.style.animationDelay=(i*22)+'ms';
    li.innerHTML='<span class="dot '+(t.type==='review'?'dot-warn':t.type==='code'?'dot-ok':'dot-danger')+'"></span>'+
      '<span class="nm">'+t.name+'</span><span class="tagm">'+t.owner+'</span>';
    return li;
  }));
  if(!visible.length){list.innerHTML='<li class="fb-empty">No tasks match these filters.</li>'}
  activeBox.hidden=showAll;
  chips.replaceChildren(...filters.filter(f=>f!=='all').map(f=>{
    const span=document.createElement('span');span.className='fb-tag';span.textContent=f;
    const x=document.createElement('button');x.type='button';x.setAttribute('aria-label','Remove '+f+' filter');
    x.innerHTML='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    x.addEventListener('click',()=>toggle(f));
    span.append(x);return span;
  }));
  $$('.fb-chip').forEach(b=>b.setAttribute('aria-pressed',String(selected.has(b.dataset.filter))));
  status.textContent=visible.length+' of '+TASKS.length+' tasks shown'+(showAll?'':' · filtered by '+filters.join(', '));
}
function toggle(f){
  if(f==='all'){selected=new Set(['all'])}
  else{
    selected.delete('all');
    if(selected.has(f))selected.delete(f);else selected.add(f);
    if(!selected.size)selected.add('all');
  }
  draw();
}
$$('.fb-chip').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.filter)));
clearBtn.addEventListener('click',()=>{selected=new Set(['all']);draw()});
counts();draw();

document.body.dataset.ready="true";
