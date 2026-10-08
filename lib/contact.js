// Shared logic: validate a form submission and send it to your Telegram bot.
const INTERESTS=['Web development','Mobile app','KHQR payment integration','SAP Business One integration','Reports and dashboards','Job opportunity','Other'];
const strip=(v,max,keepNewlines)=>String(v==null?'':v)
  .replace(keepNewlines?/[\u0000-\u0009\u000b-\u001f\u007f]/g:/[\u0000-\u001f\u007f]/g,' ')
  .trim().slice(0,max);

async function handle(body,env){
  body=body&&typeof body==='object'?body:{};
  if(body.website) return {status:200,json:{ok:true}};            // honeypot: bots fill this, humans never see it
  const name=strip(body.fullname,80), contact=strip(body.contact,120), message=strip(body.message,1000,true);
  const interest=INTERESTS.includes(body.interest)?body.interest:'Other';
  if(name.length<2||contact.length<3||message.length<5) return {status:400,json:{ok:false,error:'invalid'}};
  if(!env.BOT_TOKEN||!env.CHAT_ID) return {status:500,json:{ok:false,error:'not_configured'}};
  const text='📩 New message from your portfolio\n\n'+
    'Name: '+name+'\nContact: '+contact+'\nInterest: '+interest+'\n\n'+message;
  try{
    const r=await fetch('https://api.telegram.org/bot'+env.BOT_TOKEN+'/sendMessage',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:env.CHAT_ID,text,disable_web_page_preview:true}),
      signal:AbortSignal.timeout(8000)});
    if(!r.ok){
      let detail='';try{detail=(await r.json()).description||'';}catch(e){}
      console.error('Telegram error '+r.status+': '+detail);
      return {status:502,json:{ok:false,error:'telegram',detail}};
    }
    return {status:200,json:{ok:true}};
  }catch(e){console.error('Cannot reach Telegram ('+e.name+'). Check internet, firewall, or VPN.');return {status:502,json:{ok:false,error:'network'}};}
}
module.exports={handle};
