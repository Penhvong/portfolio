// Sample sales dashboard (made-up numbers) in the style of the Sell-In / Sell-Out reports.
// Pure JavaScript + SVG, no library. Change the category to update every number and chart.
(function(){
  var chartEl=document.getElementById('dbChart');if(!chartEl)return;
  var sel=document.getElementById('dbCat'),kpi=document.getElementById('dbKpi'),rank=document.getElementById('dbRank');
  var T=function(s){return window.t?window.t(s):s;};
  var CATS=['Beverages','Snacks','Personal care','Household'];
  var DIST=['Chamkar Mon','Daun Penh','Sen Sok','Tuol Kork','Mean Chey'];
  var MON=['J','F','M','A','M','J','J','A','S','O','N','D'];
  var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  var DATA={};                       // DATA[cat][district] = [{i,o} x 12]
  CATS.forEach(function(c,ci){DATA[c]={};DIST.forEach(function(d,di){
    var base=900+ci*350+di*180;DATA[c][d]=MON.map(function(_,m){
      var i=Math.round(base*(1+.25*Math.sin(m/1.9+ci))*(.85+rnd()*.3));
      return {i:i,o:Math.round(i*(.7+rnd()*.25))};});});});
  CATS.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});
  var all=document.createElement('option');all.value='all';all.textContent='All categories';sel.insertBefore(all,sel.firstChild);sel.value='all';
  function usd(n){return '$'+Math.round(n).toLocaleString('en-US');}
  function sum(cat){
    var months=MON.map(function(){return {i:0,o:0};}),byD={};
    DIST.forEach(function(d){byD[d]={i:0,o:0};});
    (cat==='all'?CATS:[cat]).forEach(function(c){DIST.forEach(function(d){DATA[c][d].forEach(function(v,m){
      months[m].i+=v.i;months[m].o+=v.o;byD[d].i+=v.i;byD[d].o+=v.o;});});});
    return {months:months,byD:byD};
  }
  function el(tag,attrs,txt){var e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(txt!=null)e.textContent=txt;return e;}
  function render(){
    var s=sum(sel.value),ti=0,to=0;s.months.forEach(function(m){ti+=m.i;to+=m.o;});
    kpi.innerHTML='';
    [[T('Sell-in'),usd(ti)],[T('Sell-out'),usd(to)],[T('Sell-through'),Math.round(to/ti*100)+'%']].forEach(function(k){
      var d=document.createElement('div');d.className='db-k';var b=document.createElement('b');b.textContent=k[1];var sp=document.createElement('span');sp.textContent=k[0];d.appendChild(b);d.appendChild(sp);kpi.appendChild(d);});
    // monthly bars
    var W=560,H=220,pl=8,pb=26,max=0;s.months.forEach(function(m){max=Math.max(max,m.i,m.o);});
    chartEl.innerHTML='';var bw=(W-pl*2)/12;
    s.months.forEach(function(m,k){
      var x=pl+k*bw,hi=(H-pb-10)*m.i/max,ho=(H-pb-10)*m.o/max;
      var r1=el('rect',{x:x+bw*.12,y:H-pb-hi,width:bw*.36,height:hi,rx:3,fill:'var(--primary)'});r1.appendChild(el('title',{},T('Sell-in')+' '+MON[k]+': '+usd(m.i)));
      var r2=el('rect',{x:x+bw*.5,y:H-pb-ho,width:bw*.36,height:ho,rx:3,fill:'var(--accent)'});r2.appendChild(el('title',{},T('Sell-out')+' '+MON[k]+': '+usd(m.o)));
      chartEl.appendChild(r1);chartEl.appendChild(r2);
      chartEl.appendChild(el('text',{x:x+bw/2,y:H-8,'text-anchor':'middle','font-size':12,fill:'var(--muted)'},MON[k]));
    });
    // district ranking by sell-out
    var list=DIST.slice().sort(function(a,b){return s.byD[b].o-s.byD[a].o;}),top=s.byD[list[0]].o;
    rank.innerHTML='';
    list.forEach(function(d){
      var row=document.createElement('div');row.className='db-row';
      var n=document.createElement('span');n.textContent=d;
      var bar=document.createElement('i');bar.style.width=(s.byD[d].o/top*100)+'%';
      var v=document.createElement('em');v.textContent=usd(s.byD[d].o);
      row.appendChild(n);row.appendChild(bar);row.appendChild(v);rank.appendChild(row);});
    all.textContent=T('All categories');
    document.getElementById('dbLegend').innerHTML='';
    [[T('Sell-in'),'var(--primary)'],[T('Sell-out'),'var(--accent)']].forEach(function(l){
      var s2=document.createElement('span');var dot=document.createElement('i');dot.style.background=l[1];s2.appendChild(dot);s2.appendChild(document.createTextNode(' '+l[0]));document.getElementById('dbLegend').appendChild(s2);});
  }
  sel.addEventListener('change',render);document.addEventListener('langchange',render);render();
})();
