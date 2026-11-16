// Local message storage in a file. No account, no install, no internet.
//  - Node 22.5 or newer: SQLite database  -> data/site.db
//  - Older Node:         plain JSON file  -> data/messages.json
// Both give the same 4 functions: add, list, setStatus, remove.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const DIR=process.env.DATA_DIR||path.join(__dirname,'..','data');
fs.mkdirSync(DIR,{recursive:true});

let store;
try{
  const {DatabaseSync}=require('node:sqlite');
  const db=new DatabaseSync(path.join(DIR,'site.db'));
  db.exec(`CREATE TABLE IF NOT EXISTS messages(
    id TEXT PRIMARY KEY, created_at TEXT NOT NULL, name TEXT NOT NULL, contact TEXT NOT NULL,
    interest TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','done')))`);
  store={
    kind:'SQLite (data/site.db)',
    add(r){db.prepare('INSERT INTO messages(id,created_at,name,contact,interest,message) VALUES(?,?,?,?,?,?)')
      .run(crypto.randomUUID(),new Date().toISOString(),r.name,r.contact,r.interest||'Other',r.message);},
    list(st){return (st==='new'||st==='done'
      ?db.prepare('SELECT * FROM messages WHERE status=? ORDER BY created_at DESC LIMIT 500').all(st)
      :db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 500').all()).map(x=>({...x}));},
    setStatus(id,st){db.prepare('UPDATE messages SET status=? WHERE id=?').run(st,id);},
    remove(id){db.prepare('DELETE FROM messages WHERE id=?').run(id);}
  };
}catch(e){
  const file=path.join(DIR,'messages.json');
  const read=()=>{try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(x){return [];}};
  const write=a=>{fs.writeFileSync(file+'.tmp',JSON.stringify(a,null,1));fs.renameSync(file+'.tmp',file);};
  store={
    kind:'JSON file (data/messages.json)',
    add(r){const a=read();a.push({id:crypto.randomUUID(),created_at:new Date().toISOString(),name:r.name,contact:r.contact,interest:r.interest||'Other',message:r.message,status:'new'});write(a);},
    list(st){return read().filter(m=>st!=='new'&&st!=='done'||m.status===st).sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,500);},
    setStatus(id,st){const a=read();a.forEach(m=>{if(m.id===id)m.status=st;});write(a);},
    remove(id){write(read().filter(m=>m.id!==id));}
  };
}
module.exports=store;
