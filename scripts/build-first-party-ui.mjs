import fs from 'node:fs/promises';
import { sharedCSS, htmlShell, prelude } from './first-party/shared.mjs';
import search from './first-party/a-search.mjs';
import forms from './first-party/b-forms.mjs';
import nav from './first-party/c-nav.mjs';
import data from './first-party/d-data.mjs';
import feedback from './first-party/e-feedback.mjs';

const components = [...search, ...forms, ...nav, ...data, ...feedback];

// Guard the catalogue contract: 28 distinct slugs, one per shipped example.
if (components.length !== 28) throw Error(`Expected 28 statements, got ${components.length}`);
if (new Set(components.map((c) => c.slug)).size !== 28) throw Error('Duplicate slug');

const dir = new URL('../public/examples/', import.meta.url);

for (const item of components) {
  const html = htmlShell(item.title, item.slug, item.body, item.tag ?? '', item.layout ?? '');
  const css = (sharedCSS + '\n' + item.css).trimEnd() + '\n';
  const js = (prelude + '\n' + item.js).trimEnd() + '\n\ndocument.body.dataset.ready="true";\n';
  await fs.writeFile(new URL(`${item.slug}.html`, dir), html);
  await fs.writeFile(new URL(`${item.slug}.css`, dir), css);
  await fs.writeFile(new URL(`${item.slug}.js`, dir), js);
}

console.log('Built ' + components.length + ' first-party UI examples');
