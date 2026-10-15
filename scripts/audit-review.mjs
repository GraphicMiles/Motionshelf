import {chromium} from 'playwright';import AxeBuilder from '@axe-core/playwright';
const base=process.env.AUDIT_BASE||'http://127.0.0.1:3001';const browser=await chromium.launch({headless:true});let checks=0,failures=[];
for(const width of [1440,390,320]){const context=await browser.newContext({viewport:{width,height:850}});const page=await context.newPage();try{
 await page.goto(base+'/admin.html');await page.locator('#loginForm').waitFor();const admin=await new AxeBuilder({page}).analyze();if(admin.violations.length)failures.push(`${width} admin: ${admin.violations.map(v=>v.id)}`);checks++;
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))failures.push(`${width} admin overflow`);checks++;
 await page.goto(base+'/');await page.locator('#cards .resource-card').first().waitFor();await page.locator('#contributeNav').evaluate(el=>el.click());
 await page.locator('#metadataFile').setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({name:'Imported resource',slug:'imported-resource',tags:['tool','ui'],frameworks:['React']}))});await page.waitForFunction(()=>document.querySelector('input[name=name]').value==='Imported resource');await page.waitForTimeout(400);
 if(await page.locator('input[name=name]').inputValue()!=='Imported resource'||await page.locator('input[name=tags]').inputValue()!=='tool, ui')failures.push(`${width} metadata import`);checks++;
 const form=await new AxeBuilder({page}).analyze();if(form.violations.length)failures.push(`${width} form: ${form.violations.map(v=>v.id)}`);checks++;
 }finally{await context.close()}}
await browser.close();console.log(`${checks-failures.length}/${checks} browser checks passed`,failures);if(failures.length)process.exitCode=1;
