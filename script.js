(function(){
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Light / dark mode (Dark is default)
  var themeBtn=document.getElementById('theme');
  function setTheme(t,save){
    root.setAttribute('data-theme',t);
    themeBtn.setAttribute('aria-pressed',t==='dark'?'true':'false');
    if(save){try{localStorage.setItem('theme',t);}catch(e){}}
  }
  var savedTheme=null;try{savedTheme=localStorage.getItem('theme');}catch(e){}
  setTheme(savedTheme||root.getAttribute('data-theme')||'dark',false);

  // Circular reveal from the clicked button with button rotation
  window.themeSwap=function(change,origin){
    themeBtn.classList.add('theme-spin');
    setTimeout(function(){themeBtn.classList.remove('theme-spin');},600);
    if(typeof document.startViewTransition!=='function'||reduce){change();return;}
    var r=origin&&origin.getBoundingClientRect?origin.getBoundingClientRect():{left:innerWidth/2,top:0,width:0,height:0};
    var x=r.left+r.width/2,y=r.top+r.height/2;
    var rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    var t=document.startViewTransition(change);
    t.ready.then(function(){
      root.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+rad+'px at '+x+'px '+y+'px)']},
        {duration:650,easing:'cubic-bezier(.4,0,.2,1)',pseudoElement:'::view-transition-new(root)'});
    }).catch(function(){});
  };
  themeBtn.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='dark'?'light':'dark';
    window.themeSwap(function(){setTheme(next,true);},themeBtn);
  });

  // Typing line (EDIT the list)
  var words=['web apps with ASP.NET','KHQR payment systems','mobile apps with Flutter','IT Innovation Strategies'];
  var el=document.getElementById('typed'),w=0,c=0,del=false;
  (function type(){
    var list=(window.getTypedWords&&window.getTypedWords())||words;var word=list[w%list.length];
    el.textContent=word.slice(0,c);
    if(!del&&c<word.length){c++;setTimeout(type,70);}
    else if(!del){del=true;setTimeout(type,1400);}
    else if(c>0){c--;setTimeout(type,35);}
    else{del=false;w=(w+1)%list.length;setTimeout(type,300);}
  })();

  // Reveal + animations
  function countUp(n){
    var to=+n.dataset.count,t0=null;
    function step(t){
      if(!t0)t0=t;var p=Math.min((t-t0)/1000,1);
      n.textContent=Math.round(to*p);
      if(p<1)requestAnimationFrame(step);
    }
    reduce?(n.textContent=to):requestAnimationFrame(step);
  }
  function animate(sec){
    sec.querySelectorAll('.spectrum').forEach(function(s){s.querySelector('.dot').style.left=s.dataset.pos+'%';});
    sec.querySelectorAll('.skill').forEach(function(s){s.querySelector('.bar i').style.width=s.dataset.level+'%';});
    sec.querySelectorAll('[data-count]').forEach(countUp);
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');animate(e.target);io.unobserve(e.target);}});
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(s){io.observe(s);});

  // Cursor spotlight on cards
  document.addEventListener('pointermove',function(e){
    var g=e.target.closest&&e.target.closest('.glow');
    if(!g)return;
    var r=g.getBoundingClientRect();
    g.style.setProperty('--mx',(e.clientX-r.left)+'px');
    g.style.setProperty('--my',(e.clientY-r.top)+'px');
  });

  // 3D tilt and specular glare on the photo card
  var tilt=document.querySelector('.tilt');
  if(tilt&&!reduce&&matchMedia('(hover:hover)').matches){
    tilt.addEventListener('pointermove',function(e){
      var r=tilt.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      tilt.style.transform='perspective(800px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg) translateZ(6px)';
      tilt.style.setProperty('--glare-x', ((x+0.5)*100).toFixed(1)+'%');
      tilt.style.setProperty('--glare-y', ((y+0.5)*100).toFixed(1)+'%');
    });
    tilt.addEventListener('pointerleave',function(){
      tilt.style.transform='';
      tilt.style.removeProperty('--glare-x');
      tilt.style.removeProperty('--glare-y');
    });
  }

  // Dual photo switcher (Studio Portrait vs Desk Workstation)
  var switchBtns=document.querySelectorAll('.photo-switcher .switch-btn');
  var heroPhoto=document.getElementById('heroPhoto');
  if(switchBtns.length&&heroPhoto){
    function setPhoto(btn){
      var src=btn.getAttribute('data-src'),alt=btn.getAttribute('data-alt');
      if(!src||heroPhoto.getAttribute('src')===src)return;
      switchBtns.forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false');});
      btn.classList.add('active');btn.setAttribute('aria-selected','true');
      if(window.playSfx)window.playSfx('switch');
      heroPhoto.style.opacity='0.25';
      heroPhoto.style.transform='scale(0.97)';
      setTimeout(function(){
        heroPhoto.src=src;
        if(alt)heroPhoto.alt=alt;
        heroPhoto.style.opacity='1';
        heroPhoto.style.transform='scale(1)';
      },150);
    }
    switchBtns.forEach(function(btn){
      btn.addEventListener('click',function(e){e.stopPropagation();setPhoto(btn);});
    });
    // Clicking photo directly toggles to the other view
    var wrapper=document.querySelector('.photo-wrapper');
    if(wrapper){
      wrapper.style.cursor='pointer';
      wrapper.title=window.t?window.t('Click to switch photo'):'Click to switch photo';
      wrapper.addEventListener('click',function(){
        var nextBtn=[].find.call(switchBtns,function(b){return !b.classList.contains('active');});
        if(nextBtn)setPhoto(nextBtn);
      });
    }
  }

  // Project search and category filters
  var chips=document.querySelectorAll('.filters .chip'),cards=document.querySelectorAll('#projectGrid .card');
  var projectSearch=document.getElementById('projectSearch');
  var projectCount=document.getElementById('projectCount');
  var projectEmpty=document.getElementById('projectEmpty');
  var projectReset=document.getElementById('projectReset');
  var activeProjectFilter='all';
  function updateProjects(){
    var query=projectSearch.value.trim().toLocaleLowerCase(),visible=0;
    cards.forEach(function(card){
      var categoryMatch=activeProjectFilter==='all'||card.dataset.cat.split(' ').indexOf(activeProjectFilter)>=0;
      var searchable=(card.textContent+' '+card.dataset.cat).toLocaleLowerCase();
      var matches=categoryMatch&&(!query||searchable.indexOf(query)>=0);
      card.classList.toggle('hide',!matches);
      if(matches)visible++;
    });
    projectCount.textContent=visible+' '+(visible===1?(window.t?window.t('project found'):'project found'):(window.t?window.t('projects found'):'projects found'));
    projectEmpty.hidden=visible!==0;
  }
  chips.forEach(function(ch){
    ch.addEventListener('click',function(){
      chips.forEach(function(x){x.classList.remove('on');x.setAttribute('aria-pressed','false');});
      ch.classList.add('on');ch.setAttribute('aria-pressed','true');
      activeProjectFilter=ch.dataset.f;
      updateProjects();
    });
  });
  projectSearch.addEventListener('input',updateProjects);
  projectReset.addEventListener('click',function(){
    projectSearch.value='';activeProjectFilter='all';
    chips.forEach(function(ch){
      var active=ch.dataset.f==='all';
      ch.classList.toggle('on',active);ch.setAttribute('aria-pressed',active?'true':'false');
    });
    updateProjects();projectSearch.focus();
  });
  document.addEventListener('keydown',function(e){
    var target=e.target;
    if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&target.tagName!=='INPUT'&&target.tagName!=='TEXTAREA'&&target.tagName!=='SELECT'&&!target.isContentEditable){
      e.preventDefault();projectSearch.focus();
    }
    if(e.key==='Escape'&&document.activeElement===projectSearch){
      projectSearch.value='';updateProjects();
    }
  });
  document.addEventListener('langchange',updateProjects);
  updateProjects();

  // Copy email
  var toast=document.getElementById('toast');
  function say(m){toast.textContent=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},2000);}
  document.getElementById('copyMail').addEventListener('click',function(){
    var mail='Penhvong46@gmail.com';
    if(navigator.clipboard){navigator.clipboard.writeText(mail).then(function(){say(window.t?window.t('Email copied'):'Email copied');},function(){say(mail);});}
    else{say(mail);}
  });
  document.getElementById('saveContact').addEventListener('click',function(){
    var card=[
      'BEGIN:VCARD','VERSION:3.0','N:YOEURNG;Chanpenhvong;;;','FN:Chanpenhvong YOEURNG',
      'TITLE:Developer, IT - Innovation Strategy','EMAIL;TYPE=INTERNET,WORK:Penhvong46@gmail.com',
      'TEL;TYPE=CELL,VOICE:+855963055462','URL:https://github.com/Chanpenhvong',
      'IMPP:tg://resolve?domain=Chan_Penhvong','END:VCARD',''
    ].join('\r\n');
    var file=new Blob([card],{type:'text/vcard;charset=utf-8'}),url=URL.createObjectURL(file),link=document.createElement('a');
    link.href=url;link.download='Chanpenhvong-YOEURNG.vcf';document.body.appendChild(link);link.click();link.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    say(window.t?window.t('Contact card downloaded'):'Contact card downloaded');
  });

  // Scroll progress + active nav
  var bar=document.getElementById('progress');
  var links=[].slice.call(document.querySelectorAll('.nav nav a'));
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'));});
  function onScroll(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;bar.style.width=(max>0?h.scrollTop/max*100:0)+'%';
    var y=h.scrollTop+120,idx=-1;
    secs.forEach(function(s,i){if(s&&s.offsetTop<=y)idx=i;});
    links.forEach(function(a,i){a.classList.toggle('active',i===idx);});
  }
  var ticking=false;   // one update per frame, not one per scroll event
  window.addEventListener('scroll',function(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){ticking=false;onScroll();});
  },{passive:true});
  onScroll();          // correct bar and menu when the page reloads in the middle

  // Hero network background (pauses off screen and in background tabs, sharp on retina screens)
  var cv=document.getElementById('net');
  if(cv&&!reduce){
    var ctx=cv.getContext('2d'),pts=[],W,H,mouse={x:-999,y:-999},rgb='15,139,141',acc='242,165,65',fr=0,running=false,seen=true,rt;
    function hex2rgb(h){var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec((h||'').trim());return m?parseInt(m[1],16)+','+parseInt(m[2],16)+','+parseInt(m[3],16):null;}
    function size(){
      var dpr=Math.min(window.devicePixelRatio||1,2);
      W=cv.offsetWidth;H=cv.offsetHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.min(70,Math.floor(W*H/16000));pts=[];
      for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4});
    }
    size();
    addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,150);});
    cv.parentElement.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
    function draw(){
      if(!running)return;
      if(fr++%30===0){var cs=getComputedStyle(root);rgb=cs.getPropertyValue('--net').trim()||rgb;acc=hex2rgb(cs.getPropertyValue('--accent'))||acc;}
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<pts.length;i++){
        var p=pts[i];p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
        ctx.fillStyle='rgba('+rgb+',.6)';ctx.beginPath();ctx.arc(p.x,p.y,2,0,6.283);ctx.fill();
        for(var j=i+1;j<pts.length;j++){
          var q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
          if(d<120){ctx.strokeStyle='rgba('+rgb+','+(.25*(1-d/120))+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
        }
        var m=Math.hypot(p.x-mouse.x,p.y-mouse.y);
        if(m<150){ctx.strokeStyle='rgba('+acc+','+(.5*(1-m/150))+')';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();}
      }
      requestAnimationFrame(draw);
    }
    function go(){if(!running&&seen&&!document.hidden){running=true;requestAnimationFrame(draw);}}
    function halt(){running=false;}
    new IntersectionObserver(function(es){seen=es[0].isIntersecting;seen?go():halt();}).observe(cv);
    document.addEventListener('visibilitychange',function(){document.hidden?halt():go();});
    go();
  }

  // Cursor spotlight for modern interactive cards
  if(!reduce){
    document.addEventListener('pointermove', function(e){
      var target = e.target;
      if(!target || !target.closest) return;
      var card = target.closest('.bento-card, .card, .pipe-container, .wb-container, .tk, .pipe-card');
      if(card){
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      }
    }, {passive:true});
  }

  // Fluid button click ripple effect
  document.addEventListener('click', function(e){
    var btn = e.target.closest && e.target.closest('.btn, .chip, .hud-cmd-pill, .dock-btn, .switch-btn');
    if(!btn) return;
    var rect = btn.getBoundingClientRect();
    var circle = document.createElement('span');
    var d = Math.max(rect.width, rect.height) * 2;
    circle.style.width = circle.style.height = d + 'px';
    circle.style.left = (e.clientX - rect.left - d/2) + 'px';
    circle.style.top = (e.clientY - rect.top - d/2) + 'px';
    circle.className = 'btn-ripple-wave';
    btn.appendChild(circle);
    setTimeout(function(){ if(circle.parentNode) circle.parentNode.removeChild(circle); }, 600);
  }, true);

  // 3D perspective tilt for interactive cards
  if(!reduce && matchMedia('(hover:hover) and (min-width: 768px)').matches){
    document.addEventListener('pointermove', function(e){
      var card = e.target.closest && e.target.closest('.card.glow, .bento-card, .pipe-card');
      if(!card) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(900px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) translateY(-4px)';
    }, {passive:true});

    document.addEventListener('pointerout', function(e){
      var card = e.target.closest && e.target.closest('.card.glow, .bento-card, .pipe-card');
      if(card && (!e.relatedTarget || !card.contains(e.relatedTarget))){
        card.style.transform = '';
      }
    }, {passive:true});
  }

  // Luminous Cursor Halo Follower (Desktop only)
  if(!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches){
    var halo = document.createElement('div');
    halo.className = 'cursor-halo';
    document.body.appendChild(halo);

    var hx = -100, hy = -100, mx = -100, my = -100;
    document.addEventListener('pointermove', function(e){
      mx = e.clientX;
      my = e.clientY;
      var isHover = e.target.closest && e.target.closest('a, button, .card, .bento-card, .pipe-card, .switch-btn, .chip, .timeline-item');
      halo.classList.toggle('hovering', !!isHover);
    }, {passive:true});

    function renderHalo(){
      hx += (mx - hx) * 0.22;
      hy += (my - hy) * 0.22;
      halo.style.transform = 'translate3d(' + hx + 'px, ' + hy + 'px, 0) translate(-50%, -50%)';
      requestAnimationFrame(renderHalo);
    }
    renderHalo();
  }
})();
