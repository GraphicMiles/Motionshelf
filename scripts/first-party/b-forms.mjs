// Tag editor, file drop zone, OTP, date range, validation summary.

export const tagEditor = {
slug: 'tag-editor',
title: 'Tag editor',
tag: 'enter to add',
body: `
<div class="te">
  <div class="te-top">
    <span class="label" style="margin:0">Labels</span>
    <span class="badge" id="teCount">0/6</span>
  </div>
  <div class="te-box" id="teBox">
    <span class="te-chips" id="tags"></span>
    <input id="tag" class="te-input" placeholder="Add a label…" autocomplete="off" aria-describedby="teHelp" aria-label="Add a label">
  </div>
  <p class="hint" id="teHelp">Press <kbd class="kbd">↵</kbd> to add, <kbd class="kbd">⌫</kbd> to edit the last one.</p>
  <div class="te-suggest" id="teSuggest"></div>
  <p id="status" class="hint" role="status" aria-live="polite" style="min-height:15px"></p>
</div>
`,
css: `
.te{display:flex;flex-direction:column;gap:0}
.te-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.te-box{display:flex;flex-wrap:wrap;gap:4px;align-items:center;min-height:38px;padding:5px 7px;
  background:var(--s2);border:1px solid var(--line-2);border-radius:var(--r-sm);cursor:text;
  transition:border-color var(--t-1),box-shadow var(--t-2) var(--ease-out),background var(--t-1)}
.te-box:focus-within{background:var(--s3);border-color:var(--accent-line);box-shadow:0 0 0 3px var(--accent-soft)}
.te-chips{display:contents}
.te-chip{display:inline-flex;align-items:center;gap:3px;height:23px;padding:0 3px 0 8px;
  background:var(--s4);border:1px solid var(--line-2);border-radius:var(--r-full);
  font-size:11px;color:var(--fg-2);white-space:nowrap;
  animation:m-pop var(--t-3) var(--spring) both}
.te-chip[data-new=true]{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.te-chip.leaving{animation:m-collapse var(--t-2) var(--ease-out) forwards}
.te-chip button{display:grid;place-items:center;width:16px;height:16px;border-radius:50%;
  color:var(--fg-4);transition:background var(--t-1),color var(--t-1)}
.te-chip button:hover{background:rgba(251,113,133,.18);color:var(--danger)}
.te-input{flex:1;min-width:74px;height:24px;background:none;border:0;outline:none;font-size:12px;color:var(--fg)}
.te-input::placeholder{color:var(--fg-4)}
.te-suggest{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;min-height:0}
.te-sg{height:22px;padding:0 9px;border-radius:var(--r-full);border:1px dashed var(--line-2);
  font-size:10.5px;color:var(--fg-3);transition:background var(--t-1),color var(--t-1),border-color var(--t-1),transform var(--t-1) var(--spring)}
.te-sg:hover{background:var(--s3);color:var(--fg);border-style:solid;border-color:var(--line-3);transform:translateY(-1px)}
.te-sg::before{content:"+ ";opacity:.6}
`,
js: `
const SUGGEST=['design','review','draft','urgent','client','internal','copy','spec'];
let tags=[
 {name:'design',fresh:false},
 {name:'review',fresh:false}
];
const input=$('#tag'),box=$('#teBox'),wrap=$('#tags'),status=$('#status'),
      count=$('#teCount'),suggest=$('#teSuggest');

function draw(){
  wrap.replaceChildren(...tags.map(t=>{
    const chip=document.createElement('span');
    chip.className='te-chip';chip.dataset.new=String(t.fresh);
    const label=document.createElement('span');label.textContent=t.name;
    const x=document.createElement('button');x.type='button';
    x.setAttribute('aria-label','Remove '+t.name);
    x.innerHTML='<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    x.addEventListener('click',e=>{e.stopPropagation();remove(t.name,chip)});
    chip.append(label,x);return chip;
  }));
  count.textContent=tags.length+'/6';
  const left=SUGGEST.filter(s=>!tags.some(t=>t.name===s)).slice(0,4);
  suggest.replaceChildren(...left.map(s=>{
    const b=document.createElement('button');b.type='button';b.className='te-sg';b.textContent=s;
    b.addEventListener('click',()=>add(s));return b;
  }));
}
function add(raw){
  const name=String(raw||'').trim().toLowerCase().replace(/\\s+/g,'-').slice(0,24);
  if(!name){status.textContent='Type a label first.';return}
  if(tags.some(t=>t.name===name)){
    status.textContent='“'+name+'” is already added.';
    input.value='';bump(box);return}
  if(tags.length>=6){status.textContent='Six labels is the maximum.';bump(box);return}
  tags.push({name,fresh:true});
  input.value='';draw();
  status.textContent='Added “'+name+'”.';
  setTimeout(()=>{tags.forEach(t=>t.fresh=false)},900);
}
function remove(name,chip){
  chip.classList.add('leaving');
  setTimeout(()=>{
    tags=tags.filter(t=>t.name!==name);
    draw();
    status.textContent='Removed “'+name+'”.';
  },170);
}
document.querySelector('#add')?.addEventListener('click',()=>add(input.value));
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();add(input.value)}
  if(e.key==='Backspace'&&!input.value&&tags.length){
    e.preventDefault();
    const last=tags[tags.length-1];
    input.value=last.name;input.select();
    tags.pop();draw();
    status.textContent='Editing “'+last.name+'”.';
  }
});
box.addEventListener('click',()=>input.focus());
draw();
`
};

export const fileDrop = {
slug: 'file-drop-zone',
title: 'File drop zone',
tag: '100 KB max',
body: `
<div class="fd">
  <input id="file" type="file" accept=".txt,.md,text/plain,text/markdown" class="sr-only" aria-label="Choose a text file">
  <div class="fd-zone" id="drop" tabindex="0" role="button" aria-describedby="fdHelp">
    <span class="fd-ring" aria-hidden="true"></span>
    <span class="fd-icon" id="fdIcon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></svg>
    </span>
    <div class="fd-title" id="fdTitle">Drop a .txt or .md file</div>
    <div class="fd-help" id="fdHelp">or <span class="fd-link">browse files</span> · 100 KB max</div>
    <div class="fd-bar" id="fdBar" hidden><span id="fdFill"></span></div>
    <div class="fd-file" id="fdFile" hidden></div>
  </div>
  <div class="fd-foot">
    <button class="btn btn-sm btn-ghost" id="clear" type="button" hidden>Remove file</button>
    <span class="spacer"></span>
    <span class="hint" id="fdSize">0 files</span>
  </div>
  <p id="status" class="hint" role="status" aria-live="polite">Nothing uploaded — this stays on your device.</p>
</div>
`,
css: `
.fd{display:flex;flex-direction:column;gap:0}
.fd-zone{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  min-height:150px;padding:18px 14px;border-radius:var(--r-lg);
  background:
    radial-gradient(120% 90% at 50% 0%,rgba(201,247,90,.045),transparent 62%),
    var(--s2);
  border:1px dashed var(--line-3);cursor:pointer;overflow:hidden;text-align:center;
  transition:border-color var(--t-2) var(--ease-out),background var(--t-2) var(--ease-out),transform var(--t-2) var(--ease-out)}
.fd-zone:hover{border-color:var(--line-3);background:radial-gradient(120% 90% at 50% 0%,rgba(201,247,90,.07),transparent 62%),var(--s3)}
.fd-zone:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.fd-zone.dragging{border-color:var(--accent);border-style:solid;transform:scale(.988);
  background:radial-gradient(120% 90% at 50% 0%,rgba(201,247,90,.12),transparent 62%),var(--s3)}
.fd-zone.done{border-style:solid;border-color:var(--accent-line);background:radial-gradient(120% 90% at 50% 0%,rgba(201,247,90,.08),transparent 62%),var(--s2)}
.fd-ring{position:absolute;width:150px;height:150px;border-radius:50%;border:1px solid var(--accent-line);
  opacity:0;transform:scale(.5);pointer-events:none}
.fd-zone.dragging .fd-ring{animation:m-ring 900ms var(--ease-out) forwards}
@keyframes m-ring{0%{opacity:.7;transform:scale(.5)}100%{opacity:0;transform:scale(1.7)}}
.fd-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:var(--r-md);
  background:var(--s4);color:var(--fg-3);border:1px solid var(--line-2);
  transition:color var(--t-2),background var(--t-2),transform var(--t-3) var(--spring)}
.fd-zone.dragging .fd-icon{color:var(--accent);background:var(--accent-soft);transform:translateY(-3px) scale(1.06)}
.fd-zone.done .fd-icon{color:var(--accent);background:var(--accent-soft);border-color:var(--accent-line)}
.fd-title{font-size:12.5px;font-weight:600;color:var(--fg)}
.fd-help{font-size:10.5px;color:var(--fg-4);line-height:1.4;text-wrap:balance}
@container preview (max-width:330px){.fd-zone{min-height:132px;padding:14px 10px}.fd-title{font-size:11.5px}}
.fd-link{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
.fd-bar{width:100%;height:3px;border-radius:2px;background:var(--s5);overflow:hidden;margin-top:4px}
.fd-bar span{display:block;height:100%;width:0;background:var(--accent);transition:width var(--t-4) var(--ease-out)}
.fd-file{display:flex;align-items:center;gap:7px;width:100%;justify-content:center;
  font-size:11px;color:var(--fg-2);animation:m-rise-sm var(--t-3) var(--ease-out) both}
.fd-file .nm{max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fg);font-weight:550}
.fd-file .sz{color:var(--fg-4);font-variant-numeric:tabular-nums}
.fd-foot{display:flex;align-items:center;gap:8px;margin-top:9px;min-height:26px}
`,
js: `
const input=$('#file'),zone=$('#drop'),status=$('#status'),clearBtn=$('#clear'),
      bar=$('#fdBar'),fillEl=$('#fdFill'),fileBox=$('#fdFile'),title=$('#fdTitle'),
      sizeLbl=$('#fdSize'),help=$('#fdHelp');
let current=null;

const fmt=n=>n<1024?n+' B':(n/1024).toFixed(n<10240?1:0)+' KB';
const ext=name=>name.slice(name.lastIndexOf('.')+1).toLowerCase();

function reject(msg){
  status.textContent=msg;
  input.value='';
  zone.classList.add('anim-shake');
  setTimeout(()=>zone.classList.remove('anim-shake'),420);
  current=null;clearBtn.hidden=true;bar.hidden=true;fileBox.hidden=true;
  zone.classList.remove('done');title.textContent='Drop a .txt or .md file';
  sizeLbl.textContent='0 files';
}
function accept(file){
  current=file;
  zone.classList.remove('dragging');zone.classList.add('done');
  title.textContent='File ready';
  bar.hidden=false;
  requestAnimationFrame(()=>{fillEl.style.width='100%'});
  fileBox.hidden=false;
  fileBox.innerHTML='<span class="nm">'+file.name.replace(/</g,'&lt;')+'</span><span class="sz">'+fmt(file.size)+'</span>';
  clearBtn.hidden=false;
  sizeLbl.textContent='1 file · '+fmt(file.size);
  status.textContent=file.name+' is ready. Nothing left your device.';
}
function inspect(file){
  if(!file)return;
  if(!['txt','md'].includes(ext(file.name))){reject('“'+file.name+'” is not a .txt or .md file.');return}
  if(file.size>100*1024){reject('That file is '+fmt(file.size)+' — the limit is 100 KB.');return}
  if(file.size===0){reject('That file is empty.');return}
  bar.hidden=false;fillEl.style.width='0';
  accept(file);
}
input.addEventListener('change',()=>inspect(input.files[0]));
zone.addEventListener('click',()=>input.click());
zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
let depth=0;
zone.addEventListener('dragenter',e=>{e.preventDefault();depth++;zone.classList.add('dragging')});
zone.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'});
zone.addEventListener('dragleave',e=>{e.preventDefault();if(--depth<=0){depth=0;zone.classList.remove('dragging')}});
zone.addEventListener('drop',e=>{
  e.preventDefault();depth=0;zone.classList.remove('dragging');
  inspect(e.dataTransfer.files[0]);
});
zone.addEventListener('dragend',()=>{depth=0;zone.classList.remove('dragging')});
clearBtn.addEventListener('click',()=>{
  current=null;input.value='';clearBtn.hidden=true;
  zone.classList.remove('done');
  bar.hidden=true;fillEl.style.width='0';fileBox.hidden=true;
  title.textContent='Drop a .txt or .md file';
  sizeLbl.textContent='0 files';
  status.textContent='File removed.';zone.focus();
});
`
};

export const otp = {
slug: 'otp-code-input',
title: 'Verification code',
tag: '6 digits',
body: `
<div class="otp">
  <div class="otp-head">
    <span class="label" style="margin:0" id="otpLabel">Enter the 6-digit code</span>
    <span class="otp-timer" id="otpTimer"><span class="dot dot-warn"></span><span id="otpTime">0:42</span></span>
  </div>
  <div class="otp-slots" id="slots" role="group" aria-labelledby="otpLabel">
    <input class="otp-slot" inputmode="numeric" autocomplete="one-time-code" maxlength="1" aria-label="Digit 1">
    <input class="otp-slot" inputmode="numeric" maxlength="1" aria-label="Digit 2">
    <input class="otp-slot" inputmode="numeric" maxlength="1" aria-label="Digit 3">
    <span class="otp-gap" aria-hidden="true"></span>
    <input class="otp-slot" inputmode="numeric" maxlength="1" aria-label="Digit 4">
    <input class="otp-slot" inputmode="numeric" maxlength="1" aria-label="Digit 5">
    <input class="otp-slot" inputmode="numeric" maxlength="1" aria-label="Digit 6">
  </div>
  <div class="otp-state" id="otpState" aria-live="polite" role="status">0 of 6 digits entered</div>
  <div class="otp-foot">
    <button class="btn btn-sm btn-ghost" id="otpResend" type="button">Resend code</button>
    <span class="spacer"></span>
    <button class="btn btn-sm btn-primary" id="otpVerify" type="button" disabled>Verify</button>
  </div>
</div>
`,
css: `
.otp{display:flex;flex-direction:column;gap:0}
.otp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;gap:8px}
.otp-timer{display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--fg-3);font-variant-numeric:tabular-nums}
.otp-slots{display:flex;align-items:center;gap:5px}
.otp-gap{width:9px}
.otp-slot{width:100%;min-width:0;height:46px;padding:0;text-align:center;
  background:var(--s2);border:1px solid var(--line-2);border-radius:var(--r-sm);
  font-family:var(--mono);font-size:17px;font-weight:600;color:var(--fg);
  caret-color:var(--accent);
  transition:border-color var(--t-1) var(--ease-out),background var(--t-1),box-shadow var(--t-2) var(--ease-out),
             transform var(--t-2) var(--spring),color var(--t-2)}
.otp-slot:hover{border-color:var(--line-3)}
.otp-slot:focus{outline:none;background:var(--s3);border-color:var(--accent-line);
  box-shadow:0 0 0 3px var(--accent-soft);transform:translateY(-1px)}
.otp-slot.filled{background:var(--s3);border-color:var(--line-3);color:var(--fg)}
.otp-slot.pop{animation:m-pop-tight 260ms var(--spring)}
.otp-slots[data-state=ok] .otp-slot{border-color:var(--accent-line);background:var(--accent-soft);color:var(--accent)}
.otp-slots[data-state=err] .otp-slot{border-color:rgba(251,113,133,.5);background:rgba(251,113,133,.08);color:#ffb3be;
  animation:m-shake 380ms var(--ease-in-out)}
.otp-state{min-height:16px;margin-top:8px;font-size:11px;color:var(--fg-3);transition:color var(--t-2)}
.otp-state.ok{color:var(--accent);font-weight:600}
.otp-state.err{color:var(--danger)}
.otp-foot{display:flex;align-items:center;gap:8px;margin-top:11px;padding-top:11px;border-top:1px solid var(--line)}
`,
js: `
const slots=$$('.otp-slot'),state=$('#otpState'),verify=$('#otpVerify'),
      resend=$('#otpResend'),timeEl=$('#otpTime'),wrap=$('#slots');
let seconds=42,timer=null,locked=false;

const value=()=>slots.map(s=>s.value).join('');

function paint(){
  slots.forEach(s=>s.classList.toggle('filled',!!s.value));
  const v=value(),n=v.length;
  verify.disabled=n!==6;
  if(locked)return;
  wrap.dataset.state='';
  state.className='otp-state';
  state.textContent=n===6?'Code complete — press Verify.':n+' of 6 digits entered';
}
function focusAt(i){
  const s=slots[Math.max(0,Math.min(slots.length-1,i))];
  if(s){s.focus();s.select()}
}
slots.forEach((slot,i)=>{
  slot.addEventListener('input',e=>{
    const digits=(slot.value.match(/\\d/g)||[]).join('');
    if(digits.length>1){ // paste or fast typing landed in one slot
      digits.split('').forEach((d,k)=>{if(slots[i+k]){slots[i+k].value=d;slots[i+k].classList.add('pop');
        setTimeout(()=>slots[i+k].classList.remove('pop'),280)}});
      focusAt(i+digits.length);paint();return;
    }
    slot.value=digits.slice(0,1);
    if(slot.value){slot.classList.add('pop');setTimeout(()=>slot.classList.remove('pop'),260);
      if(i<slots.length-1)focusAt(i+1)}
    paint();
  });
  slot.addEventListener('keydown',e=>{
    if(e.key==='Backspace'){
      if(slot.value){slot.value='';paint();e.preventDefault();return}
      if(i>0){e.preventDefault();slots[i-1].value='';focusAt(i-1);paint()}
    }
    if(e.key==='ArrowLeft'){e.preventDefault();focusAt(i-1)}
    if(e.key==='ArrowRight'){e.preventDefault();focusAt(i+1)}
    if(e.key==='Enter'&&value().length===6){e.preventDefault();verify.click()}
  });
  slot.addEventListener('paste',e=>{
    e.preventDefault();
    const text=(e.clipboardData.getData('text')||'').replace(/\\D/g,'').slice(0,6);
    if(!text)return;
    text.split('').forEach((d,k)=>{if(slots[i+k]){slots[i+k].value=d;slots[i+k].classList.add('pop');
      setTimeout(()=>slots[i+k].classList.remove('pop'),280)}});
    focusAt(i+text.length);paint();
  });
  slot.addEventListener('focus',()=>slot.select());
});
verify.addEventListener('click',()=>{
  const v=value();
  if(v.length!==6)return;
  locked=true;
  wrap.dataset.state='ok';
  state.className='otp-state ok';
  state.textContent='Verified. Signing you in…';
  verify.textContent='Verified ✓';
  verify.disabled=true;
  slots.forEach((s,i)=>setTimeout(()=>s.classList.add('pop'),i*45));
});
resend.addEventListener('click',()=>{
  locked=false;
  slots.forEach(s=>s.value='');
  wrap.dataset.state='';
  state.className='otp-state';
  verify.disabled=true;verify.textContent='Verify';
  seconds=42;tick();paint();focusAt(0);
  state.textContent='New code sent. 0 of 6 digits entered';
});
function tick(){
  const m=Math.floor(seconds/60),s=String(seconds%60).padStart(2,'0');
  timeEl.textContent=m+':'+s;
  if(seconds<=0){clearInterval(timer);timeEl.textContent='expired';return}
  seconds--;
}
tick();timer=setInterval(tick,1000);
paint();focusAt(0);
`
};

export const validator = {
slug: 'validation-summary',
title: 'Validation summary',
tag: 'inline errors',
body: `
<form id="form" class="vs" novalidate>
  <div class="vs-head">
    <span class="vs-count" id="vsCount">3 fields need attention</span>
    <span class="vs-pill" id="vsPill">0 of 3 valid</span>
  </div>
  <div class="vs-box" id="errors" tabindex="-1" role="alert" hidden>
    <div class="vs-box-h">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>
      <strong id="vsTitle">Please fix these fields</strong>
    </div>
    <ol id="vsList"></ol>
  </div>
  <label class="label" for="name">Full name</label>
  <input class="input" id="name" required autocomplete="name" placeholder="Amina Okafor">
  <p class="vs-err" id="nameErr" hidden></p>
  <label class="label" for="email" style="margin-top:9px">Email</label>
  <input class="input" id="email" type="email" required autocomplete="email" placeholder="you@studio.com">
  <p class="vs-err" id="emailErr" hidden></p>
  <label class="label" for="handle" style="margin-top:9px">Handle</label>
  <div class="vs-prefix"><span>@</span><input class="input" id="handle" required pattern="[a-z0-9_]{3,15}" placeholder="amina_design"></div>
  <p class="vs-err" id="handleErr" hidden></p>
  <button class="btn btn-primary" type="submit" style="width:100%;margin-top:13px">Create account</button>
  <p id="status" class="hint" role="status" aria-live="polite" style="margin-top:8px;min-height:15px"></p>
</form>
`,
css: `
.vs{display:flex;flex-direction:column;--err:var(--danger)}
.vs-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;gap:8px}
.vs-count{font-size:10.5px;color:var(--fg-4)}
.vs-pill{font-size:10px;padding:3px 8px;border-radius:var(--r-full);background:var(--s3);color:var(--fg-3);
  border:1px solid var(--line-2);font-variant-numeric:tabular-nums;font-weight:600;
  transition:background var(--t-3) var(--ease-out),color var(--t-3),border-color var(--t-3)}
.vs-pill.partial{background:rgba(245,196,81,.12);border-color:rgba(245,196,81,.3);color:var(--warn)}
.vs-pill.done{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
.vs-box{background:rgba(251,113,133,.075);border:1px solid rgba(251,113,133,.28);
  border-radius:var(--r-md);padding:10px 11px;margin-bottom:11px;
  animation:m-rise-sm var(--t-3) var(--ease-out) both}
.vs-box-h{display:flex;align-items:center;gap:6px;color:#ffb3be;margin-bottom:7px}
.vs-box-h strong{font-size:11.5px;font-weight:650}
#vsList{display:grid;gap:1px;counter-reset:v}
#vsList li{counter-increment:v}
#vsList a{display:flex;align-items:flex-start;gap:7px;padding:4px 5px;border-radius:var(--r-xs);
  font-size:11px;color:#ffc4cc;line-height:1.45;text-align:left;width:100%;
  transition:background var(--t-1),color var(--t-1)}
#vsList a::before{content:counter(v);flex:none;display:grid;place-items:center;width:14px;height:14px;
  border-radius:50%;background:rgba(251,113,133,.24);font-size:8.5px;font-weight:700;color:#ffb3be;margin-top:1px}
#vsList a:hover{background:rgba(251,113,133,.12);color:#ffe0e4}
.vs-err{font-size:10.5px;color:var(--danger);margin-top:4px;display:flex;align-items:center;gap:4px;
  animation:m-rise-sm var(--t-2) var(--ease-out) both}
.vs-prefix{position:relative;display:flex;align-items:center}
.vs-prefix span{position:absolute;left:10px;color:var(--fg-4);font-size:12px;pointer-events:none}
.vs-prefix .input{padding-left:24px}
.field-ok{position:relative}
.input[data-ok=true]{border-color:rgba(92,224,160,.4)}
`,
js: `
const form=$('#form'),box=$('#errors'),list=$('#vsList'),status=$('#status'),
      pill=$('#vsPill'),count=$('#vsCount'),title=$('#vsTitle');
const FIELDS=[
 {id:'name',label:'Full name',test:v=>v.trim()?null:'Enter your full name'},
 {id:'email',label:'Email',test:v=>!v.trim()?'Enter your email':/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v.trim())?null:'Use a valid email like you@studio.com'},
 {id:'handle',label:'Handle',test:v=>!v.trim()?'Pick a handle':/^[a-z0-9_]{3,15}$/.test(v.trim())?null:'3–15 characters, lowercase letters, numbers or _'}
];
function validate(show){
  const problems=[];
  for(const f of FIELDS){
    const el=document.getElementById(f.id);
    const msg=f.test(el.value);
    const err=document.getElementById(f.id+'Err');
    el.setAttribute('aria-invalid',String(!!msg&&show));
    el.dataset.ok=String(!msg&&el.value.trim()!=='');
    if(err){err.hidden=!msg||!show;if(msg&&show)err.textContent=msg}
    if(msg)problems.push({...f,msg,el});
  }
  const valid=FIELDS.length-problems.length;
  pill.textContent=valid+' of 3 valid';
  pill.className='vs-pill'+(valid===3?' done':valid?' partial':'');
  return {problems,valid};
}
function render(problems,valid){
  if(!problems.length){
    box.hidden=true;
    count.textContent='All fields valid';
    return;
  }
  title.textContent='Please fix '+problems.length+' field'+(problems.length===1?'':'s');
  count.textContent=problems.length+' field'+(problems.length===1?'':'s')+' need attention';
  list.replaceChildren(...problems.map(p=>{
    const li=document.createElement('li');
    const a=document.createElement('a');a.href='#'+p.id;
    a.textContent=p.label+': '+p.msg;
    a.addEventListener('click',e=>{e.preventDefault();p.el.focus();p.el.scrollIntoView({block:'nearest'})});
    li.append(a);return li;
  }));
  box.hidden=false;
  box.classList.remove('anim-shake');void box.offsetWidth;box.classList.add('anim-shake');
}
form.addEventListener('submit',e=>{
  e.preventDefault();
  const {problems,valid}=validate(true);
  if(problems.length){render(problems,valid);box.focus();status.textContent='Fix the highlighted fields.';return}
  box.hidden=true;
  status.textContent='Account created. Welcome aboard.';
  pill.className='vs-pill done';
});
FIELDS.forEach(f=>{
  const el=document.getElementById(f.id);
  el.addEventListener('input',()=>{
    const {problems,valid}=validate(false);
    if(!box.hidden&&problems.length)render(problems,valid);
    if(!problems.length){box.hidden=true;count.textContent='All fields valid'}
  });
  el.addEventListener('blur',()=>{
    const msg=f.test(el.value);
    const err=document.getElementById(f.id+'Err');
    el.setAttribute('aria-invalid',String(!!msg));
    if(err){err.hidden=!msg;if(msg)err.textContent=msg}
  });
});
validate(false);
`
};

export const dateRange = {
slug: 'date-range-picker',
title: 'Date range',
tag: 'range select',
body: `
<div class="dr">
  <div class="dr-trigger" id="drTrigger">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
    <span id="drFrom">Start date</span>
    <span class="dr-arrow">→</span>
    <span id="drTo">End date</span>
    <button class="dr-x" id="drClear" type="button" aria-label="Clear range" hidden>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="dr-cal" id="drCal">
    <div class="dr-head">
      <button class="btn btn-icon btn-ghost" id="drPrev" type="button" aria-label="Previous month">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="dr-month" id="drMonth" aria-live="polite"></div>
      <button class="btn btn-icon btn-ghost" id="drNext" type="button" aria-label="Next month">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
    <div class="dr-week" aria-hidden="true"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
    <div class="dr-grid" id="drGrid" role="group" aria-label="Choose a date range"></div>
  </div>
  <div class="dr-sum" id="drSum" hidden>
    <span class="dot dot-ok" aria-hidden="true"></span>
    <span id="drSumText"></span>
    <span class="spacer"></span>
    <span class="badge" id="drNights"></span>
  </div>
  <p id="status" class="hint" role="status" aria-live="polite">Pick a start date, then an end date.</p>
</div>
`,
css: `
.dr{display:flex;flex-direction:column;gap:0}
.dr-trigger{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;margin-bottom:9px;
  background:var(--s2);border:1px solid var(--line-2);border-radius:var(--r-sm);
  font-size:11.5px;color:var(--fg-3);transition:border-color var(--t-2) var(--ease-out)}
.dr-trigger.filled{border-color:var(--accent-line);background:var(--accent-soft)}
.dr-trigger.filled #drFrom,.dr-trigger.filled #drTo{color:var(--accent);font-weight:600}
.dr-arrow{color:var(--fg-4);font-size:10px}
.dr-x{display:grid;place-items:center;width:17px;height:17px;margin-left:auto;border-radius:50%;
  background:rgba(201,247,90,.16);color:var(--accent);transition:background var(--t-1)}
.dr-x:hover{background:rgba(251,113,133,.22);color:var(--danger)}
.dr-cal{background:var(--s2);border:1px solid var(--line);border-radius:var(--r-md);padding:9px}
.dr-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
.dr-month{font-size:12px;font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.dr-head .btn-icon{min-height:24px;width:24px;border-radius:var(--r-xs)}
.dr-week{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:3px}
.dr-week span{text-align:center;font-size:9px;font-weight:700;color:var(--fg-4);letter-spacing:.05em;height:14px;line-height:14px}
.dr-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;position:relative}
.dr-day{position:relative;height:27px;display:grid;place-items:center;border-radius:var(--r-xs);
  font-size:11px;color:var(--fg-2);font-variant-numeric:tabular-nums;
  transition:background var(--t-1) var(--ease-out),color var(--t-1) var(--ease-out),transform var(--t-1) var(--spring)}
.dr-day:hover{background:var(--s4);color:var(--fg);transform:scale(1.06)}
.dr-day.mute{color:var(--fg-3);pointer-events:none}
.dr-day.today{font-weight:700;color:var(--fg)}
.dr-day.today::after{content:"";position:absolute;bottom:3px;width:3px;height:3px;border-radius:50%;background:var(--accent)}
.dr-day.in-range{background:var(--accent-soft);border-radius:0;color:var(--fg)}
.dr-day.edge{background:var(--accent);color:var(--accent-ink);font-weight:700;border-radius:var(--r-xs);z-index:1}
.dr-day.edge:hover{background:#d9ff7e}
.dr-day.preview{background:rgba(201,247,90,.07);border-radius:0}
.dr-sum{display:flex;align-items:center;gap:7px;margin-top:9px;padding:7px 10px;border-radius:var(--r-sm);
  background:var(--accent-soft);border:1px solid var(--accent-line);font-size:11px;color:var(--fg);
  animation:m-rise-sm var(--t-3) var(--ease-out) both}
.dr-sum .badge{background:rgba(201,247,90,.18);color:var(--accent);font-weight:700}
@keyframes dr-slide-r{from{opacity:0;transform:translateX(9px)}to{opacity:1;transform:none}}
@keyframes dr-slide-l{from{opacity:0;transform:translateX(-9px)}to{opacity:1;transform:none}}
.dr-grid.slide-r{animation:dr-slide-r var(--t-2) var(--ease-out)}
.dr-grid.slide-l{animation:dr-slide-l var(--t-2) var(--ease-out)}
`,
js: `
const grid=$('#drGrid'),monthEl=$('#drMonth'),fromEl=$('#drFrom'),toEl=$('#drTo'),
      sumBox=$('#drSum'),sumText=$('#drSumText'),nights=$('#drNights'),
      status=$('#status'),trigger=$('#drTrigger'),clearBtn=$('#drClear');
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const today=new Date();today.setHours(0,0,0,0);
let view=new Date(today.getFullYear(),today.getMonth(),1);
let start=null,end=null,hover=null;

const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
const same=(a,b)=>a&&b&&key(a)===key(b);
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const fmt=d=>d.toLocaleDateString('en',{month:'short',day:'numeric'});

function paint(dir){
  monthEl.textContent=MONTHS[view.getMonth()]+' '+view.getFullYear();
  const first=new Date(view.getFullYear(),view.getMonth(),1);
  // Monday-first offset: getDay() is 0=Sun
  const offset=(first.getDay()+6)%7;
  const days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const prevDays=new Date(view.getFullYear(),view.getMonth(),0).getDate();
  const cells=[];
  for(let i=offset-1;i>=0;i--)cells.push({d:new Date(view.getFullYear(),view.getMonth()-1,prevDays-i),mute:true});
  for(let n=1;n<=days;n++)cells.push({d:new Date(view.getFullYear(),view.getMonth(),n),mute:false});
  while(cells.length%7)cells.push({d:addDays(cells[cells.length-1].d,1),mute:true});

  const lo=start&&end?(start<end?start:end):start;
  const hi=start&&end?(start<end?end:start):(start&&hover&&hover>start?hover:null);
  grid.replaceChildren(...cells.map(({d,mute})=>{
    const b=document.createElement('button');
    b.type='button';b.className='dr-day';
    if(mute)b.classList.add('mute');
    b.textContent=String(d.getDate());
    b.setAttribute('aria-label',d.toDateString());
    const isEdge=(!mute&&same(d,start))||(!mute&&same(d,end));
    const inRange=!mute&&lo&&hi&&d>lo&&d<hi;
    if(mute)b.tabIndex=-1;
    if(same(d,today))b.classList.add('today');
    if(isEdge)b.classList.add('edge');
    else if(inRange)b.classList.add('in-range');
    if(isEdge)b.setAttribute('aria-current','date');
    if(!mute){
      b.addEventListener('click',()=>pick(d));
      b.addEventListener('mouseenter',()=>{if(start&&!end){hover=d;bandOnly()}});
    }
    return b;
  }));
  grid.classList.remove('slide-r','slide-l');
  if(dir){void grid.offsetWidth;grid.classList.add(dir>0?'slide-r':'slide-l')}
}
function bandOnly(){
  const lo=start,hi=hover&&hover>start?hover:null;
  $$('.dr-day',grid).forEach(b=>{
    const t=b.getAttribute('aria-label');
    if(!t||b.classList.contains('mute'))return;
    const d=new Date(t);
    b.classList.toggle('preview',!!lo&&!!hi&&d>lo&&d<hi&&!b.classList.contains('edge'));
  });
}
function pick(d){
  if(!start||(start&&end)){
    start=d;end=null;hover=null;
    status.textContent='Start '+fmt(d)+'. Now pick an end date.';
  }else{
    if(d<start){end=start;start=d}else end=d;
    hover=null;
    const lo=start,hi=end;
    const n=Math.round((hi-lo)/86400000);
    fromEl.textContent=fmt(lo);toEl.textContent=fmt(hi);
    clearBtn.hidden=false;trigger.classList.add('filled');
    sumBox.hidden=false;
    sumText.textContent=fmt(lo)+' → '+fmt(hi);
    nights.textContent=(n||0)+' night'+(n===1?'':'s');
    status.textContent=n+' night'+(n===1?'':'s')+' selected.';
  }
  paint();
}
$('#drPrev').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);paint(-1)});
$('#drNext').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);paint(1)});
clearBtn.addEventListener('click',e=>{
  e.stopPropagation();
  start=end=hover=null;
  fromEl.textContent='Start date';toEl.textContent='End date';
  trigger.classList.remove('filled');clearBtn.hidden=true;sumBox.hidden=true;
  status.textContent='Range cleared. Pick a start date.';
  paint();
});
grid.addEventListener('mouseleave',()=>{if(start&&!end){hover=null;
  $$('.dr-day.preview',grid).forEach(b=>b.classList.remove('preview'))}});
paint();
`
};

export default [tagEditor, fileDrop, otp, validator, dateRange];
