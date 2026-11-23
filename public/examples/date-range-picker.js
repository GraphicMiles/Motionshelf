
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


const grid=$('#drGrid'),monthEl=$('#drMonth'),fromEl=$('#drFrom'),toEl=$('#drTo'),
      nights=$('#drNights'),
      status=$('#status'),trigger=$('#drTrigger'),clearBtn=$('#drClear');
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const today=new Date();today.setHours(0,0,0,0);
let view=new Date(today.getFullYear(),today.getMonth(),1);
let start=null,end=null,hover=null;

const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
const same=(a,b)=>a&&b&&key(a)===key(b);
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const fmt=d=>d.toLocaleDateString('en',{month:'short',day:'numeric'});

function paint(dir){
  monthEl.textContent=MONTHS[view.getMonth()]+' '+view.getFullYear();
  const first=new Date(view.getFullYear(),view.getMonth(),1);
  // Monday-first offset: getDay() is 0=Sun
  const offset=(first.getDay()+6)%7;
  const days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const prevDays=new Date(view.getFullYear(),view.getMonth(),0).getDate();
  const cells=[];
  for(let i=offset-1;i>=0;i--)cells.push({d:new Date(view.getFullYear(),view.getMonth()-1,prevDays-i),mute:true});
  for(let n=1;n<=days;n++)cells.push({d:new Date(view.getFullYear(),view.getMonth(),n),mute:false});
  while(cells.length%7)cells.push({d:addDays(cells[cells.length-1].d,1),mute:true});

  const lo=start&&end?(start<end?start:end):start;
  const hi=start&&end?(start<end?end:start):(start&&hover&&hover>start?hover:null);
  grid.replaceChildren(...cells.map(({d,mute})=>{
    const b=document.createElement('button');
    b.type='button';b.className='dr-day';
    if(mute)b.classList.add('mute');
    b.textContent=String(d.getDate());
    b.setAttribute('aria-label',d.toDateString());
    const isEdge=(!mute&&same(d,start))||(!mute&&same(d,end));
    const inRange=!mute&&lo&&hi&&d>lo&&d<hi;
    if(mute)b.tabIndex=-1;
    if(same(d,today))b.classList.add('today');
    if(isEdge)b.classList.add('edge');
    else if(inRange)b.classList.add('in-range');
    if(isEdge)b.setAttribute('aria-current','date');
    if(!mute){
      b.addEventListener('click',()=>pick(d));
      b.addEventListener('mouseenter',()=>{if(start&&!end){hover=d;bandOnly()}});
    }
    return b;
  }));
  grid.classList.remove('slide-r','slide-l');
  if(dir){void grid.offsetWidth;grid.classList.add(dir>0?'slide-r':'slide-l')}
}
function bandOnly(){
  const lo=start,hi=hover&&hover>start?hover:null;
  $$('.dr-day',grid).forEach(b=>{
    const t=b.getAttribute('aria-label');
    if(!t||b.classList.contains('mute'))return;
    const d=new Date(t);
    b.classList.toggle('preview',!!lo&&!!hi&&d>lo&&d<hi&&!b.classList.contains('edge'));
  });
}
function pick(d){
  if(!start||(start&&end)){
    start=d;end=null;hover=null;
    status.textContent='Start '+fmt(d)+'. Now pick an end date.';
  }else{
    if(d<start){end=start;start=d}else end=d;
    hover=null;
    const lo=start,hi=end;
    const n=Math.round((hi-lo)/86400000);
    fromEl.textContent=fmt(lo);toEl.textContent=fmt(hi);
    clearBtn.hidden=false;trigger.classList.add('filled');
    nights.hidden=false;
    nights.textContent=(n||0)+' night'+(n===1?'':'s');
    status.textContent=n+' night'+(n===1?'':'s')+' selected.';
  }
  paint();
}
$('#drPrev').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);paint(-1)});
$('#drNext').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);paint(1)});
clearBtn.addEventListener('click',e=>{
  e.stopPropagation();
  start=end=hover=null;
  fromEl.textContent='Start date';toEl.textContent='End date';
  trigger.classList.remove('filled');clearBtn.hidden=true;nights.hidden=true;
  status.textContent='Range cleared. Pick a start date.';
  paint();
});
grid.addEventListener('mouseleave',()=>{if(start&&!end){hover=null;
  $$('.dr-day.preview',grid).forEach(b=>b.classList.remove('preview'))}});
paint();

document.body.dataset.ready="true";
