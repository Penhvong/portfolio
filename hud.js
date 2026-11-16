// Live Phnom Penh Innovation HUD
// Displays real-time local time, weather status, current engineering activity, and quick command shortcut.
(function(){
  function init(){
    var hud=document.getElementById('innovationHud');
    if(!hud)return;

    var timeEl=document.getElementById('hudTime');
    var cmdPill=document.getElementById('hudCmdBtn');

    function updateTime(){
      if(!timeEl)return;
      try{
        var now=new Date();
        var fmt=new Intl.DateTimeFormat('en-US',{
          timeZone:'Asia/Phnom_Penh',
          hour:'numeric',
          minute:'2-digit',
          second:'2-digit',
          hour12:true
        }).format(now);
        timeEl.textContent=fmt+' ICT';
      }catch(e){
        var d=new Date();
        timeEl.textContent=d.toLocaleTimeString()+' ICT';
      }
    }

    setInterval(updateTime,1000);
    updateTime();

    if(cmdPill){
      cmdPill.addEventListener('click',function(){
        if(window.openCommandPalette)window.openCommandPalette();
      });
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
