
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


const metrics=$('#sdMetrics'),spark=$('#sdSpark'),status=$('#status'),ts=$('#sdTs');
let sample=0,outage=false;
const HISTORY=Array.from({length:22},(_,i)=>38+Math.round(Math.sin(i*.7)*9+Math.random()*7));

function drawBars(){
  const max=Math.max(...HISTORY,1);
  spark.replaceChildren(...HISTORY.map(v=>{
    const b=document.createElement('div');
    const h=Math.max(3,Math.round(v/max*34));
    b.className='sd-bar'+(v>max*.82?' hi':v>max*.55?' mid':'');
    b.style.height=h+'px';
    return b;
  }));
}
function draw(){
  const rows=[
    {k:'Requests',v:outage?'—':(12480+sample*137).toLocaleString('en-US'),trend:outage?null:'+4.2%',up:true,dot:'dot-ok'},
    {k:'Latency',v:outage?'—':(38+sample*2)+' ms',trend:outage?null:'−6 ms',up:true,dot:'dot-ok'},
    {k:'Error rate',v:outage?'—':'0.'+(2+sample%4)+'%',trend:outage?null:'stable',up:null,dot:'dot-warn'},
    {k:'Service',v:outage?'Unavailable':'Operational',trend:null,dot:outage?'dot-danger':'dot-ok'}
  ];
  metrics.replaceChildren(...rows.map(r=>{
    const d=document.createElement('div');
    d.className='sd-m'+(outage?' outage':'');
    d.innerHTML='<span class="sd-lbl">'+r.k+'</span>'+
      '<span class="sd-val">'+r.v+'</span>'+
      (r.trend?'<span class="sd-trend '+(r.up===true?'up':r.up===false?'down':'')+'">'+r.trend+'</span>':'')+
      '<span class="sd-dot '+r.dot+'"></span>';
    return d;
  }));
  ts.textContent=outage?'outage detected · '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    :'updated '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  status.textContent=outage?'Metrics unavailable — last values are not shown as current.'
    :'Metrics updated from sample '+(sample+1)+'.';
}
$('#refresh').addEventListener('click',()=>{
  sample++;outage=false;
  HISTORY.push(38+Math.round(Math.random()*16));HISTORY.shift();
  draw();drawBars();
});
$('#unavailable').addEventListener('click',()=>{
  outage=!outage;
  $('#unavailable').textContent=outage?'Restore service':'Simulate outage';
  draw();
});
draw();drawBars();

document.body.dataset.ready="true";
