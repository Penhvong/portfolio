// Linear & Raycast style Command Palette (Cmd+K / Ctrl+K)
// Allows visitors to instantly search, navigate, trigger demos, and toggle settings.
(function(){
  var T=function(s){return window.t?window.t(s):s;};
  var m=document.createElement('div');
  m.id='cmdModal';
  m.hidden=true;
  m.className='cmd-backdrop';
  m.setAttribute('role','dialog');
  m.setAttribute('aria-modal','true');
  m.innerHTML=[
    '<div class="cmd-box glow">',
      '<div class="cmd-input-wrap">',
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
        '<input id="cmdInput" type="text" placeholder="Type a command or search..." autocomplete="off" spellcheck="false" aria-label="Search commands">',
        '<span class="cmd-esc-badge"><kbd>ESC</kbd></span>',
      '</div>',
      '<div class="cmd-list" id="cmdList" role="listbox"></div>',
      '<div class="cmd-footer">',
        '<span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>',
        '<span><kbd>↵</kbd> Select</span>',
        '<span><kbd>ESC</kbd> Close</span>',
      '</div>',
    '</div>'
  ].join('');
  document.body.appendChild(m);

  var input=document.getElementById('cmdInput');
  var list=document.getElementById('cmdList');
  var activeIndex=0;

  function getCommands(){
    return [
      {id:'khqr',cat:'Demo',icon:'💳',title:'Try KHQR Live Demo',desc:'Simulate real-time QR payment flow',run:function(){
        location.hash='#demo';var b=document.getElementById('qrMake');if(b)b.click();
      }},
      {id:'desk',cat:'Workspace',icon:'💻',title:'Switch to Desk Setup',desc:'View developer workstation photo',run:function(){
        var b=document.querySelector('.switch-btn[data-src*="photo-work"]');if(b)b.click();location.hash='#top';
      }},
      {id:'studio',cat:'Workspace',icon:'👔',title:'Switch to Studio Portrait',desc:'View official studio portrait',run:function(){
        var b=document.querySelector('.switch-btn[data-src="photo.jpg"]');if(b)b.click();location.hash='#top';
      }},
      {id:'workbench',cat:'Tech Lab',icon:'⚡',title:'Open Architecture Workbench',desc:'Interactive C#, Flutter, and SQL sandbox',run:function(){
        location.hash='#workbench';var r=document.getElementById('wbRunBtn');if(r)r.click();
      }},
      {id:'dashboard',cat:'Analytics',icon:'📊',title:'Open Sales Analytics Dashboard',desc:'Explore district sell-in and sell-out chart',run:function(){
        location.hash='#dashboard';
      }},
      {id:'projects',cat:'Navigation',icon:'🚀',title:'Browse Featured Projects',desc:'SAMAKI, KHQR Integration, Field Sales App...',run:function(){
        location.hash='#projects';
      }},
      {id:'skills',cat:'Navigation',icon:'🛠️',title:'View Skills & Toolkit',desc:'ASP.NET Core, Flutter, SQL, KHQR, SAP B1',run:function(){
        location.hash='#skills';
      }},
      {id:'journey',cat:'Navigation',icon:'🏆',title:'View Career Milestones',desc:'Norton University ➔ ICCKH ➔ Chipmong',run:function(){
        location.hash='#journey';
      }},
      {id:'contact',cat:'Navigation',icon:'📬',title:'Contact Chanpenhvong',desc:'Send a message or inquire about collaboration',run:function(){
        location.hash='#contact';
      }},
      {id:'sound',cat:'Settings',icon:'🔊',title:'Toggle Sound FX',desc:'Turn algorithmic audio clicks and chimes ON/OFF',run:function(){
        var b=document.getElementById('soundToggle');if(b)b.click();
      }},
      {id:'theme',cat:'Settings',icon:'🌓',title:'Toggle Dark / Light Mode',desc:'Switch between Obsidian Dark and Crisp Light',run:function(){
        var b=document.getElementById('theme');if(b)b.click();
      }},
      {id:'fest',cat:'Settings',icon:'🪷',title:'Choose Festival Theme',desc:'Khmer New Year, Water Festival, Angkor Sankranta...',run:function(){
        var b=document.getElementById('festBtn');if(b)b.click();
      }},
      {id:'cv',cat:'Resume',icon:'📄',title:'Download Curriculum Vitae',desc:'Get PDF resume (English / Khmer / Chinese)',run:function(){
        var b=document.getElementById('cvBtn');if(b)b.click();
      }},
      {id:'copyMail',cat:'Contact',icon:'📋',title:'Copy Email Address',desc:'Penhvong46@gmail.com',run:function(){
        var b=document.getElementById('copyMail');if(b)b.click();
      }},
      {id:'telegram',cat:'Contact',icon:'✈️',title:'Open Telegram',desc:'@Chan_Penhvong',run:function(){
        window.open('https://t.me/Chan_Penhvong','_blank');
      }},
      {id:'langKm',cat:'Language',icon:'🇰🇭',title:'ប្តូរទៅ ភាសាខ្មែរ (Khmer)',desc:'Switch website to Khmer language',run:function(){
        var opt=document.querySelector('#langList li[data-lang="km"]');if(opt)opt.click();
      }},
      {id:'langEn',cat:'Language',icon:'🇺🇸',title:'Switch to English',desc:'Switch website to English language',run:function(){
        var opt=document.querySelector('#langList li[data-lang="en"]');if(opt)opt.click();
      }},
      {id:'langZh',cat:'Language',icon:'🇨🇳',title:'切换为 中文 (Chinese)',desc:'Switch website to Simplified Chinese',run:function(){
        var opt=document.querySelector('#langList li[data-lang="zh"]');if(opt)opt.click();
      }}
    ];
  }

  function renderList(query){
    query=(query||'').trim().toLowerCase();
    var all=getCommands();
    var filtered=all.filter(function(c){
      return !query||c.title.toLowerCase().indexOf(query)>=0||c.desc.toLowerCase().indexOf(query)>=0||c.cat.toLowerCase().indexOf(query)>=0;
    });

    if(!filtered.length){
      list.innerHTML='<div class="cmd-empty">No commands matching "'+query+'"</div>';
      return [];
    }

    activeIndex=Math.min(activeIndex,filtered.length-1);
    if(activeIndex<0)activeIndex=0;

    var html='',lastCat='';
    filtered.forEach(function(cmd,idx){
      if(cmd.cat!==lastCat){
        html+='<div class="cmd-group-title">'+cmd.cat+'</div>';
        lastCat=cmd.cat;
      }
      var isAct=idx===activeIndex;
      html+=[
        '<div class="cmd-item'+(isAct?' active':'')+'" role="option" data-idx="'+idx+'" aria-selected="'+(isAct?'true':'false')+'">',
          '<span class="cmd-item-icon">'+cmd.icon+'</span>',
          '<div class="cmd-item-info">',
            '<b class="cmd-item-title">'+T(cmd.title)+'</b>',
            '<small class="cmd-item-desc">'+T(cmd.desc)+'</small>',
          '</div>',
          '<span class="cmd-item-arrow">↵</span>',
        '</div>'
      ].join('');
    });
    list.innerHTML=html;

    list.querySelectorAll('.cmd-item').forEach(function(el){
      el.addEventListener('mouseenter',function(){
        var idx=+el.getAttribute('data-idx');
        if(!isNaN(idx)){activeIndex=idx;updateActive();}
      });
      el.addEventListener('click',function(){
        execute(filtered[activeIndex]);
      });
    });

    return filtered;
  }

  function updateActive(){
    var items=list.querySelectorAll('.cmd-item');
    items.forEach(function(el,i){
      var act=i===activeIndex;
      el.classList.toggle('active',act);
      el.setAttribute('aria-selected',act?'true':'false');
      if(act)el.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
  }

  var currentFiltered=[];

  function open(){
    m.hidden=false;
    document.body.style.overflow='hidden';
    input.value='';
    activeIndex=0;
    currentFiltered=renderList('');
    setTimeout(function(){input.focus();},50);
    if(window.playSfx)window.playSfx('switch');
  }

  function close(){
    m.hidden=true;
    document.body.style.overflow='';
  }

  function execute(cmd){
    if(!cmd)return;
    close();
    if(window.playSfx)window.playSfx('click');
    setTimeout(function(){cmd.run();},120);
  }

  input.addEventListener('input',function(){
    activeIndex=0;
    currentFiltered=renderList(input.value);
  });

  input.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){
      e.preventDefault();
      if(currentFiltered.length){
        activeIndex=(activeIndex+1)%currentFiltered.length;
        updateActive();
      }
    }else if(e.key==='ArrowUp'){
      e.preventDefault();
      if(currentFiltered.length){
        activeIndex=(activeIndex-1+currentFiltered.length)%currentFiltered.length;
        updateActive();
      }
    }else if(e.key==='Enter'){
      e.preventDefault();
      if(currentFiltered[activeIndex]){
        execute(currentFiltered[activeIndex]);
      }
    }else if(e.key==='Escape'){
      e.preventDefault();
      close();
    }
  });

  m.addEventListener('click',function(e){
    if(e.target===m)close();
  });

  document.addEventListener('keydown',function(e){
    // Cmd+K or Ctrl+K
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
      e.preventDefault();
      if(m.hidden)open();else close();
    }
  });

  window.openCommandPalette=open;
})();
