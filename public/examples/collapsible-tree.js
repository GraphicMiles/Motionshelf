
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

document.body.dataset.ready="true";
