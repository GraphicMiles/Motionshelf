import fs from 'node:fs/promises';
import {interactions} from '../public/interactions/manifest.js';
const base=new URL('../public/interactions/exports/',import.meta.url);
for(const item of interactions){
 const params=item.settings.map(s=>s.key),values=Object.fromEntries(item.settings.map(s=>[s.key,s.value]));
 const keys=params.join(', '),literal=params.map(k=>`${k}: __${k.toUpperCase()}__`).join(', ');
 const templates={
  vanilla:{
   'index.html':`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${item.name}</title><link rel="stylesheet" href="./base.css"><link rel="stylesheet" href="./style.css"></head><body><main id="demo" class="ms-interaction"></main><script type="module" src="./main.js"></script></body></html>`,
   'main.js':`import {mount} from './core.js';\nconst interaction=mount(document.getElementById('demo'),{${literal}});\n// interaction.update({${literal}});\n// interaction.replay();\n// interaction.destroy();\n`},
  react:{'Interaction.jsx':`import {useEffect,useRef} from 'react';\nimport {mount} from './core.js';\nimport './base.css';\nimport './style.css';\n\nexport default function Interaction({${params.map(k=>`${k}=__${k.toUpperCase()}__`).join(', ')}}){\n const root=useRef(null),instance=useRef(null);\n useEffect(()=>{instance.current=mount(root.current,{${keys}});return()=>{instance.current?.destroy();instance.current=null}},[]);\n useEffect(()=>{instance.current?.update({${keys}})},[${keys}]);\n return <div ref={root} className="ms-interaction"/>;\n}\n`},
  vue:{'Interaction.vue':`<script setup>\nimport {ref,onMounted,onBeforeUnmount,watch} from 'vue';\nimport {mount} from './core.js';\nimport './base.css';\nimport './style.css';\nconst props=defineProps({${params.map(k=>`${k}:{type:Number,default:__${k.toUpperCase()}__}`).join(',')}});\nconst root=ref(null);let instance;\nconst values=()=>({${params.map(k=>`${k}:props.${k}`).join(',')}});\nonMounted(()=>{instance=mount(root.value,values())});\nwatch(()=>[${params.map(k=>`props.${k}`).join(',')}],()=>instance?.update(values()));\nonBeforeUnmount(()=>instance?.destroy());\n</script>\n<template><div ref="root" class="ms-interaction" /></template>\n`},
  svelte:{'Interaction.svelte':`<script>\nimport {onMount} from 'svelte';\nimport {mount} from './core.js';\nimport './base.css';\nimport './style.css';\n${params.map(k=>`export let ${k}=__${k.toUpperCase()}__;`).join('\n')}\nlet root,instance;\nonMount(()=>{instance=mount(root,{${keys}});return()=>instance?.destroy()});\n$: if(instance) instance.update({${keys}});\n</script>\n<div bind:this={root} class="ms-interaction"></div>\n`}
 };
 for(const [framework,files] of Object.entries(templates)){
  const folder=new URL(`./${item.slug}/${framework}/`,base);await fs.mkdir(folder,{recursive:true});
  for(const [name,content] of Object.entries(files))await fs.writeFile(new URL(name,folder),content);
  const lead=framework==='vanilla'?'Open index.html from a local HTTP server (ES modules do not run reliably from file://).':framework==='react'?'Copy the files into a React project and render <Interaction />.':framework==='vue'?'Copy the files into a Vue project and render <Interaction />.':'Copy the files into a Svelte project and render <Interaction />.';
  await fs.writeFile(new URL('README.md',folder),`# ${item.name} — ${framework}\n\n${lead}\n\nGive the component a parent with an explicit height (for example 320px); it fills that space. The component uses the same core.js, style.css and base.css as the live preview. Adjust the numeric defaults in the component or pass them as props where supported. The mount function returns update(options), replay(), and destroy() for lifecycle control. Reduced-motion settings are respected.\n\nSettings: ${item.settings.map(s=>`${s.key} (${s.min}–${s.max}${s.unit})`).join(', ')}.\n\nFont files are included for the preview typography. The DM Sans and Space Grotesk fonts are available from Google Fonts under the SIL Open Font License. Their license notices are included in the fonts folder. See https://openfontlicense.org/.\n`);
 }
}
console.log('Generated interaction export templates for '+interactions.length+' interactions and four targets');
