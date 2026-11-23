
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


const tabs=$$('[role=tab]'),ink=$('#otInk'),more=$('#otMore'),fade=$('#otFade'),
      panel=p=>document.querySelector('#panel'),title=$('#otTitle'),bodyEl=$('#otBody'),stats=$('#otStats');
const CONTENT={
 Overview:{title:'Overview',body:'A single workspace for the design system, its docs and its release history.',stats:[['Pages','14'],['Members','12'],['Updated','2h ago']]},
 Activity:{title:'Activity',body:'Everything that changed this week, grouped by person and by file.',stats:[['Events','38'],['Authors','5'],['Conflicts','0']]},
 Files:{title:'Files',body:'Tokens, components and the asset pipeline that keeps the library in sync.',stats:[['Files','126'],['Size','4.2 MB'],['Assets','89']]},
 Permissions:{title:'Permissions',body:'Three roles, one owner, and an audit trail for every access change.',stats:[['Roles','3'],['Guests','2'],['Audit','on']]},
 Settings:{title:'Settings',body:'Naming, versioning and how these components get published downstream.',stats:[['Version','2.4'],['Branch','main'],['CI','green']]}
};
function select(i,focus){
  tabs.forEach((t,j)=>{
    const on=i===j;
    t.setAttribute('aria-selected',String(on));
    t.tabIndex=on?0:-1;
  });
  const t=tabs[i];
  t.scrollIntoView({inline:'nearest',block:'nearest',behavior:reduce.matches?'auto':'smooth'});
  ink.style.width=t.offsetWidth+'px';
  ink.style.transform='translateX('+t.offsetLeft+'px)';
  const c=CONTENT[t.textContent.trim()];
  title.textContent=c.title;bodyEl.textContent=c.body;
  stats.innerHTML=c.stats.map(([k,v])=>'<div class="ot-stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join('');
  panel().setAttribute('aria-labelledby',t.id);
  if(focus)t.focus();
  paintOverflow();
}
function paintOverflow(){
  const el=$('#tabs');
  const can=el.scrollWidth>el.clientWidth+1;
  const atEnd=el.scrollLeft+el.clientWidth>=el.scrollWidth-2;
  more.hidden=!can||atEnd;
  fade.classList.toggle('on',can&&!atEnd);
}
tabs.forEach((t,i)=>{
  t.addEventListener('click',()=>select(i));
  t.addEventListener('keydown',e=>{
    const map={ArrowRight:(i+1)%tabs.length,ArrowLeft:(i-1+tabs.length)%tabs.length,Home:0,End:tabs.length-1};
    if(map[e.key]!==undefined){e.preventDefault();select(map[e.key],true)}
  });
});
more.addEventListener('click',()=>{
  const el=$('#tabs');
  el.scrollBy({left:Math.max(80,el.clientWidth*0.7),behavior:reduce.matches?'auto':'smooth'});
  setTimeout(paintOverflow,340);
});
$('#otFade').addEventListener('click',paintOverflow);
$('#tabs').addEventListener('scroll',paintOverflow,{passive:true});
new ResizeObserver(()=>{const t=tabs.find(x=>x.getAttribute('aria-selected')==='true');
  if(t){ink.style.width=t.offsetWidth+'px';ink.style.transform='translateX('+t.offsetLeft+'px)'}paintOverflow()}).observe($('#tabs'));
select(0);

document.body.dataset.ready="true";
