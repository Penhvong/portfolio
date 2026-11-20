// KHQR live demo: builds a real KHQR-format (EMV) payload with a CRC16 checksum, draws the QR,
// counts down 3 minutes, and lets visitors "simulate" the payment success screen.
// DEMO ONLY: the merchant account below is fake, so no bank app can really pay it.
(function(){
  var $=function(id){return document.getElementById(id);};
  var make=$('qrMake');if(!make||!window.makeQR)return;
  var amt=$('qrAmt'),cur=$('qrCur'),out=$('qrOut'),cv=$('qrCanvas'),msg=$('qrMsg'),tim=$('qrTimer'),
      pay=$('qrPay'),neu=$('qrNew'),data=$('qrData'),err=$('qrErr'),
      tagList=$('emvTagList'),emvDetails=$('emvDecoderDetails'),
      posClearBtn=$('posClearCart'),receiptItemsEl=$('receiptItems'),
      receiptWrap=$('posReceiptWrap'),rUsd=$('rTotalUsd'),rKhr=$('rTotalKhr'),
      rRef=$('rTxnRef'),rPrice=$('rItemPrice'),rCopy=$('rCopyBtn'),rPrint=$('rPrintBtn');
  var T=function(s){return window.t?window.t(s):s;};
  var TTL=180, state='idle', left=0, timer=null, shown='', tx='', curAmount=1, curCurrency='USD';
  var currentCart = [];

  var EMV_NAMES = {
    '00': 'Payload Format Indicator (01 = EMVCo Standard)',
    '01': 'Point of Initiation (12 = Dynamic Dynamic QR)',
    '29': 'Merchant Account Information (NBC Bakong Switch Node)',
    '52': 'Merchant Category Code (5999 = Retail Supermarket POS)',
    '53': 'Transaction Currency (840 = USD / 116 = KHR)',
    '54': 'Transaction Amount (Strict ISO 4217 Decimal Format)',
    '58': 'Country Code (KH = Kingdom of Cambodia)',
    '59': 'Merchant Name (CHIPMONG RETAIL)',
    '60': 'Merchant City (Phnom Penh Capital City)',
    '62': 'Additional Data Template (Bill Number & Terminal Lane)',
    '99': 'Switch Expiry Template (Issue / Expiry Timestamps)',
    '63': 'CRC-16/CCITT-FALSE Checksum (Polynomial 0x1021)'
  };

  function parseTlv(raw){
    var items = [];
    var i = 0;
    while(i + 4 <= raw.length){
      var id = raw.slice(i, i + 2);
      var len = parseInt(raw.slice(i + 2, i + 4), 10);
      if(isNaN(len) || i + 4 + len > raw.length){
        break;
      }
      var val = raw.slice(i + 4, i + 4 + len);
      items.push({
        tag: id,
        len: len,
        val: val,
        desc: EMV_NAMES[id] || ('Custom Tag ' + id)
      });
      i += 4 + len;
    }
    return items;
  }

  function renderEmv(raw){
    if(!tagList) return;
    var tags = parseTlv(raw);
    var html = '';
    tags.forEach(function(t){
      html += '<div class="emv-tag-row">' +
        '<span class="emv-tag-id">[' + t.tag + ']</span>' +
        '<span class="emv-tag-len">L:' + ('0' + t.len).slice(-2) + '</span>' +
        '<code class="emv-tag-val">' + t.val + '</code>' +
        '<span class="emv-tag-desc">' + t.desc + '</span>' +
      '</div>';
    });
    tagList.innerHTML = html;
  }

  function tlv(id,v){v=String(v);return id+('0'+v.length).slice(-2)+v;}
  function crc16(s){                       // CRC-16/CCITT-FALSE, as KHQR (EMV QR) requires
    var c=0xFFFF;
    for(var i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(var b=0;b<8;b++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}
    return ('000'+c.toString(16).toUpperCase()).slice(-4);
  }
  function payload(amount,currency){
    curAmount=amount;curCurrency=currency;
    var now=Date.now(),usd=currency==='USD';
    var p=tlv('00','01')+tlv('01','12')                        // format version, dynamic QR (one-time amount)
      +tlv('29',tlv('00','demo@devb'))                         // FAKE demo merchant account
      +tlv('52','5999')+tlv('53',usd?'840':'116')              // category, currency (840 USD / 116 KHR)
      +tlv('54',usd?amount.toFixed(2):String(Math.round(amount)))
      +tlv('58','KH')+tlv('59','CHIPMONG RETAIL')+tlv('60','Phnom Penh')
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
    if(state==='idle'){out.hidden=true;if(receiptWrap)receiptWrap.hidden=true;return;}
    out.hidden=false;
    cv.classList.toggle('dim',state!=='wait');
    pay.hidden=state!=='wait';neu.hidden=state==='wait';
    pay.textContent=T('Simulate payment');neu.textContent=T('New payment');
    if(state==='wait'){
      msg.textContent=T('Waiting for payment')+' · '+shown;
      tim.textContent=T('Expires in')+' '+fmt(left);
      if(receiptWrap)receiptWrap.hidden=true;
    }
    else if(state==='paid'){
      msg.textContent='✅ '+T('Payment successful. Thank you!')+' · '+shown;
      tim.textContent=T('Transaction')+' '+tx;
      if(receiptWrap){
        var usdStr, khrStr;
        if(curCurrency==='USD'){
          usdStr='$'+curAmount.toFixed(2);
          khrStr=Math.round(curAmount*4100).toLocaleString('en-US')+' ៛';
        }else{
          usdStr='$'+(curAmount/4100).toFixed(2);
          khrStr=Math.round(curAmount).toLocaleString('en-US')+' ៛';
        }
        if(rUsd)rUsd.textContent=usdStr;
        if(rKhr)rKhr.textContent=khrStr;
        if(rPrice)rPrice.textContent=shown;
        if(rRef)rRef.textContent=tx;
        if(receiptItemsEl){
          if(currentCart.length > 0){
            var itemCounts = {};
            currentCart.forEach(function(it){
              if(!itemCounts[it.name]) itemCounts[it.name] = { count: 0, price: it.price };
              itemCounts[it.name].count++;
            });
            var itemsHtml = '';
            Object.keys(itemCounts).forEach(function(k){
              var obj = itemCounts[k];
              var lineTot = (obj.count * obj.price).toFixed(2);
              itemsHtml += '<div class="r-item"><span>' + obj.count + 'x ' + k + '</span><span>$' + lineTot + '</span></div>';
            });
            receiptItemsEl.innerHTML = itemsHtml;
          } else {
            receiptItemsEl.innerHTML = '<div class="r-item"><span>1x Supermarket Basket Checkout</span><span>' + shown + '</span></div>';
          }
        }
        receiptWrap.hidden=false;
      }
    }
    else{
      msg.textContent=T('This QR expired. Create a new one.');tim.textContent='';
      if(receiptWrap)receiptWrap.hidden=true;
    }
  }
  function stop(){clearInterval(timer);timer=null;}
  function start(){
    err.textContent='';
    var a=parseFloat(amt.value);
    if(!(a>0)||a>100000000){err.textContent=T('Enter an amount above 0.');return;}
    var c=cur.value,text=payload(a,c);
    try{draw(text);}catch(e){err.textContent='QR error';return;}
    data.textContent=text;
    renderEmv(text);
    shown=(c==='USD'?'$'+a.toFixed(2):Math.round(a).toLocaleString('en-US')+' ៛');
    state='wait';left=TTL;stop();
    if(window.playSfx)window.playSfx('laser');
    timer=setInterval(function(){left--;if(left<=0){stop();state='expired';}render();},1000);
    render();
  }
  make.addEventListener('click',start);
  amt.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();start();}});
  pay.addEventListener('click',function(){
    stop();state='paid';tx='KH'+String(Date.now()).slice(-8);
    if(window.playSfx)window.playSfx('print');
    if(window.fireConfetti){
      var rect = pay.getBoundingClientRect();
      window.fireConfetti({ x: rect.left + rect.width / 2, y: rect.top });
    }
    render();
  });
  neu.addEventListener('click',function(){stop();state='idle';render();amt.focus();});

  if(emvDetails){
    emvDetails.addEventListener('toggle', function(){
      if(emvDetails.open && window.playSfx) window.playSfx('switch');
    });
  }

  if(rCopy){
    rCopy.addEventListener('click',function(){
      var receiptLines = [
        '================================',
        '       CHIPMONG RETAIL          ',
        '   Phnom Penh Supermarket Node  ',
        '================================',
        'Lane #04 · Cashier #2914'
      ];
      if(currentCart.length > 0){
        var counts = {};
        currentCart.forEach(function(it){
          if(!counts[it.name]) counts[it.name] = { count: 0, price: it.price };
          counts[it.name].count++;
        });
        Object.keys(counts).forEach(function(k){
          var obj = counts[k];
          receiptLines.push(obj.count + 'x ' + k + '  $' + (obj.count * obj.price).toFixed(2));
        });
      } else {
        receiptLines.push('1x Supermarket Basket  ' + shown);
      }
      receiptLines.push('--------------------------------');
      receiptLines.push('Total: ' + shown);
      receiptLines.push('Payment: NBC Bakong KHQR (18ms)');
      receiptLines.push('Ref: ' + tx);
      receiptLines.push('Ledger: SQL Server 2022 SETTLED');
      receiptLines.push('================================');
      receiptLines.push('Thank you for shopping with us!');

      var text = receiptLines.join('\n');
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          if(window.toast) window.toast('Receipt copied to clipboard');
        });
      }
    });
  }

  if(rPrint){
    rPrint.addEventListener('click',function(){
      window.print();
    });
  }

  function updateCartUI(){
    if(posClearBtn) posClearBtn.hidden = currentCart.length === 0;
  }

  document.querySelectorAll('.pos-item-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var name = btn.getAttribute('data-name');
      var price = parseFloat(btn.getAttribute('data-price'));
      currentCart.push({ name: name, price: price });
      updateCartUI();
      var sum = currentCart.reduce(function(a, b){ return a + b.price; }, 0);
      if(cur) cur.value = 'USD';
      if(amt) amt.value = sum.toFixed(2);
      if(window.playSfx) window.playSfx('laser');
      if(window.toast) window.toast('Scanned ' + name + ' ($' + price.toFixed(2) + ')');
      start();
    });
  });

  if(posClearBtn){
    posClearBtn.addEventListener('click', function(){
      currentCart = [];
      updateCartUI();
      if(cur) cur.value = 'USD';
      if(amt) amt.value = '1.00';
      if(window.playSfx) window.playSfx('switch');
      if(window.toast) window.toast('Cart reset');
      start();
    });
  }

  document.querySelectorAll('.rate-pill').forEach(function(pill){
    pill.addEventListener('click', function(){
      var curVal = pill.getAttribute('data-cur');
      var amtVal = pill.getAttribute('data-amt');
      if(cur) cur.value = curVal;
      if(amt) amt.value = amtVal;
      if(window.playSfx) window.playSfx('switch');
      document.querySelectorAll('.rate-pill').forEach(function(p){ p.classList.remove('active'); });
      pill.classList.add('active');
      start();
    });
  });

  document.addEventListener('langchange',render);
})();
