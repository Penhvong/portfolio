// Interactive Desk Workstation Hotspots
// Adds interactive glowing discovery pins on Chanpenhvong's desk photo
(function(){
  var PINS=[
    {id:'p1',x:28,y:35,icon:'🖥️',title:'Dual Dev Displays',desc:'VS Code, Visual Studio, SQL Server, and enterprise environments.'},
    {id:'p2',x:52,y:72,icon:'⌨️',title:'Mechanical Workspace',desc:'Ergonomic tactile setup engineered for high-throughput coding.'},
    {id:'p3',x:82,y:58,icon:'📱',title:'Mobile Test Rig',desc:'Real device debugging for Flutter cross-platform applications.'},
    {id:'p4',x:75,y:30,icon:'💳',title:'KHQR POS Testbed',desc:'Direct terminal testing for national QR merchant payment flows.'}
  ];

  function init(){
    var wrapper=document.querySelector('.photo-wrapper');
    var photo=document.getElementById('heroPhoto');
    if(!wrapper||!photo)return;

    var container=document.createElement('div');
    container.className='desk-hotspots';
    container.setAttribute('aria-hidden','true');

    PINS.forEach(function(pin){
      var el=document.createElement('div');
      el.className='desk-pin';
      el.style.left=pin.x+'%';
      el.style.top=pin.y+'%';
      el.innerHTML=[
        '<button type="button" class="pin-btn" aria-label="'+pin.title+'">',
          '<span class="pin-radar"></span>',
          '<span class="pin-dot">+</span>',
        '</button>',
        '<div class="pin-card">',
          '<span class="pin-icon">'+pin.icon+'</span>',
          '<b>'+pin.title+'</b>',
          '<p>'+pin.desc+'</p>',
        '</div>'
      ].join('');

      el.querySelector('.pin-btn').addEventListener('click',function(e){
        e.stopPropagation();
        el.classList.toggle('active');
        if(window.playSfx)window.playSfx('tick');
      });

      container.appendChild(el);
    });

    wrapper.appendChild(container);

    function updateVisibility(){
      var isDesk=photo.getAttribute('src').indexOf('photo-work')>=0;
      container.classList.toggle('show',isDesk);
    }

    new MutationObserver(updateVisibility).observe(photo,{attributes:true,attributeFilter:['src']});
    updateVisibility();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
