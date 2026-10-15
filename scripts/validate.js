import {loadCatalog,validateResource} from '../validation.js';
import {loadRoadmap} from '../roadmap.js';
const all=loadCatalog(); let bad=false;
for(const [i,item] of all.entries()){const errors=validateResource(item,all.filter((_,j)=>i!==j),{allowSharedFirstPartyRepository:true}); if(errors.length){bad=true; console.error(item.slug,errors)}}
if(bad)process.exit(1); const roadmap=loadRoadmap(); console.log(`Validated ${all.length} working resources and ${roadmap.length} clearly marked build plans`);
