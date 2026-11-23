
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const raf=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));
const bump=(el,cls='anim-shake')=>{el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)};
const glider=(el,fn)=>{ // move a shared indicator to a target, in one frame
  const t=fn(); if(!t||!el) return;
  el.style.transform='translate('+t.x+'px,'+t.y+'px)';
  el.style.width=t.w+'px'; el.style.height=t.h+'px';
};


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
    const digits=(slot.value.match(/\d/g)||[]).join('');
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
    const text=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);
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

document.body.dataset.ready="true";
