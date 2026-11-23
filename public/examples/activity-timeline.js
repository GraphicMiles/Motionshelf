
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


const EVENTS=[
 {t:'09:12',who:'Maya Chen',type:'updates',what:'moved “Set up tokens” to In progress'},
 {t:'09:40',who:'Maya Chen',type:'updates',what:'updated the brief'},
 {t:'10:15',who:'Alex Reid',type:'comments',what:'left a comment',quote:'Can we tighten the spacing on the card grid before this ships?'},
 {t:'11:05',who:'Sam Okafor',type:'updates',what:'uploaded draft-v3.fig'},
 {t:'11:48',who:'Alex Reid',type:'comments',what:'replied on the review',quote:'Agreed — 8px grid, 12px on desktop.'},
 {t:'13:20',who:'Sam Okafor',type:'comments',what:'resolved 2 threads'},
 {t:'14:02',who:'Maya Chen',type:'updates',what:'published release 2.4.0'}
];
const list=$('#events'),status=$('#status'),more=$('#more'),scroll=$('#alScroll');
let type='all',count=3;

function visible(){return EVENTS.filter(e=>type==='all'||e.type===type)}
function draw(){
  const all=visible();
  const rows=all.slice(0,count);
  list.replaceChildren(...rows.map((e,i)=>{
    const li=document.createElement('li');
    li.className='al-e';li.dataset.type=e.type;
    li.style.animationDelay=(i*30)+'ms';
    li.innerHTML='<div class="al-top"><span class="al-who">'+e.who+'</span><span class="al-time">'+e.t+'</span></div>'+
      '<div class="al-what">'+e.what+'</div>'+(e.quote?'<div class="al-quote">“'+e.quote+'”</div>':'');
    return li;
  }));
  more.hidden=count>=all.length;
  status.textContent=Math.min(count,all.length)+' of '+all.length+' events'+(type==='all'?'':' · '+type);
}
$$('.al-f').forEach(b=>b.addEventListener('click',()=>{
  type=b.dataset.type;count=3;
  $$('.al-f').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  draw();
}));
more.addEventListener('click',()=>{count+=3;draw()});
draw();

document.body.dataset.ready="true";
