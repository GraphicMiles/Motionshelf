// Filter bar, nav drawer, nested menu, overflow tabs, breadcrumbs, TOC, pagination, tree.

export const filterBar = {
slug: 'filter-bar',
title: 'Filter bar',
tag: 'multi-select',
body: `
<div class="fb">
  <div class="fb-row" role="group" aria-label="Filter tasks">
    <button class="fb-chip" data-filter="all" aria-pressed="true">All <span class="fb-n" data-n="all">8</span></button>
    <button class="fb-chip" data-filter="design" aria-pressed="false">Design <span class="fb-n" data-n="design">3</span></button>
    <button class="fb-chip" data-filter="code" aria-pressed="false">Code <span class="fb-n" data-n="code">3</span></button>
    <button class="fb-chip" data-filter="review" aria-pressed="false">Review <span class="fb-n" data-n="review">2</span></button>
  </div>
  <div class="fb-active" id="fbActive" hidden>
    <span class="fb-lab">Active</span>
    <span class="fb-chips" id="fbChips"></span>
    <button class="fb-clear" id="fbClear" type="button">Clear all</button>
  </div>
  <ul class="fb-list" id="items"></ul>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.fb{display:flex;flex-direction:column;gap:0}
.fb-row{display:flex;flex-wrap:wrap;gap:5px}
.fb-chip{display:inline-flex;align-items:center;gap:5px;height:27px;padding:0 9px;border-radius:var(--r-full);
  background:var(--s2);border:1px solid var(--line-2);font-size:11px;color:var(--fg-3);
  transition:background var(--t-2) var(--ease-out),color var(--t-2),border-color var(--t-2),
             transform var(--t-2) var(--spring),box-shadow var(--t-2) var(--ease-out)}
.fb-chip:hover{background:var(--s3);color:var(--fg-2);transform:translateY(-1px)}
.fb-chip[aria-pressed=true]{background:var(--accent);border-color:transparent;color:var(--accent-ink);font-weight:650;
  box-shadow:none}
.fb-chip[aria-pressed=true]:hover{background:#262626;color:var(--accent-ink)}
.fb-chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.fb-n{font-size:9.5px;font-variant-numeric:tabular-nums;opacity:.62;font-weight:600}
.fb-active{display:flex;align-items:center;gap:6px;margin-top:9px;padding:6px 8px;border-radius:var(--r-sm);
  background:var(--s2);border:1px solid var(--line);animation:m-rise-sm var(--t-2) var(--ease-out) both}
.fb-lab{font-size:11px;letter-spacing:-.004em;color:var(--fg-4);font-weight:520}
.fb-chips{display:flex;flex-wrap:wrap;gap:4px;flex:1;min-width:0}
.fb-tag{display:inline-flex;align-items:center;gap:3px;height:19px;padding:0 3px 0 7px;border-radius:var(--r-full);
  background:var(--s4);border:1px solid var(--line-2);font-size:10px;color:var(--fg-2);
  animation:m-pop var(--t-3) var(--spring) both}
.fb-tag button{display:grid;place-items:center;width:14px;height:14px;border-radius:50%;color:var(--fg-4);transition:background var(--t-1),color var(--t-1)}
.fb-tag button:hover{background:rgba(251,113,133,.2);color:var(--danger)}
.fb-clear{font-size:10px;color:var(--fg-3);white-space:nowrap;transition:color var(--t-1)}
.fb-clear:hover{color:var(--danger)}
.fb-list{display:grid;gap:0;margin-top:11px;overflow:auto;min-height:0}
.fb-item{display:flex;align-items:center;gap:8px;height:22px;padding:0 2px;
  border-bottom:1px solid rgba(0,0,0,.03);font-size:11.5px;color:var(--fg-2);
  animation:m-slide-only var(--t-3) var(--ease-out) both}
@keyframes m-slide-only{from{transform:translateY(4px)}to{transform:none}}
.fb-item:last-child{border:0}
.fb-item .dot{flex:none}
.fb-item .nm{display:flex;flex-direction:column;min-height:0;flex:1}
.nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fb-item .tagm{font-size:9.5px;color:var(--fg-3);letter-spacing:.02em}
.fb-empty{padding:16px 4px;text-align:center;font-size:11px;color:var(--fg-4)}
`,
js: `
const TASKS=[
 {name:'Design tokens pass',type:'design',owner:'AR'},
 {name:'Build sidebar shell',type:'code',owner:'KO'},
 {name:'Review colour contrast',type:'review',owner:'MI'},
 {name:'Polish button states',type:'design',owner:'AR'},
 {name:'Wire filter logic',type:'code',owner:'KO'},
 {name:'Audit focus rings',type:'review',owner:'MI'},
 {name:'Ship dark palette',type:'design',owner:'AR'},
 {name:'Refactor date utils',type:'code',owner:'KO'}
];
const list=$('#items'),status=$('#status'),activeBox=$('#fbActive'),chips=$('#fbChips'),clearBtn=$('#fbClear');
let selected=new Set(['all']);

function counts(){
  const all=TASKS.length;
  const d=TASKS.filter(t=>t.type==='design').length;
  const c=TASKS.filter(t=>t.type==='code').length;
  const r=TASKS.filter(t=>t.type==='review').length;
  $$('.fb-n').forEach(n=>n.textContent={all,d,c,r}[n.dataset.n]??'');
}
function draw(){
  const filters=[...selected];
  const showAll=filters.includes('all')||!filters.length;
  const visible=showAll?TASKS:TASKS.filter(t=>filters.includes(t.type));
  list.replaceChildren(...visible.map((t,i)=>{
    const li=document.createElement('li');li.className='fb-item';
    li.style.animationDelay=(i*22)+'ms';
    li.innerHTML='<span class="dot '+(t.type==='review'?'dot-warn':t.type==='code'?'dot-ok':'dot-danger')+'"></span>'+
      '<span class="nm">'+t.name+'</span><span class="tagm">'+t.owner+'</span>';
    return li;
  }));
  if(!visible.length){list.innerHTML='<li class="fb-empty">No tasks match these filters.</li>'}
  activeBox.hidden=showAll;
  chips.replaceChildren(...filters.filter(f=>f!=='all').map(f=>{
    const span=document.createElement('span');span.className='fb-tag';span.textContent=f;
    const x=document.createElement('button');x.type='button';x.setAttribute('aria-label','Remove '+f+' filter');
    x.innerHTML='<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    x.addEventListener('click',()=>toggle(f));
    span.append(x);return span;
  }));
  $$('.fb-chip').forEach(b=>b.setAttribute('aria-pressed',String(selected.has(b.dataset.filter))));
  status.textContent=visible.length+' of '+TASKS.length+' tasks shown'+(showAll?'':' · filtered by '+filters.join(', '));
}
function toggle(f){
  if(f==='all'){selected=new Set(['all'])}
  else{
    selected.delete('all');
    if(selected.has(f))selected.delete(f);else selected.add(f);
    if(!selected.size)selected.add('all');
  }
  draw();
}
$$('.fb-chip').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.filter)));
clearBtn.addEventListener('click',()=>{selected=new Set(['all']);draw()});
counts();draw();
`
};

export const navDrawer = {
slug: 'responsive-nav-drawer',
title: 'Navigation drawer',
tag: 'slide + scrim',
body: `
<div class="nd">
  <header class="nd-bar">
    <button class="nd-burger" id="toggle" type="button" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
    <div class="nd-brand"><span class="nd-mark">M</span><span class="nd-word">Motionshelf</span></div>
    <span class="nd-crumb" id="ndCrumb">Overview</span>
  </header>
  <div class="nd-body" id="ndBody">
    <div class="nd-hero">
      <div class="badge badge-accent">Workspace</div>
      <h2>Design system</h2>
      <p>Four pages · 12 members</p>
    </div>
  </div>
  <div class="nd-scrim" id="ndScrim" hidden></div>
  <nav class="nd-drawer" id="drawer" aria-label="Workspace navigation" aria-hidden="true">
    <div class="nd-dhead">
      <span class="nd-mark">M</span>
      <div><strong>Motionshelf</strong><small>Design system</small></div>
      <button class="nd-close" id="close" type="button" aria-label="Close menu">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <ul class="nd-links" id="ndLinks">
      <li><a href="#overview" data-page="Overview"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>Overview</a></li>
      <li><a href="#activity" data-page="Activity"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-linecap="round" aria-hidden="true"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>Activity<span class="badge">3</span></a></li>
      <li><a href="#components" data-page="Components"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>Components</a></li>
      <li><a href="#settings" data-page="Settings"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.9V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 5.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>Settings</a></li>
    </ul>
    <div class="nd-dfoot"><span class="dot dot-ok"></span>All systems normal</div>
  </nav>
  <p id="status" class="sr-only" role="status" aria-live="polite">Menu closed</p>
</div>
`,
css: `
.nd{display:flex;flex-direction:column;flex:1;min-height:0;position:relative;margin:-14px;border-radius:0}
.nd-bar{display:flex;align-items:center;gap:9px;padding:8px 12px;border-bottom:1px solid var(--line);flex:none}
.nd-burger{display:grid;gap:3.5px;place-content:center;width:28px;height:28px;border-radius:var(--r-xs);
  background:var(--s3);border:1px solid var(--line-2);transition:background var(--t-1),border-color var(--t-1)}
.nd-burger:hover{background:var(--s4);border-color:var(--line-3)}
.nd-burger span{display:block;width:12px;height:1.5px;background:var(--fg-2);border-radius:1px;
  transition:transform var(--t-3) var(--spring),opacity var(--t-2),width var(--t-2)}
.nd-burger[aria-expanded=true] span:nth-child(1){transform:translateY(5px) rotate(45deg)}
.nd-burger[aria-expanded=true] span:nth-child(2){opacity:0}
.nd-burger[aria-expanded=true] span:nth-child(3){transform:translateY(-5px) rotate(-45deg)}
.nd-brand{display:flex;align-items:center;gap:6px}
.nd-mark{display:grid;place-items:center;width:19px;height:19px;border-radius:5px;background:var(--accent);
  color:var(--accent-ink);font-size:10px;font-weight:800;flex:none}
.nd-word{font-size:11.5px;font-weight:650;letter-spacing:-.01em}
.nd-crumb{margin-left:auto;font-size:10px;color:var(--fg-3);padding:2px 7px;border-radius:var(--r-full);background:var(--s2)}
.nd-body{flex:1;min-height:0;padding:14px 12px;overflow:auto}
.nd-hero h2{font-size:16px;margin:6px 0 2px}
.nd-hero p{font-size:11px;color:var(--fg-3)}
.nd-scrim{position:absolute;inset:0;background:rgba(23,23,26,.34);backdrop-filter:blur(1.5px);
  animation:m-fade var(--t-3) var(--ease-out) both;z-index:8}
.nd-drawer{position:absolute;top:0;bottom:0;left:0;width:74%;max-width:210px;z-index:9;
  display:flex;flex-direction:column;gap:0;
  background:var(--s2);border-right:1px solid var(--line-2);
  box-shadow:12px 0 40px -12px rgba(0,0,0,.9);
  transform:translateX(-102%);visibility:hidden;
  transition:transform var(--t-4) var(--ease-out),visibility 0s linear var(--t-4)}
.nd-drawer.open{transform:none;visibility:visible;
  transition:transform var(--t-4) var(--spring-soft,var(--ease-out)),visibility 0s}
.nd-dhead{display:flex;align-items:center;gap:8px;padding:11px 11px;border-bottom:1px solid var(--line);flex:none}
.nd-dhead strong{display:block;font-size:11.5px}
.nd-dhead small{display:block;font-size:9.5px;color:var(--fg-3)}
.nd-close{display:grid;place-items:center;width:22px;height:22px;margin-left:auto;border-radius:var(--r-xs);
  background:var(--s3);color:var(--fg-3);transition:background var(--t-1),color var(--t-1)}
.nd-close:hover{background:var(--s4);color:var(--fg)}
.nd-links{flex:1;padding:6px;display:grid;gap:1px;align-content:start}
.nd-links a{display:flex;align-items:center;gap:8px;height:31px;padding:0 8px;border-radius:var(--r-sm);
  font-size:11.5px;color:var(--fg-2);transition:background var(--t-1),color var(--t-1),padding-left var(--t-2) var(--ease-out)}
.nd-links a:hover{background:var(--s3);color:var(--fg);padding-left:10px}
.nd-links a.current{background:var(--accent-soft);color:var(--accent);font-weight:600}
.nd-links a .badge{margin-left:auto}
.nd-dfoot{display:flex;align-items:center;gap:5px;padding:9px 11px;border-top:1px solid var(--line);
  font-size:9.5px;color:var(--fg-3);flex:none}
`,
js: `
const toggle=$('#toggle'),drawer=$('#drawer'),closeBtn=$('#close'),scrim=$('#ndScrim'),
      status=$('#status'),crumb=$('#ndCrumb'),body=$('#ndBody');
let open=false;

function set(next,restoreFocus){
  open=next;
  drawer.classList.toggle('open',next);
  drawer.setAttribute('aria-hidden',String(!next));
  toggle.setAttribute('aria-expanded',String(next));
  scrim.hidden=!next;
  if(next){
    drawer.querySelector('a').focus();
  }else if(restoreFocus!==false){
    toggle.focus();
  }
  status.textContent=next?'Menu open':'Menu closed';
}
toggle.addEventListener('click',()=>set(!open));
closeBtn.addEventListener('click',()=>set(false));
scrim.addEventListener('click',()=>set(false));
document.addEventListener('keydown',e=>{
  if(!open)return;
  if(e.key==='Escape'){e.preventDefault();set(false);return}
  if(e.key==='Tab'){
    const f=$$('a[href],button',drawer).filter(el=>el.offsetParent!==null);
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
$$('#ndLinks a').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  $$('#ndLinks a').forEach(x=>x.classList.toggle('current',x===a));
  crumb.textContent=a.dataset.page;
  body.querySelector('.nd-hero h2').textContent=a.dataset.page;
  body.querySelector('.nd-hero p').textContent=
    {Overview:'Four pages · 12 members',Activity:'8 events today',Components:'28 documented',Settings:'Workspace preferences'}[a.dataset.page]||'';
  set(false,false);
  toggle.focus();
  status.textContent=a.dataset.page+' selected';
}));
$$('#ndLinks a')[0].classList.add('current');
`
};

export const nestedMenu = {
slug: 'nested-menu',
title: 'Nested menu',
tag: 'flyout',
body: `
<div class="nm">
  <div class="nm-bar">
    <button class="nm-trigger" id="parent" type="button" aria-expanded="false" aria-controls="submenu">
      <span class="nm-ic"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h10M4 17h7"/></svg></span>
      <span class="nm-txt">Project options</span>
      <svg class="nm-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  </div>
  <div class="nm-pop" id="submenu" role="menu" aria-label="Project options" hidden>
    <div class="nm-glab">Project</div>
    <button role="menuitem" tabindex="-1" data-action="Duplicate">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
      <span>Duplicate</span><kbd class="kbd">⌘D</kbd>
    </button>
    <button role="menuitem" tabindex="-1" data-action="Archive">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="4" width="20" height="5" rx="1.5"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>
      <span>Archive</span>
    </button>
    <div class="nm-sep"></div>
    <button role="menuitem" tabindex="-1" data-action="Share" class="nm-danger">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
      <span>Share</span>
    </button>
  </div>
  <div class="nm-result" id="nmResult" hidden></div>
  <p id="status" class="hint" role="status" aria-live="polite">Closed — press ↓ or click to open.</p>
</div>
`,
css: `
.nm{display:flex;flex-direction:column;position:relative;min-height:0}
.nm-bar{z-index:2;flex:none}
.nm-trigger{display:flex;align-items:center;gap:8px;width:100%;height:34px;padding:0 10px;
  background:var(--s2);border:1px solid var(--line-2);border-radius:var(--r-sm);font-size:12px;color:var(--fg-2);
  transition:background var(--t-1),border-color var(--t-2),color var(--t-1),box-shadow var(--t-2) var(--ease-out)}
.nm-trigger:hover{background:var(--s3);border-color:var(--line-3);color:var(--fg)}
.nm-trigger[aria-expanded=true]{background:var(--s3);border-color:var(--accent-line);
  box-shadow:0 0 0 3px var(--accent-soft);color:var(--fg)}
.nm-ic{color:var(--fg-3)}
.nm-trigger[aria-expanded=true] .nm-ic{color:var(--accent)}
.nm-txt{flex:1;text-align:left}
.nm-chev{color:var(--fg-4);transition:transform var(--t-3) var(--spring),color var(--t-2)}
.nm-trigger[aria-expanded=true] .nm-chev{transform:rotate(180deg);color:var(--accent)}
.nm-pop{position:relative;margin-top:6px;z-index:6;flex:1 1 auto;min-height:0;overflow:auto;
  background:var(--s1);border:1px solid var(--line);border-radius:var(--r-md);box-shadow:var(--shadow-pop);padding:5px;
  transform-origin:top center;animation:m-rise-sm var(--t-2) var(--ease-out) both}
.nm-pop::before{content:"";position:absolute;left:14px;top:-5px;width:8px;height:8px;background:var(--s3);
  transform:rotate(45deg);border-radius:1px;border-left:1px solid var(--line-2);border-top:1px solid var(--line-2)}
.nm-glab{font-size:11px;letter-spacing:-.004em;color:var(--fg-4);font-weight:520;padding:5px 7px 4px}
.nm-pop button{display:flex;align-items:center;gap:8px;width:100%;height:29px;padding:0 7px;border-radius:var(--r-xs);
  font-size:11.5px;color:var(--fg-2);text-align:left;transition:background var(--t-1),color var(--t-1),padding-left var(--t-2) var(--ease-out)}
.nm-pop button span{flex:1;min-width:0}
.nm-pop button:hover,.nm-pop button:focus-visible{background:var(--s4);color:var(--fg);padding-left:9px;outline:none}
.nm-pop button:focus-visible{box-shadow:inset 0 0 0 1px var(--accent-line)}
.nm-pop button .kbd{opacity:1;color:var(--fg-3);background:var(--s3)}
.nm-danger{color:var(--danger)!important}
.nm-danger:hover{background:var(--danger-bg)!important;color:var(--danger)!important}
.nm-sep{height:1px;background:var(--line);margin:4px 3px}
.nm-result{display:flex;align-items:center;gap:7px;margin-top:11px;padding:8px 10px;border-radius:var(--r-sm);
  background:var(--accent-soft);border:1px solid var(--accent-line);font-size:11px;color:var(--accent);
  animation:m-rise-sm var(--t-3) var(--ease-out) both}
`,
js: `
const parent=$('#parent'),menu=$('#submenu'),status=$('#status'),result=$('#nmResult');
let open=false;
const items=()=>$$('[role=menuitem]',menu);

function set(next,focus){
  open=next;
  menu.hidden=!next;
  parent.setAttribute('aria-expanded',String(next));
  if(next){
    (focus||items()[0]).focus();
    status.textContent='Menu open · '+items().length+' actions';
  }else{
    parent.focus();
    status.textContent='Closed — press ↓ or click to open.';
  }
}
parent.addEventListener('click',()=>set(!open));
// A flyout demo should display the flyout. Open on load, keep focus on the trigger
// so keyboard users start in the expected place.
set(true,parent);
parent.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowRight'||e.key==='Enter'||e.key===' '){
    e.preventDefault();if(!open)set(true);
  }
});
menu.addEventListener('keydown',e=>{
  const all=items(),i=all.indexOf(document.activeElement);
  if(e.key==='ArrowDown'){e.preventDefault();all[(i+1)%all.length].focus()}
  if(e.key==='ArrowUp'){e.preventDefault();all[(i-1+all.length)%all.length].focus()}
  if(e.key==='Escape'||e.key==='ArrowLeft'){e.preventDefault();set(false)}
  if(e.key==='Tab'){set(false)}
  if(e.key==='Home'){e.preventDefault();all[0].focus()}
  if(e.key==='End'){e.preventDefault();all[all.length-1].focus()}
});
items().forEach(b=>b.addEventListener('click',()=>{
  result.hidden=false;
  result.innerHTML='<span class="dot dot-ok"></span><span>'+b.dataset.action+' selected</span>';
  status.textContent=b.dataset.action+' selected';
  set(false);
  parent.focus();
}));
document.addEventListener('click',e=>{if(open&&!e.target.closest('.nm'))set(false,false)});
`
};

export const overflowTabs = {
slug: 'overflow-tabs',
title: 'Overflow tabs',
tag: 'scroll + glide',
layout: 'stage--opt',
body: `
<div class="ot">
  <div class="ot-wrap">
    <div class="ot-tabs" role="tablist" aria-label="Workspace sections" id="tabs">
      <button role="tab" aria-selected="true" aria-controls="panel" id="tab-0" tabindex="0">Overview</button>
      <button role="tab" aria-selected="false" aria-controls="panel" id="tab-1" tabindex="-1">Activity</button>
      <button role="tab" aria-selected="false" aria-controls="panel" id="tab-2" tabindex="-1">Files</button>
      <button role="tab" aria-selected="false" aria-controls="panel" id="tab-3" tabindex="-1">Permissions</button>
      <button role="tab" aria-selected="false" aria-controls="panel" id="tab-4" tabindex="-1">Settings</button>
      <span class="ot-ink" id="otInk" aria-hidden="true"></span>
    </div>
    <button class="ot-more" id="otMore" type="button" aria-label="Scroll tabs right" hidden>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
    <span class="ot-fade" id="otFade" aria-hidden="true"></span>
  </div>
  <div role="tabpanel" id="panel" tabindex="0" aria-labelledby="tab-0">
    <h2 id="otTitle">Overview</h3>
    <p id="otBody"></p>
    <div class="ot-stats" id="otStats"></div>
  </div>
</div>
`,
css: `
.ot{display:flex;flex-direction:column;gap:0;min-height:0}
.ot-wrap{position:relative;border-bottom:1px solid var(--line);margin:0 -1px}
.ot-tabs{position:relative;display:flex;gap:2px;overflow:auto;scrollbar-width:none;scroll-behavior:smooth;padding-bottom:0}
.ot-tabs::-webkit-scrollbar{display:none}
.ot-tabs button{position:relative;flex:none;height:31px;padding:0 10px;font-size:11.5px;color:var(--fg-3);
  border-radius:var(--r-xs) var(--r-xs) 0 0;white-space:nowrap;
  transition:color var(--t-2) var(--ease-out),background var(--t-1)}
.ot-tabs button:hover{color:var(--fg-2);background:rgba(0,0,0,.03)}
.ot-tabs button[aria-selected=true]{color:var(--fg);font-weight:600}
.ot-tabs button:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.ot-ink{position:absolute;bottom:-1px;left:0;height:2px;width:0;background:var(--accent);border-radius:1px;
  transition:transform var(--t-3) var(--ease-out),width var(--t-3) var(--ease-out);pointer-events:none}
.ot-more{position:absolute;right:0;top:2px;display:grid;place-items:center;width:22px;height:26px;
  background:linear-gradient(90deg,transparent,var(--s1) 34%);color:var(--fg-3);z-index:2;
  transition:color var(--t-1)}
.ot-more:hover{color:var(--fg)}
.ot-fade{position:absolute;right:0;top:0;bottom:1px;width:26px;pointer-events:none;
  background:linear-gradient(90deg,transparent,var(--s1));opacity:0;transition:opacity var(--t-2)}
.ot-fade.on{opacity:1}
#panel{padding-top:12px;flex:1;min-height:0;overflow:auto;animation:m-fade var(--t-2) var(--ease-out)}
#panel h2{font-size:14px;margin-bottom:4px}
#panel p{font-size:11.5px;color:var(--fg-3);line-height:1.6}
.ot-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ot-stat{background:var(--s2);border:1px solid var(--line);border-radius:var(--r-sm);padding:7px 8px}
.ot-stat span{display:block;font-size:11px;color:var(--fg-3);letter-spacing:-.004em}
.ot-stat strong{display:block;font-size:13px;margin-top:3px;font-variant-numeric:tabular-nums}
`,
js: `
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
`
};

export const breadcrumbs = {
slug: 'breadcrumbs',
title: 'Breadcrumb trail',
tag: 'collapse',
layout: 'stage--opt',
body: `
<nav class="bc" aria-label="Breadcrumb">
  <ol class="bc-list" id="trail">
    <li><a href="#home" class="bc-a"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg><span class="bc-t">Home</span></a></li>
    <li class="bc-sep" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></li>
    <li id="fold" class="bc-fold"><button class="bc-more" id="expand" type="button" aria-label="Show 2 hidden breadcrumbs" aria-expanded="false">···</button></li>
    <li class="bc-sep" id="foldSep" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></li>
    <li id="m1" hidden><a href="#projects" class="bc-a"><span class="bc-t">Projects</span></a></li>
    <li class="bc-sep" id="s1" hidden aria-hidden="true"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></li>
    <li id="m2" hidden><a href="#q4" class="bc-a"><span class="bc-t">Q4 launch</span></a></li>
    <li class="bc-sep" id="s2" hidden aria-hidden="true"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></li>
    <li><a href="#design" class="bc-a"><span class="bc-t">Design</span></a></li>
    <li class="bc-sep" aria-hidden="true"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></li>
    <li><span class="bc-cur" aria-current="page">Overview</span></li>
  </ol>
</nav>
<div class="bc-page">
  <div class="bc-kicker">Page</div>
  <h2>Overview</h2>
  <p>Design system · Q4 launch · last edited 2 hours ago by Amara.</p>
</div>
<p id="status" class="hint" role="status" aria-live="polite">Two segments collapsed</p>
`,
css: `
.bc{display:flex;flex-direction:column;gap:0}
.bc-list{display:flex;align-items:center;gap:3px;flex-wrap:wrap;min-height:26px}
.bc-list li{display:flex;align-items:center;animation:m-fade var(--t-2) var(--ease-out) both}
.bc-a{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 6px;border-radius:var(--r-xs);
  font-size:11px;color:var(--fg-3);transition:background var(--t-1),color var(--t-1)}
.bc-a:hover{background:var(--s3);color:var(--fg)}
.bc-sep{color:var(--fg-4);opacity:.5;padding:0 1px}
.bc-sep svg{width:8px;height:8px}
.bc-more{display:grid;place-items:center;height:20px;min-width:22px;padding:0 5px;border-radius:var(--r-xs);
  background:var(--s3);border:1px solid var(--line-2);color:var(--fg-3);
  font-size:10px;font-weight:700;letter-spacing:.04em;line-height:1;
  transition:background var(--t-1),color var(--t-1),border-color var(--t-1),transform var(--t-2) var(--spring)}
.bc-more:hover{background:var(--s4);color:var(--fg);border-color:var(--line-3);transform:scale(1.04)}
.bc-more[aria-expanded=true]{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.bc-cur{display:inline-flex;align-items:center;height:22px;padding:0 7px;border-radius:var(--r-xs);
  font-size:11px;font-weight:650;color:var(--fg);background:var(--s3);border:1px solid var(--line)}
.bc-page{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.bc-kicker{font-size:11px;letter-spacing:-.004em;color:var(--fg-3);font-weight:520}
.bc-page h2{font-size:16px;margin:4px 0 3px}
.bc-page p{font-size:11px;color:var(--fg-4)}
`,
js: `
const fold=$('#fold'),expand=$('#expand'),status=$('#status');
const hiddenSegs=[$('#m1'),$('#s1'),$('#m2'),$('#s2')];
let open=false;
function set(next){
  open=next;
  expand.setAttribute('aria-expanded',String(next));
  hiddenSegs.forEach(el=>{el.hidden=!next});
  expand.textContent=next?'‹‹':'···';
  expand.setAttribute('aria-label',next?'Collapse 2 breadcrumbs':'Show 2 hidden breadcrumbs');
  status.textContent=next?'Full path shown':'Two segments collapsed';
  if(next)(hiddenSegs[0].querySelector('a')).focus();
}
expand.addEventListener('click',()=>set(!open));
`
};

export const toc = {
slug: 'table-of-contents',
title: 'Reading outline',
tag: 'scroll spy',
body: `
<div class="toc">
  <div class="toc-rail">
    <div class="toc-track"><span class="toc-prog" id="tocProg"></span></div>
  </div>
  <ol class="toc-list" id="tocList"></ol>
  <div class="toc-reader" id="reader" tabindex="0" aria-label="Article body">
    <section id="intro"><h2>Introduction</h2><p>The library started as three components and a colour ramp. Everything here follows from that constraint: one accent, two radii, and motion only where it explains a change of state.</p></section>
    <section id="details"><h2>How it works</h2><p>Each component owns its own stylesheet and ships with no dependencies. The shared layer holds tokens, reset and the motion primitives — nothing that a component can opt out of.</p><p>Spacing is a 4px scale, radii are capped at 22px, and every interactive surface has a visible focus ring.</p></section>
    <section id="summary"><h2>Summary</h2><p>Twenty-eight components, one design language, zero runtime dependencies. Copy the files, or take the zip.</p></section>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.toc{display:flex;flex-direction:column;gap:0;min-height:0;flex:1}
.toc-rail{position:relative;height:2px;background:var(--line);border-radius:1px;margin-bottom:11px;overflow:hidden}
.toc-track{position:absolute;inset:0}
.toc-prog{display:block;height:100%;width:0;background:var(--accent);border-radius:1px;
  transition:width var(--t-2) var(--ease-out)}
.toc-list{display:grid;gap:0;margin-bottom:11px}
.toc-item{position:relative}
.toc-item a{display:flex;align-items:center;gap:7px;width:100%;height:27px;padding:0 7px 0 8px;border-radius:var(--r-xs);
  font-size:11.5px;color:var(--fg-3);text-align:left;
  transition:background var(--t-1),color var(--t-1),padding-left var(--t-2) var(--ease-out)}
.toc-item a::before{content:"";width:3px;height:3px;border-radius:50%;background:var(--fg-4);flex:none;
  transition:width var(--t-3) var(--ease-out),height var(--t-3) var(--ease-out),background var(--t-2),border-radius var(--t-3)}
.toc-item a:hover{background:var(--s2);color:var(--fg-2)}
.toc-item a[aria-current=true]{color:var(--fg);font-weight:600;background:var(--s2)}
.toc-item a[aria-current=true]::before{width:9px;height:2px;border-radius:1px;background:var(--accent)}
.toc-item .n{margin-left:auto;font-size:9.5px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.toc-reader{flex:1;min-height:0;overflow:auto;border-radius:var(--r-md);background:var(--s2);border:1px solid var(--line);
  padding:0 13px;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.toc-reader:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.toc-reader::-webkit-scrollbar{width:7px}
.toc-reader::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.toc-reader section{min-height:132px;padding:13px 0}
.toc-reader h2{font-size:12.5px;margin-bottom:5px}
.toc-reader p{font-size:11px;line-height:1.62;color:var(--fg-3);margin-bottom:8px}
`,
js: `
const reader=$('#reader'),list=$('#tocList'),prog=$('#tocProg'),status=$('#status');
const sections=$$('section',reader);
const LABELS={intro:'Introduction',details:'How it works',summary:'Summary'};

list.innerHTML=sections.map((s,i)=>
  '<li class="toc-item"><a href="#'+s.id+'" data-go="'+s.id+'"><span>'+LABELS[s.id]+'</span>'+
  '<span class="n">0'+(i+1)+'</span></a></li>').join('');

function active(id,announce){
  $$('[data-go]',list).forEach(a=>a.setAttribute('aria-current',String(a.dataset.go===id)));
  if(announce)status.textContent=LABELS[id]+' section';
}
$$('[data-go]',list).forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  const s=document.getElementById(a.dataset.go);
  reader.scrollTo({top:s.offsetTop-reader.offsetTop,behavior:reduce.matches?'auto':'smooth'});
  active(a.dataset.go,true);
}));
reader.addEventListener('scroll',()=>{
  const top=reader.scrollTop+18;
  let current=sections[0];
  for(const s of sections){if(s.offsetTop-reader.offsetTop<=top)current=s}
  active(current.id);
  const max=reader.scrollHeight-reader.clientHeight;
  prog.style.width=(max>0?Math.min(100,reader.scrollTop/max*100):0)+'%';
},{passive:true});
active('intro');
`
};

export const pagination = {
slug: 'pagination-controls',
title: 'Pagination',
tag: 'numbered',
body: `
<div class="pg">
  <ul class="pg-results" id="results"></ul>
  <div class="pg-bar">
    <span class="pg-info" id="pgInfo"></span>
    <nav class="pg-nav" aria-label="Pagination" id="pgNav"></nav>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.pg{display:flex;flex-direction:column;gap:0;min-height:0;flex:1}
.pg-results{display:grid;gap:0;flex:1;min-height:0;overflow:auto;align-content:start}
.pg-row{display:flex;align-items:center;gap:8px;min-height:29px;padding:0 2px;
  border-bottom:1px solid rgba(0,0,0,.03);font-size:11.5px;color:var(--fg-2);
  animation:m-slide-only var(--t-3) var(--ease-out) both}
@keyframes m-slide-only{from{transform:translateY(4px)}to{transform:none}}
.pg-row .ix{font-size:9.5px;color:var(--fg-3);font-variant-numeric:tabular-nums;width:16px;flex:none}
.pg-row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pg-row .st{font-size:9px;color:var(--fg-3);padding:1px 6px;border-radius:var(--r-full);background:var(--s2);border:1px solid var(--line)}
.pg-bar{display:flex;flex-direction:column;gap:7px;padding-top:10px;margin-top:2px;border-top:1px solid var(--line);flex:none}
.pg-info{font-size:10px;color:var(--fg-3);font-variant-numeric:tabular-nums;text-align:center}
.pg-nav{display:flex;align-items:center;justify-content:center;gap:2px}
.pg-btn{display:grid;place-items:center;min-width:24px;height:24px;padding:0 4px;border-radius:var(--r-xs);
  font-size:10.5px;font-weight:600;color:var(--fg-3);font-variant-numeric:tabular-nums;
  border:1px solid transparent;
  transition:background var(--t-1),color var(--t-1),border-color var(--t-1),transform var(--t-1) var(--spring)}
.pg-btn:hover:not([disabled]):not([aria-current]){background:var(--s3);color:var(--fg);transform:translateY(-1px)}
.pg-btn[aria-current=page]{background:var(--accent);color:var(--accent-ink);border-color:transparent;
  box-shadow:none}
.pg-btn[disabled]{opacity:.28;pointer-events:none}
.pg-btn svg{width:11px;height:11px}
.pg-gap{display:grid;place-items:center;min-width:16px;height:24px;font-size:10px;color:var(--fg-3)}
.pg-btn:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
`,
js: `
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
`
};

export const tree = {
slug: 'collapsible-tree',
title: 'Collapsible tree',
tag: 'arrow keys',
body: `
<div class="tr" role="tree" aria-label="Project files" id="tree"></div>
<p id="status" class="sr-only" role="status" aria-live="polite"></p>
`,
css: `
.tr{display:flex;flex-direction:column;min-height:0;flex:1;overflow:auto;font-size:11.5px;
  scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.tr::-webkit-scrollbar{width:7px}
.tr::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.tr-node{position:relative;user-select:none}
.tr-row{display:flex;align-items:center;gap:5px;height:26px;padding-right:6px;border-radius:var(--r-xs);
  color:var(--fg-2);cursor:pointer;
  transition:background var(--t-1),color var(--t-1)}
.tr-row:hover{background:var(--s2);color:var(--fg)}
.tr-row:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.tr-row[aria-selected=true]{background:var(--accent-soft);color:var(--accent)}
.tr-chev{display:grid;place-items:center;width:13px;height:13px;flex:none;color:var(--fg-4);
  transition:transform var(--t-3) var(--spring),color var(--t-2)}
.tr-row[aria-expanded=true] .tr-chev{transform:rotate(90deg);color:var(--fg-2)}
.tr-row[aria-expanded=false] .tr-chev{color:var(--fg-4)}
.tr-ic{color:var(--fg-4);flex:none}
.tr-row[aria-expanded=true] .tr-ic{color:var(--accent)}
.tr-row[aria-selected=true] .tr-ic{color:var(--accent)}
.tr-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tr-meta{font-size:9px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.tr-group{position:relative;overflow:hidden}
.tr-group::before{content:"";position:absolute;left:var(--guide,14px);top:0;bottom:0;width:1px;
  background:linear-gradient(180deg,var(--line-2),rgba(0,0,0,.02))}
.tr-group.collapsed{display:none}
.tr-group.opening{animation:m-unfold var(--t-3) var(--ease-out) both}
@keyframes m-unfold{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
`,
js: `
const DATA=[
 {name:'src',type:'dir',children:[
   {name:'components',type:'dir',children:[
     {name:'Button.tsx',type:'file',size:'2.1 KB'},
     {name:'Dialog.tsx',type:'file',size:'4.8 KB'},
     {name:'Tabs.tsx',type:'file',size:'3.3 KB'}
   ]},
   {name:'tokens.css',type:'file',size:'1.2 KB'},
   {name:'index.ts',type:'file',size:'640 B'}
 ]},
 {name:'docs',type:'dir',children:[
   {name:'getting-started.md',type:'file',size:'3.4 KB'},
   {name:'motion.md',type:'file',size:'2.2 KB'}
 ]},
 {name:'package.json',type:'file',size:'890 B'}
];
const host=$('#tree'),status=$('#status');
const CHEV='<span class="tr-chev"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>';
const FOLDER='<svg class="tr-ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 20V6a2 2 0 0 1 2-2h3.6l2 2.4H18a2 2 0 0 1 2 2V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/></svg>';
const FILE='<svg class="tr-ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/></svg>';

let uid=0;
function build(nodes,depth){
  const wrap=document.createDocumentFragment();
  for(const n of nodes){
    const node=document.createElement('div');
    node.className='tr-node';node.dataset.depth=depth;
    const row=document.createElement('div');
    row.className='tr-row';row.setAttribute('role','treeitem');row.tabIndex=-1;
    row.style.paddingLeft=(depth*13+4)+'px';
    const id='tr-'+(uid++);row.id=id;
    if(n.type==='dir'){
      row.setAttribute('aria-expanded','true');
      row.innerHTML=CHEV+FOLDER+'<span class="tr-name">'+n.name+'</span><span class="tr-meta">'+n.children.length+'</span>';
      const group=document.createElement('div');
      group.className='tr-group';group.setAttribute('role','group');
      group.style.setProperty('--guide',(depth*13+10)+'px');
      group.append(build(n.children,depth+1));
      if(depth===2)group.classList.add('collapsed'),row.setAttribute('aria-expanded','false');
      row.addEventListener('click',()=>toggle(row,group));
    }else{
      row.innerHTML='<span class="tr-chev" style="visibility:hidden"></span>'+FILE+'<span class="tr-name">'+n.name+'</span><span class="tr-meta">'+n.size+'</span>';
    }
    row.addEventListener('keydown',e=>onKey(e,row));
    row.addEventListener('focus',()=>saveFocus(row));
    node.append(row,);
    if(n.type==='dir')node.append(node.querySelector('.tr-group')||document.createComment(''));
    wrap.append(node);
    if(n.type==='dir'){
      node.append(...build(n.children,depth+1).childNodes);
    }
  }
  return wrap;
}
// simpler, correct builder (avoid double nesting)
host.replaceChildren();
uid=0;
function make(nodes,depth,parent){
  for(const n of nodes){
    const node=document.createElement('div');node.className='tr-node';
    const row=document.createElement('div');
    row.className='tr-row';row.setAttribute('role','treeitem');row.tabIndex=-1;
    row.style.paddingLeft=(depth*13+4)+'px';
    row.id='tr-'+(uid++);
    if(n.type==='dir'){
      row.setAttribute('aria-expanded','true');
      row.innerHTML=CHEV+FOLDER+'<span class="tr-name">'+n.name+'</span><span class="tr-meta">'+n.children.length+'</span>';
    }else{
      row.innerHTML='<span class="tr-chev" style="visibility:hidden"></span>'+FILE+'<span class="tr-name">'+n.name+'</span><span class="tr-meta">'+n.size+'</span>';
    }
    row.addEventListener('keydown',e=>onKey(e,row));
    node.append(row);parent.append(node);
    if(n.type==='dir'){
      const group=document.createElement('div');
      group.className='tr-group';group.setAttribute('role','group');
      group.style.setProperty('--guide',(depth*13+10)+'px');
      const collapsed=depth>=2;
      if(collapsed){group.classList.add('collapsed');row.setAttribute('aria-expanded','false')}
      row.addEventListener('click',()=>toggle(row,group));
      node.append(group);make(n.children,depth+1,group);
    }
  }
}
function toggle(row,group){
  const open=row.getAttribute('aria-expanded')==='true';
  row.setAttribute('aria-expanded',String(!open));
  if(open){group.classList.add('collapsed')}
  else{group.classList.remove('collapsed');group.classList.add('opening');
    setTimeout(()=>group.classList.remove('opening'),360)}
  status.textContent=row.querySelector('.tr-name').textContent+' '+(open?'collapsed':'expanded');
}
function visible(){
  return $$('[role=treeitem]',host).filter(r=>!r.closest('.tr-group.collapsed'));
}
let last=null;
function saveFocus(r){last=r}
function onKey(e,r){
  const rows=visible(),i=rows.indexOf(r);
  const move=n=>{if(n){e.preventDefault();rows.forEach(x=>x.tabIndex=x===n?0:-1);n.focus()}};
  if(e.key==='ArrowDown')move(rows[i+1]);
  if(e.key==='ArrowUp')move(rows[i-1]);
  if(e.key==='Home')move(rows[0]);
  if(e.key==='End')move(rows[rows.length-1]);
  if(e.key==='ArrowRight'){
    e.preventDefault();
    if(r.getAttribute('aria-expanded')==='false'){r.click();return}
    const next=rows[i+1];
    if(next&&next.dataset.depth>r.dataset.depth)move(next);
  }
  if(e.key==='ArrowLeft'){
    e.preventDefault();
    if(r.getAttribute('aria-expanded')==='true'){r.click();return}
    // climb to parent
    const rowNodes=rows.slice(0,i).reverse();
    if(rowNodes[0])move(rowNodes[0]);
  }
  if(e.key==='Enter'||e.key===' '){
    e.preventDefault();
    if(r.getAttribute('aria-expanded')!==null)r.click();
    else{rows.forEach(x=>x.setAttribute('aria-selected','false'));r.setAttribute('aria-selected','true');
      status.textContent=r.querySelector('.tr-name').textContent+' selected'}
  }
}
make(DATA,0,host);
$$('[role=treeitem]',host).forEach(r=>r.dataset.depth=String(r.style.paddingLeft.replace('px','')/13|0));
visible().forEach((r,i)=>r.tabIndex=i===0?0:-1);
`
};

export default [filterBar, navDrawer, nestedMenu, overflowTabs, breadcrumbs, toc, pagination, tree];
