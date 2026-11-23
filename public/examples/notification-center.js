
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


const DATA=[
 {id:1,who:'Maya',initials:'MC',tone:'green',text:'approved your <b>release notes</b> for v2.4',time:'4m',unread:true,app:'Docs'},
 {id:2,who:'Alex',initials:'AR',tone:'blue',text:'mentioned you in <b>#design-system</b>',time:'22m',unread:true,app:'Chat'},
 {id:3,who:'Sam',initials:'SO',tone:'amber',text:'requested access to <b>Q4 roadmap</b>',time:'1h',unread:true,app:'Files'},
 {id:4,who:'CI',initials:'CI',tone:'green',text:'build <b>#1281</b> passed in 42s',time:'3h',unread:false,app:'Pipelines'},
 {id:5,who:'Kim',initials:'KO',tone:'blue',text:'commented on <b>Card grid spacing</b>',time:'5h',unread:false,app:'Chat'},
 {id:6,who:'Tobi',initials:'TO',tone:'amber',text:'shared <b>Design tokens v3</b> with you',time:'1d',unread:false,app:'Files'}
];
const list=$('#notes'),status=$('#status'),badge=$('#ncBadge'),
      filter=$('#unread'),markAll=$('#markAll');
let unreadOnly=false;

const plural=(n,s)=>n===1?s:'s';
function draw(){
  const visible=unreadOnly?DATA.filter(d=>d.unread):DATA;
  list.replaceChildren(...visible.map((d,i)=>{
    const li=document.createElement('li');
    const b=document.createElement('button');
    b.type='button';
    b.className='nc-n'+(d.unread?' unread':'');
    b.dataset.tone=d.tone;
    b.setAttribute('aria-label',(d.unread?'Unread: ':'')+d.who+' — '+d.text.replace(/<[^>]+>/g,'')+', '+d.time+' ago, '+d.app);
    b.innerHTML='<span class="nc-av">'+d.initials+'</span><span class="nc-c">'+
      '<span class="nc-t">'+d.text+'</span>'+
      '<span class="nc-s">'+d.time+' ago · '+d.app+(d.unread?'<span class="nx">Mark read</span>':'')+'</span></span>';
    b.style.animation='m-rise-sm var(--t-3) var(--ease-out) both';
    b.style.animationDelay=(i*24)+'ms';
    b.addEventListener('click',()=>{
      d.unread=false;
      draw();
      status.textContent=d.who+' notification marked read. '+DATA.filter(x=>x.unread).length+' unread remaining.';
    });
    li.append(b);return li;
  }));
  if(!visible.length){
    list.innerHTML='<li class="nc-empty">'+
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg>'+
      '<span>All caught up</span><span style="font-size:9.5px">No unread notifications</span></li>';
  }
  const n=DATA.filter(d=>d.unread).length;
  badge.textContent=n;
  badge.hidden=false;
  badge.style.opacity=n?1:.35;
  status.textContent=unreadOnly?visible.length+' unread notification'+plural(visible.length)+' in this view'
    :n+' unread notification'+plural(n);
}
filter.addEventListener('click',()=>{
  unreadOnly=!unreadOnly;
  filter.setAttribute('aria-pressed',String(unreadOnly));
  draw();
});
markAll.addEventListener('click',()=>{
  const n=DATA.filter(d=>d.unread).length;
  DATA.forEach(d=>d.unread=false);
  draw();
  status.textContent=n+' notification'+plural(n)+' marked read';
});
draw();

document.body.dataset.ready="true";
