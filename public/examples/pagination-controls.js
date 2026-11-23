
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


const ITEMS=[
 'Token audit','Sidebar shell','Contrast sweep','Button states','Filter logic','Focus rings',
 'Dark palette','Date utils','Grid baseline','Icon set','Docs page','Release notes'
];
const results=$('#results'),nav=$('#pgNav'),info=$('#pgInfo'),status=$('#status');
const PER=4;
const PAGES=Math.ceil(ITEMS.length/PER);
let page=0;

function pageList(){
  // 1 … 4 5 6 … 12 style windowing, but compact enough for 300px
  const out=[];
  const add=n=>out.push(n);
  if(PAGES<=5){for(let i=0;i<PAGES;i++)add(i);return out}
  add(0);
  const lo=Math.max(1,Math.min(page-1,PAGES-3));
  const hi=Math.min(PAGES-2,Math.max(page+1,2));
  if(lo>1)out.push('…');
  for(let i=lo;i<=hi;i++)add(i);
  if(hi<PAGES-2)out.push('…');
  add(PAGES-1);
  return out;
}
function draw(){
  const slice=ITEMS.slice(page*PER,page*PER+PER);
  results.replaceChildren(...slice.map((name,i)=>{
    const li=document.createElement('li');
    li.className='pg-row';li.style.animationDelay=(i*30)+'ms';
    li.innerHTML='<span class="ix">'+String(page*PER+i+1).padStart(2,'0')+'</span>'+
      '<span class="nm">'+name+'</span><span class="st">'+(i%2?'ready':'draft')+'</span>';
    return li;
  }));
  const first=page*PER+1,last=Math.min(ITEMS.length,(page+1)*PER);
  info.textContent='Showing '+first+'–'+last+' of '+ITEMS.length;
  const btn=(label,opts={})=>{
    const b=document.createElement('button');
    b.type='button';b.className='pg-btn';
    if(opts.html)b.innerHTML=opts.html;else b.textContent=label;
    if(opts.disabled)b.disabled=true;
    if(opts.aria)b.setAttribute('aria-label',opts.aria);
    if(opts.current){b.setAttribute('aria-current','page');b.setAttribute('aria-label','Page '+(page+1)+', current')}
    if(opts.go!==undefined&&!opts.current)b.addEventListener('click',()=>go(opts.go));
    return b;
  };
  const frag=document.createDocumentFragment();
  frag.append(btn('',{html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',aria:'Previous page',disabled:page===0,go:page-1}));
  for(const p of pageList()){
    if(p==='…'){const s=document.createElement('span');s.className='pg-gap';s.textContent='…';frag.append(s);continue}
    frag.append(btn(String(p+1),{go:p,current:p===page,aria:'Page '+(p+1)}));
  }
  frag.append(btn('',{html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',aria:'Next page',disabled:page===PAGES-1,go:page+1}));
  nav.replaceChildren(frag);
}
function go(n){
  if(n<0||n>=PAGES)return;
  page=n;
  draw();
  status.textContent='Page '+(page+1)+' of '+PAGES;
  const cur=nav.querySelector('[aria-current]');
  if(cur)cur.focus();
}
draw();

document.body.dataset.ready="true";
