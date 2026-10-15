export function mount(root,initial={}){
 let options={duration:480,distance:24,...initial},index=0,animations=[];
 const views=[{n:'01',label:'DISCOVER',title:'Start with the story.',copy:'A quiet entrance can change how a page feels.',button:'Open the next view'},{n:'02',label:'EXPLORE',title:'Then follow the thread.',copy:'Each view keeps the same rhythm, without a hard cut.',button:'Return to the first view'}];
 root.innerHTML='<div class="pt-frame"><div class="pt-head"><span>ATLAS / TWO VIEWS</span><span class="pt-count">01 — 02</span></div><div class="pt-stage" aria-live="polite"></div><div class="pt-foot"><span class="pt-progress"><i></i><i></i></span><button type="button" class="pt-next">Open the next view</button></div></div>';
 const stage=root.querySelector('.pt-stage'),counter=root.querySelector('.pt-count'),next=root.querySelector('.pt-next');
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const content=i=>`<section class="pt-view"><span class="pt-eyebrow">${views[i].label} / ${views[i].n}</span><strong>${views[i].title}</strong><p>${views[i].copy}</p></section>`;
 function sync(){counter.textContent=`${views[index].n} — 02`;next.textContent=views[index].button;root.querySelectorAll('.pt-progress i').forEach((el,i)=>el.classList.toggle('current',i===index))}
 function change(to,animate=true){for(const animation of animations)animation.cancel();animations=[];const current=stage.lastElementChild;stage.replaceChildren();if(current)stage.append(current);index=to;stage.insertAdjacentHTML('beforeend',content(index));sync();const incoming=stage.lastElementChild,outgoing=current;
  if(!animate||reduced()){outgoing?.remove();return}
  const duration=Math.max(180,Math.min(1000,Number(options.duration)||480)),direction=index===1?1:-1,travel=Math.max(8,Math.min(64,Number(options.distance)||24));
  if(outgoing){outgoing.setAttribute('aria-hidden','true');outgoing.style.position='absolute';outgoing.style.pointerEvents='none';animations.push(outgoing.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-direction*travel}px)`}],{duration,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}))}
  const entrance=incoming.animate([{opacity:0,transform:`translateX(${direction*travel}px)`},{opacity:1,transform:'translateX(0)'}],{duration,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});animations.push(entrance);
  entrance.finished.then(()=>{if(stage.lastElementChild===incoming){outgoing?.remove();animations=[]}}).catch(()=>{});
 }
 function onClick(){change(index?0:1)}next.addEventListener('click',onClick);change(0,false);
 return{update(nextOptions){options={...options,...nextOptions}},replay(){change(index?0:1)},destroy(){animations.forEach(a=>a.cancel());next.removeEventListener('click',onClick);root.replaceChildren()}};
}
