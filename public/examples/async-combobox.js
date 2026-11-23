
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


const CITIES=[
 ['Lagos','NG','Africa/Lagos','11.8M'],['London','GB','Europe/London','8.9M'],['Lisbon','PT','Europe/Lisbon','545K'],
 ['Lima','PE','America/Lima','9.7M'],['Nairobi','KE','Africa/Nairobi','4.4M'],['New York','US','America/New_York','8.3M'],
 ['Oslo','NO','Europe/Oslo','709K'],['Paris','FR','Europe/Paris','2.1M'],['Tokyo','JP','Asia/Tokyo','13.9M'],
 ['Toronto','CA','America/Toronto','2.9M'],['Berlin','DE','Europe/Berlin','3.6M'],['Madrid','ES','Europe/Madrid','3.3M'],
 ['Rome','IT','Europe/Rome','2.8M'],['Vienna','AT','Europe/Vienna','1.9M'],['Zurich','CH','Europe/Zurich','436K'],
 ['Amsterdam','NL','Europe/Amsterdam','872K'],['Brussels','BE','Europe/Brussels','1.2M'],['Stockholm','SE','Europe/Stockholm','975K'],
 ['Copenhagen','DK','Europe/Copenhagen','644K'],['Helsinki','FI','Europe/Helsinki','656K'],['Dublin','IE','Europe/Dublin','555K'],
 ['Prague','CZ','Europe/Prague','1.3M'],['Warsaw','PL','Europe/Warsaw','1.8M'],['Athens','GR','Europe/Athens','664K'],
 ['Istanbul','TR','Europe/Istanbul','15.5M'],['Dubai','AE','Asia/Dubai','3.5M'],['Mumbai','IN','Asia/Kolkata','20.4M'],
 ['Delhi','IN','Asia/Kolkata','32.9M'],['Singapore','SG','Asia/Singapore','5.9M'],['Seoul','KR','Asia/Seoul','9.7M'],
 ['Shanghai','CN','Asia/Shanghai','24.9M'],['Bangkok','TH','Asia/Bangkok','10.7M'],['Jakarta','ID','Asia/Jakarta','10.6M'],
 ['Sydney','AU','Australia/Sydney','5.3M'],['Melbourne','AU','Australia/Melbourne','5.2M'],['Auckland','NZ','Pacific/Auckland','1.7M'],
 ['Cairo','EG','Africa/Cairo','21.3M'],['Accra','GH','Africa/Accra','2.6M'],['Johannesburg','ZA','Africa/Johannesburg','5.8M'],
 ['São Paulo','BR','America/Sao_Paulo','22.4M'],['Mexico City','MX','America/Mexico_City','9.2M'],['Buenos Aires','AR','America/Argentina/Buenos_Aires','15.4M']
];
const svg=(p,s=12)=>'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const TICK='<span class="tick">'+svg('<path d="M20 6 9 17l-5-5"/>')+'</span>';
const input=$('#city'),pop=$('#cbPop'),list=$('#cbList'),glide=$('#cbGlide'),empty=$('#cbEmpty'),
      spin=$('#cbSpin'),clearBtn=$('#cbClear'),status=$('#status'),
      selBox=$('#cbSelected'),selText=$('#cbSelText'),selTz=$('#cbSelTz');
let timer,ticket=0,active=0,options=[],selected=null,open=false;

function openPop(){pop.hidden=false;open=true;input.setAttribute('aria-expanded','true')}
function closePop(){pop.hidden=true;open=false;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');glide.style.opacity='0'}
function paint(instant){
  options.forEach((o,i)=>o.setAttribute('aria-selected',String(i===active)));
  const o=options[active];if(!o)return;
  input.setAttribute('aria-activedescendant',o.id);
  const lb=list.getBoundingClientRect(),r=o.getBoundingClientRect();
  if(instant)glide.style.transition='none';
  glide.style.opacity='1';
  glide.style.transform='translate('+(r.left-lb.left)+'px,'+(r.top-lb.top+list.scrollTop)+'px)';
  glide.style.width=r.width+'px';glide.style.height=r.height+'px';
  if(instant){void glide.offsetWidth;glide.style.transition=''}
  o.scrollIntoView({block:'nearest'});
}
function draw(rows,q){
  list.querySelectorAll('.cb-opt').forEach(n=>n.remove());
  options=[];
  if(!rows.length){empty.hidden=false;glide.style.opacity='0';return}
  empty.hidden=true;
  for(const [name,cc,tz,pop] of rows){
    const b=document.createElement('button');
    b.type='button';b.className='cb-opt';b.id='cb-'+name.replace(/\W/g,'').toLowerCase();
    b.setAttribute('role','option');b.setAttribute('aria-selected','false');
    b.setAttribute('aria-checked',String(selected&&selected[0]===name));
    let nm=name;
    const i=name.toLowerCase().indexOf(q);
    if(i>=0)nm=name.slice(0,i)+'<b>'+name.slice(i,i+q.length)+'</b>'+name.slice(i+q.length);
    b.innerHTML='<span class="nm">'+nm+'</span><span class="co">'+cc+' · '+pop+'</span>'+TICK;
    b.addEventListener('mousemove',()=>{const k=options.indexOf(b);if(k>=0&&k!==active){active=k;paint()}});
    b.addEventListener('click',()=>choose([name,cc,tz,pop]));
    list.append(b);options.push(b);
  }
  active=0;paint(true);
}
function choose(city){
  selected=city;
  input.value=city[0];
  selBox.hidden=false;selText.textContent=city[0]+' · '+city[1];selTz.textContent=city[2];
  clearBtn.hidden=false;
  closePop();
  status.textContent=city[0]+' selected. Timezone '+city[2]+'.';
  spin.hidden=true;
}
input.addEventListener('input',()=>{
  clearTimeout(timer);
  const q=input.value.trim().toLowerCase();
  const my=++ticket;
  if(q!==(selected?selected[0].toLowerCase():'')){clearBtn.hidden=!q;selBox.hidden=true}
  if(q.length<2){
    closePop();spin.hidden=true;
    status.textContent=q?'Type one more letter.':'Type two letters to search 40 cities.';
    return;
  }
  spin.hidden=false;status.textContent='Searching…';
  timer=setTimeout(()=>{
    if(my!==ticket)return;               // stale response guard
    const rows=CITIES.filter(c=>c[0].toLowerCase().includes(q)||c[1].toLowerCase().startsWith(q)).slice(0,7);
    spin.hidden=true;
    draw(rows,q);
    openPop();
    status.textContent=rows.length?rows.length+' of 40 cities shown.':'No city matches '+q+'.';
  },260);
});
input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePop();return}
  if(!options.length)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;paint()}
  if(e.key==='Enter'&&options[active]){e.preventDefault();options[active].click()}
  if(e.key==='Tab')closePop();
});
clearBtn.addEventListener('click',()=>{
  input.value='';selected=null;clearBtn.hidden=true;selBox.hidden=true;closePop();
  status.textContent='Selection cleared.';input.focus();
});
input.addEventListener('focus',()=>{if(input.value.trim().length>=2&&!open){const q=input.value.trim().toLowerCase();
  draw(CITIES.filter(c=>c[0].toLowerCase().includes(q)).slice(0,7),q);openPop()}});
document.addEventListener('click',e=>{if(!e.target.closest('.cb-anchor')&&open)closePop()});

document.body.dataset.ready="true";
