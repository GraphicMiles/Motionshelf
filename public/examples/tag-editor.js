
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


const SUGGEST=['design','review','draft','urgent','client','internal','copy','spec'];
let tags=[
 {name:'design',fresh:false},
 {name:'review',fresh:false}
];
const input=$('#tag'),box=$('#teBox'),wrap=$('#tags'),status=$('#status'),
      count=$('#teCount'),suggest=$('#teSuggest');

function draw(){
  wrap.replaceChildren(...tags.map(t=>{
    const chip=document.createElement('span');
    chip.className='te-chip';chip.dataset.new=String(t.fresh);
    const label=document.createElement('span');label.textContent=t.name;
    const x=document.createElement('button');x.type='button';
    x.setAttribute('aria-label','Remove '+t.name);
    x.innerHTML='<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    x.addEventListener('click',e=>{e.stopPropagation();remove(t.name,chip)});
    chip.append(label,x);return chip;
  }));
  count.textContent=tags.length+'/6';
  const left=SUGGEST.filter(s=>!tags.some(t=>t.name===s)).slice(0,4);
  suggest.replaceChildren(...left.map(s=>{
    const b=document.createElement('button');b.type='button';b.className='te-sg';b.textContent=s;
    b.addEventListener('click',()=>add(s));return b;
  }));
}
function add(raw){
  const name=String(raw||'').trim().toLowerCase().replace(/\s+/g,'-').slice(0,24);
  if(!name){status.textContent='Type a label first.';return}
  if(tags.some(t=>t.name===name)){
    status.textContent='“'+name+'” is already added.';
    input.value='';bump(box);return}
  if(tags.length>=6){status.textContent='Six labels is the maximum.';bump(box);return}
  tags.push({name,fresh:true});
  input.value='';draw();
  status.textContent='Added “'+name+'”.';
  setTimeout(()=>{tags.forEach(t=>t.fresh=false)},900);
}
function remove(name,chip){
  chip.classList.add('leaving');
  setTimeout(()=>{
    tags=tags.filter(t=>t.name!==name);
    draw();
    status.textContent='Removed “'+name+'”.';
  },170);
}
document.querySelector('#add')?.addEventListener('click',()=>add(input.value));
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();add(input.value)}
  if(e.key==='Backspace'&&!input.value&&tags.length){
    e.preventDefault();
    const last=tags[tags.length-1];
    input.value=last.name;input.select();
    tags.pop();draw();
    status.textContent='Editing “'+last.name+'”.';
  }
});
box.addEventListener('click',()=>input.focus());
draw();

document.body.dataset.ready="true";
