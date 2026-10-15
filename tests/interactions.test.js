import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {interactions} from '../public/interactions/manifest.js';
const root=new URL('../public/interactions/',import.meta.url),frameworks={vanilla:['main.js','index.html'],react:['Interaction.jsx'],vue:['Interaction.vue'],svelte:['Interaction.svelte']};
test('interaction catalog covers six distinct requested categories',()=>{assert.equal(interactions.length,6);assert.equal(new Set(interactions.map(x=>x.category)).size,6);assert.equal(new Set(interactions.map(x=>x.slug)).size,6)});
for(const item of interactions)test(`${item.slug} ships the preview core and four parameterized framework wrappers`,()=>{
 const html=fs.readFileSync(new URL(`${item.slug}/preview.html`,root),'utf8');assert.match(html,/\.\/style\.css/);assert.match(html,/\.\.\/preview\.js/);
 const core=fs.readFileSync(new URL(`${item.slug}/core.js`,root),'utf8');assert.match(core,/export function mount\(/);assert.match(core,/update\(/);assert.match(core,/replay/);assert.match(core,/destroy\(/);
 const css=fs.readFileSync(new URL(`${item.slug}/style.css`,root),'utf8');assert.ok(css.length>100);
 for(const [framework,names] of Object.entries(frameworks))for(const name of names){const source=fs.readFileSync(new URL(`exports/${item.slug}/${framework}/${name}`,root),'utf8');if(!name.endsWith('.html')){assert.match(source,/\.\/core\.js/);for(const setting of item.settings)assert.ok(source.includes(`__${setting.key.toUpperCase()}__`),`${framework}/${name}: ${setting.key}`)}}
});
test('bundled typography carries both font licenses',()=>{for(const name of ['DM-Sans-LICENSE.txt','Space-Grotesk-LICENSE.txt'])assert.match(fs.readFileSync(new URL(`fonts/${name}`,root),'utf8'),/SIL OPEN FONT LICENSE/i)});
