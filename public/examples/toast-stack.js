
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

document.body.dataset.ready="true";
