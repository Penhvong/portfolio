// Shared logic: validate a form submission and send it to your Telegram bot.
const INTERESTS=['Web development','Mobile app','KHQR payment integration','SAP Business One integration','Reports and dashboards','Job opportunity','Other'];
const strip=(v,max,keepNewlines)=>String(v==null?'':v)
  .replace(keepNewlines?/[\u0000-\u0009\u000b-\u001f\u007f]/g:/[\u0000-\u001f\u007f]/g,' ')
  .trim().slice(0,max);

// Optional auto-reply email through Resend (https://resend.com). Skipped unless RESEND_API_KEY and MAIL_FROM are set,
// and only when the visitor typed a real-looking email address. The email body is fixed text (nothing the visitor wrote
// except their first name), so the form cannot be used to send spam.
async function autoReply(name,contact,env){
  if(!env.RESEND_API_KEY||!env.MAIL_FROM||!/^[^@\s<>,;]+@[^@\s<>,;]+\.[^@\s<>,;]+$/.test(contact))return;
  const first=name.split(' ')[0].replace(/[<>]/g,'');
  try{await fetch('https://api.resend.com/emails',{method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.RESEND_API_KEY},
    body:JSON.stringify({from:env.MAIL_FROM,to:[contact],subject:'Thanks for your message',
      text:'Hi '+first+',\n\nThanks for contacting me. I received your message and will reply within 24 hours.\n\nChanpenhvong YOEURNG'}),
    signal:AbortSignal.timeout(8000)});}catch(e){console.error('Auto-reply failed:',e.name);}
}

async function handle(body,env,store){
  body=body&&typeof body==='object'?body:{};
  if(body.website) return {status:200,json:{ok:true}};            // honeypot: bots fill this, humans never see it
  const name=strip(body.fullname,80), contact=strip(body.contact,120), message=strip(body.message,1000,true);
  const interest=INTERESTS.includes(body.interest)?body.interest:'Other';
  if(name.length<2||contact.length<3||message.length<5) return {status:400,json:{ok:false,error:'invalid'}};
  const hasTg=!!(env.BOT_TOKEN&&env.CHAT_ID), hasDb=!!store;
  if(!hasTg&&!hasDb) return {status:500,json:{ok:false,error:'not_configured'}};
  let saved=false;
  if(hasDb){try{store.add({name,contact,interest,message});saved=true;}catch(e){console.error('Cannot save message:',e.message);}}
  let sent=false,fail={status:502,json:{ok:false,error:'network'}};
  if(hasTg){
    const text='📩 New message from your portfolio\n\n'+
      'Name: '+name+'\nContact: '+contact+'\nInterest: '+interest+'\n\n'+message;
    try{
      const r=await fetch('https://api.telegram.org/bot'+env.BOT_TOKEN+'/sendMessage',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:env.CHAT_ID,text,disable_web_page_preview:true}),
        signal:AbortSignal.timeout(8000)});
      if(r.ok)sent=true;
      else{
        let detail='';try{detail=(await r.json()).description||'';}catch(e){}
        console.error('Telegram error '+r.status+': '+detail);
        fail={status:502,json:{ok:false,error:'telegram',detail}};
      }
    }catch(e){console.error('Cannot reach Telegram ('+e.name+'). Check internet, firewall, or VPN.');}
  }
  if(!sent&&!saved)return fail;          // reached you by neither route
  await autoReply(name,contact,env);     // optional: only runs when RESEND_API_KEY is set
  return {status:200,json:{ok:true}};
}
module.exports={handle};
