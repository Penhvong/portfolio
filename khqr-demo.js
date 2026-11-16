// KHQR live demo: builds a real KHQR-format (EMV) payload with a CRC16 checksum, draws the QR,
// counts down 3 minutes, and lets visitors "simulate" the payment success screen.
// DEMO ONLY: the merchant account below is fake, so no bank app can really pay it.
(function(){
  var $=function(id){return document.getElementById(id);};
  var make=$('qrMake');if(!make||!window.makeQR)return;
  var amt=$('qrAmt'),cur=$('qrCur'),out=$('qrOut'),cv=$('qrCanvas'),msg=$('qrMsg'),tim=$('qrTimer'),
      pay=$('qrPay'),neu=$('qrNew'),data=$('qrData'),err=$('qrErr');
  var T=function(s){return window.t?window.t(s):s;};
  var TTL=180, state='idle', left=0, timer=null, shown='', tx='';

  function tlv(id,v){v=String(v);return id+('0'+v.length).slice(-2)+v;}
  function crc16(s){                       // CRC-16/CCITT-FALSE, as KHQR (EMV QR) requires
    var c=0xFFFF;
    for(var i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(var b=0;b<8;b++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}
    return ('000'+c.toString(16).toUpperCase()).slice(-4);
  }
  function payload(amount,currency){
    var now=Date.now(),usd=currency==='USD';
    var p=tlv('00','01')+tlv('01','12')                        // format version, dynamic QR (one-time amount)
      +tlv('29',tlv('00','demo@devb'))                         // FAKE demo merchant account
      +tlv('52','5999')+tlv('53',usd?'840':'116')              // category, currency (840 USD / 116 KHR)
      +tlv('54',usd?amount.toFixed(2):String(Math.round(amount)))
      +tlv('58','KH')+tlv('59','DEMO SHOP')+tlv('60','Phnom Penh')
      +tlv('62',tlv('01','DEMO'+String(now).slice(-6)))        // bill number
      +tlv('99',tlv('00',String(now))+tlv('01',String(now+TTL*1000)))  // created / expires
      +'6304';
    return p+crc16(p);
  }
  function draw(text){
    var q=window.makeQR(text),dpr=Math.min(window.devicePixelRatio||1,2),size=240,quiet=4;
    var px=Math.max(1,Math.floor(size*dpr/(q.n+quiet*2))),total=px*(q.n+quiet*2);
    cv.width=total;cv.height=total;cv.style.width=size+'px';cv.style.height=size+'px';
    var g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,total,total);g.fillStyle='#000';
    for(var r=0;r<q.n;r++)for(var c=0;c<q.n;c++)if(q.dark(r,c))g.fillRect((c+quiet)*px,(r+quiet)*px,px,px);
  }
  function fmt(s){return Math.floor(s/60)+':'+('0'+(s%60)).slice(-2);}
  function render(){
    if(state==='idle'){out.hidden=true;return;}
    out.hidden=false;
    cv.classList.toggle('dim',state!=='wait');
    pay.hidden=state!=='wait';neu.hidden=state==='wait';
    pay.textContent=T('Simulate payment');neu.textContent=T('New payment');
    if(state==='wait'){msg.textContent=T('Waiting for payment')+' · '+shown;tim.textContent=T('Expires in')+' '+fmt(left);}
    else if(state==='paid'){msg.textContent='✅ '+T('Payment successful. Thank you!')+' · '+shown;tim.textContent=T('Transaction')+' '+tx;}
    else{msg.textContent=T('This QR expired. Create a new one.');tim.textContent='';}
  }
  function stop(){clearInterval(timer);timer=null;}
  function start(){
    err.textContent='';
    var a=parseFloat(amt.value);
    if(!(a>0)||a>100000000){err.textContent=T('Enter an amount above 0.');return;}
    var c=cur.value,text=payload(a,c);
    try{draw(text);}catch(e){err.textContent='QR error';return;}
    data.textContent=text;shown=(c==='USD'?'$'+a.toFixed(2):Math.round(a).toLocaleString('en-US')+' ៛');
    state='wait';left=TTL;stop();
    timer=setInterval(function(){left--;if(left<=0){stop();state='expired';}render();},1000);
    render();
  }
  make.addEventListener('click',start);
  amt.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();start();}});
  pay.addEventListener('click',function(){
    stop();state='paid';tx='KH'+String(Date.now()).slice(-8);render();
  });
  neu.addEventListener('click',function(){stop();state='idle';render();amt.focus();});
  document.addEventListener('langchange',render);
})();
