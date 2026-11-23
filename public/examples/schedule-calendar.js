
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


const grid=$('#days'),monthEl=$('#month'),weekEl=$('#calWeek'),agenda=$('#agenda'),modeEl=$('#calMode');
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
weekEl.innerHTML=WD.map(d=>'<span>'+d[0]+'</span>').join('');
const today=new Date();today.setHours(0,0,0,0);
const EVENTS=new Set();for(let i=0;i<70;i++){if(i%4===1)EVENTS.add(i)}
let view=new Date(today.getFullYear(),today.getMonth(),1);
let start=null,end=null,hover=null;

const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
const same=(a,b)=>!!a&&!!b&&key(a)===key(b);
const fmt=d=>d.toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'});
const fmtM=d=>d.toLocaleDateString('en',{month:'short',day:'numeric'});

function paint(dir){
  monthEl.textContent=MONTHS[view.getMonth()]+' '+view.getFullYear();
  const first=new Date(view.getFullYear(),view.getMonth(),1);
  // Monday-first. getDay(): 0=Sun..6=Sat
  const offset=(first.getDay()+6)%7;
  const total=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const prevTotal=new Date(view.getFullYear(),view.getMonth(),0).getDate();
  const cells=[];
  for(let i=offset-1;i>=0;i--)cells.push(new Date(view.getFullYear(),view.getMonth()-1,prevTotal-i));
  for(let n=1;n<=total;n++)cells.push(new Date(view.getFullYear(),view.getMonth(),n));
  while(cells.length%7||cells.length<35){
    const last=cells[cells.length-1];
    cells.push(new Date(last.getFullYear(),last.getMonth(),last.getDate()+1));
  }
  const lo=start&&end?(start<end?start:end):start;
  const hi=start&&end?(start<end?end:start):(start&&hover&&hover>start?hover:null);

  grid.replaceChildren(...cells.map(d=>{
    const b=document.createElement('button');
    b.type='button';b.className='cal-day';
    const mute=d.getMonth()!==view.getMonth();
    if(mute)b.classList.add('mute');
    b.textContent=String(d.getDate());
    b.setAttribute('aria-label',d.toDateString());
    const isEdge=(!mute&&same(d,start))||(!mute&&same(d,end));
    if(same(d,today))b.classList.add('today');
    if(EVENTS.has(d.getDate()))b.classList.add('has-ev');
    if(isEdge)b.classList.add('edge');
    else if(!mute&&lo&&hi&&d>lo&&d<hi)b.classList.add('in-range');
    if(isEdge)b.setAttribute('aria-current','date');
    if(!mute){
      b.addEventListener('click',()=>pick(d));
      if(start&&!end)b.addEventListener('mouseenter',()=>{hover=d;bandOnly()});
    }
    return b;
  }));
  grid.classList.remove('r','l');
  if(dir){void grid.offsetWidth;grid.classList.add(dir>0?'r':'l')}
}
function bandOnly(){
  // repaint only range classes for hover preview (cheap, avoids full rebuild)
  const lo=start,hi=hover&&hover>start?hover:null;
  $$('.cal-day',grid).forEach(b=>{
    const t=b.getAttribute('aria-label');
    if(!t)return;
    const d=new Date(t);
    const mute=b.classList.contains('mute');
    b.classList.toggle('preview',!mute&&lo&&hi&&d>lo&&d<hi&&!b.classList.contains('edge'));
  });
}
function pick(d){
  if(!start||(start&&end)){
    start=d;end=null;hover=null;modeEl.textContent='Range';
    agenda.className='cal-agenda';
    agenda.innerHTML='<span class="cal-agenda-i">'+(d%5===0?'Review meeting · ':'')+fmt(d)+' — pick an end date</span>';
  }else{
    if(d<start){end=start;start=d}else end=d;
    hover=null;
    const n=Math.round((end-start)/86400000);
    agenda.className='cal-agenda on';
    agenda.innerHTML='<span class="dot dot-ok"></span><span class="cal-agenda-i">'+fmtM(start)+' → '+fmtM(end)+
      '</span><span class="spacer"></span><span class="badge badge-accent">'+(n||0)+'n</span>';
  }
  paint();
}
$('#prev').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);paint(-1)});
$('#next').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);paint(1)});
grid.addEventListener('mouseleave',()=>{if(start&&!end){hover=null;$$('.cal-day.preview',grid).forEach(b=>b.classList.remove('preview'))}});
paint();

document.body.dataset.ready="true";
