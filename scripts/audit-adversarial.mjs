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
 await page.route('https://api.github.com/repos/GraphicMiles/Motionshelf?fresh=*',route=>{requests++;return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({stargazers_count:count})})});
 await page.goto(base+'/');await page.waitForFunction(()=>document.querySelector('#githubStars').textContent==='7');
 check('freshness','Count loaded from API response',await page.locator('#githubStars').textContent()==='7');
 check('freshness','Pill links to GitHub star destination',await page.locator('.github-pill').getAttribute('href')==='https://github.com/GraphicMiles/Motionshelf'&&await page.locator('.github-pill').getAttribute('target')==='_blank');
 count=8;await page.locator('.github-pill').dispatchEvent('click');await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.querySelector('#githubStars').textContent==='8');check('freshness','Immediate refetch on return from star action',requests>=2);
 const before=requests;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));check('freshness','Focus burst is throttled',requests===before);
 await page.route('https://api.github.com/repos/GraphicMiles/Motionshelf?fresh=*',route=>route.fulfill({status:403,body:'{}'}));await page.clock.fastForward(61000);await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(100);check('freshness','Rate limit does not fabricate a new count',await page.locator('#githubStars').textContent()==='8');await context.close();
 const real=await pageAt();await real.page.goto(base+'/');const remote=await real.page.request.get('https://api.github.com/repos/GraphicMiles/Motionshelf?fresh='+Date.now());const actual=(await remote.json()).stargazers_count;await real.page.waitForFunction(()=>!document.querySelector('#githubStars').hidden&&document.querySelector('#githubStars').textContent!=='',{timeout:10000}).catch(()=>{});const shown=await real.page.locator('#githubStars').textContent();check('freshness','Displayed production count matches live GitHub API',remote.ok()&&shown===new Intl.NumberFormat('en').format(actual),`shown ${shown}, API ${actual}`);await real.context.close();
}
// 2. Browse, save, detail, source, form and download journeys.
{
 const {context,page}=await pageAt(390);await page.goto(base+'/');await page.locator('.resource-card').first().waitFor();
 const total=await page.locator('.resource-card').count();check('functionality','All seven resources render',total===7);
 await page.locator('#search').fill('shadcn');check('functionality','Search narrows results',await page.locator('.resource-card').count()===1);
 await page.locator('#search').fill('');await page.locator('[data-type=agent]').click();check('functionality','Agent filter isolates original source listing',await page.locator('.resource-card').count()===1&&await page.locator('.agent-preview a').getAttribute('href')!==null);
 await page.locator('[data-type=all]').click();await page.locator('[data-save=shadcn-ui]').click();check('functionality','Save persists in local storage',await page.evaluate(()=>JSON.parse(localStorage.getItem('motionshelf:saved')).includes('shadcn-ui')));
 await page.locator('#savedNav').evaluate(e=>e.click());check('functionality','Saved view filters catalog',await page.locator('.resource-card').count()===1);
 await page.reload();await page.locator('.resource-card').first().waitFor();check('functionality','Save survives reload',await page.evaluate(()=>JSON.parse(localStorage.getItem('motionshelf:saved')).includes('shadcn-ui')));
 await page.locator('#sortFilter').selectOption('za');let names=await page.locator('.resource-card h3').allTextContents();check('functionality','Descending sort is real',names.join('|')===names.toSorted((a,b)=>b.localeCompare(a)).join('|'));
 await page.locator('[data-open=shadcn-ui]').click();await page.locator('#exampleCode').waitFor();await page.waitForFunction(()=>document.querySelector('#exampleCode').textContent.startsWith('<!doctype html>'));
 for(const ext of ['html','css','js']){await page.locator(`[data-example-file=${ext}]`).click();await page.waitForFunction(ext=>document.querySelector('#exampleCode').textContent===undefined?false:document.querySelector('#exampleCode').textContent.includes(ext==='css'?'.tablist':ext==='js'?'tab':'<!doctype html>'),ext);const res=await page.request.get(base+'/examples/shadcn-ui.'+ext);check('functionality',`Displayed ${ext.toUpperCase()} equals served file`,await page.locator('#exampleCode').textContent()===await res.text())}
 await page.locator('[data-copy-example]').click();check('functionality','Copy writes exact selected file',await page.evaluate(()=>navigator.clipboard.readText())===await page.locator('#exampleCode').textContent());check('functionality','ZIP link resolves', (await page.request.get(base+'/examples/shadcn-ui.zip')).ok());await page.keyboard.press('Escape');check('functionality','Escape dismisses detail',await page.locator('#detailOverlay').isHidden());
 await page.locator('#contributeNav').evaluate(e=>e.click());check('functionality','Contribution copy states review boundary',(await page.locator('.form-intro').textContent()).includes('curated separately'));
 await page.locator('#metadataFile').setInputFiles({name:'data.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({name:'Imported example',slug:'imported-example',tags:['safe'],frameworks:['React']}))});await page.waitForFunction(()=>document.querySelector('input[name=name]').value==='Imported example');check('functionality','Metadata import populates fields',await page.locator('input[name=slug]').inputValue()==='imported-example');await page.keyboard.press('Escape');check('functionality','Escape dismisses contribution form',await page.locator('#submitOverlay').isHidden());await context.close();
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
// 4. Failure isolation and trust boundary: all production requests here are read-only or intentionally invalid.
{
 const {context,page}=await pageAt();await page.route('**/api/resources',route=>route.fulfill({status:503,body:'{}'}));await page.goto(base+'/');check('boundary','Catalog failure is visible rather than silently empty',await page.locator('#cards').innerText().then(s=>s.includes('Could not load catalog')));await context.close();
 const example=await pageAt();await example.page.goto(base+'/');await example.page.locator('.resource-card').first().waitFor();const frame=example.page.frameLocator('.resource-card iframe[src="/examples/shadcn-ui.html"]');await frame.locator('body[data-ready=true]').waitFor();check('boundary','Curated preview cannot read parent origin',await frame.locator('body').evaluate(()=>{try{return window.parent.location.href!==window.location.href}catch{return true}}));
 await example.page.locator('#contributeNav').evaluate(e=>e.click());await example.page.locator('#metadataFile').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});await example.page.waitForFunction(()=>document.querySelector('#formMessage').textContent.length>0);check('boundary','Bad metadata import rejected locally',(await example.page.locator('#formMessage').innerText()).includes('JSON'));
 await example.page.locator('#metadataFile').setInputFiles({name:'big.json',mimeType:'application/json',buffer:Buffer.alloc(30001)});check('boundary','Oversize metadata import rejected',(await example.page.locator('#formMessage').innerText()).includes('30 KB'));await example.context.close();
 const res=await fetch(api+'/api/admin/submissions');check('boundary','Unauthenticated review denied',res.status===401,res.status);
 const cors=await fetch(api+'/api/admin/submissions',{headers:{Origin:'https://evil.invalid'}});check('boundary','Cross-origin admin denied or unauthenticated',[401,403].includes(cors.status)&&!cors.headers.get('access-control-allow-origin'),cors.status);
 const upload=await fetch(api+'/api/submissions',{method:'POST',headers:{'Content-Type':'text/plain'},body:'submitted code'});check('boundary','Executable/file upload not accepted',upload.status===415,upload.status);
 const health=await fetch(api+'/health');check('boundary','API health responds',health.ok,(await health.text()));
}
await browser.close();const groups=[...new Set(outcomes.map(x=>x.axis))];for(const axis of groups){const rows=outcomes.filter(x=>x.axis===axis);console.log(`${axis}: ${rows.filter(x=>x.ok).length}/${rows.length}`);for(const row of rows.filter(x=>!x.ok))console.log(' FAIL',row.name,row.detail)}console.log(`${outcomes.filter(x=>x.ok).length}/${outcomes.length} adversarial checks passed`);if(outcomes.some(x=>!x.ok))process.exitCode=1;
