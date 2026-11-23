
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
 {id:'t1',lane:'todo',name:'Write outline',tags:['copy'],who:'AM'},
 {id:'t2',lane:'todo',name:'Review copy',tags:['edit'],who:'KO'},
 {id:'t3',lane:'todo',name:'Set up tokens',tags:['dev'],who:'MI'},
 {id:'t4',lane:'doing',name:'Build the shell',tags:['dev'],who:'KO'},
 {id:'t5',lane:'doing',name:'Motion pass',tags:['dev','ux'],who:'AM'},
 {id:'t6',lane:'done',name:'Publish notes',tags:['docs'],who:'TO'}
];
const LANES=['todo','doing','done'];
const NAMES={todo:'To do',doing:'In progress',done:'Done'};
const status=$('#status'),meta=$('#kbMeta');
let dragId=null;

function draw(){
  for(const lane of LANES){
    const host=document.querySelector('[data-drop="'+lane+'"]');
    const items=TASKS.filter(t=>t.lane===lane);
    host.replaceChildren(...items.map(t=>{
      const card=document.createElement('div');
      card.className='kb-card';card.draggable=true;card.dataset.id=t.id;
      card.innerHTML=t.name+'<div class="tags">'+t.tags.map(x=>'<span class="tg">'+x+'</span>').join('')+'</div>'+
        '<span class="av">'+t.who+'</span>';
      card.addEventListener('dragstart',e=>{
        dragId=t.id;card.classList.add('dragging');
        e.dataTransfer.effectAllowed='move';
        e.dataTransfer.setData('text/plain',t.id);
      });
      card.addEventListener('dragend',()=>{card.classList.remove('dragging');dragId=null;
        $$('.kb-lane').forEach(l=>l.classList.remove('dragover'))});
      return card;
    }));
    if(!items.length)host.innerHTML='<div class="kb-empty">Drop here</div>';
    document.querySelector('[data-lane="'+lane+'"] [data-count]').textContent=items.length;
  }
  meta.textContent=TASKS.length+' tasks · '+TASKS.filter(t=>t.lane==='done').length+' done';
}
for(const lane of LANES){
  const zone=document.querySelector('[data-drop="'+lane+'"]');
  const shell=document.querySelector('[data-lane="'+lane+'"]');
  ['dragenter','dragover'].forEach(ev=>zone.addEventListener(ev,e=>{
    e.preventDefault();e.dataTransfer.dropEffect='move';shell.classList.add('dragover');
  }));
  ['dragleave','drop'].forEach(ev=>shell.addEventListener(ev,e=>{
    if(ev==='dragleave'&&shell.contains(e.relatedTarget))return;
    shell.classList.remove('dragover');
  }));
  shell.addEventListener('drop',e=>{
    e.preventDefault();
    const id=e.dataTransfer.getData('text/plain')||dragId;
    const t=TASKS.find(x=>x.id===id);
    if(!t||t.lane===lane)return;
    const from=t.lane;t.lane=lane;draw();
    status.textContent=t.name+' moved from '+NAMES[from]+' to '+NAMES[lane];
  });
}
$$('[data-add]').forEach(b=>b.addEventListener('click',()=>{
  const lane=b.dataset.add;
  const id='t'+(Date.now());
  TASKS.push({id,lane,name:'New task',tags:['new'],who:'YOU'});
  draw();
  status.textContent='Task added to '+NAMES[lane];
}));
draw();

document.body.dataset.ready="true";
