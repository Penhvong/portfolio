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
    },
    arpeggio:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      var notes=[261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77];
      notes.forEach(function(freq,i){
        var osc=ac.createOscillator(),g=ac.createGain(),dt=i*0.055;
        osc.type='triangle';
        osc.frequency.setValueAtTime(freq,t+dt);
        g.gain.setValueAtTime(0.04,t+dt);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.12);
        osc.connect(g);g.connect(ac.destination);
        osc.start(t+dt);osc.stop(t+dt+0.13);
      });
    },
    overdrive:function(){
      var ac=getCtx();if(!ac||!enabled)return;
      var t=ac.currentTime;
      var osc=ac.createOscillator(),g=ac.createGain();
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(120,t);
      osc.frequency.exponentialRampToValueAtTime(1400,t+0.6);
      g.gain.setValueAtTime(0.08,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.65);
      osc.connect(g);g.connect(ac.destination);
      osc.start(t);osc.stop(t+0.7);

      setTimeout(function(){
        var ac2=getCtx();if(!ac2||!enabled)return;
        var t2=ac2.currentTime;
        [523.25,659.25,783.99,1046.50,1318.51].forEach(function(f,i){
          var osc2=ac2.createOscillator(),g2=ac2.createGain();
          osc2.type='sine';
          osc2.frequency.setValueAtTime(f,t2+i*0.04);
          g2.gain.setValueAtTime(0.05,t2+i*0.04);
          g2.gain.exponentialRampToValueAtTime(0.0001,t2+i*0.04+0.35);
          osc2.connect(g2);g2.connect(ac2.destination);
          osc2.start(t2+i*0.04);osc2.stop(t2+i*0.04+0.36);
        });
      },350);
    }
  };

  // Procedural Cyberpunk Lo-Fi Ambient Synth Pad (A Minor 9: 55Hz, 110Hz, 130.8Hz, 164.8Hz, 246.9Hz)
  var ambientGain = null;
  var ambientOscs = [];
  var isAmbientPlaying = false;

  function updateAmbientUI(active){
    var meter = document.getElementById('hudAudioMeter');
    if(meter) meter.classList.toggle('ambient-active', active);
    var toast = document.getElementById('toast');
    if(toast){
      toast.textContent = active ? (window.t ? window.t('Cyber Ambient Pad: ON 🌌') : 'Cyber Ambient Pad: ON 🌌') : (window.t ? window.t('Cyber Ambient Pad: OFF') : 'Cyber Ambient Pad: OFF');
      toast.classList.add('show');
      setTimeout(function(){ toast.classList.remove('show'); }, 1800);
    }
  }

  function startAmbientPad(){
    var ac = getCtx();
    if(!ac || isAmbientPlaying) return;

    ambientGain = ac.createGain();
    ambientGain.gain.setValueAtTime(0.0001, ac.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.038, ac.currentTime + 1.2);

    // Warm Low-Pass Filter
    var filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, ac.currentTime);

    // Filter breathing LFO
    var lfo = ac.createOscillator();
    var lfoGain = ac.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.09, ac.currentTime);
    lfoGain.gain.setValueAtTime(110, ac.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();
    ambientOscs.push(lfo);

    filter.connect(ambientGain);
    ambientGain.connect(ac.destination);

    // Polyphonic Warm Blade-Runner Chord (Am9)
    var freqs = [55.00, 110.00, 130.81, 164.81, 246.94];
    freqs.forEach(function(f, i){
      var osc = ac.createOscillator();
      var g = ac.createGain();
      osc.type = i === 0 ? 'sine' : (i % 2 === 0 ? 'triangle' : 'sine');
      var detune = (i - 2) * 5;
      osc.frequency.setValueAtTime(f, ac.currentTime);
      osc.detune.setValueAtTime(detune, ac.currentTime);
      g.gain.setValueAtTime(0.18, ac.currentTime);
      osc.connect(g);
      g.connect(filter);
      osc.start();
      ambientOscs.push(osc);
    });

    isAmbientPlaying = true;
    updateAmbientUI(true);
  }

  function stopAmbientPad(){
    var ac = getCtx();
    if(!ac || !isAmbientPlaying) return;
    if(ambientGain){
      ambientGain.gain.setValueAtTime(ambientGain.gain.value, ac.currentTime);
      ambientGain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8);
      setTimeout(function(){
        ambientOscs.forEach(function(o){ try{ o.stop(); o.disconnect(); }catch(e){} });
        ambientOscs = [];
        if(ambientGain){ try{ ambientGain.disconnect(); }catch(e){} ambientGain = null; }
      }, 850);
    }
    isAmbientPlaying = false;
    updateAmbientUI(false);
  }

  function toggleAmbientPad(){
    if(isAmbientPlaying){
      stopAmbientPad();
    } else {
      startAmbientPad();
    }
    return isAmbientPlaying;
  }

  window.toggleAmbientPad = toggleAmbientPad;
  window.isAmbientPlaying = function(){ return isAmbientPlaying; };

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
