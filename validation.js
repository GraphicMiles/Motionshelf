import fs from 'node:fs';
export const TYPES = ['ui','animation','agent','utility'];
export function validateResource(value, existing = []) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Metadata must be an object'];
  const required = ['slug','name','type','category','description','repository','source','license','runtime','install','usage','version','maintenance','attribution'];
  for (const key of required) if (typeof value[key] !== 'string' || !value[key].trim()) errors.push(`${key} is required`);
  if (value.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) errors.push('slug must be lowercase kebab-case');
  if (value.type && !TYPES.includes(value.type)) errors.push('type must be ui, animation, agent, or utility');
  for (const key of ['tags','frameworks']) if (!Array.isArray(value[key]) || !value[key].length || value[key].some(x => typeof x !== 'string' || !x.trim())) errors.push(`${key} must be a non-empty string array`);
  for (const key of ['repository','source']) {
    try { const u = new URL(value[key]); if (u.protocol !== 'https:' || !['github.com','gitlab.com','codeberg.org'].includes(u.hostname) || u.pathname.split('/').filter(Boolean).length < 2) throw Error(); }
    catch { errors.push(`${key} must be an HTTPS repository URL on GitHub, GitLab, or Codeberg`); }
  }
  if (value.repository && value.source && !(value.source.replace(/\/$/,'') === value.repository.replace(/\/$/,'') || value.source.replace(/\/$/,'').startsWith(value.repository.replace(/\/$/,'') + '/'))) errors.push('source must belong to the repository');
  if (value.type === 'agent' && (!value.runtime || !value.install || !value.usage)) errors.push('agent tools require runtime, installation, and client configuration guidance');
  if (['ui','animation'].includes(value.type) && !value.frameworks?.length) errors.push('UI resources require a framework');
  if (existing.some(x => x.slug === value.slug || x.repository?.replace(/\/$/,'').toLowerCase() === value.repository?.replace(/\/$/,'').toLowerCase())) errors.push('duplicate slug or repository');
  return errors;
}
export function loadCatalog() { return JSON.parse(fs.readFileSync(new URL('./data/resources.json', import.meta.url), 'utf8')); }
