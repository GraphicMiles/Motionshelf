
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


const input=$('#file'),zone=$('#drop'),status=$('#status'),clearBtn=$('#clear'),
      bar=$('#fdBar'),fillEl=$('#fdFill'),fileBox=$('#fdFile'),title=$('#fdTitle'),
      sizeLbl=$('#fdSize'),help=$('#fdHelp');
let current=null;

const fmt=n=>n<1024?n+' B':(n/1024).toFixed(n<10240?1:0)+' KB';
const ext=name=>name.slice(name.lastIndexOf('.')+1).toLowerCase();

function reject(msg){
  status.textContent=msg;
  input.value='';
  zone.classList.add('anim-shake');
  setTimeout(()=>zone.classList.remove('anim-shake'),420);
  current=null;clearBtn.hidden=true;bar.hidden=true;fileBox.hidden=true;
  zone.classList.remove('done');title.textContent='Drop a .txt or .md file';
  sizeLbl.textContent='0 files';
}
function accept(file){
  current=file;
  zone.classList.remove('dragging');zone.classList.add('done');
  title.textContent='File ready';
  bar.hidden=false;
  requestAnimationFrame(()=>{fillEl.style.width='100%'});
  fileBox.hidden=false;
  fileBox.innerHTML='<span class="nm">'+file.name.replace(/</g,'&lt;')+'</span><span class="sz">'+fmt(file.size)+'</span>';
  clearBtn.hidden=false;
  sizeLbl.textContent='1 file · '+fmt(file.size);
  status.textContent=file.name+' is ready. Nothing left your device.';
}
function inspect(file){
  if(!file)return;
  if(!['txt','md'].includes(ext(file.name))){reject('“'+file.name+'” is not a .txt or .md file.');return}
  if(file.size>100*1024){reject('That file is '+fmt(file.size)+' — the limit is 100 KB.');return}
  if(file.size===0){reject('That file is empty.');return}
  bar.hidden=false;fillEl.style.width='0';
  accept(file);
}
input.addEventListener('change',()=>inspect(input.files[0]));
zone.addEventListener('click',()=>input.click());
zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
let depth=0;
zone.addEventListener('dragenter',e=>{e.preventDefault();depth++;zone.classList.add('dragging')});
zone.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'});
zone.addEventListener('dragleave',e=>{e.preventDefault();if(--depth<=0){depth=0;zone.classList.remove('dragging')}});
zone.addEventListener('drop',e=>{
  e.preventDefault();depth=0;zone.classList.remove('dragging');
  inspect(e.dataTransfer.files[0]);
});
zone.addEventListener('dragend',()=>{depth=0;zone.classList.remove('dragging')});
clearBtn.addEventListener('click',()=>{
  current=null;input.value='';clearBtn.hidden=true;
  zone.classList.remove('done');
  bar.hidden=true;fillEl.style.width='0';fileBox.hidden=true;
  title.textContent='Drop a .txt or .md file';
  sizeLbl.textContent='0 files';
  status.textContent='File removed.';zone.focus();
});

document.body.dataset.ready="true";
