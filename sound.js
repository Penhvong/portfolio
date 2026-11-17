// High-Tech Web Audio Synthesizer: 100% algorithmic audio without external audio files.
// Synthesizes futuristic UI clicks, scanner beeps, mechanical switches, and payment success chimes.
(function(){
  var ctx=null,enabled=false;
  try{enabled=localStorage.getItem('sound_enabled')==='true';}catch(e){}

  function getCtx(){
    if(!ctx){
      var AC=window.AudioContext||window.webkitAudioContext;
      if(AC)ctx=new AC();
    }
    if(ctx&&ctx.state==='suspended')ctx.resume();
    return ctx;
  }

  var SFX={
    click:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var osc=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      osc.type='sine';
      osc.frequency.setValueAtTime(880,t);
      osc.frequency.exponentialRampToValueAtTime(440,t+0.04);
      g.gain.setValueAtTime(0.06,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.04);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.045);
    },
    tick:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var osc=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      osc.type='triangle';
      osc.frequency.setValueAtTime(1400,t);
      osc.frequency.exponentialRampToValueAtTime(900,t+0.02);
      g.gain.setValueAtTime(0.02,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.02);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.025);
    },
    switch:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      // Mechanical double-click feel
      [0,0.03].forEach(function(dt,i){
        var osc=ac.createOscillator(),g=ac.createGain();
        osc.type='sine';
        osc.frequency.setValueAtTime(i===0?520:780,t+dt);
        osc.frequency.exponentialRampToValueAtTime(300,t+dt+0.025);
        g.gain.setValueAtTime(0.05,t+dt);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.025);
        osc.connect(g);g.connect(ac.destination);
        osc.start(t+dt);osc.stop(t+dt+0.03);
      });
    },
    success:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      // Elegant futuristic triad chime (C5, E5, G5, C6)
      var notes=[523.25,659.25,783.99,1046.50];
      notes.forEach(function(freq,idx){
        var osc=ac.createOscillator(),g=ac.createGain(),dt=idx*0.07;
        osc.type='sine';
        osc.frequency.setValueAtTime(freq,t+dt);
        g.gain.setValueAtTime(0.08,t+dt);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.35);
        osc.connect(g);g.connect(ac.destination);
        osc.start(t+dt);osc.stop(t+dt+0.36);
      });
    },
    scan:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var osc=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(400,t);
      osc.frequency.linearRampToValueAtTime(1200,t+0.08);
      g.gain.setValueAtTime(0.03,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.095);
    },
    laser:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var osc=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      osc.type='sine';
      osc.frequency.setValueAtTime(1600,t);
      osc.frequency.exponentialRampToValueAtTime(300,t+0.12);
      g.gain.setValueAtTime(0.04,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.13);
    },
    terminal:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      [0,0.04,0.08].forEach(function(dt,idx){
        var osc=ac.createOscillator(),g=ac.createGain();
        osc.type='square';
        osc.frequency.setValueAtTime(600+(idx*200),t+dt);
        g.gain.setValueAtTime(0.02,t+dt);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.03);
        osc.connect(g);g.connect(ac.destination);
        osc.start(t+dt);osc.stop(t+dt+0.035);
      });
    },
    packet:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var osc=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      osc.type='sine';
      osc.frequency.setValueAtTime(320,t);
      osc.frequency.exponentialRampToValueAtTime(1400,t+0.15);
      osc.frequency.exponentialRampToValueAtTime(700,t+0.28);
      g.gain.setValueAtTime(0.04,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.29);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.3);
    },
    keypress:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var osc=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;
      osc.type='triangle';
      osc.frequency.setValueAtTime(600+Math.random()*300,t);
      g.gain.setValueAtTime(0.02,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.015);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.02);
    },
    matrix:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      [220,330,440,660,880,1320].forEach(function(freq,i){
        var osc=ac.createOscillator(),g=ac.createGain(),dt=i*0.05;
        osc.type='sawtooth';
        osc.frequency.setValueAtTime(freq,t+dt);
        g.gain.setValueAtTime(0.03,t+dt);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.1);
        osc.connect(g);g.connect(ac.destination);
        osc.start(t+dt);osc.stop(t+dt+0.11);
      });
    },
    print:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      // Synthesize realistic thermal receipt printer motor & paper feed
      for(var i=0;i<8;i++){
        var osc=ac.createOscillator(),g=ac.createGain(),dt=i*0.045;
        osc.type='sawtooth';
        osc.frequency.setValueAtTime(220+Math.random()*80,t+dt);
        g.gain.setValueAtTime(0.02,t+dt);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.035);
        osc.connect(g);g.connect(ac.destination);
        osc.start(t+dt);osc.stop(t+dt+0.04);
      }
    }
  };

  window.playSfx=function(name){
    if(SFX[name])SFX[name]();
    if(window.triggerAudioVisualizer)window.triggerAudioVisualizer(name);
  };

  function initUI(){
    var btn=document.getElementById('soundToggle');
    if(!btn)return;

    function render(){
      btn.setAttribute('aria-pressed',enabled?'true':'false');
      btn.classList.toggle('sound-active',enabled);
      btn.title=enabled?(window.t?window.t('Sound effects enabled (Click to mute)'):'Sound effects enabled (Click to mute)'):(window.t?window.t('Sound effects muted (Click to enable)'):'Sound effects muted (Click to enable)');
      var onIcon=btn.querySelector('.sound-on'),offIcon=btn.querySelector('.sound-off');
      if(onIcon)onIcon.style.display=enabled?'block':'none';
      if(offIcon)offIcon.style.display=enabled?'none':'block';
    }

    btn.addEventListener('click',function(e){
      e.stopPropagation();
      getCtx();
      enabled=!enabled;
      try{localStorage.setItem('sound_enabled',enabled?'true':'false');}catch(err){}
      render();
      if(enabled){
        SFX.success();
        var toast=document.getElementById('toast');
        if(toast){toast.textContent=window.t?window.t('Sound FX Enabled'):'Sound FX Enabled 🔊';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1600);}
      }
    });

    render();

    // Attach subtle sounds to interactive elements
    var lastHover=0;
    document.addEventListener('pointerenter',function(e){
      if(!enabled)return;
      var target=e.target;
      if(!target||!target.closest)return;
      if(target.closest('.btn, .nav nav a, .card, .chip, .contact-item, .bento-card, .switch-btn')){
        var now=Date.now();
        if(now-lastHover>60){lastHover=now;SFX.tick();}
      }
    },true);

    document.addEventListener('click',function(e){
      if(!enabled)return;
      var target=e.target;
      if(!target||!target.closest)return;
      if(target.closest('.btn, .switch-btn, .chip, .nav nav a, #theme, #festBtn')){
        SFX.click();
      }
    },true);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initUI);
  }else{
    initUI();
  }
})();
