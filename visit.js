// Tells the server once per browser session that someone visited (skipped on localhost).
(function(){
  if(/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname))return;
  try{if(sessionStorage.getItem('visited'))return;sessionStorage.setItem('visited','1');}catch(e){}
  var ref='';try{ref=document.referrer?new URL(document.referrer).hostname:'';}catch(e){}
  fetch('/api/visit',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
    body:JSON.stringify({lang:document.documentElement.lang||'en',ref:ref,screen:innerWidth+'x'+innerHeight})}).catch(function(){});
})();
