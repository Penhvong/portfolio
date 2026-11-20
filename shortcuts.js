// Keyboard Shortcuts Cheat Sheet & Power Navigation Engine
// Allows visitors to navigate via hotkeys: ?, ~, K, S, T, M, 1-7, and ESC.
(function(){
  var modal = document.createElement('div');
  modal.id = 'shortcutsModal';
  modal.hidden = true;
  modal.className = 'shortcuts-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Keyboard Shortcuts');
  modal.innerHTML = [
    '<div class="shortcuts-box glow">',
      '<div class="shortcuts-header">',
        '<div class="shortcuts-title-wrap">',
          '<span class="shortcuts-icon">⌨️</span>',
          '<div>',
            '<h3>Keyboard Shortcuts</h3>',
            '<p class="shortcuts-sub">Navigate and trigger actions at lightning speed</p>',
          '</div>',
        '</div>',
        '<button type="button" class="shortcuts-close" id="shortcutsCloseBtn" aria-label="Close shortcuts">&times;</button>',
      '</div>',
      '<div class="shortcuts-grid">',
        '<div class="sc-group">',
          '<h4>Navigation & Views</h4>',
          '<div class="sc-row"><span>Go to Home</span><kbd>1</kbd></div>',
          '<div class="sc-row"><span>Go to About / Bio</span><kbd>2</kbd></div>',
          '<div class="sc-row"><span>Go to Skills</span><kbd>3</kbd></div>',
          '<div class="sc-row"><span>Go to Engineering Lab</span><kbd>4</kbd></div>',
          '<div class="sc-row"><span>Go to Integration Process</span><kbd>5</kbd></div>',
          '<div class="sc-row"><span>Go to Projects</span><kbd>6</kbd></div>',
          '<div class="sc-row"><span>Go to Contact</span><kbd>7</kbd></div>',
        '</div>',
        '<div class="sc-group">',
          '<h4>Developer Tools</h4>',
          '<div class="sc-row"><span>Command Palette</span><kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd></div>',
          '<div class="sc-row"><span>Developer Terminal (CLI)</span><kbd>~</kbd></div>',
          '<div class="sc-row"><span>Matrix Digital Rain</span><kbd>M</kbd></div>',
          '<div class="sc-row"><span>Toggle Sound FX</span><kbd>S</kbd></div>',
          '<div class="sc-row"><span>Toggle Dark / Light Theme</span><kbd>T</kbd></div>',
          '<div class="sc-row"><span>Simulate Process Pipeline</span><kbd>P</kbd></div>',
          '<div class="sc-row"><span>Execute SQL Server Query</span><kbd>Q</kbd></div>',
          '<div class="sc-row"><span>View CV Modal</span><kbd>V</kbd></div>',
          '<div class="sc-row"><span>Replay Career Tour</span><kbd>J</kbd></div>',
          '<div class="sc-row"><span>Toggle Ambient Pad</span><kbd>A</kbd></div>',
          '<div class="sc-row"><span>Ping Bank Switches</span><kbd>B</kbd></div>',
          '<div class="sc-row"><span>Keyboard Help</span><kbd>?</kbd></div>',
          '<div class="sc-row"><span>Close Active Modal</span><kbd>ESC</kbd></div>',
        '</div>',
      '</div>',
      '<div class="shortcuts-footer">',
        '<span>Tip: Press <kbd>?</kbd> anytime to toggle this menu</span>',
      '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(modal);

  function open(){
    modal.hidden = false;
    modal.classList.add('show');
    if(window.playSfx) window.playSfx('switch');
    var closeBtn = document.getElementById('shortcutsCloseBtn');
    if(closeBtn) closeBtn.focus();
  }

  function close(){
    modal.hidden = true;
    modal.classList.remove('show');
    if(window.playSfx) window.playSfx('click');
  }

  function toggle(){
    if(modal.hidden) open();
    else close();
  }

  // Keyboard events
  document.addEventListener('keydown', function(e){
    var tag = (e.target && e.target.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

    if(e.key === '?' || (e.key === '/' && e.shiftKey)){
      e.preventDefault();
      toggle();
      return;
    }

    if(e.key === 'Escape' && !modal.hidden){
      e.preventDefault();
      close();
      return;
    }

    // Single key shortcuts when no modal is open
    if(modal.hidden && !e.ctrlKey && !e.metaKey && !e.altKey){
      switch(e.key.toLowerCase()){
        case 's':
          var soundBtn = document.getElementById('soundToggle');
          if(soundBtn) soundBtn.click();
          break;
        case 't':
          var themeBtn = document.getElementById('theme');
          if(themeBtn) themeBtn.click();
          break;
        case 'm':
          if(window.TerminalCLI) window.TerminalCLI.toggleMatrix();
          break;
        case 'p':
          location.hash = '#architecture';
          if(window.ProcessPipeline) window.ProcessPipeline.runSimulation();
          break;
        case 'q':
          location.hash = '#architecture';
          if(window.ProcessPipeline){
            window.ProcessPipeline.renderNode('sql_server');
            window.ProcessPipeline.executeSqlQuery();
          }
          break;
        case 'v':
          if(window.openCvModal) window.openCvModal();
          break;
        case 'j':
          if(window.replayCareerTour) window.replayCareerTour();
          break;
        case 'a':
          if(window.toggleAmbientPad) window.toggleAmbientPad();
          break;
        case 'b':
          location.hash = '#architecture';
          if(window.ProcessPipeline) window.ProcessPipeline.renderNode('bakong');
          if(window.pingInterbankRails) window.pingInterbankRails();
          break;
        case '1': location.hash = '#top'; break;
        case '2': location.hash = '#about'; break;
        case '3': location.hash = '#skills'; break;
        case '4': location.hash = '#workbench'; break;
        case '5': location.hash = '#architecture'; break;
        case '6': location.hash = '#projects'; break;
        case '7': location.hash = '#contact'; break;
      }
    }
  });

  var closeBtn = document.getElementById('shortcutsCloseBtn');
  if(closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function(e){
    if(e.target === modal) close();
  });

  // Konami Code Detector (↑ ↑ ↓ ↓ ← → ← → B A)
  var konamiSeq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var konamiIdx = 0;

  window.activateOverdrive = function(){
    if(window.playSfx) window.playSfx('overdrive');
    document.body.classList.add('cyber-overdrive');
    if(window.fireConfetti){
      window.fireConfetti({ x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 });
      window.fireConfetti({ x: window.innerWidth * 0.75, y: window.innerHeight * 0.3 });
    }
    if(window.toast) window.toast('⚡ CYBER OVERDRIVE: Full Engine Throughput Unlocked (60fps)!');
    setTimeout(function(){
      document.body.classList.remove('cyber-overdrive');
    }, 15000);
  };

  document.addEventListener('keydown', function(e){
    var k = e.key;
    if(k.toLowerCase() === konamiSeq[konamiIdx].toLowerCase()){
      konamiIdx++;
      if(konamiIdx === konamiSeq.length){
        konamiIdx = 0;
        window.activateOverdrive();
      }
    } else {
      konamiIdx = 0;
    }
  });

  window.ShortcutsEngine = {
    open: open,
    close: close,
    toggle: toggle
  };
})();
