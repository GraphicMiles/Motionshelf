
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

document.body.dataset.ready="true";
