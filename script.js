(function(){
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Light / dark mode
  var themeBtn=document.getElementById('theme');
  var mq=matchMedia('(prefers-color-scheme: dark)');
  function setTheme(t,save){
    root.setAttribute('data-theme',t);
    themeBtn.setAttribute('aria-pressed',t==='dark'?'true':'false');
    if(save){try{localStorage.setItem('theme',t);}catch(e){}}
  }
  setTheme(root.getAttribute('data-theme')||(mq.matches?'dark':'light'),false);
  // Circular reveal from the clicked button (View Transitions API); instant change where unsupported
  window.themeSwap=function(change,origin){
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
  (mq.addEventListener?mq.addEventListener.bind(mq,'change'):mq.addListener.bind(mq))(function(e){
    var saved=null;try{saved=localStorage.getItem('theme');}catch(x){}
    if(!saved)setTheme(e.matches?'dark':'light',false);
  });

  // Typing line (EDIT the list)
  var words=['web apps with ASP.NET','KHQR payment systems','mobile apps with Flutter','forms and reports'];
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

  // 3D tilt on the photo card
  var tilt=document.querySelector('.tilt');
  if(tilt&&!reduce&&matchMedia('(hover:hover)').matches){
    tilt.addEventListener('pointermove',function(e){
      var r=tilt.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      tilt.style.transform='perspective(800px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)';
    });
    tilt.addEventListener('pointerleave',function(){tilt.style.transform='';});
  }

  // Project filters
  var chips=document.querySelectorAll('.chip'),cards=document.querySelectorAll('#projectGrid .card');
  chips.forEach(function(ch){
    ch.addEventListener('click',function(){
      chips.forEach(function(x){x.classList.remove('on');});ch.classList.add('on');
      var f=ch.dataset.f;
      cards.forEach(function(cd){
        cd.classList.toggle('hide',f!=='all'&&cd.dataset.cat.split(' ').indexOf(f)<0);
      });
    });
  });

  // Copy email
  var toast=document.getElementById('toast');
  function say(m){toast.textContent=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},2000);}
  document.getElementById('copyMail').addEventListener('click',function(){
    var mail='Penhvong46@gmail.com';
    if(navigator.clipboard){navigator.clipboard.writeText(mail).then(function(){say(window.t?window.t('Email copied'):'Email copied');},function(){say(mail);});}
    else{say(mail);}
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
})();
