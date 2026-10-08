// Used only when the site is hosted on Netlify (set BOT_TOKEN and CHAT_ID in Site settings > Environment variables).
const {handle}=require('../../lib/contact');
exports.handler=async(event)=>{
  if(event.httpMethod!=='POST')return {statusCode:405,body:''};
  let body;try{body=JSON.parse(event.body||'{}');}catch(e){return {statusCode:400,body:'{"ok":false}'};}
  const out=await handle(body,process.env);
  return {statusCode:out.status,headers:{'Content-Type':'application/json'},body:JSON.stringify(out.json)};
};
