import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.AUDIT_BASE||'http://127.0.0.1:3011';
const api=process.env.AUDIT_API||'http://127.0.0.1:3010';
const browser=await chromium.launch();const outcomes=[];
function check(axis,name,ok,detail=''){outcomes.push({axis,name,ok:!!ok,detail:ok?'':String(detail)});}
async function pageAt(width=390){const context=await browser.newContext({viewport:{width,height:850},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();return {context,page}}
// 1. Real GitHub data, replayed changes, and failure behavior.
{
 const {context,page}=await pageAt();await page.clock.install();let count=7,requests=0;
 await page.route('**/api/github-stars*',route=>{requests++;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({count:count})})});
 await page.goto(base+'/');await page.waitForFunction(()=>document.querySelector('#githubStars').textContent==='7');
 check('freshness','Count loaded from API response',await page.locator('#githubStars').textContent()==='7');
 check('freshness','Pill links to GitHub star destination',await page.locator('.github-pill').getAttribute('href')==='https://github.com/GraphicMiles/Motionshelf'&&await page.locator('.github-pill').getAttribute('target')==='_blank');
 count=8;await page.locator('.github-pill').dispatchEvent('click');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.querySelector('#githubStars').textContent==='8');check('freshness','Immediate refetch on return from star action',requests>=2);
 const before=requests;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));check('freshness','Focus burst is throttled',requests===before);
 await page.route('**/api/github-stars*',route=>route.fulfill({status:403,body:'{}'}));await page.clock.fastForward(61000);await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(100);check('freshness','Rate limit does not fabricate a new count',await page.locator('#githubStars').textContent()==='8');await context.close();
 const real=await pageAt();await real.page.goto(base+'/');const remote=await real.page.request.get('https://github.com/GraphicMiles/Motionshelf');const match=(await remote.text()).match(/\"stargazerCount\":(\d+)/);const actual=match&&Number(match[1]);await real.page.waitForFunction(()=>!document.querySelector('#githubStars').hidden&&document.querySelector('#githubStars').textContent!=='',{timeout:20000}).catch(()=>{});const shown=await real.page.locator('#githubStars').textContent();check('freshness','Displayed count matches GitHub repository page',remote.ok()&&Number.isSafeInteger(actual)&&shown===new Intl.NumberFormat('en').format(actual),`shown ${shown}, GitHub ${actual}`);await real.context.close();
}
// 2. Browse, save, detail, source, form and download journeys.
{
 const {context,page}=await pageAt(390);await page.goto(base+'/');await page.locator('.resource-card').first().waitFor();
 const total=await page.locator('.resource-card').count();check('functionality','All seven resources render',total===7);
 await page.locator('#search').fill('shadcn');check('functionality','Search narrows results',await page.locator('.resource-card').count()===1);
 await page.locator('#search').fill('zzzz-no-match');check('functionality','Empty state appears',await page.locator('#empty').isVisible());await page.locator('#clearFilters').click();check('functionality','Clear filters restores results',await page.locator('.resource-card').count()===7);
 await page.locator('#frameworkFilter').selectOption('React');check('functionality','Framework filter applies',await page.locator('.resource-card').count()<7&&await page.locator('.resource-card').count()>0);await page.locator('#frameworkFilter').selectOption('all');
 await page.locator('#licenseFilter').selectOption('MIT');check('functionality','License filter applies',await page.locator('.resource-card').count()<7&&await page.locator('.resource-card').count()>0);await page.locator('#licenseFilter').selectOption('all');
 await page.locator('[data-type=agent]').click();check('functionality','Agent filter isolates original source listing',await page.locator('.resource-card').count()===1&&await page.locator('.agent-preview a').getAttribute('href')!==null);
 await page.locator('[data-type=all]').click();await page.locator('[data-copy-card=shadcn-ui]').click();await page.waitForFunction(()=>document.querySelector('[data-copy-feedback=shadcn-ui]').textContent.length>0);check('functionality','Card copy reports success',await page.locator('[data-copy-feedback=shadcn-ui]').innerText()==='Copied');check('functionality','Card clipboard holds served snippet',await page.evaluate(()=>navigator.clipboard.readText())===await (await page.request.get(base+'/examples/shadcn-ui.js')).text());
 await page.reload();await page.locator('.resource-card').first().waitFor();check('functionality','No saved state or bookmark UI',await page.locator('#savedNav,[data-save]').count()===0&&await page.evaluate(()=>localStorage.getItem('motionshelf:saved')===null));
 await page.locator('#sortFilter').selectOption('za');let names=await page.locator('.resource-card h3').allTextContents();check('functionality','Descending sort is real',names.join('|')===names.toSorted((a,b)=>b.localeCompare(a)).join('|'));
 await page.locator('[data-open=shadcn-ui]').click();await page.locator('#exampleCode').waitFor();await page.waitForFunction(()=>document.querySelector('#exampleCode').textContent.startsWith('<!doctype html>'));
 for(const ext of ['html','css','js']){await page.locator(`[data-example-file=${ext}]`).click();await page.waitForFunction(ext=>document.querySelector('#exampleCode').textContent===undefined?false:document.querySelector('#exampleCode').textContent.includes(ext==='css'?'.tablist':ext==='js'?'tab':'<!doctype html>'),ext);const res=await page.request.get(base+'/examples/shadcn-ui.'+ext);check('functionality',`Displayed ${ext.toUpperCase()} equals served file`,await page.locator('#exampleCode').textContent()===await res.text())}
 await page.locator('[data-copy-example]').click();check('functionality','Copy writes exact selected file',await page.evaluate(()=>navigator.clipboard.readText())===await page.locator('#exampleCode').textContent());check('functionality','ZIP link resolves', (await page.request.get(base+'/examples/shadcn-ui.zip')).ok());await page.keyboard.press('Escape');check('functionality','Escape dismisses detail',await page.locator('#detailOverlay').isHidden());
 await page.goto(base+'/contribute');check('functionality','Contribution route states review boundary',(await page.locator('.review-lead').textContent()).includes('published yet'));
 await page.locator('[data-kind=files]').click();await page.locator('#sourceFiles').setInputFiles({name:'package.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({name:'imported-example',description:'A source-based example',dependencies:{react:'18'}}))});await page.locator('#analyzeBtn').click();await page.locator('#reviewStep').waitFor({state:'visible'});check('functionality','Source analysis populates editable fields',await page.locator('input[name=slug]').inputValue()==='imported-example');await context.close();
}
// 3. Small, middle and large viewports; keyboard and assistive-tech structure.
for(const width of [280,320,390,768,1280]){
 const {context,page}=await pageAt(width);await page.goto(base+'/');await page.locator('.resource-card').first().waitFor();
 check('interface',`${width}px home fits`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#search').click();check('interface',`${width}px input has no bright ring`,await page.locator('#search').evaluate(e=>getComputedStyle(e).outlineStyle==='none'&&getComputedStyle(e).boxShadow==='none'));
 await page.locator('[data-open=shadcn-ui]').click();check('interface',`${width}px details fit`,await page.locator('.detail-panel').evaluate(e=>e.scrollWidth<=e.clientWidth));
 const axe=await new AxeBuilder({page}).exclude('iframe').analyze();check('interface',`${width}px overlay accessibility`,axe.violations.length===0,axe.violations.map(v=>v.id));await page.keyboard.press('Escape');
 await page.goto(base+'/admin.html');const adminAxe=await new AxeBuilder({page}).analyze();check('interface',`${width}px admin login fits and is accessible`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&adminAxe.violations.length===0,adminAxe.violations.map(v=>v.id));await context.close();
}
for(const slug of ['shadcn-ui','radix-primitives','tanstack-table','motion','zustand','react-hook-form']){
 const {context,page}=await pageAt(280);await page.goto(base+'/examples/'+slug+'.html');await page.locator('body[data-ready=true]').waitFor();
 const axe=await new AxeBuilder({page}).analyze();check('interface',`${slug} standalone at 280px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&axe.violations.length===0,axe.violations.map(v=>v.id));await context.close();
}
// 4. Failure isolation and trust boundary: all production requests here are read-only or intentionally invalid.
{
 const {context,page}=await pageAt();await page.route('**/api/resources',route=>route.fulfill({status:503,body:'{}'}));await page.goto(base+'/');check('boundary','Catalog failure is visible rather than silently empty',await page.locator('#cards').innerText().then(s=>s.includes('Could not load catalog')));await context.close();
 const example=await pageAt();await example.page.goto(base+'/');await example.page.locator('.resource-card').first().waitFor();const frame=example.page.frameLocator('.resource-card iframe[src="/examples/shadcn-ui.html"]');await frame.locator('body[data-ready=true]').waitFor();check('boundary','Curated preview cannot read parent origin',await frame.locator('body').evaluate(()=>{try{return window.parent.location.href!==window.location.href}catch{return true}}));
 await example.page.goto(base+'/contribute');await example.page.locator('#sourceUrl').fill('https://127.0.0.1');await example.page.locator('#analyzeBtn').click();await example.page.waitForFunction(()=>document.querySelector('#analysisMessage').textContent.includes('manually'));check('boundary','Unsafe URL analysis blocked with fallback',(await example.page.locator('#analysisMessage').innerText()).includes('public HTTPS'));
 await example.page.locator('[data-kind=files]').click();await example.page.locator('#sourceFiles').setInputFiles({name:'big.js',mimeType:'text/javascript',buffer:Buffer.alloc(2*1024*1024+1)});await example.page.locator('#analyzeBtn').click();check('boundary','Oversize source rejected locally',(await example.page.locator('#analysisMessage').innerText()).includes('2 MB'));await example.context.close();
 const res=await fetch(api+'/api/admin/submissions');check('boundary','Unauthenticated review denied',res.status===401,res.status);
 const cors=await fetch(api+'/api/admin/submissions',{headers:{Origin:'https://evil.invalid'}});check('boundary','Cross-origin admin denied or unauthenticated',[401,403].includes(cors.status)&&!cors.headers.get('access-control-allow-origin'),cors.status);
 const upload=await fetch(api+'/api/submissions',{method:'POST',headers:{'Content-Type':'text/plain'},body:'submitted code'});check('boundary','Executable/file upload not accepted',upload.status===415,upload.status);
 const health=await fetch(api+'/health');check('boundary','API health responds',health.ok,(await health.text()));
}
await browser.close();const groups=[...new Set(outcomes.map(x=>x.axis))];for(const axis of groups){const rows=outcomes.filter(x=>x.axis===axis);console.log(`${axis}: ${rows.filter(x=>x.ok).length}/${rows.length}`);for(const row of rows.filter(x=>!x.ok))console.log(' FAIL',row.name,row.detail)}console.log(`${outcomes.filter(x=>x.ok).length}/${outcomes.length} adversarial checks passed`);if(outcomes.some(x=>!x.ok))process.exitCode=1;
