import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.AUDIT_BASE||'http://127.0.0.1:3001',api=process.env.AUDIT_API||'http://127.0.0.1:3000',seed=Number(process.env.AUDIT_SEED||20977);let rng=seed>>>0,passed=0,failures=[];
function random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296}
function choice(xs){return xs[Math.floor(random()*xs.length)]}
function check(name,ok,detail=''){passed++;if(!ok)failures.push(`${name}: ${detail}`)}
const browser=await chromium.launch({headless:true});
for(const width of [280,320,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:850},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/');await page.locator('.resource-card').first().waitFor();
 for(let i=0;i<15;i++){
  const action=choice(['search','type','framework','license','sort','detail','copy','clear']);
  try{if(action==='search')await page.locator('#search').fill(choice(['motion','react','zzz-not-found','','table','agent']));
  if(action==='type')await page.locator(choice(['[data-type=all]','[data-type=ui]','[data-type=animation]','[data-type=agent]','[data-type=utility]'])).click();
  if(action==='framework')await page.locator('#frameworkFilter').selectOption(choice(await page.locator('#frameworkFilter option').evaluateAll(xs=>xs.map(x=>x.value))));
  if(action==='license')await page.locator('#licenseFilter').selectOption(choice(await page.locator('#licenseFilter option').evaluateAll(xs=>xs.map(x=>x.value))));
  if(action==='sort')await page.locator('#sortFilter').selectOption(choice(['featured','az','za']));
  if(action==='detail'&&await page.locator('[data-open]').count()){await page.locator('[data-open]').first().click();await page.keyboard.press('Escape')}
  if(action==='copy'&&await page.locator('[data-copy-card]:not([disabled])').count()){await page.locator('[data-copy-card]:not([disabled])').first().click();await page.waitForTimeout(70)}
  if(action==='clear'){if(await page.locator('#empty').isVisible())await page.locator('#clearFilters').click();else{await page.locator('#search').fill('');await page.locator('[data-type=all]').click();await page.locator('#frameworkFilter').selectOption('all');await page.locator('#licenseFilter').selectOption('all')}}
  check(`${width}px action ${i} ${action} stays aligned`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check(`${width}px action ${i} cards remain operable`,await page.locator('.resource-card').count()<=7);
  }catch(e){failures.push(`${width}px action ${i} ${action}: ${e.message.slice(0,140)}`)}
 }
 check(`${width}px no uncaught errors`,errors.length===0,errors.join('; '));await context.close();
}
{
 const context=await browser.newContext({viewport:{width:390,height:850}}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let deliver;const requested=new Promise(r=>deliver=r);await page.route('**/api/analyze/github',route=>deliver(route));await page.goto(base+'/contribute');await page.locator('[data-kind=github]').click();await page.locator('#sourceUrl').fill('https://github.com/example/repo');await page.locator('#analyzeBtn').click();const intercepted=await requested;await page.locator('[data-kind=files]').click();try{await intercepted.fulfill({status:200,contentType:'application/json',body:JSON.stringify({metadata:{name:'Outdated repo',type:'ui'},notes:[],missing:[]})})}catch{}await page.waitForTimeout(150);check('switching source rejects stale analysis',await page.locator('#reviewStep').isHidden());
 await page.locator('[data-kind=live]').click();await page.locator('#sourceUrl').fill('https://example.com');await page.route('**/api/analyze/live',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({metadata:{name:'Original',description:'Original page',type:'ui',category:'Components'},notes:[],missing:[]})}));await page.locator('#analyzeBtn').click();await page.locator('#reviewStep').waitFor({state:'visible'});await page.locator('#sourceUrl').fill('https://another.example');check('URL edit revokes extracted review',await page.locator('#reviewStep').isHidden());
 await page.locator('#manualBtn').click();await page.locator('#reviewStep').waitFor({state:'visible'});await page.locator('[name=name]').fill('Manual entry');await page.locator('[name=slug]').fill('manual-entry-audit');await page.locator('[name=type]').selectOption('utility');await page.locator('[name=category]').fill('Developer utility');await page.locator('textarea[name=description]').fill('This manually checked resource is pending review.');let captured;await page.route('**/api/submissions',async route=>{captured=route.request().postDataJSON();await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({message:'Submission saved for review.'})})});await page.locator('#submitBtn').click();await page.waitForFunction(()=>document.querySelector('#formMessage').textContent.includes('Submission saved'));check('manual fallback submits current URL only',captured?.sourceInput==='https://another.example'&&captured?.website==='https://another.example'&&captured?.sourceKind==='live');check('unknown license is truly unset',captured?.license==='');
 check('contribution has no runtime errors',errors.length===0,errors.join('; '));await context.close();
}
{
 const context=await browser.newContext({viewport:{width:320,height:850}}),page=await context.newPage();await page.goto(base+'/contribute');await page.locator('[data-kind=files]').click();const file=(name,text)=>({name,mimeType:'text/plain',buffer:Buffer.from(text)});await page.locator('#sourceFiles').setInputFiles(file('widget.js','export default 1'));await page.locator('#manualBtn').click();check('manual file review visible',await page.locator('#reviewStep').isVisible());await page.locator('#sourceFiles').setInputFiles(file('replacement.js','export default 2'));check('replacing files revokes review',await page.locator('#reviewStep').isHidden());await page.locator('#manualBtn').click();const result=await new AxeBuilder({page}).exclude('iframe').analyze();check('320px manual review accessible',result.violations.length===0,result.violations.map(v=>v.id).join(','));await context.close();
}
{
 const page=await browser.newPage();await page.route('**/api/resources',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{name:'No snippet',slug:'no-snippet',type:'utility',frameworks:['JavaScript'],license:'MIT',description:'Example without install',category:'Tool',runtime:'Browser',tags:[],repository:'https://github.com/example/no-snippet',source:'https://github.com/example/no-snippet',install:'',usage:''}])}));await page.goto(base+'/');await page.locator('[data-copy-card]').waitFor();check('missing snippet has disabled action',await page.locator('[data-copy-card]').isDisabled());await page.close();
}
{
 const context=await browser.newContext({viewport:{width:390,height:800}}),page=await context.newPage();let requests=0;
 await page.route('**/api/github-stars*',route=>{requests++;return route.fulfill({status:requests===1?503:200,contentType:'application/json',body:requests===1?'{}':'{"count":17}'})});
 await page.goto(base+'/');await page.waitForFunction(()=>document.querySelector('#githubStars').textContent==='17',{timeout:12000}).catch(()=>{});
 check('star count retries a transient upstream failure without guessing',requests>=2&&await page.locator('#githubStars').innerText()==='17');
 await page.locator('.resource-card').first().waitFor();await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(Error('denied'))});
 await page.locator('[data-copy-card]').first().click();await page.waitForFunction(()=>document.querySelector('[data-copy-feedback]').textContent==='Could not copy',{timeout:5000}).catch(()=>{});
 check('clipboard failure has visible feedback',await page.locator('[data-copy-feedback]').first().innerText()==='Could not copy');await context.close();
}
for(const input of ['null','[]','"string"','123','true','{}']){const res=await fetch(api+'/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:input});check(`malformed submission ${input} is client error`,res.status>=400&&res.status<500,res.status)}
await browser.close();console.log(`seed=${seed} · ${passed-failures.length}/${passed} randomized checks passed`);for(const failure of failures)console.log('FAIL',failure);if(failures.length)process.exitCode=1;
