import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {loadCatalog} from '../validation.js';
const base=process.env.AUDIT_BASE||'http://127.0.0.1:3001',browser=await chromium.launch({headless:true}),items=loadCatalog().filter(r=>r.firstParty&&r.type==='ui');let checks=0,failures=[];
function check(name,value){checks++;if(!value)failures.push(name)}
const actions={
 'accessible-command-menu':async p=>{await p.locator('#query').fill('copy');await p.locator('#actions button').click();return(await p.locator('#status').innerText()).includes('Copy project link selected')},
 'async-combobox':async p=>{await p.locator('#city').fill('lag');await p.locator('#results [role=option]').first().waitFor();await p.locator('#results [role=option]').first().click();return(await p.locator('#city').inputValue())==='Lagos'},
 'inline-edit-field':async p=>{await p.locator('#edit').click();await p.locator('#draft').fill('New title');await p.locator('#form button[type=submit]').click();return(await p.locator('#value').innerText())==='New title'},
 'multi-step-form':async p=>{await p.locator('#fullName').fill('Amina');await p.locator('#next').click();await p.locator('#email').fill('amina@example.com');await p.locator('#next').click();return(await p.locator('#review').innerText()).includes('amina@example.com')},
 'validation-summary':async p=>{await p.locator('#form button').click();return await p.locator('#errors').isVisible()&&await p.locator('#errors a').count()===2},
 'tag-editor':async p=>{await p.locator('#tag').fill('new');await p.locator('#add').click();return(await p.locator('#tags').innerText()).includes('new')},
 'file-drop-zone':async p=>{await p.locator('#file').setInputFiles({name:'note.txt',mimeType:'text/plain',buffer:Buffer.from('hello')});return(await p.locator('#status').innerText()).includes('note.txt ready')},
 'otp-code-input':async p=>{await p.locator('#code').fill('abc1234567');return(await p.locator('#code').inputValue())==='123456'&&await p.locator('#status').innerText()==='Code complete'},
 'date-range-picker':async p=>{await p.locator('#start').fill('2026-10-01');await p.locator('#end').fill('2026-10-03');await p.locator('#end').dispatchEvent('change');return(await p.locator('#status').innerText()).includes('3 days')},
 'filter-bar':async p=>{await p.locator('[data-filter=design]').click();return await p.locator('#items li').count()===2},
 'responsive-nav-drawer':async p=>{await p.locator('#toggle').click();const open=await p.locator('#drawer').isVisible();await p.keyboard.press('Escape');return open&&await p.locator('#drawer').isHidden()},
 'nested-menu':async p=>{await p.locator('#parent').click();await p.locator('[data-action=Share]').click();return(await p.locator('#status').innerText()).includes('Share selected')},
 'overflow-tabs':async p=>{await p.getByRole('tab',{name:'Activity'}).click();return(await p.locator('#content').innerText()).includes('Activity')},
 'breadcrumbs':async p=>{await p.locator('#expand').click();return await p.locator('#middle').isVisible()},
 'table-of-contents':async p=>{await p.locator('[data-go=details]').click();return(await p.locator('[data-go=details]').getAttribute('aria-current'))==='true'},
 'pagination-controls':async p=>{await p.locator('#next').click();return(await p.locator('#page').innerText()).includes('2 of 4')},
 'collapsible-tree':async p=>{await p.locator('#folder').click();return await p.locator('#children').isHidden()},
 'data-table':async p=>{await p.locator('#sort').click();return(await p.locator('#rows tr').first().innerText()).includes('Casey')},
 'virtual-list':async p=>{await p.locator('#viewport').evaluate(x=>x.scrollTop=15000);await p.waitForFunction(()=>document.querySelector('#window').textContent.includes('0470'));return(await p.locator('#window').innerText()).includes('0470')},
 'kanban-lanes':async p=>{await p.locator('#todo button').first().click();return(await p.locator('#done').innerText()).includes('Write outline')},
 'activity-timeline':async p=>{await p.locator('#more').click();return await p.locator('#events li').count()===4},
 'schedule-calendar':async p=>{await p.locator('#days button').first().click();return(await p.locator('#agenda').innerText()).includes('events on')},
 'comparison-grid':async p=>{await p.locator('#differences').check();return await p.locator('#rows tr').count()===2},
 'status-dashboard':async p=>{await p.locator('#unavailable').click();return(await p.locator('#requests').innerText())==='Unavailable'},
 'toast-stack':async p=>{await p.locator('#add').click();return(await p.locator('.toast').count())===1},
 'action-confirmation':async p=>{await p.locator('#delete').click();await p.locator('#confirm').click();await p.locator('#undo').click();return await p.locator('#item').isVisible()},
 'progress-steps':async p=>{await p.locator('#next').click();const blocked=(await p.locator('#status').innerText()).includes('Confirm');await p.locator('#ready').check();await p.locator('#next').click();return blocked&&(await p.locator('#status').innerText()).includes('Step 2')},
 'notification-center':async p=>{await p.locator('#markAll').click();return(await p.locator('#status').innerText()).includes('0 unread')}
};
for(const item of items){const context=await browser.newContext({viewport:{width:360,height:260}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await page.goto(`${base}/examples/${item.slug}.html`);await page.locator('body[data-ready=true]').waitFor();check(`${item.slug} loads without script errors`,errors.length===0);check(`${item.slug} fits narrow preview`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));check(`${item.slug} interaction works`,await actions[item.slug](page));const audit=await new AxeBuilder({page}).analyze();check(`${item.slug} accessibility`,audit.violations.length===0);if(audit.violations.length)console.log(item.slug,'axe',audit.violations.map(x=>x.id))}catch(e){failures.push(`${item.slug}: ${e.message.slice(0,250)}`)}finally{await context.close()}}
await browser.close();console.log(`${checks-failures.length}/${checks} first-party UI checks passed`,failures);if(failures.length)process.exitCode=1;
