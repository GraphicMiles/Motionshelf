import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {run,tools} from '../agents/core.mjs';
import {loadCatalog} from '../validation.js';
const samples={
 'repo-structure-map':[{files:[{path:'src/index.js',content:''},{path:'README.md',content:''}]},x=>x.folders.length===2&&x.entryPoints.includes('src/index.js')],
 'pr-change-risk':[{diff:'+++ b/src/auth.js\n+new check\n-legacy check'},x=>x.reviewPriority==='higher'&&x.files[0]==='src/auth.js'],
 'test-gap-finder':[{changed:['src/menu.js','src/button.js'],tests:['tests/button.test.js']},x=>x.possibleGaps.length===1&&x.possibleGaps[0].detail==='src/menu.js'],
 'dependency-impact-trace':[{entry:'src/state.js',files:[{path:'src/state.js',content:'export const state=1'},{path:'src/app.js',content:'import {state} from "./state.js"'}]},x=>x.consumers.includes('src/app.js')],
 'license-notice-check':[{files:[{path:'LICENSE',content:'MIT'},{path:'package.json',content:'{"license":"MIT"}'}]},x=>x.licenseFiles[0]==='LICENSE'&&x.packageDeclarations[0].declared==='MIT'],
 'docs-staleness-check':[{files:[{path:'README.md',content:'[Missing](docs/missing.md) [Found](docs/found.md)'},{path:'docs/found.md',content:'ok'}]},x=>x.missing.length===1&&x.missing[0].reference==='docs/missing.md'],
 'api-contract-diff':[{before:{routes:{'/items':{POST:{required:['name']}}}},after:{routes:{'/items':{GET:{required:[]}}}}},x=>x.removed.includes('POST /items')&&x.added.includes('GET /items')],
 'accessibility-review-assistant':[{html:'<img src="x"><button><svg></svg></button>'},x=>x.findings.length===2],
 'release-checklist-builder':[{files:[{path:'README.md',content:'hi'}],changed:['src/index.js']},x=>x.checks[0].status==='found'&&x.checks[1].status==='verify manually'],
 'build-log-triage':[{log:'Error: token=ghp_abcdefghijklmnopqrstuvwxyz0123456789'},x=>x.findings.length===1&&!JSON.stringify(x).includes('ghp_')],
 'issue-duplicate-finder':[{query:{title:'Search input loses focus'},issues:[{id:12,title:'Search field loses focus'}]},x=>x.candidates[0]?.id==='12'],
 'prompt-boundary-probe':[{forbidden:['private marker'],responses:[{name:'test',output:'private marker leaked'}]},x=>x.cases[0].status==='review'&&!JSON.stringify(x).includes('private marker')],
 'secret-pattern-audit':[{files:[{path:'config.js',content:'ghp_12345678901234567890123456789012'}]},x=>x.findings.length===1&&!JSON.stringify(x).includes('12345678901234567890123456789012')],
 'localization-consistency-check':[{locales:{en:{hello:'Hi {name}',bye:'Bye'},fr:{hello:'Bonjour {person}'}}},x=>x.results[0].missing.includes('bye')&&x.results[0].placeholderMismatch.includes('hello')]
};
test('all planned agent tools have distinct working, bounded implementations',()=>{const slugs=loadCatalog().filter(x=>x.firstParty&&x.type==='agent').map(x=>x.slug);assert.deepEqual(slugs.sort(),Object.keys(tools).sort());for(const slug of slugs){const [input,expect]=samples[slug];assert.ok(expect(run(slug,input)),slug);const wrapper=new URL(`../agents/${slug}.mjs`,import.meta.url),bundle=new URL(`../public/agents/${slug}.zip`,import.meta.url);assert.ok(fs.existsSync(wrapper),slug);assert.ok(fs.statSync(bundle).size>1000,slug);assert.equal(spawnSync(process.execPath,[wrapper.pathname,'--help'],{encoding:'utf8'}).status,0,slug)}});
test('agent CLI reads JSON only, rejects oversized input, and never executes supplied JavaScript',()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'motionshelf-agent-'));try{const input=path.join(dir,'payload.json');fs.writeFileSync(input,JSON.stringify(samples['repo-structure-map'][0]));const cli=new URL('../agents/repo-structure-map.mjs',import.meta.url).pathname;const result=spawnSync(process.execPath,[cli,input],{encoding:'utf8'});assert.equal(result.status,0);assert.equal(JSON.parse(result.stdout).entryPoints[0],'src/index.js');fs.writeFileSync(input,'not json');assert.equal(spawnSync(process.execPath,[cli,input],{encoding:'utf8'}).status,1);fs.writeFileSync(input,'x'.repeat(1_000_001));assert.equal(spawnSync(process.execPath,[cli,input],{encoding:'utf8'}).status,1)}finally{fs.rmSync(dir,{recursive:true,force:true})}});
