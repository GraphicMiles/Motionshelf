
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

document.body.dataset.ready="true";
