import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {loadCatalog} from '../validation.js';

// One scripted path per first-party component, written against the current markup.
// Each builder must prove the component's core behaviour, not merely that it renders.
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:3011';
const browser = await chromium.launch({headless:true});
const items = loadCatalog().filter(r => r.firstParty && r.type === 'ui');
let checks = 0, failures = [];
const check = (name, value) => { checks++; if (!value) failures.push(name); };

const actions = {
  'accessible-command-menu': async p => {
    await p.locator('#query').fill('copy');
    await p.waitForTimeout(180);
    const n = await p.locator('.cm-item').count();
    await p.locator('.cm-item').first().click();
    const flash = await p.locator('#cmFlash').innerText();
    return n > 0 && n < 12 && flash.includes('Copy project link');
  },
  'async-combobox': async p => {
    await p.locator('#city').fill('lon');
    await p.locator('.cb-opt').first().waitFor({timeout:5000});
    await p.locator('.cb-opt').first().click();
    return (await p.locator('#city').inputValue()) === 'London'
      && await p.locator('#cbSelected').isVisible()
      && (await p.locator('#cbSelTz').innerText()).includes('/');
  },
  'inline-edit-field': async p => {
    await p.locator('#edit').click();
    await p.locator('#draft').fill('New title');
    await p.locator('#form button[type=submit]').click();
    return (await p.locator('#value').innerText()) === 'New title'
      && await p.locator('#ieLog li').count() === 1;
  },
  'multi-step-form': async p => {
    await p.locator('#next').click();
    const blocked = (await p.locator('#msHint').innerText()).includes('Step 1');
    await p.locator('#fullName').fill('Amina');
    await p.locator('#next').click();
    await p.locator('#email').fill('amina@example.com');
    await p.locator('#next').click();
    return blocked && (await p.locator('#msReview').innerText()).includes('amina@example.com');
  },
  'validation-summary': async p => {
    await p.locator('button[type=submit]').click();
    const n = await p.locator('#vsList li').count();
    const shown = await p.locator('#errors').isVisible();
    await p.locator('#name').fill('Amina');
    await p.locator('#email').fill('a@b.co');
    await p.locator('#handle').fill('amina_d');
    await p.locator('button[type=submit]').click();
    return shown && n === 3 && await p.locator('#errors').isHidden()
      && await p.locator('.vs-pill.done').count() === 1;
  },
  'tag-editor': async p => {
    await p.locator('#tag').fill('urgent');
    await p.locator('#tag').press('Enter');
    const added = await p.locator('.te-chip').count();
    await p.locator('.te-chip button').first().click();
    await p.waitForTimeout(260);
    return added === 3 && await p.locator('.te-chip').count() === 2;
  },
  'file-drop-zone': async p => {
    await p.locator('#file').setInputFiles({name:'note.txt',mimeType:'text/plain',buffer:Buffer.from('hello')});
    const ok = (await p.locator('#status').innerText()).includes('ready');
    await p.locator('#file').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('x')});
    return ok && (await p.locator('#status').innerText()).includes('not a .txt');
  },
  'otp-code-input': async p => {
    await p.locator('.otp-slot').first().evaluate(el => {
      const dt = new DataTransfer(); dt.setData('text/plain','482913');
      el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));
    });
    await p.waitForTimeout(160);
    const v = await p.locator('.otp-slot').evaluateAll(e => e.map(x => x.value).join(''));
    await p.locator('#otpVerify').click();
    await p.waitForTimeout(160);
    return v === '482913' && (await p.locator('#otpState').innerText()).includes('Verified');
  },
  'date-range-picker': async p => {
    await p.locator('.dr-day:not(.mute)').nth(2).click();
    await p.waitForTimeout(120);
    await p.locator('.dr-day:not(.mute)').nth(6).click();
    await p.waitForTimeout(120);
    return await p.locator('#drSum').isVisible()
      && await p.locator('.dr-day.edge').count() === 2
      && (await p.locator('#drNights').innerText()).includes('night');
  },
  'filter-bar': async p => {
    await p.locator('[data-filter=design]').click();
    const design = await p.locator('.fb-item').count();
    const chips = await p.locator('.fb-tag').count();
    await p.locator('.fb-tag button').click();
    return design === 3 && chips === 1 && await p.locator('.fb-item').count() === 8;
  },
  'responsive-nav-drawer': async p => {
    await p.locator('#toggle').click();
    await p.waitForTimeout(500);
    const open = await p.locator('#drawer').evaluate(e => e.classList.contains('open'));
    const scrim = await p.locator('#ndScrim').isVisible();
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    return open && scrim && await p.locator('#drawer').evaluate(e => !e.classList.contains('open'));
  },
  'nested-menu': async p => {
    await p.locator('#parent').click();
    const open = await p.locator('#submenu').isVisible();
    await p.locator('[data-action=Share]').click();
    return open && (await p.locator('#nmResult').innerText()).includes('Share');
  },
  'overflow-tabs': async p => {
    await p.getByRole('tab',{name:'Files'}).click();
    const title = await p.locator('#otTitle').innerText();
    const ink = await p.locator('#otInk').evaluate(e => parseFloat(e.style.width));
    await p.getByRole('tab',{name:'Files'}).press('ArrowRight');
    return title === 'Files' && ink > 0 && (await p.locator('#otTitle').innerText()) === 'Permissions';
  },
  'breadcrumbs': async p => {
    await p.locator('#expand').click();
    const shown = await p.locator('#m1').isVisible();
    await p.locator('#expand').click();
    return shown && await p.locator('#m1').isHidden();
  },
  'table-of-contents': async p => {
    await p.locator('[data-go=summary]').click();
    await p.waitForTimeout(750);
    return await p.locator('#reader').evaluate(e => e.scrollTop) > 0
      && await p.locator('#tocProg').evaluate(e => parseFloat(e.style.width)) > 0;
  },
  'pagination-controls': async p => {
    const numbered = await p.locator('.pg-btn').count() >= 4;
    await p.locator('.pg-btn[aria-label="Next page"]').click();
    return numbered && (await p.locator('#pgInfo').innerText()).includes('5–8')
      && await p.locator('.pg-btn[aria-current=page]').innerText() === '2';
  },
  'collapsible-tree': async p => {
    const before = await p.locator('.tr-row[aria-expanded=true]').count();
    await p.locator('.tr-row[aria-expanded=true]').first().click();
    const collapsed = await p.locator('.tr-row[aria-expanded=false]').count() > 0;
    await p.locator('.tr-row[aria-expanded=false]').first().focus();
    await p.keyboard.press('ArrowRight');
    return before > 0 && collapsed && await p.locator('.tr-row[aria-expanded=true]').count() >= 1;
  },
  'data-table': async p => {
    const first = await p.locator('#dtBody tr:first-child .dt-name').innerText();
    await p.locator('[data-col=name]').click();
    const sorted = await p.locator('#dtBody tr:first-child .dt-name').innerText();
    await p.locator('#dtBody input[type=checkbox]').first().check();
    const bulk = await p.locator('#dtBulk').isVisible();
    await p.locator('[data-col=revenue]').click();
    return first !== sorted && bulk && await p.locator('#dtBody tr.sel').count() === 1;
  },
  'virtual-list': async p => {
    const windowed = await p.locator('.vl-row').count() < 40;
    await p.locator('#viewport').evaluate(e => e.scrollTop = 5000);
    await p.waitForTimeout(280);
    const pos = Number(await p.locator('.vl-row').first().getAttribute('aria-posinset'));
    return windowed && pos > 100 && await p.locator('.vl-row').count() < 40;
  },
  'kanban-lanes': async p => {
    const cards = await p.locator('.kb-card').count();
    const clean = !(await p.locator('.kb').innerText()).includes('undefined');
    await p.locator('[data-add=todo]').click();
    return cards === 6 && clean && await p.locator('.kb-card').count() === 7;
  },
  'activity-timeline': async p => {
    const start = await p.locator('.al-e').count();
    await p.locator('#more').click();
    const loaded = await p.locator('.al-e').count();
    await p.locator('.al-f[data-type=comments]').click();
    return start === 3 && loaded === 6 && await p.locator('.al-e').count() <= 3;
  },
  'schedule-calendar': async p => {
    const label = await p.locator('#month').innerText();
    const first = await p.locator('.cal-day').first().getAttribute('aria-label');
    const monday = new Date(first).getDay() === 1;
    const headers = await p.locator('.cal-week span').count() === 7;
    await p.locator('.cal-day:not(.mute)').nth(4).click();
    await p.waitForTimeout(120);
    await p.locator('.cal-day:not(.mute)').nth(8).click();
    await p.waitForTimeout(120);
    const range = await p.locator('.cal-day.in-range').count() > 0;
    await p.locator('#next').click();
    return monday && headers && range && (await p.locator('#month').innerText()) !== label;
  },
  'comparison-grid': async p => {
    const all = await p.locator('#rows tr').count();
    await p.locator('#differences').check();
    const diff = await p.locator('#rows tr').count();
    return all === 8 && diff === 5 && await p.locator('.cg-yes, .cg-no').count() > 0;
  },
  'status-dashboard': async p => {
    const metrics = await p.locator('.sd-m').count();
    const bars = await p.locator('.sd-bar').count();
    await p.locator('#unavailable').click();
    const outage = await p.locator('.sd-m.outage').count();
    await p.locator('#unavailable').click();
    return metrics === 4 && bars > 10 && outage === 4 && await p.locator('.sd-m.outage').count() === 0;
  },
  'toast-stack': async p => {
    await p.locator('[data-toast=success]').click();
    await p.locator('[data-toast=error]').click();
    await p.waitForTimeout(120);
    return await p.locator('.toast').count() === 2
      && await p.locator('.toast[data-kind=error]').count() === 1
      && await p.locator('.toast .bar').count() === 2;
  },
  'action-confirmation': async p => {
    await p.locator('.ac-item .rm').first().click();
    const dialog = await p.locator('#dialog').isVisible();
    const scrim = await p.locator('#acScrim').isVisible();
    await p.locator('#confirm').click();
    await p.waitForTimeout(420);
    const removed = await p.locator('.ac-item').evaluateAll(e => e.filter(x => x.getBoundingClientRect().height > 0).length) === 2;
    await p.locator('#undo').click();
    await p.waitForTimeout(360);
    return dialog && scrim && removed
      && await p.locator('.ac-item').evaluateAll(e => e.filter(x => x.getBoundingClientRect().height > 0).length) === 3;
  },
  'progress-steps': async p => {
    await p.locator('#next').click();
    const advanced = (await p.locator('.ps-step[data-state=active] .ps-lab').innerText()) === 'Preferences';
    const ticked = await p.locator('.ps-step[data-state=done]').count() === 1;
    await p.locator('#back').click();
    return advanced && ticked && (await p.locator('.ps-step[data-state=active] .ps-lab').innerText()) === 'Details';
  },
  'notification-center': async p => {
    const six = await p.locator('.nc-n').count() === 6;
    const unread = await p.locator('.nc-n.unread').count() === 3;
    await p.locator('.nc-n').first().click();
    const after = await p.locator('#ncBadge').innerText();
    await p.locator('#unread').click();
    const filtered = await p.locator('.nc-n').count() === 2;
    await p.locator('#markAll').click();
    return six && unread && after === '2' && filtered
      && (await p.locator('#notes').innerText()).includes('All caught up')
      && !/1 unread notifications/.test(await p.locator('#status').innerText());
  }
};

for (const item of items) {
  const context = await browser.newContext({viewport:{width:390,height:340}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(`${base}/examples/${item.slug}.html`);
    await page.locator('body[data-ready=true]').waitFor({timeout:10000});
    check(`${item.slug} loads without script errors`, errors.length === 0);
    check(`${item.slug} fits narrow preview`,
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const act = actions[item.slug];
    check(`${item.slug} has a behaviour test`, typeof act === 'function');
    if (act) check(`${item.slug} interaction works`, await act(page));
    await page.waitForTimeout(420);   // let entrance animations settle before measuring
    const axe = await new AxeBuilder({page}).analyze();
    check(`${item.slug} accessibility`, axe.violations.length === 0);
    if (axe.violations.length) console.log(item.slug, 'axe', axe.violations.map(v => v.id));
    check(`${item.slug} has a heading`, await page.locator('h1').count() === 1);
  } catch (e) {
    failures.push(`${item.slug}: ${e.message.slice(0,200)}`);
  } finally {
    await context.close();
  }
}

await browser.close();
console.log(`${checks - failures.length}/${checks} first-party UI checks passed`, failures);
if (failures.length) process.exitCode = 1;
