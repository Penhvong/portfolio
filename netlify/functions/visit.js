const {handle}=require('../../lib/visit');
exports.handler=async(event)=>{
  if(event.httpMethod!=='POST')return {statusCode:405,body:''};
  let body;try{body=JSON.parse(event.body||'{}');}catch(e){return {statusCode:400,body:''};}
  let country='';try{country=JSON.parse(Buffer.from(event.headers['x-nf-geo']||'','base64').toString()).country.name||'';}catch(e){}
  const out=await handle(body,process.env,{country});
  return {statusCode:out.status,headers:{'Content-Type':'application/json'},body:JSON.stringify(out.json)};
};
