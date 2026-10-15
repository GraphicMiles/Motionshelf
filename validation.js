import fs from 'node:fs';
export const TYPES = ['ui','animation','agent','utility'];
export function validateResource(value, existing = [], {allowSharedFirstPartyRepository=false} = {}) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Metadata must be an object'];
  const required = ['slug','name','type','category','description','repository','source','license','runtime','install','usage','version','maintenance','attribution'];
  for (const key of required) if (typeof value[key] !== 'string' || !value[key].trim()) errors.push(`${key} is required`);
  if (value.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) errors.push('slug must be lowercase kebab-case');
  if (value.type && !TYPES.includes(value.type)) errors.push('type must be ui, animation, agent, or utility');
  for (const key of ['tags','frameworks']) if (!Array.isArray(value[key]) || !value[key].length || value[key].some(x => typeof x !== 'string' || !x.trim())) errors.push(`${key} must be a non-empty string array`);
  const parseRepoUrl = (raw, key) => {
    try {
      const u = new URL(raw);
      const segments = u.pathname.split('/').filter(Boolean);
      if (u.protocol !== 'https:' || !['github.com','gitlab.com','codeberg.org'].includes(u.hostname) || u.username || u.password || u.port || u.search || u.hash || segments.length < 2 || (key === 'repository' && segments.length !== 2) || segments.some(s=>!/^[-_.a-zA-Z0-9]+$/.test(s))) throw Error();
      return u;
    } catch { errors.push(`${key} must be a clean HTTPS ${key === 'repository' ? 'repository root' : 'source'} URL on GitHub, GitLab, or Codeberg`); return null; }
  };
  const repo = parseRepoUrl(value.repository,'repository'), source = parseRepoUrl(value.source,'source');
  if (repo && source && !(repo.hostname === source.hostname && (source.pathname.toLowerCase() === repo.pathname.toLowerCase() || source.pathname.toLowerCase().startsWith(repo.pathname.replace(/\/$/,'').toLowerCase()+'/')))) errors.push('source must belong to the repository');
  if (value.website !== undefined && value.website !== '') { try { const u=new URL(value.website);if(u.protocol!=='https:' || u.username || u.password || u.port || !u.hostname.includes('.')) throw Error(); } catch { errors.push('website must be a clean HTTPS URL'); } }
  for (const key of required) if (typeof value[key] === 'string' && value[key].length > (key === 'usage' || key === 'description' ? 2000 : 500)) errors.push(`${key} is too long`);
  for (const key of ['tags','frameworks']) if(Array.isArray(value[key]) && (value[key].length>20 || value[key].some(x=>typeof x==='string' && x.length>80))) errors.push(`${key} has too many or oversized values`);
  if (value.type === 'agent' && (!value.runtime || !value.install || !value.usage)) errors.push('agent tools require runtime, installation, and client configuration guidance');
  if (['ui','animation'].includes(value.type) && !value.frameworks?.length) errors.push('UI resources require a framework');
  if (existing.some(x => x.slug === value.slug || (typeof value.repository === 'string' && typeof x.repository === 'string' && x.repository.replace(/\/$/,'').toLowerCase() === value.repository.replace(/\/$/,'').toLowerCase() && !(allowSharedFirstPartyRepository && value.firstParty===true && x.firstParty===true && value.repository==='https://github.com/GraphicMiles/Motionshelf' && value.source!==x.source)))) errors.push('duplicate slug or repository');
  return errors;
}
export function loadCatalog() { return JSON.parse(fs.readFileSync(new URL('./data/resources.json', import.meta.url), 'utf8')); }
