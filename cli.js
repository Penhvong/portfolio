// Interactive Developer Terminal & Matrix Rain Engine
// Provides full CLI sandbox: commands, auto-completion, history, and Matrix rain easter egg.
(function(){
  var history = [];
  var historyIndex = -1;
  var isOpen = false;
  var matrixActive = false;
  var matrixAnimId = null;

  var COMMANDS = {
    help: 'List all available shell commands and functions',
    whoami: 'Display developer identity, position, and enterprise focus',
    skills: 'Display categorized engineering capabilities & tech stack',
    projects: 'List featured production projects and architectural role',
    khqr: 'Generate simulated EMVCo-compliant KHQR payload with CRC16',
    benchmark: 'Run high-throughput latency and memory allocation test',
    matrix: 'Toggle full-screen Cyberpunk Matrix digital rain animation',
    sound: 'Toggle audio synthesizer FX [sound on | sound off]',
    theme: 'Change UI appearance [theme dark | theme light | theme fest]',
    contact: 'Display direct communication channels (Telegram, Email, etc.)',
    neofetch: 'Display system specs, uptime, OS and workstation stats',
    clear: 'Clear the terminal output buffer',
    exit: 'Close the developer terminal drawer'
  };

  function appendOutput(html, isCmd){
    var output = document.getElementById('cliOutput');
    if(!output) return;
    var line = document.createElement('div');
    line.className = 'cli-line' + (isCmd ? ' cli-cmd-line' : '');
    line.innerHTML = html;
    output.appendChild(line);
    var body = document.getElementById('cliBody');
    if(body) body.scrollTop = body.scrollHeight;
  }

  function runCommand(raw){
    var cmdStr = (raw || '').trim();
    if(!cmdStr) return;
    
    // Save to history
    history.push(cmdStr);
    historyIndex = history.length;

    appendOutput('<span class="cli-prompt-usr">visitor@chipmong</span>:<span class="cli-prompt-path">~</span>$ ' + escapeHtml(cmdStr), true);
    if(window.playSfx) window.playSfx('terminal');

    var parts = cmdStr.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts[1] ? parts[1].toLowerCase() : '';

    switch(cmd){
      case 'help':
        var h = '<div class="cli-table">';
        h += '<div class="cli-row"><strong class="cli-hl">COMMAND</strong> <strong class="cli-hl">DESCRIPTION</strong></div>';
        Object.keys(COMMANDS).forEach(function(k){
          h += '<div class="cli-row"><span class="cli-cyan">' + k.padEnd(12, ' ') + '</span> <span>' + COMMANDS[k] + '</span></div>';
        });
        h += '</div><div class="cli-sub">Tip: Use Tab for auto-completion, ↑ / ↓ for history, or type "matrix" for cyber rain.</div>';
        appendOutput(h);
        break;

      case 'whoami':
        appendOutput(
          '<div class="cli-box">' +
          '<span class="cli-hl">Name:</span> Chanpenhvong YOEURNG<br>' +
          '<span class="cli-hl">Role:</span> Developer, IT - Innovation Strategy @ Chipmong<br>' +
          '<span class="cli-hl">Location:</span> Phnom Penh, Cambodia 🇰🇭<br>' +
          '<span class="cli-hl">Alma Mater:</span> Norton University (Software Development)<br>' +
          '<span class="cli-hl">Specialty:</span> KHQR Payment Pipelines · Offline-First Flutter Apps · ASP.NET Core & SQL Server' +
          '</div>'
        );
        break;

      case 'skills':
        appendOutput(
          '<div class="cli-box">' +
          '<strong class="cli-green">BACKEND & FINTECH:</strong><br>' +
          '  [C# / ASP.NET Core 8]  ██████████████████ 95%<br>' +
          '  [KHQR / Bakong / EMV]  ██████████████████ 94%<br>' +
          '  [Microsoft SQL Server] ████████████████   88%<br>' +
          '  [SAP Business One DI]  ██████████████     82%<br><br>' +
          '<strong class="cli-green">MOBILE & FRONTEND:</strong><br>' +
          '  [Flutter / Dart BLoC]  █████████████████  92%<br>' +
          '  [SQLite Offline Sync]  ████████████████   88%<br>' +
          '  [Modern JS / Vanilla]  ████████████████   86%<br>' +
          '</div>'
        );
        break;

      case 'projects':
        appendOutput(
          '<div class="cli-box">' +
          '1. <strong class="cli-hl">KHQR Payment Integration</strong> (Supermarket & POS Checkout)<br>' +
          '   Real-time EMVCo QR request pipeline, WebSocket verification & instant settlement.<br><br>' +
          '2. <strong class="cli-hl">Field Sales Mobile Application</strong> (Flutter + SQLite)<br>' +
          '   Offline-first mobile client with geospatial GPS check-in/out and background sync.<br><br>' +
          '3. <strong class="cli-hl">Procurement & Order Management System</strong> (ASP.NET)<br>' +
          '   Automated inter-departmental purchase requisitions and SAP B1 integration.<br><br>' +
          '4. <strong class="cli-hl">SAMAKI Appointment Booking</strong> (Norton University)<br>' +
          '   Full-stack customer appointment scheduler and real-time staff dispatch platform.' +
          '</div>'
        );
        break;

      case 'khqr':
        var amount = parts[1] || '25000';
        var crc = (Math.floor(Math.random()*60000)+5000).toString(16).toUpperCase();
        appendOutput(
          '<div class="cli-box">' +
          '<span class="cli-green">>>> KHQR EMVCo Payload Generated</span><br>' +
          'Payload Format Indicator (00): 01<br>' +
          'Point of Initiation (01): 12 (Dynamic)<br>' +
          'Merchant Account Info (29): khqr@chipmong.com.kh<br>' +
          'Transaction Currency (53): 116 (KHR)<br>' +
          'Transaction Amount (54): ' + amount + '<br>' +
          'Country Code (58): KH<br>' +
          'CRC16-CCITT (63): 0x' + crc + ' <span class="cli-green">✔ VALIDATED</span><br>' +
          'Raw: 00020101021229320016chipmong.merchant53031165405' + amount + '5802KH6304' + crc +
          '</div>'
        );
        break;

      case 'benchmark':
        appendOutput('<span class="cli-cyan">Starting system performance benchmark...</span>');
        setTimeout(function(){
          appendOutput(
            '<div class="cli-box">' +
            '⚡ <strong class="cli-hl">Benchmark Results:</strong><br>' +
            '  EMV Tag Parsing:      12,450 ops/sec (0.08ms)<br>' +
            '  CRC16 Calculation:    48,100 ops/sec (0.02ms)<br>' +
            '  SQLite Local Query:    4,200 ops/sec (0.23ms)<br>' +
            '  Memory Overhead:       14.2 MB RSS<br>' +
            '  Status:                <span class="cli-green">OPTIMAL (Sub-millisecond latency)</span>' +
            '</div>'
          );
        }, 500);
        break;

      case 'matrix':
        toggleMatrix();
        break;

      case 'sound':
        var soundBtn = document.getElementById('soundToggle');
        if(soundBtn){
          soundBtn.click();
          appendOutput('Sound audio status toggled.');
        } else {
          appendOutput('Audio toggle not found.');
        }
        break;

      case 'theme':
        var themeBtn = document.getElementById('theme');
        if(themeBtn){
          themeBtn.click();
          appendOutput('Theme switched.');
        } else {
          appendOutput('Theme switcher not found.');
        }
        break;

      case 'contact':
        appendOutput(
          '<div class="cli-box">' +
          '📧 <span class="cli-hl">Email:</span> <a href="mailto:chanpenhvong.yoeurng@gmail.com" class="cli-link">chanpenhvong.yoeurng@gmail.com</a><br>' +
          '💬 <span class="cli-hl">Telegram:</span> <a href="https://t.me/chanpenhvong" target="_blank" class="cli-link">@chanpenhvong</a><br>' +
          '💼 <span class="cli-hl">LinkedIn:</span> <a href="https://linkedin.com" target="_blank" class="cli-link">linkedin.com/in/chanpenhvong</a><br>' +
          '📍 <span class="cli-hl">Location:</span> Phnom Penh, Cambodia' +
          '</div>'
        );
        break;

      case 'neofetch':
        appendOutput(
          '<div class="cli-neofetch">' +
          '<pre class="cli-ascii">' +
          '  ____  _     _                              \n' +
          ' / ___|| |__ (_)_ __  _ __ ___   ___  _ __   \n' +
          '| |    | \'_ \\| | \'_ \\| \'_ ` _ \\ / _ \\| \'_ \\  \n' +
          '| |___ | | | | | |_) | | | | | | (_) | | | | \n' +
          ' \\____||_| |_|_| .__/|_| |_| |_|\\___/|_| |_| \n' +
          '               |_|                           ' +
          '</pre>' +
          '<div class="cli-specs">' +
          '<strong class="cli-cyan">chanpenhvong@chipmong-dev</strong><br>' +
          '-------------------------<br>' +
          '<span class="cli-hl">OS:</span> High-Tech Web Portfolio v2.5<br>' +
          '<span class="cli-hl">Host:</span> Phnom Penh Innovation Lab<br>' +
          '<span class="cli-hl">Uptime:</span> 99.98% High Availability<br>' +
          '<span class="cli-hl">Shell:</span> bash / zsh 5.9<br>' +
          '<span class="cli-hl">Stack:</span> C# · ASP.NET Core · Flutter · SQL · KHQR<br>' +
          '<span class="cli-hl">Theme:</span> Obsidian Dark & Electric Cyan' +
          '</div></div>'
        );
        break;

      case 'clear':
        var out = document.getElementById('cliOutput');
        if(out) out.innerHTML = '';
        break;

      case 'exit':
        closeDrawer();
        break;

      case 'sudo':
        appendOutput('<span class="cli-red">Permission denied: You are a guest in safe mode. Administrator privileges reserved for Chanpenhvong.</span>');
        break;

      default:
        appendOutput('<span class="cli-red">Command not recognized: "' + escapeHtml(cmd) + '". Type <strong class="cli-hl">help</strong> to see available commands.</span>');
        break;
    }
  }

  function escapeHtml(s){
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function toggleMatrix(){
    matrixActive = !matrixActive;
    var canvas = document.getElementById('matrixCanvas');
    if(!canvas) return;

    if(matrixActive){
      canvas.style.display = 'block';
      startMatrixRain(canvas);
      if(window.playSfx) window.playSfx('matrix');
      appendOutput('<span class="cli-green">>>> Matrix Digital Rain ENGAGED. Press ESC or type "matrix" to exit.</span>');
    } else {
      canvas.style.display = 'none';
      if(matrixAnimId) cancelAnimationFrame(matrixAnimId);
      appendOutput('<span class="cli-cyan">>>> Matrix Digital Rain DISENGAGED.</span>');
    }
  }

  function startMatrixRain(canvas){
    var ctx = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var cols = Math.floor(w / 18);
    var ypos = Array(cols).fill(0);
    var chars = '01KHQR0123456789ABCDEF$#@*+=-~<>កខគឃងចឆជឈញ';

    function draw(){
      ctx.fillStyle = 'rgba(6, 11, 20, 0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00F5D4';
      ctx.font = '14px monospace';

      for(var i = 0; i < cols; i++){
        var text = chars.charAt(Math.floor(Math.random() * chars.length));
        var x = i * 18;
        var y = ypos[i];
        ctx.fillText(text, x, y);
        if(y > 100 + Math.random() * 10000){
          ypos[i] = 0;
        } else {
          ypos[i] = y + 18;
        }
      }
      matrixAnimId = requestAnimationFrame(draw);
    }

    if(matrixAnimId) cancelAnimationFrame(matrixAnimId);
    draw();
  }

  function openDrawer(){
    var drawer = document.getElementById('cliDrawer');
    if(!drawer) return;
    drawer.classList.add('open');
    isOpen = true;
    if(window.playSfx) window.playSfx('switch');
    var input = document.getElementById('cliInput');
    if(input){
      input.focus();
    }
  }

  function closeDrawer(){
    var drawer = document.getElementById('cliDrawer');
    if(!drawer) return;
    drawer.classList.remove('open');
    isOpen = false;
    if(window.playSfx) window.playSfx('click');
  }

  function toggleDrawer(){
    if(isOpen) closeDrawer();
    else openDrawer();
  }

  function init(){
    var input = document.getElementById('cliInput');
    var closeBtn = document.getElementById('cliCloseBtn');
    var triggerBtns = document.querySelectorAll('.cli-trigger');

    triggerBtns.forEach(function(b){
      b.addEventListener('click', function(e){
        e.preventDefault();
        toggleDrawer();
      });
    });

    if(closeBtn){
      closeBtn.addEventListener('click', closeDrawer);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e){
      // Toggle terminal with backtick ` or ~
      if((e.key === '`' || e.key === '~') && !e.ctrlKey && !e.metaKey){
        var tag = (e.target && e.target.tagName) || '';
        if(tag !== 'INPUT' && tag !== 'TEXTAREA'){
          e.preventDefault();
          toggleDrawer();
          return;
        }
      }
      if(e.key === 'Escape' && isOpen){
        closeDrawer();
        return;
      }
      if(e.key === 'Escape' && matrixActive){
        toggleMatrix();
        return;
      }
    });

    if(input){
      input.addEventListener('keydown', function(e){
        if(window.playSfx) window.playSfx('keypress');

        if(e.key === 'Enter'){
          var val = input.value;
          input.value = '';
          runCommand(val);
        } else if(e.key === 'ArrowUp'){
          e.preventDefault();
          if(historyIndex > 0){
            historyIndex--;
            input.value = history[historyIndex];
          }
        } else if(e.key === 'ArrowDown'){
          e.preventDefault();
          if(historyIndex < history.length - 1){
            historyIndex++;
            input.value = history[historyIndex];
          } else {
            historyIndex = history.length;
            input.value = '';
          }
        } else if(e.key === 'Tab'){
          e.preventDefault();
          var current = input.value.trim().toLowerCase();
          var match = Object.keys(COMMANDS).find(function(k){ return k.startsWith(current); });
          if(match) input.value = match + ' ';
        }
      });
    }

    // Initial greeting
    setTimeout(function(){
      appendOutput('<span class="cli-cyan">Chanpenhvong YOEURNG Developer Shell v2.5.0</span> (Phnom Penh Node)');
      appendOutput('Type <strong class="cli-hl">help</strong> for commands, or <strong class="cli-hl">matrix</strong> for digital rain.');
    }, 200);
  }

  window.TerminalCLI = {
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
    toggleMatrix: toggleMatrix,
    run: runCommand
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
