// Khmer festival themes: menu, auto theme by Khmer calendar, falling emoji, circular reveal,
// long-press on the hero to open the menu (like ABA Mobile).
// Saved in the browser: festivalMode = 'auto' | 'manual', festival = theme id (only when manual).
(function(){
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cal=window.KhmerCalendar;
  var EMOJI={
    'default':[],
    'khmer-heritage':['🛕','🪷'],
    'retro-phnom-penh':['🎵','✨'],
    'meak-bochea':['🕯️','✨'],
    'khmer-new-year':['🌸','💦','✨'],
    'visak-bochea':['🪷','🕯️'],
    'royal-ploughing':['🌾','🐂'],
    'pchum-ben':['🙏','🍚'],
    'kathina':['🧡','🪔'],
    'water-festival':['🚣','🌊'],
    'ok-om-bok':['🌕','⭐'],
    'angkor-sankranta':['🛕','🎊'],
    'sea-festival':['🌊','🐚']
  };

  function read(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function store(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function drop(k){try{localStorage.removeItem(k);}catch(e){}}
  function todayTheme(){return cal?cal.forDate(cal.today()):'default';}
  // Auto is the default: only a theme the visitor picked from the menu is kept
  function isAuto(){return !(read('festivalMode')==='manual'&&EMOJI.hasOwnProperty(read('festival')));}

  function initFestival(){
    var btn=document.getElementById('festBtn');
    var list=document.getElementById('festList');
    var layer=document.getElementById('fest');
    if(!btn||!list) return;

    var items=[].slice.call(list.querySelectorAll('li[data-fest]'));
    var toast=document.getElementById('toast');
    var meta=document.querySelector('meta[name="theme-color"]');
    var openedAt=0,current='default';

    items.forEach(function(li){li.tabIndex=-1;});

    function say(m){if(!toast)return;toast.textContent=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1800);}
    function label(id){var b=list.querySelector('li[data-fest="'+id+'"] b');return b?b.textContent:id;}

    function setOpen(open){
      if(open){
        list.removeAttribute('hidden');
        btn.setAttribute('aria-expanded','true');
        openedAt=Date.now();
        var sel=list.querySelector('li[aria-selected="true"]')||items[0];
        if(sel)sel.focus({preventScroll:true});
      }else{
        list.setAttribute('hidden','true');
        btn.setAttribute('aria-expanded','false');
      }
    }

    function rain(id){
      if(!layer)return;
      layer.innerHTML='';
      var set=EMOJI[id]||[];
      if(!set.length||reduce)return;
      for(var i=0;i<16;i++){
        var s=document.createElement('span'),dur=10+Math.random()*10;
        s.textContent=set[i%set.length];
        s.style.left=(Math.random()*100)+'%';
        s.style.fontSize=(14+Math.random()*16)+'px';
        s.style.animationDuration=dur+'s';
        s.style.animationDelay='-'+(Math.random()*dur)+'s';
        s.style.setProperty('--dx',((Math.random()-.5)*120)+'px');
        layer.appendChild(s);
      }
    }

    // Menu marks: "Auto" is selected in auto mode and today's festival gets a side bar
    function mark(){
      var auto=isAuto();
      items.forEach(function(li){
        var id=li.getAttribute('data-fest');
        li.setAttribute('aria-selected',(auto?id==='auto':id===current)?'true':'false');
        if(auto&&id===current)li.setAttribute('aria-current','true');else li.removeAttribute('aria-current');
      });
    }

    // Browser bar colour follows the theme (light/dark and festival)
    function tint(){
      if(!meta)return;
      var c=getComputedStyle(root).getPropertyValue('--bg').trim();
      if(c)meta.setAttribute('content',c);
    }

    function apply(id){
      if(!EMOJI.hasOwnProperty(id)) id='default';
      current=id;
      root.setAttribute('data-festival',id);
      rain(id);
      mark();
      tint();
    }

    // What the visitor picked in the menu
    function choose(sel){
      if(sel==='auto'){
        store('festivalMode','auto');drop('festival');
        apply(todayTheme());
        say(label('auto')+': '+label(current));
      }else{
        store('festivalMode','manual');store('festival',sel);
        apply(sel);
        say(label(sel));
      }
    }

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      setOpen(list.hasAttribute('hidden'));
    });

    items.forEach(function(li){
      li.addEventListener('click', function(e){
        e.stopPropagation();
        var sel=li.getAttribute('data-fest');
        setOpen(false);
        var run=function(){choose(sel);};
        if(window.themeSwap) window.themeSwap(run,btn);
        else run();
        btn.focus();
      });
    });

    // Keyboard: arrows, Home/End and Enter/Space inside the menu
    list.addEventListener('keydown', function(e){
      var i=items.indexOf(document.activeElement);
      if(e.key==='ArrowDown'){e.preventDefault();items[Math.min(i+1,items.length-1)].focus();}
      else if(e.key==='ArrowUp'){e.preventDefault();items[Math.max(i-1,0)].focus();}
      else if(e.key==='Home'){e.preventDefault();items[0].focus();}
      else if(e.key==='End'){e.preventDefault();items[items.length-1].focus();}
      else if((e.key==='Enter'||e.key===' ')&&i>=0){e.preventDefault();items[i].click();}
    });

    // capture phase: the language menu calls stopPropagation, so a bubbling listener never closes this menu
    document.addEventListener('click', function(e){
      if(Date.now()-openedAt<500) return;   // ignore the click that ends a long-press
      if(!list.contains(e.target) && !btn.contains(e.target)) setOpen(false);
    }, true);
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape' && !list.hasAttribute('hidden')){ setOpen(false); btn.focus(); }
    });

    // Long-press on an empty part of the hero opens the theme menu (same gesture as ABA Mobile)
    var hero=document.querySelector('.hero-bg'),lp=null,sx=0,sy=0;
    function cancelLP(){if(lp){clearTimeout(lp);lp=null;}}
    if(hero){
      hero.addEventListener('pointerdown',function(e){
        var t=e.target;
        if(!(t===hero||t.id==='net'||(t.classList&&t.classList.contains('hero')))) return;
        sx=e.clientX;sy=e.clientY;cancelLP();
        lp=setTimeout(function(){
          lp=null;setOpen(true);
          say(window.t?window.t('Choose a festival theme'):'Choose a festival theme');
          if(navigator.vibrate)navigator.vibrate(15);
        },600);
      });
      hero.addEventListener('pointermove',function(e){if(lp&&Math.hypot(e.clientX-sx,e.clientY-sy)>10)cancelLP();});
      ['pointerup','pointercancel','pointerleave'].forEach(function(n){hero.addEventListener(n,cancelLP);});
    }

    // A tab left open past midnight (or a phone that wakes up the next day) moves to the new festival
    document.addEventListener('visibilitychange',function(){
      if(document.hidden||!isAuto())return;
      var id=todayTheme();
      if(id!==current)apply(id);
    });
    // Light/dark switch also changes the browser bar colour
    new MutationObserver(tint).observe(root,{attributes:true,attributeFilter:['data-theme']});

    apply(isAuto()?todayTheme():read('festival'));
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', initFestival);
  } else {
    initFestival();
  }
})();
