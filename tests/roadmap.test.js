import test from 'node:test';
import assert from 'node:assert/strict';
import {server} from '../server.js';
import {loadCatalog} from '../validation.js';
import {loadRoadmap,validateRoadmap} from '../roadmap.js';

test('42 first-party plans are unique and cannot masquerade as working resources',()=>{
 const catalog=loadCatalog(),plans=loadRoadmap();assert.equal(plans.length,42);assert.equal(plans.filter(x=>x.type==='ui').length,28);assert.equal(plans.filter(x=>x.type==='agent').length,14);
 for(const plan of plans){assert.equal(plan.status,'planned');assert.ok(!catalog.some(r=>r.slug===plan.slug));for(const field of ['repository','source','website','license','install','usage','frameworks','preview','verified'])assert.equal(Object.hasOwn(plan,field),false,`${plan.slug} must not claim ${field}`)}
 const raw=plans.map(({status,...entry})=>entry);assert.deepEqual(validateRoadmap(raw),[]);assert.match(validateRoadmap([...raw,{...raw[0],slug:raw[0].slug}]).join(' '),/duplicate slug/);assert.match(validateRoadmap([{...raw[0],source:'https:\/\/example.com'}]).join(' '),/unexpected fields/);
});
test('roadmap is public but separate from the verified catalog; reserved planned slugs cannot enter review',async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const base=`http://127.0.0.1:${server.address().port}`;const response=await fetch(base+'/api/roadmap');assert.equal(response.status,200);assert.equal((await response.json()).length,42);assert.equal((await(await fetch(base+'/api/resources')).json()).length,7);
 const planned=loadRoadmap()[0];const submitted={...loadCatalog()[0],slug:planned.slug,repository:'https://github.com/example/placeholder',source:'https://github.com/example/placeholder'};const res=await fetch(base+'/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(submitted)});assert.equal(res.status,409);assert.match((await res.json()).errors[0],/roadmap/)}finally{server.close()}
});
