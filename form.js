// Custom dropdown for "I'm interested in" (keeps the value in a hidden input named "interest")
(function(){
  var dd=document.getElementById('dd');if(!dd)return;
  var btn=document.getElementById('ddBtn'),list=document.getElementById('ddList'),label=document.getElementById('ddLabel');
  var input=dd.querySelector('input[type=hidden]'),items=[].slice.call(list.querySelectorAll('li')),sel=0,act=0;
  function mark(i){act=i;items.forEach(function(li,k){li.classList.toggle('act',k===i);});items[i].scrollIntoView({block:'nearest'});}
  function open(){list.hidden=false;dd.classList.add('open');btn.setAttribute('aria-expanded','true');mark(sel);}
  function close(focus){list.hidden=true;dd.classList.remove('open');btn.setAttribute('aria-expanded','false');if(focus)btn.focus();}
  function choose(i,focus){
    sel=i;input.value=items[i].getAttribute('data-value');
    items.forEach(function(li,k){li.setAttribute('aria-selected',k===i?'true':'false');});
    label.textContent=items[i].textContent.trim();close(focus);
  }
  btn.addEventListener('click',function(){list.hidden?open():close(false);});
  btn.addEventListener('keydown',function(e){
    if(['ArrowDown','ArrowUp','Enter',' '].indexOf(e.key)<0&&e.key!=='Escape')return;
    if(e.key==='Escape'){if(!list.hidden){e.preventDefault();close(true);}return;}
    e.preventDefault();
    if(list.hidden){open();return;}
    if(e.key==='ArrowDown')mark(Math.min(act+1,items.length-1));
    else if(e.key==='ArrowUp')mark(Math.max(act-1,0));
    else choose(act,true);
  });
  items.forEach(function(li,k){
    li.addEventListener('click',function(){choose(k,true);});
    li.addEventListener('mousemove',function(){if(act!==k)mark(k);});
  });
  document.addEventListener('click',function(e){if(!dd.contains(e.target))close(false);});
  document.addEventListener('langchange',function(){label.textContent=items[sel].textContent.trim();});
  var form=dd.closest('form');
  if(form)form.addEventListener('reset',function(){setTimeout(function(){choose(0,false);},0);});
})();

// Sends the interest form to /api/contact (handled by server.js or the Netlify function).
(function(){
  var f=document.getElementById('interestForm');if(!f)return;
  var ENDPOINT='/api/contact';
  var st=document.getElementById('formStatus'),btn=f.querySelector('button[type=submit]');
  function T(s){return window.t?window.t(s):s;}
  function show(msg,ok){st.textContent=T(msg);st.className='form-status '+(ok?'ok':'err');}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var d={};new FormData(f).forEach(function(v,k){d[k]=v;});
    if(!d.website&&(String(d.fullname).trim().length<2||String(d.contact).trim().length<3||String(d.message).trim().length<5)){
      return show('Please fill in all fields.',false);
    }
    btn.disabled=true;show('Sending...',true);
    fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
      .then(function(r){
        if(r.ok){f.reset();return show('Message sent. Thank you!',true);}
        if(r.status===429)return show('Too many messages. Try again later.',false);
        if(r.status===400)return show('Please fill in all fields.',false);
        return r.json().catch(function(){return {};}).then(function(j){
          if(j.error==='not_configured')show('Server is not set up. Check the .env file.',false);
          else if(j.error==='telegram'){show('Telegram: ',false);st.textContent=T('Telegram rejected the message.')+(j.detail?' ('+j.detail+')':'');}
          else if(j.error==='network')show('Server cannot reach Telegram. Check internet or VPN.',false);
          else show('Cannot reach the form server. Run node server.js and open http://localhost:3000',false);
        });
      })
      .catch(function(){show('Cannot reach the form server. Run node server.js and open http://localhost:3000',false);})
      .then(function(){btn.disabled=false;});
  });
})();
