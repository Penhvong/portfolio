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

    var pingEl = document.querySelector('.live-stat-ping');
    if(pingEl){
      setInterval(function(){
        var p = (1.1 + Math.random() * 0.5).toFixed(1);
        pingEl.textContent = p + 'ms';
      }, 3500);
    }

    if(cmdPill){
      cmdPill.addEventListener('click',function(){
        if(window.openCommandPalette)window.openCommandPalette();
      });
    }

    // Mini Cyber Audio Wave Visualizer in HUD
    var audioCv = document.getElementById('hudAudioCanvas');
    var meterWrap = document.getElementById('hudAudioMeter');
    if(audioCv && meterWrap){
      var actx = audioCv.getContext('2d');
      var bars = [3, 6, 9, 5, 2];
      var targetBars = [3, 6, 9, 5, 2];
      var isAudioActive = false;

      meterWrap.addEventListener('click', function(){
        var soundToggle = document.getElementById('soundToggle');
        if(soundToggle) soundToggle.click();
      });

      window.triggerAudioVisualizer = function(type){
        isAudioActive = true;
        for(var b = 0; b < bars.length; b++){
          targetBars[b] = 4 + Math.random() * 11;
        }
        setTimeout(function(){ isAudioActive = false; }, 350);
      };

      function renderWave(){
        actx.clearRect(0, 0, 48, 16);
        var isMuted = localStorage.getItem('sound_enabled') !== 'true';
        for(var i = 0; i < 5; i++){
          if(isMuted){
            bars[i] += (2 - bars[i]) * 0.1;
            actx.fillStyle = 'rgba(100, 116, 139, 0.4)';
          } else {
            var base = isAudioActive ? targetBars[i] : (2 + Math.sin(Date.now() * 0.006 + i) * 2 + 1);
            bars[i] += (base - bars[i]) * 0.25;
            actx.fillStyle = isAudioActive ? '#00f5d4' : '#38bdf8';
          }
          var h = Math.max(2, Math.min(14, bars[i]));
          var x = i * 9 + 4;
          var y = 15 - h;
          actx.fillRect(x, y, 5, h);
        }
        requestAnimationFrame(renderWave);
      }
      renderWave();
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
