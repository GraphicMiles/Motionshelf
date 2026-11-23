// Data table, virtual list, kanban, activity timeline, comparison grid.

export const dataTable = {
slug: 'data-table',
title: 'Data table',
tag: 'sort + select',
body: `
<div class="dt">
  <div class="dt-head">
    <div class="dt-title">Top products</div>
    <span class="badge" id="dtCount">0 selected</span>
  </div>
  <div class="dt-search">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input id="dtQuery" type="search" placeholder="Search products…" autocomplete="off">
  </div>
  <div class="dt-scroll" id="dtScroll">
    <table class="dt-table">
      <thead>
        <tr>
          <th class="dt-check"><input type="checkbox" id="dtAll" aria-label="Select all rows"></th>
          <th scope="col"><button class="dt-sort" data-col="name" aria-label="Sort by product">Product</button></th>
          <th scope="col" class="dt-r"><button class="dt-sort dt-on" data-col="revenue" aria-label="Sort by revenue">Revenue<i class="dt-ar" aria-hidden="true"></i></button></th>
          <th scope="col" class="dt-r"><button class="dt-sort" data-col="delta" aria-label="Sort by change">Δ</button></th>
        </tr>
      </thead>
      <tbody id="dtBody"></tbody>
    </table>
  </div>
  <div class="dt-bulk" id="dtBulk" hidden>
    <span id="dtBulkText">0 selected</span>
    <span class="spacer"></span>
    <button class="btn btn-sm btn-ghost" type="button" id="dtExport">Export</button>
    <button class="btn btn-sm btn-danger" type="button" id="dtDelete">Delete</button>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.dt{display:flex;flex-direction:column;min-height:0;flex:1;position:relative}
.dt-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex:none}
.dt-title{font-size:12.5px;font-weight:650;letter-spacing:-.01em}
.dt-head .badge{background:var(--s2);border:1px solid var(--line);color:var(--fg-3);transition:background var(--t-2),color var(--t-2),border-color var(--t-2)}
.dt-head .badge.on{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.dt-search{display:flex;align-items:center;gap:6px;height:28px;padding:0 9px;margin-bottom:7px;flex:none;
  background:var(--s2);border:1px solid var(--line-2);border-radius:var(--r-sm);color:var(--fg-4);
  transition:border-color var(--t-1),box-shadow var(--t-2) var(--ease-out)}
.dt-search:focus-within{border-color:var(--accent-line);box-shadow:0 0 0 3px var(--accent-soft);color:var(--accent)}
.dt-search input{flex:1;min-width:0;height:100%;background:none;border:0;outline:none;font-size:11px;color:var(--fg)}
.dt-search input::placeholder{color:var(--fg-3)}
.dt-scroll{flex:1;min-height:0;overflow:auto;border-radius:var(--r-sm);border:1px solid var(--line);
  background:var(--s1);scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.dt-scroll::-webkit-scrollbar{width:7px;height:7px}
.dt-scroll::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.dt-table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px}
.dt-table thead th{position:sticky;top:0;z-index:2;background:var(--s2);text-align:left;font-size:11px;font-weight:520;letter-spacing:-.004em;color:var(--fg-3);padding:0;height:26px;border-bottom:1px solid var(--line-2);white-space:nowrap;overflow:hidden}
@container preview (max-width:330px){
  .dt-table thead th{font-size:8px;letter-spacing:.04em}
  .dt-table td{padding:0 5px;font-size:10.5px}
  .dt-sort{padding:0 5px;font-size:8px}
  .dt-table .dt-delta{font-size:9px;padding:1px 3px}
}
.dt-table thead th:first-child{border-radius:var(--r-sm) 0 0 0;padding-left:7px}
.dt-table thead th:last-child{border-radius:0 var(--r-sm) 0 0}
.dt-table th.dt-r,.dt-table td.dt-r{text-align:right}
.dt-check{width:22px}
.dt-sort{display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 7px;width:100%;font-size:11px;font-weight:520;letter-spacing:-.004em;color:var(--fg-3);transition:color var(--t-1)}
.dt-r .dt-sort{justify-content:flex-end}
.dt-sort:hover{color:var(--fg-2)}
.dt-sort.dt-on{color:var(--accent)}
.dt-ar{display:inline-block;width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;
  border-top:4px solid currentColor;opacity:0;transition:transform var(--t-2) var(--spring),opacity var(--t-1)}
.dt-sort.dt-on .dt-ar{opacity:1}
.dt-sort.dt-on.asc .dt-ar{transform:rotate(180deg)}
.dt-table tbody tr{transition:background var(--t-1)}
.dt-table tbody tr:hover{background:rgba(0,0,0,.02)}
.dt-table tbody tr.sel{background:var(--accent-soft)}
.dt-table tbody tr.sel:hover{background:var(--s4)}
.dt-table td{padding:0 7px;height:31px;border-bottom:1px solid rgba(0,0,0,.02);color:var(--fg-2)}
.dt-table tbody tr:last-child td{border-bottom:0}
.dt-table td.dt-name{color:var(--fg);font-weight:550}
.dt-table td.dt-name small{display:block;font-size:9px;color:var(--fg-3);font-weight:400;margin-top:-2px}
.dt-num{font-variant-numeric:tabular-nums}
.dt-delta{display:inline-flex;align-items:center;gap:2px;font-size:10px;font-variant-numeric:tabular-nums;
  padding:1px 5px;border-radius:var(--r-full);font-weight:600}
.dt-delta.up{background:var(--ok-bg);color:var(--ok)}
.dt-delta.down{background:var(--danger-bg);color:var(--danger)}
.dt-delta svg{width:8px;height:8px}
.dt-empty{padding:24px;text-align:center;font-size:11px;color:var(--fg-4)}
.dt-bulk{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:6px;
  padding:8px 10px;background:var(--s3);border:1px solid var(--line-2);border-radius:var(--r-md);
  box-shadow:var(--shadow-3);font-size:11px;color:var(--fg-2);
  animation:m-slide-in-bottom var(--t-3) var(--ease-out) both;z-index:4}
input[type=checkbox]{appearance:none;width:13px;height:13px;border-radius:4px;border:1.5px solid var(--line-3);
  background:var(--s2);cursor:pointer;position:relative;transition:background var(--t-1),border-color var(--t-1),transform var(--t-1) var(--spring);flex:none}
input[type=checkbox]:hover{border-color:var(--fg-4)}
input[type=checkbox]:checked{background:var(--accent);border-color:var(--accent)}
input[type=checkbox]:checked::after{content:"";position:absolute;left:3.5px;top:1px;width:3px;height:6px;
  border:solid var(--accent-ink);border-width:0 1.8px 1.8px 0;transform:rotate(40deg)}
input[type=checkbox]:indeterminate{background:var(--accent);border-color:var(--accent)}
input[type=checkbox]:indeterminate::after{content:"";position:absolute;left:3px;top:5px;width:5px;height:1.8px;background:var(--accent-ink);border-radius:1px}
input[type=checkbox]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
`,
js: `
const ROWS=[
 {id:1,name:'Floor Lamp',cat:'Lighting',rev:73174,delta:12.8},
 {id:2,name:'Linen Shirt',cat:'Apparel',rev:72504,delta:5.2},
 {id:3,name:'Bamboo Shelf',cat:'Furniture',rev:67176,delta:23.4},
 {id:4,name:'Studio Headphones',cat:'Audio',rev:66463,delta:15.0},
 {id:5,name:'Soy Candle',cat:'Home',rev:66377,delta:-4.5},
 {id:6,name:'Leather Wallet',cat:'Accessories',rev:64015,delta:11.8},
 {id:7,name:'Linen Throw',cat:'Textiles',rev:63979,delta:-2.3},
 {id:8,name:'Camp Blanket',cat:'Textiles',rev:63418,delta:58.0},
 {id:9,name:'Travel Mug',cat:'Kitchen',rev:62942,delta:14.5},
 {id:10,name:'Noise Speaker',cat:'Audio',rev:58428,delta:-1.2},
 {id:11,name:'Pocket Notebook',cat:'Stationery',rev:58255,delta:43.7},
 {id:12,name:'Desk Mat',cat:'Stationery',rev:56815,delta:4.3}
];
const body=$('#dtBody'),scroll=$('#dtScroll'),query=$('#dtQuery'),all=$('#dtAll'),
      bulk=$('#dtBulk'),bulkText=$('#dtBulkText'),status=$('#status'),count=$('#dtCount');
let sort={col:'revenue',dir:'desc'};
let selected=new Set();
let q='';

const money=n=>'$'+n.toLocaleString('en-US');
const arrow=up=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'+
  (up?'<path d="M12 19V5M5 12l7-7 7 7"/>':'<path d="M12 5v14M19 12l-7 7-7-7"/>')+'</svg>';

function rows(){
  let out=ROWS.slice();
  if(q)out=out.filter(r=>(r.name+' '+r.cat).toLowerCase().includes(q));
  out.sort((a,b)=>{
    const k=sort.col;
    const av=k==='name'?a.name.toLowerCase():a[k];
    const bv=k==='name'?b.name.toLowerCase():b[k];
    if(av<bv)return sort.dir==='asc'?-1:1;
    if(av>bv)return sort.dir==='asc'?1:-1;
    return 0;
  });
  return out;
}
function draw(){
  const list=rows();
  body.replaceChildren(...list.map(r=>{
    const tr=document.createElement('tr');
    tr.className=selected.has(r.id)?'sel':'';
    tr.innerHTML='<td class="dt-check"><input type="checkbox" aria-label="Select '+r.name+'"'+(selected.has(r.id)?' checked':'')+'></td>'+
      '<td class="dt-name">'+r.name+'<small>'+r.cat+'</small></td>'+
      '<td class="dt-r dt-num">'+money(r.rev)+'</td>'+
      '<td class="dt-r"><span class="dt-delta '+(r.delta>=0?'up':'down')+'">'+arrow(r.delta>=0)+Math.abs(r.delta).toFixed(1)+'%</span></td>';
    tr.querySelector('input').addEventListener('change',e=>{
      if(e.target.checked)selected.add(r.id);else selected.delete(r.id);
      tr.classList.toggle('sel',e.target.checked);
      syncSelect();
    });
    return tr;
  }));
  if(!list.length)body.innerHTML='<tr><td colspan="4" class="dt-empty">No products match that search.</td></tr>';
  syncSelect();
}
function syncSelect(){
  const list=rows();
  const n=selected.size;
  count.textContent=n+' selected';
  count.classList.toggle('on',n>0);
  const allOn=list.length>0&&list.every(r=>selected.has(r.id));
  const someOn=list.some(r=>selected.has(r.id));
  all.checked=allOn;
  all.indeterminate=!allOn&&someOn;
  bulk.hidden=n===0;
  bulkText.textContent=n+' row'+(n===1?'':'s')+' selected';
}
$$('.dt-sort').forEach(b=>b.addEventListener('click',()=>{
  const col=b.dataset.col;
  if(sort.col===col)sort.dir=sort.dir==='asc'?'desc':'asc';
  else sort={col,dir:col==='name'?'asc':'desc'};
  $$('.dt-sort').forEach(x=>{x.classList.toggle('dt-on',x===b);x.classList.toggle('asc',x===b&&sort.dir==='asc')});
  draw();
  status.textContent='Sorted by '+col+' '+sort.dir+'ending';
}));
all.addEventListener('change',()=>{
  const list=rows();
  if(all.checked)list.forEach(r=>selected.add(r.id));
  else list.forEach(r=>selected.delete(r.id));
  draw();
  status.textContent=all.checked?list.length+' rows selected':'Selection cleared';
});
query.addEventListener('input',()=>{q=query.value.trim().toLowerCase();draw()});
$('#dtDelete').addEventListener('click',()=>{
  const n=selected.size;
  ROWS.forEach((r,i)=>{if(selected.has(r.id))ROWS.splice(i,1)});
  selected.clear();draw();
  status.textContent=n+' rows deleted';
});
$('#dtExport').addEventListener('click',()=>{status.textContent=selected.size+' rows exported as CSV'});
draw();
`
};

export const virtualList = {
slug: 'virtual-list',
title: 'Virtual list',
tag: '10,000 rows',
body: `
<div class="vl">
  <div class="vl-head">
    <span class="vl-title">Audit log</span>
    <span class="badge" id="vlBadge">10,000</span>
  </div>
  <div class="vl-view" id="viewport" tabindex="0" role="list" aria-label="Audit log entries">
    <div class="vl-spacer" id="spacer"><div class="vl-window" id="window"></div></div>
  </div>
  <div class="vl-foot">
    <span id="vlRange">Rows 1–12</span>
    <span class="spacer"></span>
    <button class="btn btn-sm btn-ghost" type="button" id="vlTop">Jump to top</button>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.vl{display:flex;flex-direction:column;min-height:0;flex:1}
.vl-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;flex:none}
.vl-title{font-size:12px;font-weight:650}
.vl-head .badge{background:var(--s2);border:1px solid var(--line);color:var(--fg-3);font-variant-numeric:tabular-nums}
.vl-view{position:relative;flex:1;min-height:0;overflow:auto;border-radius:var(--r-sm);
  background:var(--s1);border:1px solid var(--line);scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.vl-view::-webkit-scrollbar{width:7px}
.vl-view::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.vl-view:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.vl-spacer{position:relative}
.vl-window{position:absolute;left:0;right:0;top:0;will-change:transform}
.vl-row{display:flex;align-items:center;gap:7px;height:32px;padding:0 9px;
  border-bottom:1px solid rgba(0,0,0,.02);font-size:11px;color:var(--fg-2);
  contain:layout style}
.vl-row .ix{font-family:var(--mono);font-size:9px;color:var(--fg-3);width:34px;flex:none;font-variant-numeric:tabular-nums}
.vl-row .dot{width:5px;height:5px}
.vl-row .ev{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vl-row .who{font-size:9.5px;color:var(--fg-3);flex:none}
.vl-foot{display:flex;align-items:center;gap:7px;margin-top:7px;flex:none;font-size:10px;color:var(--fg-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.vl-foot .btn{white-space:nowrap}
`,
js: `
const N=10000,ROW=32;
const EVENTS=['updated the token file','published a release','opened a pull request','commented on the spec',
 'archived a workspace','invited a member','changed the theme','deleted 4 rows','exported a CSV','created a branch'];
const WHO=['amara','kai','mira','tobi','len','sana'];
const viewport=$('#viewport'),spacer=$('#spacer'),win=$('#window'),
      range=$('#vlRange'),status=$('#status'),badge=$('#vlBadge');
spacer.style.height=N*ROW+'px';
badge.textContent=N.toLocaleString('en-US');

function record(i){
  // deterministic so scrolling never reshuffles
  const ev=EVENTS[(i*7)%EVENTS.length],who=WHO[(i*13)%WHO.length];
  const min=String((i*17)%60).padStart(2,'0');
  return {i,ev,who,time:'0'+(1+(i%9))+':'+min,
    tone:i%17===0?'dot-danger':i%11===0?'dot-warn':'dot-ok'};
}
function draw(){
  const h=viewport.clientHeight||180;
  const start=Math.max(0,Math.floor(viewport.scrollTop/ROW)-3);
  const count=Math.ceil(h/ROW)+6;
  const end=Math.min(N,start+count);
  win.style.transform='translateY('+(start*ROW)+'px)';
  const frag=document.createDocumentFragment();
  for(let i=start;i<end;i++){
    const r=record(i);
    const row=document.createElement('div');
    row.className='vl-row';row.setAttribute('role','listitem');
    row.setAttribute('aria-posinset',String(i+1));
    row.setAttribute('aria-setsize',String(N));
    row.innerHTML='<span class="ix">'+String(i+1).padStart(5,'0')+'</span>'+
      '<span class="dot '+r.tone+'"></span>'+
      '<span class="ev">'+r.who+' '+r.ev+'</span>'+
      '<span class="who">'+r.time+'</span>';
    frag.append(row);
  }
  win.replaceChildren(frag);
  range.textContent='Rows '+(start+1).toLocaleString('en-US')+'–'+end.toLocaleString('en-US')+' of '+N.toLocaleString('en-US');
}
let queued=false;
viewport.addEventListener('scroll',()=>{
  if(queued)return;
  queued=true;requestAnimationFrame(()=>{queued=false;draw()});
},{passive:true});
$('#vlTop').addEventListener('click',()=>{viewport.scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'});status.textContent='Jumped to top'});
new ResizeObserver(draw).observe(viewport);
draw();
`
};

export const kanban = {
slug: 'kanban-lanes',
title: 'Kanban lanes',
tag: 'move cards',
body: `
<div class="kb">
  <div class="kb-head">
    <span class="kb-title">Sprint 24</span>
    <span class="kb-meta" id="kbMeta"></span>
  </div>
  <div class="kb-lanes" id="kbLanes">
    <section class="kb-lane" data-lane="todo">
      <header><span class="kb-dot"></span><h2>To do</h2><span class="badge" data-count>0</span></header>
      <div class="kb-cards" data-drop="todo" tabindex="0" role="group" aria-label="To do tasks"></div>
      <button class="kb-add" type="button" data-add="todo">+ Add task</button>
    </section>
    <section class="kb-lane" data-lane="doing">
      <header><span class="kb-dot"></span><h2>In progress</h2><span class="badge" data-count>0</span></header>
      <div class="kb-cards" data-drop="doing" tabindex="0" role="group" aria-label="In progress tasks"></div>
      <button class="kb-add" type="button" data-add="doing">+ Add task</button>
    </section>
    <section class="kb-lane" data-lane="done">
      <header><span class="kb-dot"></span><h2>Done</h2><span class="badge" data-count>0</span></header>
      <div class="kb-cards" data-drop="done" tabindex="0" role="group" aria-label="Done tasks"></div>
      <button class="kb-add" type="button" data-add="done">+ Add task</button>
    </section>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.kb{display:flex;flex-direction:column;min-height:0;flex:1}
.kb-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:9px;flex:none}
.kb-title{font-size:12.5px;font-weight:650}
.kb-meta{font-size:10px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.kb-lanes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;flex:1;min-height:0}
@container preview (max-width:340px){
  .kb-lanes{grid-template-columns:1fr;gap:5px;overflow:auto;align-content:start}
  .kb-lane{min-height:0}
  .kb-cards{overflow:visible}
  .kb-card{font-size:11px;padding:8px 9px}
  .kb-lane header h2{font-size:11px}
}
.kb-lane{display:flex;flex-direction:column;min-height:0;background:var(--s2);border:1px solid var(--line);
  border-radius:var(--r-md);padding:6px;transition:border-color var(--t-2) var(--ease-out),background var(--t-2)}
.kb-lane.dragover{border-color:var(--fg-4);background:rgba(0,0,0,.03)}
.kb-lane header{display:flex;align-items:center;gap:5px;padding:0 2px 6px;flex:none}
.kb-lane header h2{font-size:10px;font-weight:650;color:var(--fg-2);letter-spacing:-.005em;flex:1;min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kb-dot{width:5px;height:5px;border-radius:50%;flex:none;background:var(--fg-4)}
.kb-lane[data-lane=todo] .kb-dot{background:var(--fg-3)}
.kb-lane[data-lane=doing] .kb-dot{background:var(--warn)}
.kb-lane[data-lane=done] .kb-dot{background:var(--ok)}
.kb-lane header .badge{height:15px;min-width:15px;font-size:9px;background:var(--s4)}
.kb-cards{display:flex;flex-direction:column;gap:5px;flex:1;min-height:0;overflow:auto;
  scrollbar-width:none;padding-bottom:2px}
.kb-cards::-webkit-scrollbar{display:none}
.kb-card{position:relative;background:var(--s1);border:1px solid var(--line-2);box-shadow:var(--shadow-1);border-radius:var(--r-sm);
  padding:7px 8px;font-size:10.5px;color:var(--fg-2);line-height:1.35;cursor:grab;
  transition:transform var(--t-2) var(--spring),box-shadow var(--t-2) var(--ease-out),
             border-color var(--t-1),opacity var(--t-2),background var(--t-1);
  animation:m-pop var(--t-3) var(--spring) both}
.kb-card:hover{border-color:var(--line-3);transform:translateY(-1px);box-shadow:var(--shadow-2);background:var(--s1)}
.kb-card:active{cursor:grabbing}
.kb-card.dragging{opacity:.4;transform:scale(.97) rotate(-1deg)}
.kb-card.drop-target{box-shadow:0 -2px 0 var(--accent)}
.kb-card .tags{display:flex;gap:3px;margin-top:5px}
.kb-card .tg{font-size:10.5px;padding:1.5px 6px;border-radius:var(--r-full);background:var(--s3);color:var(--fg-2);letter-spacing:-.004em}
.kb-card .av{position:absolute;right:6px;bottom:6px;width:15px;height:15px;border-radius:50%;
  background:var(--s4);color:var(--fg-2);font-size:8px;font-weight:600;letter-spacing:.01em;
  display:grid;place-items:center;font-variant-numeric:tabular-nums}
.kb-add{flex:none;margin-top:4px;height:20px;border-radius:var(--r-xs);font-size:9.5px;color:var(--fg-3);
  border:1px dashed var(--line-2);transition:color var(--t-1),border-color var(--t-1),background var(--t-1)}
.kb-add:hover{color:var(--fg-2);border-color:var(--line-3);background:var(--s3)}
.kb-empty{display:grid;place-items:center;height:38px;font-size:9px;color:var(--fg-3);
  border:1px dashed var(--line);border-radius:var(--r-xs)}
@keyframes kb-in{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
`,
js: `
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
`
};

export const activityTimeline = {
slug: 'activity-timeline',
title: 'Activity timeline',
tag: 'grouped',
body: `
<div class="al">
  <div class="al-filters" role="group" aria-label="Activity type">
    <button class="al-f" data-type="all" aria-pressed="true">All</button>
    <button class="al-f" data-type="updates" aria-pressed="false">Updates</button>
    <button class="al-f" data-type="comments" aria-pressed="false">Comments</button>
  </div>
  <div class="al-scroll" id="alScroll" tabindex="0" role="region" aria-label="Activity events">
    <ol class="al-list" id="events"></ol>
  </div>
  <button class="al-more" id="more" type="button">Load more</button>
  <p id="status" class="hint" role="status" aria-live="polite"></p>
</div>
`,
css: `
.al{display:flex;flex-direction:column;min-height:0;flex:1}
.al-filters{display:flex;gap:3px;padding:2px;background:var(--s2);border:1px solid var(--line);border-radius:var(--r-sm);flex:none;margin-bottom:10px}
.al-f{flex:1;height:23px;border-radius:var(--r-xs);font-size:10.5px;color:var(--fg-3);
  transition:background var(--t-2) var(--ease-out),color var(--t-2),box-shadow var(--t-2)}
.al-f:hover{color:var(--fg-2)}
.al-f[aria-pressed=true]{background:var(--s4);color:var(--fg);font-weight:600;box-shadow:var(--shadow-1)}
.al-scroll{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--s5) transparent;padding-right:2px}
.al-scroll::-webkit-scrollbar{width:7px}
.al-scroll::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.al-list{position:relative;display:grid;gap:0;padding-left:16px}
.al-list::before{content:"";position:absolute;left:4.5px;top:7px;bottom:8px;width:1px;
  background:linear-gradient(180deg,var(--line-2),rgba(0,0,0,.03))}
.al-e{position:relative;padding:0 0 11px 0;animation:m-slide-only var(--t-3) var(--ease-out) both}
@keyframes m-slide-only{from{transform:translateY(4px)}to{transform:none}}
.al-e:last-child{padding-bottom:2px}
.al-e::before{content:"";position:absolute;left:-14px;top:4px;width:7px;height:7px;border-radius:50%;
  background:var(--s1);border:1.5px solid var(--s5);z-index:1;transition:border-color var(--t-2),box-shadow var(--t-2)}
.al-e[data-type=updates]::before{border-color:var(--fg);box-shadow:0 0 0 3px rgba(0,0,0,.06)}
.al-e[data-type=comments]::before{border-color:var(--info);box-shadow:0 0 0 3px rgba(121,184,255,.1)}
.al-e .al-top{display:flex;align-items:baseline;gap:6px}
.al-e .al-who{font-size:11px;font-weight:600;color:var(--fg)}
.al-e .al-time{font-size:9px;color:var(--fg-3);margin-left:auto;font-variant-numeric:tabular-nums;flex:none}
.al-e .al-what{font-size:10.5px;color:var(--fg-2);margin-top:1px;line-height:1.45}
.al-e .al-quote{margin-top:5px;padding:5px 8px;border-radius:var(--r-xs);background:var(--s2);
  border-left:2px solid var(--line-3);font-size:10px;color:var(--fg-2);font-style:italic}
.al-more{flex:none;margin-top:2px;height:22px;border-radius:var(--r-xs);font-size:10px;color:var(--fg-3);
  background:var(--s2);border:1px solid var(--line-2);transition:background var(--t-1),color var(--t-1)}
.al-more:hover{background:var(--s3);color:var(--fg)}
`,
js: `
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
`
};

export const comparisonGrid = {
slug: 'comparison-grid',
title: 'Comparison grid',
tag: 'diff only',
body: `
<div class="cg">
  <label class="cg-toggle">
    <input type="checkbox" id="differences">
    <span>Only show differences</span>
  </label>
  <div class="cg-scroll" tabindex="0" role="region" aria-label="Feature comparison">
    <table class="cg-table">
      <thead>
        <tr>
          <th scope="col">Feature</th>
          <th scope="col">Basic</th>
          <th scope="col" class="cg-hi">Plus<span class="cg-star">★</span></th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
  <p id="status" class="hint" role="status" aria-live="polite"></p>
</div>
`,
css: `
.cg{display:flex;flex-direction:column;min-height:0;flex:1}
.cg-toggle{display:inline-flex;align-items:center;gap:8px;font-size:11px;color:var(--fg-3);
  cursor:pointer;margin-bottom:9px;user-select:none;flex:none;align-self:flex-start}
.cg-toggle:hover{color:var(--fg-2)}
.cg-toggle input{appearance:none;-webkit-appearance:none;position:relative;flex:none;
  width:26px;height:15px;border-radius:var(--r-full);background:var(--s4);border:1px solid var(--line-2);
  cursor:pointer;transition:background var(--t-2) var(--ease-out),border-color var(--t-2)}
.cg-toggle input::after{content:"";position:absolute;top:2px;left:2px;width:9px;height:9px;border-radius:50%;
  background:var(--fg-4);transition:transform var(--t-3) var(--spring),background var(--t-2)}
.cg-toggle input:checked{background:var(--accent);border-color:var(--accent)}
.cg-toggle input:checked::after{transform:translateX(11px);background:var(--accent-ink)}
.cg-toggle input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cg-scroll{flex:1;min-height:0;overflow:auto;border-radius:var(--r-sm);border:1px solid var(--line);
  scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.cg-scroll::-webkit-scrollbar{width:7px;height:7px}
.cg-scroll::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.cg-table{width:100%;border-collapse:separate;border-spacing:0;font-size:10.5px}
.cg-table thead th{position:sticky;top:0;z-index:2;background:var(--s2);height:28px;padding:0 9px;font-size:11px;font-weight:520;letter-spacing:-.004em;color:var(--fg-3);text-align:left;border-bottom:1px solid var(--line-2);white-space:nowrap}
.cg-table thead th:not(:first-child){text-align:center}
.cg-table thead th.cg-hi{color:var(--fg);background:var(--s1)}
.cg-star{font-size:7px;margin-left:3px;vertical-align:top}
.cg-table td{padding:0 9px;height:29px;border-bottom:1px solid rgba(0,0,0,.02);color:var(--fg-3);vertical-align:middle}
.cg-table td:not(:first-child){text-align:center;font-variant-numeric:tabular-nums}
.cg-table tbody tr:last-child td{border-bottom:0}
.cg-table tbody tr:hover td{background:rgba(0,0,0,.02)}
.cg-feat{color:var(--fg-2);font-weight:500}
.cg-table td.cg-plus{background:transparent;color:var(--fg);font-weight:520}
.cg-table tr.cg-diff td.cg-plus{color:var(--fg);font-weight:600}
.cg-yes{display:inline-grid;place-items:center;width:14px;height:14px;border-radius:50%;
  background:var(--ok-bg);color:var(--ok)}
.cg-no{display:inline-grid;place-items:center;width:14px;height:14px;border-radius:50%;
  background:rgba(251,113,133,.1);color:var(--danger)}
.cg-yes svg,.cg-no svg{width:8px;height:8px}
.cg-note{font-size:9.5px;color:var(--fg-3);margin-top:6px;flex:none}
`,
js: `
const FEATURES=[
 {name:'Projects',basic:'3',plus:'Unlimited',diff:true},
 {name:'Team members',basic:'5',plus:'20',diff:true},
 {name:'Version history',basic:'7 days',plus:'Unlimited',diff:true},
 {name:'Export CSV',basic:true,plus:true,diff:false},
 {name:'Priority support',basic:false,plus:true,diff:true},
 {name:'Custom domains',basic:false,plus:true,diff:true},
 {name:'SSO',basic:false,plus:false,diff:false},
 {name:'API access',basic:true,plus:true,diff:false}
];
const rows=$('#rows'),toggle=$('#differences'),status=$('#status');
const ICON_OK='<span class="cg-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';
const ICON_NO='<span class="cg-no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span>';
const cell=v=>v===true?ICON_OK:v===false?ICON_NO:String(v);
function draw(){
  const list=toggle.checked?FEATURES.filter(f=>f.diff):FEATURES;
  rows.replaceChildren(...list.map((f,i)=>{
    const tr=document.createElement('tr');
    tr.className=f.diff?'cg-diff':'';
    tr.style.animation='m-fade var(--t-2) var(--ease-out) both';
    tr.style.animationDelay=(i*18)+'ms';
    tr.innerHTML='<td class="cg-feat">'+f.name+'</td><td>'+cell(f.basic)+'</td><td class="cg-plus">'+cell(f.plus)+'</td>';
    return tr;
  }));
  status.textContent=list.length+' of '+FEATURES.length+' features shown'+
    (toggle.checked?' · differences only':'');
}
toggle.addEventListener('change',draw);
draw();
`
};

export default [dataTable, virtualList, kanban, activityTimeline, comparisonGrid];
