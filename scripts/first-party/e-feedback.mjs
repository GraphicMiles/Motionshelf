// Calendar, status dashboard, toast stack, action confirmation, progress steps, notification centre.

export const calendar = {
slug: 'schedule-calendar',
title: 'Schedule calendar',
tag: 'single + range',
body: `
<div class="cal">
  <div class="cal-head">
    <button class="cal-nav" id="prev" type="button" aria-label="Previous month">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <div class="cal-month" id="month" aria-live="polite"></div>
    <button class="cal-nav" id="next" type="button" aria-label="Next month">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </div>
  <div class="cal-week" aria-hidden="true" id="calWeek"></div>
  <div class="cal-grid" id="days" role="group" aria-label="Month days"></div>
  <div class="cal-foot">
    <span class="cal-agenda" id="agenda" role="status" aria-live="polite"><span class="cal-agenda-i">Pick a date</span></span>
    <span class="cal-mode" id="calMode">Range</span>
  </div>
</div>
`,
css: `
.cal{display:flex;flex-direction:column;min-height:0;flex:1}
.cal-foot{display:flex;align-items:center;gap:8px;margin-top:6px;flex:none;min-width:0}
.cal-foot .cal-agenda{margin-top:0;flex:1;min-width:0}
.cal-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex:none}
.cal-month{flex:1;text-align:center;font-size:12px;font-weight:650;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.cal-nav{display:grid;place-items:center;width:24px;height:24px;border-radius:var(--r-xs);
  background:var(--s2);border:1px solid var(--line-2);color:var(--fg-3);
  transition:background var(--t-1),color var(--t-1),border-color var(--t-1),transform var(--t-1) var(--spring)}
.cal-nav:hover{background:var(--s3);color:var(--fg);border-color:var(--line-3);transform:scale(1.06)}
.cal-nav:active{transform:scale(.94)}
.cal-week{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;flex:none}
.cal-week span{text-align:center;font-size:9px;font-weight:700;color:var(--fg-4);letter-spacing:.05em;height:13px;line-height:13px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-auto-rows:24px;gap:1px;flex:none;position:relative}
@container preview (max-height:340px){.cal-day{height:24px;font-size:10px}}
.cal-day{position:relative;display:grid;place-items:center;height:24px;border-radius:var(--r-xs);
  font-size:11px;color:var(--fg-2);font-variant-numeric:tabular-nums;
  transition:background var(--t-1) var(--ease-out),color var(--t-1),transform var(--t-1) var(--spring)}
.cal-day:hover{background:var(--s3);color:var(--fg);transform:scale(1.07);z-index:2}
.cal-day.mute{color:var(--fg-3)}
.cal-day.today{color:var(--accent);font-weight:700}
.cal-day.today::before{content:"";position:absolute;inset:auto auto 3px 50%;transform:translateX(-50%);
  width:3px;height:3px;border-radius:50%;background:var(--accent)}
.cal-day.has-ev::after{content:"";position:absolute;top:4px;right:5px;width:3px;height:3px;border-radius:50%;background:var(--info)}
.cal-day.in-range{background:var(--accent-soft);border-radius:0;color:var(--fg)}
.cal-day.preview{background:rgba(0,0,0,.05);border-radius:0}
.cal-day.edge{background:var(--accent);color:var(--accent-ink);font-weight:700;border-radius:var(--r-xs);z-index:1;
  box-shadow:none}
.cal-day.edge::after{display:none}
.cal-day.edge:hover{background:var(--ok);color:var(--accent-ink)}
@keyframes cal-r{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
@keyframes cal-l{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
.cal-grid.r{animation:cal-r var(--t-2) var(--ease-out)}
.cal-grid.l{animation:cal-l var(--t-2) var(--ease-out)}
.cal-legend{display:flex;align-items:center;gap:10px;margin-top:5px;padding-top:8px;border-top:1px solid var(--line);
  font-size:9px;color:var(--fg-3);flex:none}
.cal-legend span{display:inline-flex;align-items:center;gap:4px}
.cal-mode{margin-left:auto;padding:1px 6px;border-radius:var(--r-full);background:var(--s3);
  border:1px solid var(--line-2);font-weight:650;color:var(--fg-3);letter-spacing:.03em}
.lg{width:5px;height:5px;border-radius:50%;display:inline-block}
.lg-today{background:var(--accent)}
.lg-dot{background:var(--info)}
.cal-agenda{margin-top:7px;min-height:26px;display:flex;align-items:center;gap:6px;padding:5px 9px;
  border-radius:var(--r-sm);background:var(--s2);border:1px solid var(--line);font-size:10.5px;color:var(--fg-3);flex:none;
  transition:background var(--t-2),border-color var(--t-2),color var(--t-2)}
.cal-agenda.on{background:var(--accent-soft);border-color:var(--accent-line);color:var(--fg)}
.cal-agenda-i{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`,
js: `
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
`
};

export const statusDashboard = {
slug: 'status-dashboard',
title: 'Status dashboard',
tag: 'live metrics',
body: `
<div class="sd">
  <div class="sd-head">
    <span class="sd-live"><span class="sd-ping"></span>Live</span>
    <span class="sd-ts" id="sdTs">updated just now</span>
  </div>
  <div class="sd-metrics" id="sdMetrics"></div>
  <div class="sd-spark" id="sdSpark"></div>
  <div class="sd-actions">
    <button class="btn btn-sm" type="button" id="refresh">Refresh sample</button>
    <button class="btn btn-sm btn-ghost" type="button" id="unavailable">Simulate outage</button>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.sd{display:flex;flex-direction:column;min-height:0;flex:1}
.sd-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex:none}
.sd-live{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:520;color:var(--ok);letter-spacing:-.004em}
.sd-ping{position:relative;width:5px;height:5px;border-radius:50%;background:var(--ok)}
.sd-ping::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1px solid var(--ok);
  opacity:0;animation:sd-ping 2s var(--ease-out) infinite}
@keyframes sd-ping{0%{opacity:.7;transform:scale(.6)}70%,100%{opacity:0;transform:scale(1.5)}}
.sd-ts{font-size:9.5px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.sd-metrics{display:grid;grid-template-columns:1fr;gap:4px;flex:none}
.sd-m{display:flex;align-items:center;gap:8px;padding:5px 9px;background:var(--s2);
  border:1px solid var(--line);border-radius:var(--r-sm);
  transition:background var(--t-2),border-color var(--t-2)}
.sd-m .sd-lbl{font-size:11px;letter-spacing:-.004em;color:var(--fg-3);font-weight:520;flex:none;width:52px}
.sd-m .sd-val{font-size:13px;font-weight:650;letter-spacing:-.015em;font-variant-numeric:tabular-nums;
  flex:1;min-width:0;overflow-wrap:break-word;line-height:1.2}
.sd-m .sd-trend{font-size:9px;font-variant-numeric:tabular-nums;padding:1px 5px;border-radius:var(--r-full);flex:none}
.sd-m .sd-trend.up{background:var(--ok-bg);color:var(--ok)}
.sd-m .sd-trend.down{background:var(--danger-bg);color:var(--danger)}
.sd-m .sd-dot{width:5px;height:5px;border-radius:50%;flex:none}
.sd-m.outage{background:rgba(251,113,133,.06);border-color:var(--danger-bg)}
.sd-m.outage .sd-val{color:var(--danger);font-size:11px}
.sd-spark{margin-top:9px;flex:none;height:26px;border-radius:var(--r-sm);background:var(--s2);
  border:1px solid var(--line);padding:5px 7px;display:flex;align-items:flex-end;gap:2px}
.sd-bar{flex:1;background:var(--s4);border-radius:2px 2px 0 0;min-height:2px;
  transition:height var(--t-4) var(--ease-out),background var(--t-2)}
.sd-bar.hi{background:var(--fg)}
.sd-bar.mid{background:var(--fg-4)}
.sd-actions{display:flex;gap:5px;margin-top:10px;flex:none}
.sd-actions .btn{flex:1;min-width:0;padding:0 6px;font-size:10.5px}
`,
js: `
const metrics=$('#sdMetrics'),spark=$('#sdSpark'),status=$('#status'),ts=$('#sdTs');
let sample=0,outage=false;
const HISTORY=Array.from({length:22},(_,i)=>38+Math.round(Math.sin(i*.7)*9+Math.random()*7));

function drawBars(){
  const max=Math.max(...HISTORY,1);
  spark.replaceChildren(...HISTORY.map(v=>{
    const b=document.createElement('div');
    const h=Math.max(3,Math.round(v/max*34));
    b.className='sd-bar'+(v>max*.82?' hi':v>max*.55?' mid':'');
    b.style.height=h+'px';
    return b;
  }));
}
function draw(){
  const rows=[
    {k:'Requests',v:outage?'—':(12480+sample*137).toLocaleString('en-US'),trend:outage?null:'+4.2%',up:true,dot:'dot-ok'},
    {k:'Latency',v:outage?'—':(38+sample*2)+' ms',trend:outage?null:'−6 ms',up:true,dot:'dot-ok'},
    {k:'Error rate',v:outage?'—':'0.'+(2+sample%4)+'%',trend:outage?null:'stable',up:null,dot:'dot-warn'},
    {k:'Service',v:outage?'Unavailable':'Operational',trend:null,dot:outage?'dot-danger':'dot-ok'}
  ];
  metrics.replaceChildren(...rows.map(r=>{
    const d=document.createElement('div');
    d.className='sd-m'+(outage?' outage':'');
    d.innerHTML='<span class="sd-lbl">'+r.k+'</span>'+
      '<span class="sd-val">'+r.v+'</span>'+
      (r.trend?'<span class="sd-trend '+(r.up===true?'up':r.up===false?'down':'')+'">'+r.trend+'</span>':'')+
      '<span class="sd-dot '+r.dot+'"></span>';
    return d;
  }));
  ts.textContent=outage?'outage detected · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    :'updated '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  status.textContent=outage?'Metrics unavailable — last values are not shown as current.'
    :'Metrics updated from sample '+(sample+1)+'.';
}
$('#refresh').addEventListener('click',()=>{
  sample++;outage=false;
  HISTORY.push(38+Math.round(Math.random()*16));HISTORY.shift();
  draw();drawBars();
});
$('#unavailable').addEventListener('click',()=>{
  outage=!outage;
  $('#unavailable').textContent=outage?'Restore service':'Simulate outage';
  draw();
});
draw();drawBars();
`
};

export const toastStack = {
slug: 'toast-stack',
title: 'Toast stack',
tag: 'severity + timer',
body: `
<div class="ts">
  <div class="ts-bar"><span class="ts-k">Trigger</span><span class="ts-n" id="tsCount">0 active</span></div>
  <div class="ts-demo">
    <button class="btn btn-sm" type="button" data-toast="success">Save draft</button>
    <button class="btn btn-sm" type="button" data-toast="warn">Show warning</button>
    <button class="btn btn-sm" type="button" data-toast="error">Trigger error</button>
    <button class="btn btn-sm btn-ghost" type="button" data-toast="info">Sync</button>
  </div>
  <div class="ts-stage" id="stage">
    <div class="ts-empty" id="tsEmpty">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
      <span>No notifications yet</span>
    </div>
    <div class="ts-stack" id="toasts" aria-live="polite" aria-relevant="additions"></div>
  </div>
  <p id="status" class="hint" role="status" aria-live="polite">Trigger a toast to see it stack.</p>
</div>
`,
css: `
.ts{display:flex;flex-direction:column;min-height:0;flex:1}
.ts-bar{display:flex;align-items:baseline;justify-content:space-between;flex:none;margin-bottom:5px}
.ts-k{font-size:11px;letter-spacing:-.004em;color:var(--fg-3);font-weight:520}
.ts-n{font-size:9.5px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.ts-demo{display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:none;margin-bottom:10px}
.ts-demo .btn{min-height:30px;font-size:12px;background:var(--s1);border:1px solid var(--line-2);box-shadow:var(--shadow-1)}
.ts-demo .btn:hover{background:var(--s2)}
.ts-stage{position:relative;flex:1;min-height:0;border-radius:var(--r-md);
  background:var(--s2);
  border:1px dashed var(--line-2);overflow:hidden}
.ts-empty{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:6px;
  font-size:12px;color:var(--fg-4);transition:opacity var(--t-3),transform var(--t-3)}
.ts-empty.hide{opacity:0;transform:scale(.96);pointer-events:none}
.ts-stack{position:absolute;left:8px;right:8px;bottom:8px;display:flex;flex-direction:column-reverse;gap:5px;
  max-height:100%;overflow:hidden;justify-content:flex-start}
.toast{position:relative;display:flex;align-items:flex-start;gap:7px;padding:8px 9px;overflow:hidden;
  background:var(--s3);border:1px solid var(--line-2);border-radius:var(--r-sm);
  box-shadow:var(--shadow-2);font-size:10.5px;color:var(--fg-2);
  animation:m-slide-in-bottom var(--t-3) var(--ease-out) both}
.toast.out{animation:m-toast-out var(--t-2) var(--ease-out) forwards}
@keyframes m-toast-out{to{opacity:0;transform:translateX(16px) scale(.96);max-height:0;margin-bottom:-5px}}
.toast .ic{display:grid;place-items:center;width:16px;height:16px;border-radius:50%;flex:none;margin-top:1px}
.toast .ic svg{width:9px;height:9px}
.toast .body{flex:1;min-width:0}
.toast .ttl{font-size:10.5px;font-weight:650;color:var(--fg);line-height:1.25}
.toast .msg{font-size:10px;color:var(--fg-3);margin-top:1px;line-height:1.35}
.toast .x{flex:none;display:grid;place-items:center;width:15px;height:15px;border-radius:50%;
  color:var(--fg-4);transition:background var(--t-1),color var(--t-1)}
.toast .x:hover{background:var(--s5);color:var(--fg)}
.toast .x svg{width:8px;height:8px}
.toast .bar{position:absolute;left:0;bottom:0;height:1.5px;background:currentColor;opacity:.5;
  transform-origin:left;animation:m-timer linear forwards}
@keyframes m-timer{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.toast[data-kind=success]{border-left:2px solid var(--ok)}
.toast[data-kind=success] .ic{background:var(--ok-bg);color:var(--ok)}
.toast[data-kind=warn]{border-left:2px solid var(--warn)}
.toast[data-kind=warn] .ic{background:var(--warn-bg);color:var(--warn)}
.toast[data-kind=error]{border-left:2px solid var(--danger)}
.toast[data-kind=error] .ic{background:var(--danger-bg);color:var(--danger)}
.toast[data-kind=info]{border-left:2px solid var(--info)}
.toast[data-kind=info] .ic{background:rgba(121,184,255,.14);color:var(--info)}
`,
js: `
const stack=$('#toasts'),empty=$('#tsEmpty'),status=$('#status'),counter=$('#tsCount');
const DURATION={success:4200,warn:5200,error:6500,info:3800};
const ICONS={
 success:'<path d="M20 6 9 17l-5-5"/>',
 warn:'<path d="M12 9v4M12 17v.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
 error:'<path d="M18 6 6 18M6 6l12 12"/>',
 info:'<path d="M12 16v-5M12 8v.01"/><circle cx="12" cy="12" r="9"/>'
};
const COPY={
 success:['Draft saved','Your changes are stored locally.'],
 warn:['Check required fields','Two fields still need a value.'],
 error:['Upload failed','The file exceeded the 100 KB limit.'],
 info:['Sync started','Pulling 3 changes from the server.']
};
let n=0;
function toast(kind){
  n++;
  empty.classList.add('hide');
  const el=document.createElement('div');
  el.className='toast';el.dataset.kind=kind;
  const [title,msg]=COPY[kind];
  el.innerHTML='<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+ICONS[kind]+'</svg></span>'+
    '<span class="body"><span class="ttl">'+title+'</span><span class="msg">'+msg+'</span></span>'+
    '<button class="x" type="button" aria-label="Dismiss: '+title+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'+
    '<span class="bar" style="animation-duration:'+DURATION[kind]+'ms"></span>';
  let timer=null;
  const syncCount=()=>{
    const n=stack.children.length;
    counter.textContent=n+(n===1?' active':' active');
    counter.style.opacity=n?'1':'.55';
  };
  const kill=()=>{
    clearTimeout(timer);
    el.classList.add('out');
    setTimeout(()=>{
      el.remove();
      syncCount();
      if(!stack.children.length)empty.classList.remove('hide');
    },210);
    status.textContent=title+' dismissed';
  };
  el.querySelector('.x').addEventListener('click',kill);
  el.addEventListener('mouseenter',()=>{
    clearTimeout(timer);
    el.querySelector('.bar').style.animationPlayState='paused';
  });
  el.addEventListener('mouseleave',()=>{
    el.querySelector('.bar').style.animationPlayState='running';
    timer=setTimeout(kill,DURATION[kind]*.4);
  });
  el.addEventListener('focusin',()=>{clearTimeout(timer);el.querySelector('.bar').style.animationPlayState='paused'});
  stack.append(el);
  while(stack.children.length>3){stack.firstElementChild.remove()}
  timer=setTimeout(kill,DURATION[kind]);
  status.textContent=title+' shown';
  syncCount();
}
$$('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
`
};

export const actionConfirm = {
slug: 'action-confirmation',
title: 'Confirm dialog',
tag: 'modal + undo',
body: `
<div class="ac">
  <div class="ac-list" id="acList"></div>
  <div class="ac-scrim" id="acScrim" hidden></div>
  <div class="ac-dialog" id="dialog" role="dialog" aria-modal="true" aria-labelledby="dialogTitle" aria-describedby="dialogBody" hidden>
    <div class="ac-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
    </div>
    <h2 id="dialogTitle">Remove this item?</h3>
    <p id="dialogBody">“Quarterly plan” will be removed from the workspace. You can undo this for a few seconds.</p>
    <div class="ac-actions">
      <button class="btn btn-sm" type="button" id="cancel">Keep it</button>
      <button class="btn btn-sm btn-danger" type="button" id="confirm">Remove</button>
    </div>
  </div>
  <div class="ac-undo" id="undoBar" hidden>
    <span class="dot dot-ok"></span>
    <span id="undoText">Item removed</span>
    <span class="ac-undo-bar"><span id="undoFill"></span></span>
    <button class="ac-undo-btn" type="button" id="undo">Undo</button>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.ac{display:flex;flex-direction:column;min-height:0;flex:1;position:relative}
.ac-list{display:grid;gap:4px;align-content:start}
.ac-item{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--s2);
  border:1px solid var(--line);border-radius:var(--r-sm);font-size:11.5px;
  animation:m-rise-sm var(--t-3) var(--ease-out) both}
.ac-item .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fg)}
.ac-item .meta{font-size:9px;color:var(--fg-3)}
.ac-item .rm{display:grid;place-items:center;width:20px;height:20px;border-radius:var(--r-xs);
  color:var(--fg-4);transition:background var(--t-1),color var(--t-1)}
.ac-item .rm:hover{background:rgba(251,113,133,.16);color:var(--danger)}
.ac-scrim{position:absolute;inset:-14px;background:rgba(23,23,26,.32);backdrop-filter:blur(1.5px);z-index:8;
  animation:m-fade var(--t-2) var(--ease-out) both}
.ac-dialog{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9;
  width:min(100%,258px);padding:14px;background:var(--s3);border:1px solid var(--line-2);
  border-radius:var(--r-lg);box-shadow:var(--shadow-3);
  animation:m-dialog-in var(--t-3) var(--spring) both}
@keyframes m-dialog-in{0%{opacity:0;transform:translate(-50%,-46%) scale(.94)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.ac-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:var(--r-sm);margin-bottom:9px;
  background:var(--danger-bg);color:var(--danger)}
.ac-dialog h2{font-size:13px;margin-bottom:4px}
.ac-dialog p{font-size:10.5px;color:var(--fg-3);line-height:1.5}
.ac-actions{display:flex;gap:6px;margin-top:13px}
.ac-actions .btn{flex:1}
.ac-undo{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:7px;
  padding:7px 9px;background:var(--s3);border:1px solid var(--line-2);border-radius:var(--r-sm);
  font-size:10.5px;color:var(--fg-2);box-shadow:var(--shadow-2);z-index:5;
  animation:m-slide-in-bottom var(--t-3) var(--ease-out) both}
.ac-undo-bar{flex:1;height:2px;border-radius:1px;background:var(--s5);overflow:hidden;min-width:24px}
.ac-undo-bar span{display:block;height:100%;width:100%;background:var(--accent);transform-origin:left}
.ac-undo-btn{font-size:10.5px;font-weight:650;color:var(--accent);padding:2px 4px;border-radius:3px}
.ac-undo-btn:hover{background:var(--accent-soft)}
`,
js: `
const ITEMS=[
 {name:'Quarterly plan',meta:'Edited 2h ago'},
 {name:'Brand refresh',meta:'Edited yesterday'},
 {name:'Q4 roadmap',meta:'Edited Mon'}
];
const list=$('#acList'),dialog=$('#dialog'),scrim=$('#acScrim'),status=$('#status'),
      undoBar=$('#undoBar'),undoText=$('#undoText'),undoFill=$('#undoFill'),undoBtn=$('#undo');
let pending=null,lastFocus=null,removeTimer=null,tickTimer=null,remaining=5000;

function draw(){
  list.replaceChildren(...ITEMS.map((it,i)=>{
    const row=document.createElement('div');
    row.className='ac-item';row.style.animationDelay=(i*30)+'ms';
    row.innerHTML='<span class="dot dot-ok"></span><span class="nm">'+it.name+'</span>'+
      '<span class="meta">'+it.meta+'</span>'+
      '<button class="rm" type="button" aria-label="Remove '+it.name+'"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>';
    row.querySelector('.rm').addEventListener('click',()=>openDialog(it.name,row));
    return row;
  }));
}
function openDialog(name,row){
  pending={name,row};
  lastFocus=document.activeElement;
  $('#dialogBody').textContent='“'+name+'” will be removed from the workspace. You can undo this for a few seconds.';
  dialog.hidden=false;scrim.hidden=false;
  document.querySelector('.frame-bar').setAttribute('aria-hidden','false');
  $('#cancel').focus();
  status.textContent='Confirmation dialog opened for '+name;
}
function closeDialog(restore){
  dialog.hidden=true;scrim.hidden=true;pending=null;
  if(restore!==false&&lastFocus)lastFocus.focus();
}
$('#cancel').addEventListener('click',()=>{closeDialog();status.textContent='Removal cancelled'});
scrim.addEventListener('click',()=>{closeDialog();status.textContent='Removal cancelled'});
$('#confirm').addEventListener('click',()=>{
  if(!pending)return;
  const {name,row}=pending;
  closeDialog(false);
  row.style.transition='opacity var(--t-2),transform var(--t-2)';
  row.style.opacity='0';row.style.transform='translateX(-8px)';
  setTimeout(()=>{row.hidden=true;row.style.opacity='';row.style.transform=''},200);
  undoText.textContent=name+' removed';
  undoBar.hidden=false;
  remaining=5000;
  undoFill.style.transition='none';
  undoFill.style.transform='scaleX(1)';
  void undoFill.offsetWidth;
  undoFill.style.transition='transform '+remaining+'ms linear';
  undoFill.style.transform='scaleX(0)';
  clearTimeout(removeTimer);clearInterval(tickTimer);
  removeTimer=setTimeout(()=>{undoBar.hidden=true;status.textContent=name+' deleted permanently'},remaining);
  status.textContent=name+' removed — undo available';
  $('#undo').focus();
});
undoBtn.addEventListener('click',()=>{
  clearTimeout(removeTimer);clearInterval(tickTimer);
  undoBar.hidden=true;
  const row=list.querySelector('.ac-item[hidden]');
  if(row){row.hidden=false;row.style.opacity='0';row.style.transform='translateX(-8px)';
    requestAnimationFrame(()=>{row.style.opacity='1';row.style.transform='none'})}
  status.textContent='Item restored';
  draw();
});
dialog.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();closeDialog();status.textContent='Removal cancelled';return}
  if(e.key!=='Tab')return;
  const f=$$('button:not([disabled])',dialog);
  const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
draw();
`
};

export const progressSteps = {
slug: 'progress-steps',
title: 'Progress steps',
tag: 'numbered',
body: `
<div class="ps">
  <ol class="ps-head" id="steps"></ol>
  <div class="ps-panel" id="psPanel"></div>
  <div class="ps-foot">
    <button class="btn btn-sm" type="button" id="back">Back</button>
    <span class="spacer"></span>
    <button class="btn btn-sm btn-primary" type="button" id="next">Continue</button>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.ps{display:flex;flex-direction:column;min-height:0;flex:1}
.ps-head{display:flex;align-items:flex-start;gap:0;margin-bottom:16px;flex:none;position:relative}
.ps-step{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;z-index:1}
.ps-bub{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;position:relative;
  background:var(--s1);border:1.5px solid var(--line-3);color:var(--fg-4);font-size:10px;font-weight:700;
  transition:background var(--t-3) var(--ease-out),border-color var(--t-3),color var(--t-3),
             transform var(--t-3) var(--spring),box-shadow var(--t-3) var(--ease-out)}
.ps-bub svg{position:absolute;width:11px;height:11px;opacity:0;transform:scale(.4);transition:opacity var(--t-2),transform var(--t-3) var(--spring)}
.ps-lab{font-size:9px;color:var(--fg-3);letter-spacing:.02em;transition:color var(--t-2);white-space:nowrap;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;text-align:center}
@container preview (max-width:330px){.ps-lab{font-size:8.5px}.ps-bub{width:21px;height:21px;font-size:9px}}
.ps-step[data-state=active] .ps-bub{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);
  transform:scale(1.1);box-shadow:0 0 0 4px var(--accent-soft)}
.ps-step[data-state=active] .ps-lab{color:var(--fg);font-weight:650}
.ps-step[data-state=done] .ps-bub{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.ps-step[data-state=done] .ps-bub span{opacity:0;transform:scale(.5);transition:opacity var(--t-1)}
.ps-step[data-state=done] .ps-bub svg{opacity:1;transform:none}
.ps-step[data-state=done] .ps-lab{color:var(--fg-2)}
.ps-line{position:absolute;top:12px;left:50%;width:100%;height:1.5px;background:var(--line-2);z-index:0}
.ps-step:last-child .ps-line{display:none}
.ps-line span{display:block;height:100%;width:0;background:var(--accent);border-radius:1px;
  transition:width var(--t-4) var(--ease-out)}
.ps-panel{flex:1;min-height:0;overflow:auto;animation:m-rise-sm var(--t-3) var(--ease-out) both}
.ps-f{margin-bottom:9px}
.ps-f:last-child{margin-bottom:0}
.ps-f .label{margin-bottom:4px}
.ps-foot{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:11px;border-top:1px solid var(--line);flex:none}
.ps-foot .btn{min-width:76px}
.ps-check{display:flex;align-items:center;gap:7px;padding:8px 9px;border-radius:var(--r-sm);
  background:var(--s2);border:1px solid var(--line);font-size:10.5px;color:var(--fg-3);cursor:pointer;
  transition:border-color var(--t-1),background var(--t-1)}
.ps-check:hover{border-color:var(--line-2)}
.ps-check.on{border-color:var(--accent-line);background:var(--accent-soft);color:var(--fg)}
`,
js: `
const NAMES=['Details','Preferences','Review'];
const stepsEl=$('#steps'),panel=$('#psPanel'),status=$('#status'),
      back=$('#back'),next=$('#next');
const state={name:'',tier:'Studio',email:false,digest:true};
let step=0,dir=1;

stepsEl.innerHTML=NAMES.map((n,i)=>
  '<li class="ps-step" data-state="todo"><span class="ps-bub"><span>'+(i+1)+'</span>'+
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'+
  '<span class="ps-lab">'+n+'</span><span class="ps-line"><span></span></span></li>').join('');

function panelFor(i){if(i===0)return '<div class="ps-f"><label class="label" for="psName">Project name</label>'+
    '<input class="input" id="psName" value="'+state.name+'" placeholder="Atlas"></div>'+
    '<div class="ps-f"><label class="label" for="psTier">Plan</label>'+
    '<select class="input" id="psTier">'+['Starter','Studio','Scale'].map(t=>'<option'+(t===state.tier?' selected':'')+'>'+t+'</option>').join('')+'</select></div>';if(i===1)return '<label class="ps-check'+(state.email?' on':'')+'" id="cEmail"><input type="checkbox" '+(state.email?'checked':'')+'> Email me release notes</label>'+
    '<label class="ps-check'+(state.digest?' on':'')+'" id="cDigest" style="margin-top:6px"><input type="checkbox" '+(state.digest?'checked':'')+'> Weekly digest</label>';return '<div class="ps-review">'+
    [['Project',state.name||'Atlas'],['Plan',state.tier],['Email notes',state.email?'Yes':'No'],['Digest',state.digest?'Yes':'No']]
      .map(([k,v])=>'<div class="ps-row"><span class="ps-k">'+k+'</span><span class="ps-v">'+v+'</span></div>').join('')+'</div>';}
function paint(){
  $$('.ps-step').forEach((li,i)=>{
    li.dataset.state=i<step?'done':i===step?'active':'todo';
    const line=li.querySelector('.ps-line span');
    if(line)line.style.width=i<step?'100%':'0';
  });
  back.disabled=step===0;
  next.textContent=step===2?'Create project':'Continue';
  panel.innerHTML=panelFor(step);
  panel.style.animation='none';void panel.offsetWidth;panel.style.animation='';
  if(step===0){$('#psName').addEventListener('input',e=>state.name=e.target.value);
    $('#psTier').addEventListener('change',e=>state.tier=e.target.value)}
  if(step===1){
    $('#cEmail').addEventListener('change',e=>{state.email=e.target.checked;
      e.target.closest('.ps-check').classList.toggle('on',e.target.checked)});
    $('#cDigest').addEventListener('change',e=>{state.digest=e.target.checked;
      e.target.closest('.ps-check').classList.toggle('on',e.target.checked)});
  }
  status.textContent='Step '+(step+1)+' of 3: '+NAMES[step];
}
next.addEventListener('click',()=>{
  if(step===2){
    status.textContent='Project '+(state.name||'Atlas')+' created on the '+state.tier+' plan.';
    next.textContent='Created ✓';next.disabled=true;
    setTimeout(()=>{step=0;state.name='';next.disabled=false;paint()},1400);
    return;
  }
  step++;paint();
});
back.addEventListener('click',()=>{if(step>0){step--;paint()}});
paint();
`
};

export const notificationCenter = {
slug: 'notification-center',
title: 'Notifications',
tag: 'read state',
body: `
<div class="nc">
  <div class="nc-head">
    <div class="nc-title">Inbox <span class="badge badge-accent" id="ncBadge">3</span></div>
    <div class="nc-tools">
      <button class="nc-filter" id="unread" aria-pressed="false" type="button">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3Z"/></svg>
        Unread only
      </button>
      <button class="nc-mark" id="markAll" type="button">Mark all read</button>
    </div>
  </div>
  <ul class="nc-list" id="notes"></ul>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.nc{display:flex;flex-direction:column;min-height:0;flex:1}
.nc-head{flex:none;margin-bottom:9px}
.nc-title{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:650;margin-bottom:8px}
.nc-title .badge{height:15px;min-width:15px;font-size:9px}
.nc-tools{display:flex;align-items:center;gap:5px}
.nc-filter{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 7px;border-radius:var(--r-full);
  background:var(--s2);border:1px solid var(--line-2);font-size:9.5px;color:var(--fg-3);
  transition:background var(--t-1),color var(--t-1),border-color var(--t-1)}
.nc-filter:hover{color:var(--fg-2);border-color:var(--line-3)}
.nc-filter[aria-pressed=true]{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent);font-weight:600}
.nc-mark{margin-left:auto;font-size:9.5px;color:var(--fg-3);transition:color var(--t-1)}
.nc-mark:hover{color:var(--fg-2)}
.nc-list{flex:1;min-height:0;overflow:auto;display:grid;gap:4px;align-content:start;
  scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.nc-list::-webkit-scrollbar{width:7px}
.nc-list::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.nc-n{display:flex;gap:8px;padding:8px 9px;border-radius:var(--r-sm);position:relative;cursor:pointer;
  background:var(--s2);border:1px solid var(--line);text-align:left;width:100%;
  transition:background var(--t-2),border-color var(--t-2),transform var(--t-1) var(--ease-out)}
.nc-n:hover{background:var(--s3);border-color:var(--line-2);transform:translateX(1px)}
.nc-n:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.nc-n.unread{background:var(--s3);border-color:var(--line-2)}
.nc-n.unread::before{content:"";position:absolute;left:-1px;top:9px;bottom:9px;width:2px;
  border-radius:2px;background:var(--accent)}
.nc-av{width:21px;height:21px;border-radius:50%;flex:none;display:grid;place-items:center;
  font-size:8.5px;font-weight:700;background:var(--s5);color:var(--fg-2);letter-spacing:.02em}
.nc-n[data-tone=green] .nc-av{background:var(--ok-bg);color:var(--ok)}
.nc-n[data-tone=blue] .nc-av{background:rgba(121,184,255,.16);color:var(--info)}
.nc-n[data-tone=amber] .nc-av{background:rgba(245,196,81,.16);color:var(--warn)}
.nc-c{flex:1;min-width:0}
.nc-t{font-size:10.5px;color:var(--fg-3);line-height:1.35}
.nc-n.unread .nc-t{color:var(--fg);font-weight:550}
.nc-t b{font-weight:700;color:var(--fg)}
.nc-s{font-size:9.5px;color:var(--fg-3);margin-top:2px;display:flex;align-items:center;gap:4px}
.nc-s .nx{color:var(--accent);font-weight:600;opacity:0;transition:opacity var(--t-1)}
.nc-n:hover .nx{opacity:1}
.nc-empty{display:grid;place-items:center;gap:5px;padding:26px 10px;text-align:center;
  font-size:10.5px;color:var(--fg-4);animation:m-fade var(--t-3) var(--ease-out) both}
.nc-empty svg{opacity:.5}
`,
js: `
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
`
};

export default [calendar, statusDashboard, toastStack, actionConfirm, progressSteps, notificationCenter];
