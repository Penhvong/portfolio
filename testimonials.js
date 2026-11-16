// Testimonials: add REAL quotes below (with permission). While the list is empty the section stays hidden.
// Example:  {quote:'Penhvong delivered the KHQR flow on time and fixed every bug fast.', name:'Name Surname', role:'Manager, Chipmong'}
(function(){
  var TESTIMONIALS=[
  ];
  var sec=document.getElementById('voices'),box=document.getElementById('voiceList');
  if(!sec||!box||!TESTIMONIALS.length)return;
  TESTIMONIALS.forEach(function(t){
    var c=document.createElement('figure');c.className='card glow voice';
    var q=document.createElement('blockquote');q.textContent=t.quote;
    var f=document.createElement('figcaption');f.textContent=t.name+(t.role?' · '+t.role:'');
    c.appendChild(q);c.appendChild(f);box.appendChild(c);
  });
  sec.hidden=false;
})();
