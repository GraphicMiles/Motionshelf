
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


const NAMES=['Details','Preferences','Review'];
const stepsEl=$('#steps'),panel=$('#psPanel'),status=$('#status'),
      back=$('#back'),next=$('#next');
const state={name:'',tier:'Studio',email:false,digest:true};
let step=0,dir=1;

stepsEl.innerHTML=NAMES.map((n,i)=>
  '<li class="ps-step" data-state="todo"><span class="ps-bub"><span>'+(i+1)+'</span>'+
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'+
  '<span class="ps-lab">'+n+'</span><span class="ps-line"><span></span></span></li>').join('');

function panelFor(i){
  if(i===0)return '<div class="ps-f"><label class="label" for="psName">Project name</label>'+
    '<input class="input" id="psName" value="'+state.name+'" placeholder="Atlas"></div>'+
    '<div class="ps-f"><label class="label" for="psTier">Plan</label>'+
    '<select class="input" id="psTier">'+['Starter','Studio','Scale'].map(t=>'<option'+(t===state.tier?' selected':'')+'>'+t+'</option>').join('')+'</select></div>';
  if(i===1)return '<label class="ps-check'+(state.email?' on':'')+'" id="cEmail"><input type="checkbox" '+(state.email?'checked':'')+'> Email me release notes</label>'+
    '<label class="ps-check'+(state.digest?' on':'')+'" id="cDigest" style="margin-top:6px"><input type="checkbox" '+(state.digest?'checked':'')+'> Weekly digest</label>';
  return '<div class="ps-review">'+
    [['Project',state.name||'Atlas'],['Plan',state.tier],['Email notes',state.email?'Yes':'No'],['Digest',state.digest?'Yes':'No']]
      .map(([k,v],idx)=>'<div class="ps-row" style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:10.5px">'+
        '<span style="color:var(--fg-4);width:78px;flex:none;text-transform:uppercase;letter-spacing:.06em;font-size:9px">'+k+'</span>'+
        '<span style="color:var(--fg)">'+v+'</span></div>').join('')+'</div>';
}
function paint(){
  $$('.ps-step').forEach((li,i)=>{
    li.dataset.state=i<step?'done':i===step?'active':'todo';
    const line=li.querySelector('.ps-line span');
    if(line)line.style.width=i<step?'100%':'0';
  });
  back.disabled=step===0;
  next.textContent=step===2?'Create project':'Continue';
  panel.innerHTML=panelFor(step);
  panel.style.animation='none';void panel.offsetWidth;panel.style.animation='';
  if(step===0){$('#psName').addEventListener('input',e=>state.name=e.target.value);
    $('#psTier').addEventListener('change',e=>state.tier=e.target.value)}
  if(step===1){
    $('#cEmail').addEventListener('change',e=>{state.email=e.target.checked;
      e.target.closest('.ps-check').classList.toggle('on',e.target.checked)});
    $('#cDigest').addEventListener('change',e=>{state.digest=e.target.checked;
      e.target.closest('.ps-check').classList.toggle('on',e.target.checked)});
  }
  status.textContent='Step '+(step+1)+' of 3: '+NAMES[step];
}
next.addEventListener('click',()=>{
  if(step===2){
    status.textContent='Project '+(state.name||'Atlas')+' created on the '+state.tier+' plan.';
    next.textContent='Created ✓';next.disabled=true;
    setTimeout(()=>{step=0;state.name='';next.disabled=false;paint()},1400);
    return;
  }
  step++;paint();
});
back.addEventListener('click',()=>{if(step>0){step--;paint()}});
paint();

document.body.dataset.ready="true";
