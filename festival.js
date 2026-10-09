// Khmer festival themes: menu, falling emoji, circular reveal, long-press on the hero to open the menu (like ABA Mobile)
(function(){
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  function initFestival(){
    var btn=document.getElementById('festBtn');
    var list=document.getElementById('festList');
    var layer=document.getElementById('fest');
    if(!btn||!list) return;

    var items=[].slice.call(list.querySelectorAll('li[data-fest]'));
    var toast=document.getElementById('toast');
    var openedAt=0;

    function say(m){if(!toast)return;toast.textContent=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1800);}

    function setOpen(open){
      if(open){
        list.removeAttribute('hidden');
        btn.setAttribute('aria-expanded','true');
        openedAt=Date.now();
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

    function apply(id,announce){
      if(!EMOJI.hasOwnProperty(id)) id='default';
      root.setAttribute('data-festival',id);
      try{localStorage.setItem('festival',id);}catch(e){}
      items.forEach(function(li){
        li.setAttribute('aria-selected',li.getAttribute('data-fest')===id?'true':'false');
      });
      rain(id);
      if(announce){
        var li=list.querySelector('li[data-fest="'+id+'"] b');
        if(li) say(li.textContent);
      }
    }

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      setOpen(list.hasAttribute('hidden'));
    });

    items.forEach(function(li){
      li.addEventListener('click', function(e){
        e.stopPropagation();
        var fid = li.getAttribute('data-fest');
        setOpen(false);
        if(window.themeSwap) window.themeSwap(function(){apply(fid,true);},btn);
        else apply(fid,true);
        btn.focus();
      });
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

    var cur = root.getAttribute('data-festival')||'default';
    apply(cur, false);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', initFestival);
  } else {
    initFestival();
  }
})();
