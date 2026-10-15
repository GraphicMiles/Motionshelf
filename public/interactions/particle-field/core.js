export function mount(root,initial={}){
 let options={radius:110,strength:28,...initial},pointer=null,frame=0,active=true;
 root.innerHTML='<div class="pf-shell"><canvas aria-hidden="true"></canvas><div class="pf-copy"><span>INTERACTIVE SURFACE / 04</span><strong>Follow the current.</strong><p>Move across the field to leave a trace.</p></div><span class="pf-coordinate" aria-hidden="true">X — / Y —</span></div>';
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),shell=root.firstElementChild,coord=root.querySelector('.pf-coordinate');let points=[],width=0,height=0,scale=1;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function resize(){const rect=shell.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);scale=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);ctx.setTransform(scale,0,0,scale,0,0);points=[];const gap=25;for(let y=12;y<height;y+=gap)for(let x=12;x<width;x+=gap)points.push({x,y});queue()}
 function draw(){frame=0;ctx.clearRect(0,0,width,height);const radius=Math.max(40,Math.min(200,Number(options.radius)||110)),strength=Math.max(6,Math.min(55,Number(options.strength)||28));for(const p of points){let x=p.x,y=p.y,alpha=.34;if(pointer&&!reduced()){const dx=x-pointer.x,dy=y-pointer.y,dist=Math.hypot(dx,dy);if(dist<radius){const force=(1-dist/radius)**2;const unit=dist||1;x+=dx/unit*strength*force;y+=dy/unit*strength*force;alpha=Math.min(1,.34+force*.75)}}ctx.beginPath();ctx.arc(x,y,1.35,0,Math.PI*2);ctx.fillStyle=`rgba(226,226,217,${alpha})`;ctx.fill()}}
 function queue(){if(!frame&&active)frame=requestAnimationFrame(draw)}
 function move(e){const b=shell.getBoundingClientRect();pointer={x:e.clientX-b.left,y:e.clientY-b.top};coord.textContent=`X ${Math.round(pointer.x)} / Y ${Math.round(pointer.y)}`;queue()}
 function leave(){pointer=null;coord.textContent='X — / Y —';queue()}
 const observer=new ResizeObserver(resize);observer.observe(shell);shell.addEventListener('pointermove',move);shell.addEventListener('pointerleave',leave);resize();
 return{update(next){options={...options,...next};queue()},replay(){pointer={x:width/2,y:height/2};queue();setTimeout(()=>{pointer=null;queue()},700)},destroy(){active=false;observer.disconnect();shell.removeEventListener('pointermove',move);shell.removeEventListener('pointerleave',leave);cancelAnimationFrame(frame);root.replaceChildren()}};
}
