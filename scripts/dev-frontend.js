import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('public');const api='http://127.0.0.1:'+(process.env.API_PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname.startsWith('/api/')){const chunks=[];for await(const chunk of req)chunks.push(chunk);try{const response=await fetch(api+pathname,{method:req.method,headers:{'Content-Type':req.headers['content-type']||'application/json'},body:chunks.length?Buffer.concat(chunks):undefined});res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/json'});return res.end(Buffer.from(await response.arrayBuffer()))}catch{return res.writeHead(502).end('API unavailable')}}
 if(pathname==='/config.js'){res.writeHead(200,{'Content-Type':mime['.js']});return res.end('window.MOTIONSHELF_API_BASE = "";window.MOTIONSHELF_TURNSTILE_SITE_KEY = "";')}
 if(req.method!=='GET'&&req.method!=='HEAD')return res.writeHead(405).end();
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream',...(pathname.startsWith('/examples/assets/fa/')?{'Access-Control-Allow-Origin':'*'}:{})});res.end(req.method==='HEAD'?undefined:data)}catch{res.writeHead(404).end('Not found')}
}).listen(process.env.FRONTEND_PORT||3001,'0.0.0.0',()=>console.log('MotionShelf frontend listening on '+(process.env.FRONTEND_PORT||3001)));
