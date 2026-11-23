// Command menu, combobox, inline edit, multi-step form.

export const commandMenu = {
slug: 'accessible-command-menu',
title: 'Command menu',
tag: '⌘K',
body: `
<div class="cm">
  <div class="cm-field">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input id="query" type="text" role="combobox" aria-expanded="true" aria-controls="cmList" aria-autocomplete="list" aria-activedescendant="" autocomplete="off" spellcheck="false" placeholder="Search actions">
    <span class="cm-count" id="cmCount" aria-hidden="true"></span>
  </div>
  <div class="cm-list" id="cmList" role="listbox" aria-label="Commands">
    <div class="cm-glide" id="cmGlide" aria-hidden="true"></div>
  </div>
  <div class="cm-foot"><span id="cmStatus" role="status" aria-live="polite" class="sr-only">12 commands available</span><span class="cm-hint"><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> navigate</span><span class="cm-hint"><kbd class="kbd">↵</kbd> run</span><span class="cm-hint"><kbd class="kbd">esc</kbd> clear</span></div>
</div>
<p class="cm-flash" id="cmFlash" role="status" aria-live="polite"></p>
<div class="toast-holder" id="cmToast"></div>
`,
css: `
.cm{display:flex;flex-direction:column;min-height:0;flex:1;gap:0;background:var(--s1);border-radius:var(--r-lg);overflow:visible}
.cm-field{display:flex;align-items:center;gap:8px;padding:0 11px;height:40px;flex:none;border-bottom:1px solid var(--line);color:var(--fg-3)}
.cm-field:focus-within{color:var(--accent)}
.cm-field input{flex:1;min-width:0;height:100%;background:none;border:0;font-size:12.5px;outline:none;color:var(--fg)}
.cm-field input::placeholder{color:var(--fg-4)}
.cm-count{font-size:10px;font-variant-numeric:tabular-nums;color:var(--fg-4);padding:2px 6px;border-radius:var(--r-full);background:var(--s3)}
.cm-list{position:relative;flex:1;min-height:0;overflow:auto;padding:5px;scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.cm-list::-webkit-scrollbar{width:7px}
.cm-list::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.cm-glide{position:absolute;left:5px;top:0;width:0;height:0;border-radius:var(--r-sm);background:var(--s3);
  box-shadow:inset 0 0 0 1px var(--line-2);pointer-events:none;
  transition:transform var(--t-2) var(--ease-out),width var(--t-2) var(--ease-out),height var(--t-2) var(--ease-out),opacity var(--t-1) linear;
  opacity:0;z-index:0}
.cm-group{position:relative;z-index:1}
.cm-group + .cm-group{margin-top:5px}
.cm-gh{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-3);font-weight:650;padding:6px 8px 3px}
.cm-item{display:flex;align-items:center;gap:9px;width:100%;height:31px;padding:0 8px;border-radius:var(--r-sm);font-size:12px;color:var(--fg-2);text-align:left;position:relative;transition:color var(--t-1) var(--ease-out)}
.cm-item[aria-selected=true]{color:var(--fg)}
.cm-item .ico{color:var(--fg-3);flex:none;transition:color var(--t-1) var(--ease-out),transform var(--t-2) var(--spring)}
.cm-item[aria-selected=true] .ico{color:var(--accent);transform:scale(1.08)}
.cm-item .lbl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-item .lbl mark{background:none;color:var(--accent);font-weight:600}
.cm-item .meta{font-size:10px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.cm-item .go{opacity:0;transform:translateX(-3px);transition:opacity var(--t-1) var(--ease-out),transform var(--t-2) var(--spring);color:var(--fg-3)}
.cm-item[aria-selected=true] .go{opacity:1;transform:none}
.cm-empty{display:grid;place-items:center;gap:7px;padding:26px 10px;color:var(--fg-4);font-size:11.5px;text-align:center}
.cm-empty svg{opacity:.5}
.cm-empty strong{color:var(--fg-2);font-weight:600;font-size:12px;display:block}
.cm-foot{display:flex;align-items:center;gap:10px;flex:none;height:30px;padding:0 11px;border-top:1px solid var(--line);font-size:10px;color:var(--fg-3)}
.cm-hint{display:flex;align-items:center;gap:4px}
.cm-flash{position:absolute;left:50%;bottom:14px;transform:translate(-50%,10px);opacity:0;
  background:var(--s4);border:1px solid var(--line-2);border-radius:var(--r-full);
  padding:5px 12px;font-size:11px;color:var(--fg);white-space:nowrap;pointer-events:none;
  box-shadow:var(--shadow-2);transition:opacity var(--t-2) var(--ease-out),transform var(--t-2) var(--spring);z-index:4}
.cm-flash.on{opacity:1;transform:translate(-50%,0)}
.toast-holder{position:absolute;inset:0;pointer-events:none}
`,
js: `
const COMMANDS=[
 {id:'open-settings',label:'Open settings',group:'Navigate',keys:'⌘,',icon:'gear',hint:'Preferences and theme'},
 {id:'copy-link',label:'Copy project link',group:'Navigate',keys:'⌘L',icon:'link',hint:'Share with teammates'},
 {id:'toggle-theme',label:'Toggle dark theme',group:'Appearance',keys:'⌘⇧D',icon:'moon',hint:'Switch colour mode'},
 {id:'new-note',label:'Create new note',group:'Create',keys:'⌘N',icon:'plus',hint:'Start a blank note'},
 {id:'new-board',label:'Create new board',group:'Create',keys:'⌘⇧N',icon:'grid',hint:'Canvas with lanes'},
 {id:'invite',label:'Invite a member',group:'Create',keys:'⌘I',icon:'user',hint:'Send an email invite'},
 {id:'export-json',label:'Export as JSON',group:'Data',keys:'⌘E',icon:'download',hint:'Download all records'},
 {id:'export-csv',label:'Export as CSV',group:'Data',keys:'',icon:'download',hint:'Spreadsheet ready'},
 {id:'archive',label:'Archive workspace',group:'Data',keys:'',icon:'archive',hint:'Hidden but recoverable'},
 {id:'shortcuts',label:'View keyboard shortcuts',group:'Help',keys:'?',icon:'keyboard',hint:'Every binding'},
 {id:'changelog',label:'Read the changelog',group:'Help',keys:'',icon:'book',hint:'What shipped this week'},
 {id:'support',label:'Contact support',group:'Help',keys:'',icon:'life',hint:'Reply within a day'}
];
const ICONS={
 gear:'<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
 link:'<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
 moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 user:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>',
 download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
 archive:'<rect x="2" y="4" width="20" height="5" rx="1.5"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>',
 keyboard:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
 life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9m5 5 3.9 3.9m0-12.8-3.9 3.9m-5 5-3.9 3.9"/>'
};
const svg=(p,s=14)=>'<svg class="ico" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const input=$('#query'),list=$('#cmList'),glide=$('#cmGlide'),status=$('#cmStatus'),count=$('#cmCount'),flash=$('#cmFlash');
let items=[],active=0,filtered=[];

function score(cmd,q){
  if(!q) return 1;
  const l=cmd.label.toLowerCase(), words=cmd.hint.toLowerCase();
  if(l.startsWith(q)) return 100;
  // subsequence match: every query char in order
  let i=0;for(const ch of l){if(ch===q[i])i++}
  if(i===q.length) return 70;
  if(words.includes(q)) return 40;
  return 0;
}
function highlight(label,q){
  if(!q) return label;
  const i=label.toLowerCase().indexOf(q);
  if(i<0){ // subsequence highlight
    let out='',qi=0;
    for(const ch of label){
      if(qi<q.length&&ch.toLowerCase()===q[qi]){out+='<mark>'+ch+'</mark>';qi++}
      else out+=ch;
    }
    return out;
  }
  return label.slice(0,i)+'<mark>'+label.slice(i,i+q.length)+'</mark>'+label.slice(i+q.length);
}
function render(){
  const q=input.value.trim().toLowerCase();
  filtered=COMMANDS.map(c=>({c,s:score(c,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.c);
  count.textContent=filtered.length+'/'+COMMANDS.length;
  list.querySelectorAll('.cm-group,.cm-empty').forEach(n=>n.remove());
  glide.style.opacity='0';
  if(!filtered.length){
    const e=document.createElement('div');e.className='cm-empty';
    e.innerHTML=svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',20)+'<div><strong>No commands match</strong><span>Try “theme”, “copy” or “export”.</span></div>';
    list.append(e);items=[];status.textContent='No commands match '+q;input.setAttribute('aria-activedescendant','');
    return;
  }
  const groups=[];
  for(const c of filtered){let g=groups.find(x=>x.name===c.group);if(!g)groups.push(g={name:c.group,list:[]});g.list.push(c)}
  items=[];
  for(const g of groups){
    const sec=document.createElement('div');sec.className='cm-group';
    const h=document.createElement('div');h.className='cm-gh';h.textContent=g.name;sec.append(h);
    for(const c of g.list){
      const b=document.createElement('button');
      b.type='button';b.className='cm-item';b.id='cm-'+c.id;
      b.setAttribute('role','option');b.setAttribute('aria-selected','false');
      b.innerHTML=svg(ICONS[c.icon])+'<span class="lbl">'+highlight(c.label,q)+'</span>'+
        (c.keys?'<span class="meta">'+c.keys+'</span>':'')+
        '<span class="go">'+svg('<path d="M5 12h14M13 6l6 6-6 6"/>',12)+'</span>';
      b.addEventListener('mousemove',()=>{const i=items.indexOf(b);if(i>=0&&i!==active){active=i;paint()}});
      b.addEventListener('click',()=>run(c));
      sec.append(b);items.push(b);
    }
    list.append(sec);
  }
  active=0;paint(true);
}
function paint(instant){
  items.forEach((b,i)=>b.setAttribute('aria-selected',String(i===active)));
  const b=items[active];if(!b)return;
  input.setAttribute('aria-activedescendant',b.id);
  const lb=list.getBoundingClientRect(),r=b.getBoundingClientRect();
  if(instant)glide.style.transition='none';
  glide.style.opacity='1';
  glide.style.transform='translate('+(r.left-lb.left)+'px,'+(r.top-lb.top+list.scrollTop)+'px)';
  glide.style.width=r.width+'px';glide.style.height=r.height+'px';
  if(instant){void glide.offsetWidth;glide.style.transition=''}
  b.scrollIntoView({block:'nearest'});
  status.textContent=b.querySelector('.lbl').textContent;
}
function run(cmd){
  flash.textContent=cmd.label+' — done';
  flash.classList.add('on');
  clearTimeout(run._t);run._t=setTimeout(()=>flash.classList.remove('on'),1500);
  status.textContent=cmd.label+' ran';
}
input.addEventListener('input',render);
input.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    if(!items.length)return;
    active=(active+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;paint();
  }
  if(e.key==='Enter'&&items[active]){e.preventDefault();run(filtered.find(x=>'cm-'+x.id===items[active].id)||filtered[active])}
  if(e.key==='Escape'){e.preventDefault();input.value='';render();}
});
list.addEventListener('scroll',()=>{if(items[active])paint(true)},{passive:true});
new ResizeObserver(()=>{if(items[active])paint(true)}).observe(list);
render();
`
};

export const combobox = {
slug: 'async-combobox',
title: 'Async combobox',
tag: 'debounced',
body: `
<div class="cb">
  <label class="label" for="city">Destination city</label>
  <div class="cb-anchor">
    <div class="cb-trigger" id="cbTrigger">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="cb-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <input id="city" type="text" role="combobox" aria-expanded="false" aria-controls="cbList" aria-autocomplete="list" aria-activedescendant="" autocomplete="off" spellcheck="false" placeholder="Search a city…">
      <span class="cb-spin" id="cbSpin" hidden aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a9 9 0 0 1 9 9" stroke-linecap="round"/></svg></span>
      <button type="button" class="cb-clear" id="cbClear" hidden aria-label="Clear selection"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>
    <div class="cb-pop" id="cbPop" hidden>
      <div class="cb-list" id="cbList" role="listbox" aria-label="Cities">
        <div class="cb-glide" id="cbGlide" aria-hidden="true"></div>
      </div>
      <div class="cb-empty" id="cbEmpty" hidden>No city matches that search.</div>
    </div>
  </div>
  <div class="cb-selected" id="cbSelected" hidden>
    <span class="dot dot-ok" aria-hidden="true"></span>
    <span id="cbSelText"></span>
    <span class="badge" id="cbSelTz"></span>
  </div>
  <p id="status" class="hint" role="status" aria-live="polite">Type two letters to search 40 cities.</p>
</div>
`,
css: `
.cb{display:flex;flex-direction:column;gap:2px}
.cb-anchor{position:relative}
.cb-trigger{display:flex;align-items:center;gap:8px;height:36px;padding:0 10px;background:var(--s2);
  border:1px solid var(--line-2);border-radius:var(--r-sm);color:var(--fg-3);
  transition:border-color var(--t-1) var(--ease-out),box-shadow var(--t-2) var(--ease-out),background var(--t-1) var(--ease-out)}
.cb-trigger:hover{border-color:var(--line-3)}
.cb-trigger:focus-within{background:var(--s3);border-color:var(--accent-line);box-shadow:0 0 0 3px var(--accent-soft);color:var(--accent)}
.cb-trigger input{flex:1;min-width:0;height:100%;background:none;border:0;outline:none;font-size:12.5px;color:var(--fg)}
.cb-trigger input::placeholder{color:var(--fg-4)}
.cb-pin{transition:color var(--t-1) var(--ease-out)}
.cb-spin{display:flex;color:var(--fg-4);animation:m-spin 700ms linear infinite}
.cb-clear{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--s4);color:var(--fg-3);transition:background var(--t-1),color var(--t-1)}
.cb-clear:hover{background:var(--s5);color:var(--fg)}
.cb-pop{position:absolute;left:0;right:0;top:calc(100% + 5px);z-index:6;
  background:var(--s3);border-radius:var(--r-md);box-shadow:var(--shadow-pop);overflow:hidden;
  animation:m-rise-sm var(--t-2) var(--ease-out) both;transform-origin:top center}
.cb-list{position:relative;max-height:186px;overflow:auto;padding:4px;scrollbar-width:thin;scrollbar-color:var(--s5) transparent}
.cb-list::-webkit-scrollbar{width:7px}
.cb-list::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}
.cb-glide{position:absolute;left:4px;top:0;width:0;height:0;border-radius:var(--r-sm);background:var(--s4);
  box-shadow:inset 0 0 0 1px var(--line-2);pointer-events:none;opacity:0;z-index:0;
  transition:transform var(--t-2) var(--ease-out),width var(--t-1) var(--ease-out),height var(--t-1) var(--ease-out),opacity var(--t-1) linear}
.cb-opt{position:relative;z-index:1;display:flex;align-items:center;gap:9px;width:100%;min-height:33px;padding:4px 8px;border-radius:var(--r-sm);text-align:left;font-size:12px;color:var(--fg-2);transition:color var(--t-1) var(--ease-out)}
.cb-opt[aria-selected=true]{color:var(--fg)}
.cb-opt .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cb-opt .nm b{font-weight:600;color:var(--accent)}
.cb-opt .co{font-size:10px;color:var(--fg-3);letter-spacing:.04em}
.cb-opt .tick{width:13px;height:13px;color:var(--accent);opacity:0;transform:scale(.5);
  transition:opacity var(--t-1) var(--ease-out),transform var(--t-2) var(--spring)}
.cb-opt[aria-checked=true] .tick{opacity:1;transform:scale(1)}
.cb-empty{padding:16px 12px;text-align:center;font-size:11.5px;color:var(--fg-4)}
.cb-selected{display:flex;align-items:center;gap:7px;margin-top:9px;padding:7px 10px;border-radius:var(--r-sm);
  background:var(--accent-soft);border:1px solid var(--accent-line);font-size:11.5px;color:var(--fg);
  animation:m-rise-sm var(--t-3) var(--ease-out) both}
.cb-selected .badge{background:rgba(201,247,90,.16);color:var(--accent)}
`,
js: `
const CITIES=[
 ['Lagos','NG','Africa/Lagos','11.8M'],['London','GB','Europe/London','8.9M'],['Lisbon','PT','Europe/Lisbon','545K'],
 ['Lima','PE','America/Lima','9.7M'],['Nairobi','KE','Africa/Nairobi','4.4M'],['New York','US','America/New_York','8.3M'],
 ['Oslo','NO','Europe/Oslo','709K'],['Paris','FR','Europe/Paris','2.1M'],['Tokyo','JP','Asia/Tokyo','13.9M'],
 ['Toronto','CA','America/Toronto','2.9M'],['Berlin','DE','Europe/Berlin','3.6M'],['Madrid','ES','Europe/Madrid','3.3M'],
 ['Rome','IT','Europe/Rome','2.8M'],['Vienna','AT','Europe/Vienna','1.9M'],['Zurich','CH','Europe/Zurich','436K'],
 ['Amsterdam','NL','Europe/Amsterdam','872K'],['Brussels','BE','Europe/Brussels','1.2M'],['Stockholm','SE','Europe/Stockholm','975K'],
 ['Copenhagen','DK','Europe/Copenhagen','644K'],['Helsinki','FI','Europe/Helsinki','656K'],['Dublin','IE','Europe/Dublin','555K'],
 ['Prague','CZ','Europe/Prague','1.3M'],['Warsaw','PL','Europe/Warsaw','1.8M'],['Athens','GR','Europe/Athens','664K'],
 ['Istanbul','TR','Europe/Istanbul','15.5M'],['Dubai','AE','Asia/Dubai','3.5M'],['Mumbai','IN','Asia/Kolkata','20.4M'],
 ['Delhi','IN','Asia/Kolkata','32.9M'],['Singapore','SG','Asia/Singapore','5.9M'],['Seoul','KR','Asia/Seoul','9.7M'],
 ['Shanghai','CN','Asia/Shanghai','24.9M'],['Bangkok','TH','Asia/Bangkok','10.7M'],['Jakarta','ID','Asia/Jakarta','10.6M'],
 ['Sydney','AU','Australia/Sydney','5.3M'],['Melbourne','AU','Australia/Melbourne','5.2M'],['Auckland','NZ','Pacific/Auckland','1.7M'],
 ['Cairo','EG','Africa/Cairo','21.3M'],['Accra','GH','Africa/Accra','2.6M'],['Johannesburg','ZA','Africa/Johannesburg','5.8M'],
 ['São Paulo','BR','America/Sao_Paulo','22.4M'],['Mexico City','MX','America/Mexico_City','9.2M'],['Buenos Aires','AR','America/Argentina/Buenos_Aires','15.4M']
];
const svg=(p,s=12)=>'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const TICK='<span class="tick">'+svg('<path d="M20 6 9 17l-5-5"/>')+'</span>';
const input=$('#city'),pop=$('#cbPop'),list=$('#cbList'),glide=$('#cbGlide'),empty=$('#cbEmpty'),
      spin=$('#cbSpin'),clearBtn=$('#cbClear'),status=$('#status'),
      selBox=$('#cbSelected'),selText=$('#cbSelText'),selTz=$('#cbSelTz');
let timer,ticket=0,active=0,options=[],selected=null,open=false;

function openPop(){pop.hidden=false;open=true;input.setAttribute('aria-expanded','true')}
function closePop(){pop.hidden=true;open=false;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');glide.style.opacity='0'}
function paint(instant){
  options.forEach((o,i)=>o.setAttribute('aria-selected',String(i===active)));
  const o=options[active];if(!o)return;
  input.setAttribute('aria-activedescendant',o.id);
  const lb=list.getBoundingClientRect(),r=o.getBoundingClientRect();
  if(instant)glide.style.transition='none';
  glide.style.opacity='1';
  glide.style.transform='translate('+(r.left-lb.left)+'px,'+(r.top-lb.top+list.scrollTop)+'px)';
  glide.style.width=r.width+'px';glide.style.height=r.height+'px';
  if(instant){void glide.offsetWidth;glide.style.transition=''}
  o.scrollIntoView({block:'nearest'});
}
function draw(rows,q){
  list.querySelectorAll('.cb-opt').forEach(n=>n.remove());
  options=[];
  if(!rows.length){empty.hidden=false;glide.style.opacity='0';return}
  empty.hidden=true;
  for(const [name,cc,tz,pop] of rows){
    const b=document.createElement('button');
    b.type='button';b.className='cb-opt';b.id='cb-'+name.replace(/\\W/g,'').toLowerCase();
    b.setAttribute('role','option');b.setAttribute('aria-selected','false');
    b.setAttribute('aria-checked',String(selected&&selected[0]===name));
    let nm=name;
    const i=name.toLowerCase().indexOf(q);
    if(i>=0)nm=name.slice(0,i)+'<b>'+name.slice(i,i+q.length)+'</b>'+name.slice(i+q.length);
    b.innerHTML='<span class="nm">'+nm+'</span><span class="co">'+cc+' · '+pop+'</span>'+TICK;
    b.addEventListener('mousemove',()=>{const k=options.indexOf(b);if(k>=0&&k!==active){active=k;paint()}});
    b.addEventListener('click',()=>choose([name,cc,tz,pop]));
    list.append(b);options.push(b);
  }
  active=0;paint(true);
}
function choose(city){
  selected=city;
  input.value=city[0];
  selBox.hidden=false;selText.textContent=city[0]+' · '+city[1];selTz.textContent=city[2];
  clearBtn.hidden=false;
  closePop();
  status.textContent=city[0]+' selected. Timezone '+city[2]+'.';
  spin.hidden=true;
}
input.addEventListener('input',()=>{
  clearTimeout(timer);
  const q=input.value.trim().toLowerCase();
  const my=++ticket;
  if(q!==(selected?selected[0].toLowerCase():'')){clearBtn.hidden=!q;selBox.hidden=true}
  if(q.length<2){
    closePop();spin.hidden=true;
    status.textContent=q?'Type one more letter.':'Type two letters to search 40 cities.';
    return;
  }
  spin.hidden=false;status.textContent='Searching…';
  timer=setTimeout(()=>{
    if(my!==ticket)return;               // stale response guard
    const rows=CITIES.filter(c=>c[0].toLowerCase().includes(q)||c[1].toLowerCase().startsWith(q)).slice(0,7);
    spin.hidden=true;
    draw(rows,q);
    openPop();
    status.textContent=rows.length?rows.length+' of 40 cities shown.':'No city matches '+q+'.';
  },260);
});
input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePop();return}
  if(!options.length)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;paint()}
  if(e.key==='Enter'&&options[active]){e.preventDefault();options[active].click()}
  if(e.key==='Tab')closePop();
});
clearBtn.addEventListener('click',()=>{
  input.value='';selected=null;clearBtn.hidden=true;selBox.hidden=true;closePop();
  status.textContent='Selection cleared.';input.focus();
});
input.addEventListener('focus',()=>{if(input.value.trim().length>=2&&!open){const q=input.value.trim().toLowerCase();
  draw(CITIES.filter(c=>c[0].toLowerCase().includes(q)).slice(0,7),q);openPop()}});
document.addEventListener('click',e=>{if(!e.target.closest('.cb-anchor')&&open)closePop()});
`
};

export const inlineEdit = {
slug: 'inline-edit-field',
title: 'Inline editor',
tag: 'save / cancel',
body: `
<div class="ie">
  <div class="ie-kicker">Project title</div>
  <div class="ie-view" id="ieView">
    <h2 class="ie-value" id="value">Quarterly planning brief</h2>
    <button class="ie-edit" id="edit" type="button" aria-label="Edit title">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
      Edit
    </button>
  </div>
  <form class="ie-form" id="form" hidden>
    <label class="sr-only" for="draft">Project title</label>
    <input class="input ie-input" id="draft" maxlength="60" required autocomplete="off">
    <div class="ie-meta"><span class="ie-count" id="ieCount">0/60</span><span class="ie-err" id="ieErr" role="alert"></span></div>
    <div class="ie-actions">
      <button class="btn btn-primary btn-sm" type="submit">Save changes</button>
      <button class="btn btn-ghost btn-sm" id="cancel" type="button">Cancel</button>
      <span class="spacer"></span><span class="kbd">↵</span><span class="kbd">esc</span>
    </div>
  </form>
  <div class="ie-history" id="ieHistory" hidden>
    <div class="ie-hh">Recent changes</div>
    <ol id="ieLog"></ol>
  </div>
  <p class="hint" id="status" role="status" aria-live="polite">Saved just now</p>
</div>
`,
css: `
.ie{display:flex;flex-direction:column;gap:0}
.ie-kicker{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-3);font-weight:650;margin-bottom:5px}
.ie-view{display:flex;align-items:flex-start;gap:6px;min-height:34px;padding:2px 0;border-radius:var(--r-sm)}
@container preview (max-width:330px){.ie-edit{opacity:1;transform:none;padding:0 5px;font-size:10px}}
.ie-value{font-size:15px;font-weight:600;letter-spacing:-.021em;line-height:1.28;flex:1;min-width:0;
  overflow-wrap:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ie-edit{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 7px;border-radius:var(--r-xs);
  font-size:10.5px;color:var(--fg-3);background:var(--s2);border:1px solid var(--line);
  opacity:0;transform:translateX(-3px);
  transition:opacity var(--t-2) var(--ease-out),transform var(--t-2) var(--ease-out),color var(--t-1),background var(--t-1)}
.ie:hover .ie-edit,.ie-edit:focus-visible{opacity:1;transform:none}
.ie-edit:hover{color:var(--fg);background:var(--s3);border-color:var(--line-2)}
.ie-form{animation:m-rise-sm var(--t-2) var(--ease-out) both}
.ie-input{font-size:14px;font-weight:550;min-height:36px}
.ie-meta{display:flex;align-items:center;gap:8px;margin-top:5px;min-height:14px}
.ie-count{font-size:10px;color:var(--fg-3);font-variant-numeric:tabular-nums;transition:color var(--t-1)}
.ie-count.warn{color:var(--warn)}
.ie-err{font-size:10.5px;color:var(--danger)}
.ie-actions{display:flex;align-items:center;gap:6px;margin-top:10px;animation:m-rise-sm var(--t-3) var(--ease-out) both}
.ie-history{margin-top:13px;border-top:1px solid var(--line);padding-top:10px;animation:m-rise var(--t-3) var(--ease-out) both}
.ie-hh{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-4);font-weight:650;margin-bottom:6px}
#ieLog{display:grid;gap:0}
#ieLog li{display:flex;align-items:baseline;gap:7px;font-size:11px;padding:4px 0;color:var(--fg-2);
  border-bottom:1px solid rgba(255,255,255,.035)}
#ieLog li:last-child{border:0}
#ieLog li .old{text-decoration:line-through;color:var(--fg-3)}
#ieLog li .new{color:var(--fg-2)}
#ieLog li time{margin-left:auto;font-size:9.5px;color:var(--fg-3);font-variant-numeric:tabular-nums}
`,
js: `
const view=$('#ieView'),form=$('#form'),value=$('#value'),draft=$('#draft'),
      edit=$('#edit'),cancel=$('#cancel'),status=$('#status'),
      count=$('#ieCount'),err=$('#ieErr'),history=$('#ieHistory'),log=$('#ieLog');
let history_=[],open=false;

function open_(){
  if(open)return;
  open=true;
  draft.value=value.textContent;
  draft.dataset.original=value.textContent;
  view.hidden=true;form.hidden=false;
  tick();draft.focus();draft.select();
}
function close(save){
  open=false;
  form.hidden=true;view.hidden=false;
  edit.focus();
  if(!save)status.textContent='Changes discarded.';
}
function tick(){
  const n=draft.value.length;
  count.textContent=n+'/60';
  count.classList.toggle('warn',n>50);
  const bad=!draft.value.trim();
  err.textContent=bad&&draft.value.length?'A title is required.':'';
  draft.setAttribute('aria-invalid',String(bad&&draft.value.length>0));
}
edit.addEventListener('click',open_);
cancel.addEventListener('click',()=>close(false));
draft.addEventListener('input',tick);
draft.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close(false)}
  if(e.key==='Enter'){e.preventDefault();form.requestSubmit()}
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const next=draft.value.trim();
  if(!next){err.textContent='A title is required.';draft.setAttribute('aria-invalid','true');
    draft.classList.add('anim-shake');setTimeout(()=>draft.classList.remove('anim-shake'),400);draft.focus();return}
  if(next===draft.dataset.original){close(false);status.textContent='No changes to save.';return}
  history_.unshift([draft.dataset.original,next,new Date()]);
  value.textContent=next;
  render_();
  close(true);
  status.textContent='Saved “'+next+'”.';
});
function render_(){
  history.hidden=!history_.length;
  log.replaceChildren(...history_.slice(0,3).map(([a,b,t])=>{
    const li=document.createElement('li');
    const time=t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    li.innerHTML='<span class="old">'+a.replace(/</g,'&lt;')+'</span><span>→</span><span class="new">'+b.replace(/</g,'&lt;')+'</span><time>'+time+'</time>';
    return li;
  }));
}
`
};

export const multiStep = {
slug: 'multi-step-form',
title: 'Step form',
tag: '3 steps',
body: `
<div class="ms">
  <ol class="ms-steps" id="msSteps" aria-label="Progress">
    <li data-step="0"><span class="ms-bullet">1</span><span class="ms-name">Details</span></li>
    <li data-step="1"><span class="ms-bullet">2</span><span class="ms-name">Contact</span></li>
    <li data-step="2"><span class="ms-bullet">3</span><span class="ms-name">Review</span></li>
    <span class="ms-rail" aria-hidden="true"><span class="ms-fill" id="msFill"></span></span>
  </ol>
  <form id="wizard" class="ms-body" novalidate tabindex="0" aria-label="Step form">
    <section data-panel="0" class="ms-panel" tabindex="-1">
      <label class="label" for="fullName">Full name</label>
      <input class="input" id="fullName" autocomplete="name" required placeholder="Amina Okafor">
      <label class="label" for="role" style="margin-top:9px">Role</label>
      <select class="input" id="role">
        <option>Product designer</option><option>Engineer</option><option>Researcher</option><option>Founder</option>
      </select>
    </section>
    <section data-panel="1" class="ms-panel" hidden>
      <label class="label" for="email">Work email</label>
      <input class="input" id="email" type="email" autocomplete="email" required placeholder="you@studio.com">
      <label class="label" for="team" style="margin-top:9px">Team size</label>
      <div class="ms-seg" id="team" role="radiogroup" aria-label="Team size">
        <button type="button" role="radio" aria-checked="true" data-v="1–5">1–5</button>
        <button type="button" role="radio" aria-checked="false" data-v="6–20">6–20</button>
        <button type="button" role="radio" aria-checked="false" data-v="20+">20+</button>
      </div>
    </section>
    <section data-panel="2" class="ms-panel" hidden>
      <div class="ms-review" id="msReview"></div>
    </section>
  </form>
  <div class="ms-foot">
    <button class="btn btn-sm" type="button" id="back" hidden>Back</button>
    <span class="spacer"></span>
    <span class="hint" id="msHint">Step 1 of 3</span>
    <button class="btn btn-primary btn-sm" type="button" id="next">Continue</button>
  </div>
  <p id="status" class="sr-only" role="status" aria-live="polite"></p>
</div>
`,
css: `
.ms{display:flex;flex-direction:column;flex:1;min-height:0}
.ms-steps{position:relative;display:flex;justify-content:space-between;margin-bottom:14px;padding:0 3px}
@container preview (max-width:330px){.ms-steps{margin-bottom:10px}.ms-name{font-size:9px}}
.ms-steps li{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:5px;flex:1}
.ms-bullet{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;
  background:var(--s2);border:1px solid var(--line-2);font-size:10.5px;font-weight:650;color:var(--fg-4);
  transition:background var(--t-3) var(--ease-out),color var(--t-3),border-color var(--t-3),transform var(--t-3) var(--spring),
             box-shadow var(--t-3) var(--ease-out)}
.ms-name{font-size:10px;color:var(--fg-3);transition:color var(--t-2);white-space:nowrap}
.ms-steps li[data-state=active] .ms-bullet{background:var(--accent);border-color:transparent;color:var(--accent-ink);
  transform:scale(1.1);box-shadow:0 0 0 4px var(--accent-soft)}
.ms-steps li[data-state=active] .ms-name{color:var(--fg);font-weight:600}
.ms-steps li[data-state=done] .ms-bullet{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.ms-steps li[data-state=done] .ms-name{color:var(--fg-2)}
.ms-rail{position:absolute;left:16.6%;right:16.6%;top:11px;height:1px;background:var(--line-2);z-index:0}
.ms-fill{display:block;height:100%;width:0;background:var(--accent);border-radius:1px;
  transition:width var(--t-4) var(--ease-out)}
.ms-body{flex:1;min-height:0;overflow:auto;scrollbar-width:thin}
.ms-panel{animation:m-rise-sm var(--t-3) var(--ease-out) both}
.ms-panel[data-dir=back]{animation-name:m-slide-in-left}
.ms-seg{display:flex;gap:4px;padding:3px;background:var(--s2);border:1px solid var(--line);border-radius:var(--r-sm)}
.ms-seg button{flex:1;height:26px;border-radius:var(--r-xs);font-size:11px;color:var(--fg-3);
  transition:background var(--t-2) var(--ease-out),color var(--t-2)}
.ms-seg button[aria-checked=true]{background:var(--s4);color:var(--fg);box-shadow:var(--shadow-1)}
.ms-review{display:grid;gap:7px}
.ms-dl{margin:0;display:grid;gap:7px}
.ms-rrow{display:flex;align-items:baseline;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);margin:0}
.ms-rrow dt{font-size:10.5px;color:var(--fg-4);width:74px;flex:none;text-transform:uppercase;letter-spacing:.06em}
.ms-rrow dd{margin:0;font-size:12.5px;color:var(--fg);overflow-wrap:anywhere}
.ms-foot{display:flex;align-items:center;gap:7px;margin-top:13px;padding-top:12px;border-top:1px solid var(--line);flex:none}
`,
js: `
const panels=$$('[data-panel]'),steps=$$('#msSteps li'),fill=$('#msFill'),
      back=$('#back'),next=$('#next'),hint=$('#msHint'),status=$('#status'),
      review=$('#msReview'),form=$('#wizard');
const data={name:'',role:'',email:'',team:'1–5'};
let index=0,dir=1;

function paint(){
  steps.forEach((li,i)=>{
    li.dataset.state=i<index?'done':i===index?'active':'todo';
    const b=li.querySelector('.ms-bullet');
    b.textContent=i<index?'✓':String(i+1);
  });
  fill.style.width=(index/2*100)+'%';
  panels.forEach((p,i)=>{p.hidden=i!==index;p.dataset.dir=dir<0?'back':'fwd'});
  back.hidden=index===0;
  next.textContent=index===2?'Create project':'Continue';
  hint.textContent='Step '+(index+1)+' of 3';
  if(index===2)buildReview();
}
function buildReview(){
  review.innerHTML=[
    ['Name',data.name],['Role',data.role],['Email',data.email],['Team',data.team+' people']
  ].map(([k,v])=>'<div class="ms-rrow"><dt>'+k+'</dt><dd>'+(v||'—').replace(/</g,'&lt;')+'</dd></div>').join('');
  review.innerHTML='<dl class="ms-dl">'+review.innerHTML+'</dl>';
}
function valid(){
  if(index===0){
    const n=$('#fullName');
    if(!n.value.trim()){n.setAttribute('aria-invalid','true');n.classList.add('anim-shake');
      setTimeout(()=>n.classList.remove('anim-shake'),400);n.focus();
      status.textContent='Enter your name to continue.';return false}
    n.removeAttribute('aria-invalid');
    data.name=n.value.trim();data.role=$('#role').value;
  }
  if(index===1){
    const e=$('#email');
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(e.value.trim())){
      e.setAttribute('aria-invalid','true');e.classList.add('anim-shake');
      setTimeout(()=>e.classList.remove('anim-shake'),400);e.focus();
      status.textContent='Enter a valid email address.';return false}
    e.removeAttribute('aria-invalid');data.email=e.value.trim();
  }
  return true;
}
next.addEventListener('click',()=>{
  if(index===2){status.textContent='Project created for '+data.email+'.';next.textContent='Created ✓';
    next.classList.add('btn-primary');setTimeout(()=>{index=0;next.textContent='Continue';paint()},1200);return}
  if(!valid())return;
  dir=1;index++;paint();status.textContent='Step '+(index+1)+' of 3.';
  const first=panels[index].querySelector('input');if(first)first.focus();
});
back.addEventListener('click',()=>{dir=-1;index--;paint();status.textContent='Step '+(index+1)+' of 3.'});
$$('#team [role=radio]').forEach(b=>{
  b.addEventListener('click',()=>{
    $$('#team [role=radio]').forEach(x=>x.setAttribute('aria-checked',String(x===b)));
    data.team=b.dataset.v;
  });
});
paint();
`
};

export default [commandMenu, combobox, inlineEdit, multiStep];
