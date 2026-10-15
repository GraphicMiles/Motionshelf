import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {server} from '../server.js';
import {loadCatalog,validateResource} from '../validation.js';
import {loadRoadmap,validateRoadmap} from '../roadmap.js';
const specs=JSON.parse(fs.readFileSync(new URL('../data/first-party-specs.json',import.meta.url),'utf8'));
test('all 42 plans graduated into checked-in resources with real source',()=>{
 const all=loadCatalog(),first=all.filter(x=>x.firstParty);assert.equal(first.length,42);assert.equal(first.filter(x=>x.type==='ui').length,28);assert.equal(first.filter(x=>x.type==='agent').length,14);assert.equal(loadRoadmap().length,0);assert.deepEqual(validateRoadmap(specs,all.filter(x=>!x.firstParty)),[]);
 for(const item of first){assert.ok(specs.some(x=>x.slug===item.slug));assert.equal(item.repository,'https://github.com/GraphicMiles/Motionshelf');assert.equal(item.license,'MIT');assert.deepEqual(validateResource(item,all.filter(x=>x!==item),{allowSharedFirstPartyRepository:true}),[]);if(item.type==='ui')for(const extension of ['html','css','js','zip'])assert.ok(fs.existsSync(new URL(`../public/examples/${item.slug}.${extension}`,import.meta.url)));else assert.ok(fs.existsSync(new URL(`../public/agents/${item.slug}.zip`,import.meta.url)))}
 assert.match(validateRoadmap([{...specs[0],source:'https://example.com'}],all.filter(x=>!x.firstParty)).join(' '),/unexpected fields/);
});
test('public catalog contains working builds; roadmap is empty; first-party status cannot be submitted',async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const base=`http://127.0.0.1:${server.address().port}`;const response=await fetch(base+'/api/roadmap');assert.equal(response.status,200);assert.deepEqual(await response.json(),[]);assert.equal((await(await fetch(base+'/api/resources')).json()).length,49);
 const item=loadCatalog().find(x=>x.firstParty);const payload={...item,slug:'fake-first-party-contribution'};const res=await fetch(base+'/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});assert.equal(res.status,422);assert.match((await res.json()).errors[0],/reserved/)}finally{server.close()}
});
