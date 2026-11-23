
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


const FEATURES=[
 {name:'Projects',basic:'3',plus:'Unlimited',diff:true},
 {name:'Team members',basic:'5',plus:'20',diff:true},
 {name:'Version history',basic:'7 days',plus:'Unlimited',diff:true},
 {name:'Export CSV',basic:true,plus:true,diff:false},
 {name:'Priority support',basic:false,plus:true,diff:true},
 {name:'Custom domains',basic:false,plus:true,diff:true},
 {name:'SSO',basic:false,plus:false,diff:false},
 {name:'API access',basic:true,plus:true,diff:false}
];
const rows=$('#rows'),toggle=$('#differences'),status=$('#status');
const ICON_OK='<span class="cg-yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';
const ICON_NO='<span class="cg-no"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span>';
const cell=v=>v===true?ICON_OK:v===false?ICON_NO:String(v);
function draw(){
  const list=toggle.checked?FEATURES.filter(f=>f.diff):FEATURES;
  rows.replaceChildren(...list.map((f,i)=>{
    const tr=document.createElement('tr');
    tr.className=f.diff?'cg-diff':'';
    tr.style.animation='m-fade var(--t-2) var(--ease-out) both';
    tr.style.animationDelay=(i*18)+'ms';
    tr.innerHTML='<td class="cg-feat">'+f.name+'</td><td>'+cell(f.basic)+'</td><td class="cg-plus">'+cell(f.plus)+'</td>';
    return tr;
  }));
  status.textContent=list.length+' of '+FEATURES.length+' features shown'+
    (toggle.checked?' · differences only':'');
}
toggle.addEventListener('change',draw);
draw();

document.body.dataset.ready="true";
