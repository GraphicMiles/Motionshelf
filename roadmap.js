import fs from 'node:fs';
import {loadCatalog} from './validation.js';
const path=new URL('./data/roadmap.json',import.meta.url);
export function validateRoadmap(entries,existing=loadCatalog()){
 const errors=[],used=new Set(existing.map(r=>r.slug));
 if(!Array.isArray(entries)||entries.length>50||entries.length<1)return['Roadmap must have 1–50 entries'];
 for(const [index,item] of entries.entries()){
  const where=`Roadmap entry ${index+1}`;
  if(!item||typeof item!=='object'||Array.isArray(item)){errors.push(`${where} is not an object`);continue}
  if(Object.keys(item).some(k=>!['slug','name','type','category','description','tags','scope'].includes(k)))errors.push(`${where} contains unexpected fields`);
  if(typeof item.slug!=='string'||! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)||item.slug.length>75||used.has(item.slug))errors.push(`${where} has an invalid or duplicate slug`);
  else used.add(item.slug);
  if(!['ui','agent'].includes(item.type))errors.push(`${where} has an unsupported type`);
  for(const field of ['name','category','description','scope'])if(typeof item[field]!=='string'||!item[field].trim()||item[field].length>(field==='scope'?300:field==='description'?240:90))errors.push(`${where} has an invalid ${field}`);
  if(!Array.isArray(item.tags)||item.tags.length>6||item.tags.some(x=>typeof x!=='string'||!x.trim()||x.length>40))errors.push(`${where} has invalid tags`);
 }
 return errors;
}
export function loadRoadmap(){const entries=JSON.parse(fs.readFileSync(path,'utf8'));const errors=validateRoadmap(entries);if(errors.length)throw Error(`Invalid roadmap: ${errors.join('; ')}`);return entries.map(item=>({...item,status:'planned'}))}
