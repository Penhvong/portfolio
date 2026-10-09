// Local server: serves the website and receives the form at POST /api/contact.
// Run:  node server.js   then open http://localhost:3000
const http=require('http'),fs=require('fs'),path=require('path');
const {handle}=require('./lib/contact');

// Load .env (BOT_TOKEN, CHAT_ID, PORT) without extra packages
try{fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/).forEach(l=>{
  const m=l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');
});}catch(e){}
if(!process.env.BOT_TOKEN||!process.env.CHAT_ID)console.warn('! Missing BOT_TOKEN or CHAT_ID. Copy .env.example to .env and fill it in.');

const PORT=+process.env.PORT||3000, HOST=process.env.HOST||'127.0.0.1';
// Only these files are public (festival.js was missing here, so the festival menu never loaded locally)
const PUBLIC=['index.html','style.css','script.js','i18n.js','form.js','festival.js','calendar.js','photo.jpg'];
const FILES={'/':'index.html'};PUBLIC.forEach(f=>{FILES['/'+f]=f;});
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const hits=new Map(); // simple rate limit: 5 messages per 10 minutes per IP
function limited(ip){
  const now=Date.now(),a=(hits.get(ip)||[]).filter(t=>now-t<600000);a.push(now);hits.set(ip,a);
  if(hits.size>500)for(const [k,v] of hits)if(!v.some(t=>now-t<600000))hits.delete(k); // keep the map small
  return a.length>5;
}
function send(res,status,json){res.writeHead(status,{'Content-Type':'application/json','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(JSON.stringify(json));}

http.createServer((req,res)=>{
  const url=req.url.split('?')[0];
  if(req.method==='POST'&&url==='/api/contact'){
    let raw='';
    req.on('data',c=>{raw+=c;if(raw.length>10000){send(res,413,{ok:false});req.destroy();}});
    req.on('end',async()=>{
      if(limited(req.socket.remoteAddress))return send(res,429,{ok:false,error:'rate_limit'});
      let body;try{body=JSON.parse(raw);}catch(e){return send(res,400,{ok:false});}
      const out=await handle(body,process.env);send(res,out.status,out.json);
    });
    return;
  }
  const file=req.method==='GET'&&FILES[url];
  if(!file){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(__dirname,file),(err,data)=>{
    if(err){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Cache-Control':'no-cache'});res.end(data);
  });
}).listen(PORT,HOST,()=>console.log('Site running at http://localhost:'+PORT));
