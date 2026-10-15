import {loadCatalog,validateResource} from '../validation.js';
const all=loadCatalog(); let bad=false;
for(const [i,item] of all.entries()){const errors=validateResource(item,all.filter((_,j)=>i!==j)); if(errors.length){bad=true; console.error(item.slug,errors)}}
if(bad)process.exit(1); console.log(`Validated ${all.length} resources`);
