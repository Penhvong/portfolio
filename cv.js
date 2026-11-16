// "Download CV" button: uses cv-km.pdf / cv-zh.pdf when you add them, otherwise cv-en.pdf.
// To add a language: put cv-km.pdf or cv-zh.pdf next to index.html. Nothing else to change.
(function(){
  var a=document.getElementById('cvBtn');if(!a)return;
  var cache={};
  function pick(){
    var l=(window.getLang&&window.getLang())||'en';
    if(l==='en'){a.href='cv-en.pdf';return;}
    var f='cv-'+l+'.pdf';
    if(f in cache){a.href=cache[f]?f:'cv-en.pdf';return;}
    a.href='cv-en.pdf';
    fetch(f,{method:'HEAD'}).then(function(r){cache[f]=r.ok&&/pdf/.test(r.headers.get('content-type')||'');a.href=cache[f]?f:'cv-en.pdf';}).catch(function(){cache[f]=false;});
  }
  pick();document.addEventListener('langchange',pick);
})();
