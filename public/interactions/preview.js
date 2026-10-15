import {interactions} from './manifest.js';
const slug=document.body.dataset.interaction;
const definition=interactions.find(item=>item.slug===slug);
if(!definition)throw Error('Unknown interaction');
const {mount}=await import(`./${slug}/core.js`);
const defaults=Object.fromEntries(definition.settings.map(s=>[s.key,s.value]));
const root=document.getElementById('demo');const instance=mount(root,defaults);const heading=document.createElement('h1');heading.className='sr-only';heading.textContent=definition.name+' preview';root.prepend(heading);
window.addEventListener('message',event=>{
 if(event.source!==window.parent||!event.data||event.data.type!=='motionshelf:interaction')return;
 if(event.data.slug!==slug)return;
 if(event.data.action==='replay')instance.replay();
 if(event.data.action==='update'&&event.data.options&&typeof event.data.options==='object'){
  const options=Object.fromEntries(definition.settings.map(s=>[s.key,Math.min(s.max,Math.max(s.min,Number(event.data.options[s.key])||s.value))]));
  instance.update(options);
 }
});
window.addEventListener('pagehide',()=>instance.destroy());
document.body.dataset.ready='true';window.parent.postMessage({type:'motionshelf:ready',slug},'*');
