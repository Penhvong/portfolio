// Local server: serves the website and receives the form at POST /api/contact.
// Run:  node server.js   then open http://localhost:3000
const http=require('http'),fs=require('fs'),path=require('path');
const {handle}=require('./lib/contact');
const visit=require('./lib/visit');
const crypto=require('crypto');
const store=require('./lib/db');

// Load .env (BOT_TOKEN, CHAT_ID, PORT) without extra packages
try{fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/).forEach(l=>{
  const m=l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');
});}catch(e){}
if(!process.env.BOT_TOKEN||!process.env.CHAT_ID)console.warn('! Telegram not set (BOT_TOKEN / CHAT_ID). Messages are still saved in the local database.');

// Admin login: set ADMIN_EMAIL and ADMIN_PASSWORD in .env. If missing, create them now and show them once.
if(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD){
  const email=process.env.ADMIN_EMAIL||'admin@localhost',pw=process.env.ADMIN_PASSWORD||crypto.randomBytes(9).toString('base64url');
  try{fs.appendFileSync(path.join(__dirname,'.env'),'\nADMIN_EMAIL='+email+'\nADMIN_PASSWORD='+pw+'\n');}catch(e){}
  process.env.ADMIN_EMAIL=email;process.env.ADMIN_PASSWORD=pw;
  console.log('\n  Admin login created (saved in .env):\n    email:    '+email+'\n    password: '+pw+'\n');
}
console.log('Messages are saved in: '+store.kind);
const sessions=new Map();   // session id -> expiry time
const same=(a,b)=>{const x=crypto.createHash('sha256').update(String(a)).digest(),y=crypto.createHash('sha256').update(String(b)).digest();return crypto.timingSafeEqual(x,y);};
const sidOf=req=>((req.headers.cookie||'').match(/(?:^|;\s*)sid=([a-f0-9]{64})/)||[])[1];
const authed=req=>{const s=sidOf(req),t=s&&sessions.get(s);if(t&&t>Date.now())return true;if(s)sessions.delete(s);return false;};

const PORT=+process.env.PORT||3000, HOST=process.env.HOST||'127.0.0.1';
// Only these files are public (festival.js was missing here, so the festival menu never loaded locally)
const PUBLIC=['index.html','style.css','script.js','i18n.js','cv.js','cv-en.pdf','cv-km.pdf','cv-zh.pdf','form.js','festival.js','calendar.js','projects.js','admin.html','admin.js','visit.js','qr.js','khqr-demo.js','dashboard.js','testimonials.js','sound.js','cmd.js','workbench.js','hotspots.js','hud.js','topology.js','cli.js','confetti.js','shortcuts.js','skills-radar.js','mobile-sim.js','switch-matrix.js','photo.jpg','hero-workspace.jpg','photo-work.jpg'];
const FILES={'/':'index.html'};PUBLIC.forEach(f=>{FILES['/'+f]=f;});
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.pdf':'application/pdf','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
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
      const out=await handle(body,process.env,store);send(res,out.status,out.json);
    });
    return;
  }
  if(req.method==='POST'&&url==='/api/visit'){
    let raw='';req.on('data',c=>{raw+=c;if(raw.length>2000)req.destroy();});
    req.on('end',async()=>{let b={};try{b=JSON.parse(raw);}catch(e){}
      if(!limited('v'+req.socket.remoteAddress))await visit.handle(b,process.env);send(res,200,{ok:true});});
    return;
  }
  if(url.startsWith('/api/admin/')){
    if(req.headers['x-requested-with']!=='admin')return send(res,403,{ok:false});          // blocks cross-site requests
    let raw='';req.on('data',c=>{raw+=c;if(raw.length>5000)req.destroy();});
    req.on('end',()=>{
      let b={};try{b=raw?JSON.parse(raw):{};}catch(e){}
      if(url==='/api/admin/login'&&req.method==='POST'){
        if(limited('login'+req.socket.remoteAddress))return send(res,429,{ok:false,error:'rate_limit'});
        if(!(same(b.email||'',process.env.ADMIN_EMAIL)&same(b.password||'',process.env.ADMIN_PASSWORD)))return send(res,401,{ok:false});
        const sid=crypto.randomBytes(32).toString('hex');sessions.set(sid,Date.now()+12*3600*1000);
        res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store','Set-Cookie':'sid='+sid+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200'});
        return res.end(JSON.stringify({ok:true,email:process.env.ADMIN_EMAIL}));
      }
      if(url==='/api/admin/logout'){sessions.delete(sidOf(req));res.writeHead(200,{'Set-Cookie':'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});return res.end('{}');}
      if(!authed(req))return send(res,401,{ok:false});
      try{
        if(url==='/api/admin/me')return send(res,200,{ok:true,email:process.env.ADMIN_EMAIL});
        if(url==='/api/admin/messages'&&req.method==='POST')return send(res,200,{ok:true,rows:store.list(b.status)});
        if(url==='/api/admin/status'&&req.method==='POST'){if(b.status==='new'||b.status==='done')store.setStatus(String(b.id),b.status);return send(res,200,{ok:true});}
        if(url==='/api/admin/delete'&&req.method==='POST'){store.remove(String(b.id));return send(res,200,{ok:true});}
      }catch(e){return send(res,500,{ok:false});}
      send(res,404,{ok:false});
    });
    return;
  }
  const isHead=req.method==='HEAD';
  const file=(req.method==='GET'||isHead)&&FILES[url];
  if(!file){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(__dirname,file),(err,data)=>{
    if(err){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Cache-Control':'no-cache'});
    res.end(isHead?null:data);
  });
}).listen(PORT,HOST,()=>console.log('Site running at http://localhost:'+PORT));
