// Read-only production smoke test: does not create submissions.
const site=process.env.LIVE_SITE||'https://motionshelf.onrender.com';
const api=process.env.LIVE_API||'https://motionshelf-api.onrender.com';
const results=[];
async function check(name,fn){try{const ok=await fn();results.push([name,Boolean(ok)])}catch(e){results.push([name,false,e.message])}}
await check('Direct contribution route and refresh',async()=>{const first=await fetch(site+'/contribute'),second=await fetch(site+'/contribute');return first.ok&&second.ok&&(await first.text()).includes('Start with the source')&&(await second.text()).includes('Start with the source')});
await check('Separate assets',async()=>{const urls=['/contribute.css','/contribute.js','/styles.css'];return (await Promise.all(urls.map(u=>fetch(site+u)))).every(x=>x.ok)});
await check('Upload analysis',async()=>{const res=await fetch(api+'/api/analyze/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({files:[{name:'package.json',data:Buffer.from(JSON.stringify({name:'production-smoke',description:'Read-only analysis',license:'MIT'})).toString('base64')}]})});if(!res.ok)return false;const result=await res.json();return result.metadata.name==='production-smoke'&&result.metadata.license===''&&result.notes.some(x=>x.includes('declares MIT'))});
await check('SSRF guard',async()=>{const res=await fetch(api+'/api/analyze/live',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:'https://127.0.0.1'})});return res.status===422});
await check('Catalog intact',async()=>{const res=await fetch(api+'/api/resources');return res.ok&&(await res.json()).length>=7});
for(const [name,ok,detail] of results)console.log(`${ok?'PASS':'FAIL'} ${name}${detail?' · '+detail:''}`);
if(results.some(([,ok])=>!ok))process.exitCode=1;
