// Sends you a short Telegram note when someone opens the site (no IP address is stored or sent).
const strip=(v,max)=>String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
async function handle(body,env,meta){
  body=body&&typeof body==='object'?body:{};
  if(!env.BOT_TOKEN||!env.CHAT_ID) return {status:204,json:{ok:true}};
  const text='👀 Someone opened your portfolio\n\n'+
    'Language: '+strip(body.lang,10)+'\nFrom: '+strip(body.ref||'direct',120)+
    '\nScreen: '+strip(body.screen,20)+(meta&&meta.country?'\nCountry: '+strip(meta.country,40):'');
  try{
    await fetch('https://api.telegram.org/bot'+env.BOT_TOKEN+'/sendMessage',{method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:env.CHAT_ID,text,disable_web_page_preview:true,disable_notification:true}),
      signal:AbortSignal.timeout(8000)});
  }catch(e){}
  return {status:200,json:{ok:true}};
}
module.exports={handle};
