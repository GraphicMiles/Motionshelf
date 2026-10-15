export function mount(root,initial={}){
 let options={duration:580,stagger:90,...initial},animation=[];
 const words=['Make','room','for','the','unexpected.'];
 root.innerHTML='<div class="tr-shell"><span class="tr-caption">STUDIO NOTES / ANIMATED TYPE</span><div class="tr-line" role="heading" aria-level="2" aria-label="Make room for the unexpected."></div><span class="tr-footer">WORDS IN MOTION <span>—</span> 001</span></div>';
 const line=root.querySelector('.tr-line');for(const word of words){const span=document.createElement('span');span.className='tr-word';span.setAttribute('aria-hidden','true');span.textContent=word;line.append(span)}
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function replay(){animation.forEach(a=>a.cancel());animation=[];const duration=Math.max(200,Math.min(1100,Number(options.duration)||580)),stagger=Math.max(30,Math.min(220,Number(options.stagger)||90));for(const [i,word] of [...line.children].entries()){if(reduced()){word.style.opacity='1';word.style.transform='none';continue}word.style.opacity='0';word.style.transform='translateY(28px)';const a=word.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration,delay:i*stagger,fill:'forwards',easing:'cubic-bezier(.16,1,.3,1)'});animation.push(a)}}
 replay();return{update(next){options={...options,...next};replay()},replay,destroy(){animation.forEach(a=>a.cancel());root.replaceChildren()}};
}
