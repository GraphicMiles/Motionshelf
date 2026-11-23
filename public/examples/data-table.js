
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


const ROWS=[
 {id:1,name:'Floor Lamp',cat:'Lighting',rev:73174,delta:12.8},
 {id:2,name:'Linen Shirt',cat:'Apparel',rev:72504,delta:5.2},
 {id:3,name:'Bamboo Shelf',cat:'Furniture',rev:67176,delta:23.4},
 {id:4,name:'Studio Headphones',cat:'Audio',rev:66463,delta:15.0},
 {id:5,name:'Soy Candle',cat:'Home',rev:66377,delta:-4.5},
 {id:6,name:'Leather Wallet',cat:'Accessories',rev:64015,delta:11.8},
 {id:7,name:'Linen Throw',cat:'Textiles',rev:63979,delta:-2.3},
 {id:8,name:'Camp Blanket',cat:'Textiles',rev:63418,delta:58.0},
 {id:9,name:'Travel Mug',cat:'Kitchen',rev:62942,delta:14.5},
 {id:10,name:'Noise Speaker',cat:'Audio',rev:58428,delta:-1.2},
 {id:11,name:'Pocket Notebook',cat:'Stationery',rev:58255,delta:43.7},
 {id:12,name:'Desk Mat',cat:'Stationery',rev:56815,delta:4.3}
];
const body=$('#dtBody'),scroll=$('#dtScroll'),query=$('#dtQuery'),all=$('#dtAll'),
      bulk=$('#dtBulk'),bulkText=$('#dtBulkText'),status=$('#status'),count=$('#dtCount');
let sort={col:'revenue',dir:'desc'};
let selected=new Set();
let q='';

const money=n=>'$'+n.toLocaleString('en-US');
const arrow=up=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'+
  (up?'<path d="M12 19V5M5 12l7-7 7 7"/>':'<path d="M12 5v14M19 12l-7 7-7-7"/>')+'</svg>';

function rows(){
  let out=ROWS.slice();
  if(q)out=out.filter(r=>(r.name+' '+r.cat).toLowerCase().includes(q));
  out.sort((a,b)=>{
    const k=sort.col;
    const av=k==='name'?a.name.toLowerCase():a[k];
    const bv=k==='name'?b.name.toLowerCase():b[k];
    if(av<bv)return sort.dir==='asc'?-1:1;
    if(av>bv)return sort.dir==='asc'?1:-1;
    return 0;
  });
  return out;
}
function draw(){
  const list=rows();
  body.replaceChildren(...list.map(r=>{
    const tr=document.createElement('tr');
    tr.className=selected.has(r.id)?'sel':'';
    tr.innerHTML='<td class="dt-check"><input type="checkbox" aria-label="Select '+r.name+'"'+(selected.has(r.id)?' checked':'')+'></td>'+
      '<td class="dt-name">'+r.name+'<small>'+r.cat+'</small></td>'+
      '<td class="dt-r dt-num">'+money(r.rev)+'</td>'+
      '<td class="dt-r"><span class="dt-delta '+(r.delta>=0?'up':'down')+'">'+arrow(r.delta>=0)+Math.abs(r.delta).toFixed(1)+'%</span></td>';
    tr.querySelector('input').addEventListener('change',e=>{
      if(e.target.checked)selected.add(r.id);else selected.delete(r.id);
      tr.classList.toggle('sel',e.target.checked);
      syncSelect();
    });
    return tr;
  }));
  if(!list.length)body.innerHTML='<tr><td colspan="4" class="dt-empty">No products match that search.</td></tr>';
  syncSelect();
}
function syncSelect(){
  const list=rows();
  const n=selected.size;
  count.textContent=n+' selected';
  count.classList.toggle('on',n>0);
  const allOn=list.length>0&&list.every(r=>selected.has(r.id));
  const someOn=list.some(r=>selected.has(r.id));
  all.checked=allOn;
  all.indeterminate=!allOn&&someOn;
  bulk.hidden=n===0;
  bulkText.textContent=n+' row'+(n===1?'':'s')+' selected';
}
$$('.dt-sort').forEach(b=>b.addEventListener('click',()=>{
  const col=b.dataset.col;
  if(sort.col===col)sort.dir=sort.dir==='asc'?'desc':'asc';
  else sort={col,dir:col==='name'?'asc':'desc'};
  $$('.dt-sort').forEach(x=>{x.classList.toggle('dt-on',x===b);x.classList.toggle('asc',x===b&&sort.dir==='asc')});
  draw();
  status.textContent='Sorted by '+col+' '+sort.dir+'ending';
}));
all.addEventListener('change',()=>{
  const list=rows();
  if(all.checked)list.forEach(r=>selected.add(r.id));
  else list.forEach(r=>selected.delete(r.id));
  draw();
  status.textContent=all.checked?list.length+' rows selected':'Selection cleared';
});
query.addEventListener('input',()=>{q=query.value.trim().toLowerCase();draw()});
$('#dtDelete').addEventListener('click',()=>{
  const n=selected.size;
  ROWS.forEach((r,i)=>{if(selected.has(r.id))ROWS.splice(i,1)});
  selected.clear();draw();
  status.textContent=n+' rows deleted';
});
$('#dtExport').addEventListener('click',()=>{status.textContent=selected.size+' rows exported as CSV'});
draw();

document.body.dataset.ready="true";
