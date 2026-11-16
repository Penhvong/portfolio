// Admin inbox for the local database. Talks only to your own server (server.js).
// All visitor text is shown with textContent (never innerHTML), so a malicious message cannot run code.
(function(){
  var $=function(i){return document.getElementById(i);};
  function call(path,body){
    return fetch('/api/admin/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'admin'},credentials:'same-origin',body:JSON.stringify(body||{})})
      .then(function(r){return r.json().catch(function(){return {};}).then(function(j){
        if(r.status===401&&path!=='login'){show(false);throw new Error('Please log in again.');}
        if(r.status===429)throw new Error('Too many tries. Wait 10 minutes.');
        if(!r.ok||j.ok===false)throw new Error(path==='login'?'Wrong email or password.':'Request failed ('+r.status+')');
        return j;});});
  }
  function show(inn){$('login').hidden=inn;$('app').hidden=!inn;$('bar').hidden=!inn;}
  $('login').addEventListener('submit',function(e){
    e.preventDefault();$('lerr').textContent='';
    call('login',{email:$('em').value.trim(),password:$('pw').value}).then(function(j){$('pw').value='';start(j.email);})
      .catch(function(er){$('lerr').textContent=er.message;});
  });
  $('out').addEventListener('click',function(){call('logout').catch(function(){}).then(function(){$('list').textContent='';show(false);});});
  $('ref').addEventListener('click',list);$('flt').addEventListener('change',list);
  function btn(t,c,fn){var b=document.createElement('button');b.type='button';b.textContent=t;if(c)b.className=c;b.addEventListener('click',fn);return b;}
  function list(){
    $('aerr').textContent='';
    call('messages',{status:$('flt').value}).then(function(j){
      var rows=j.rows,box=$('list');box.textContent='';$('count').textContent=rows.length+' message'+(rows.length===1?'':'s');
      if(!rows.length){var p=document.createElement('p');p.className='meta';p.textContent='No messages here.';box.appendChild(p);return;}
      rows.forEach(function(m){
        var c=document.createElement('article');c.className='card';var h=document.createElement('div');h.className='row';
        var t=document.createElement('b');t.textContent=m.name;
        var s=document.createElement('span');s.className='tag '+(m.status==='new'?'new':'');s.textContent=m.status;
        var i=document.createElement('span');i.className='tag';i.textContent=m.interest||'Other';
        h.appendChild(t);h.appendChild(s);h.appendChild(i);
        var meta=document.createElement('div');meta.className='meta';meta.textContent=m.contact+' · '+new Date(m.created_at).toLocaleString();
        var body=document.createElement('div');body.className='msg';body.textContent=m.message;
        var act=document.createElement('div');act.className='row';
        act.appendChild(btn(m.status==='new'?'Mark done':'Mark new','p',function(){act1('status',{id:m.id,status:m.status==='new'?'done':'new'});}));
        act.appendChild(btn('Delete','d',function(){if(confirm('Delete this message for good?'))act1('delete',{id:m.id});}));
        c.appendChild(h);c.appendChild(meta);c.appendChild(body);c.appendChild(act);box.appendChild(c);
      });
    }).catch(function(er){$('aerr').textContent=er.message;});
  }
  function act1(p,b){call(p,b).then(list).catch(function(er){$('aerr').textContent=er.message;});}
  function start(email){show(true);$('who').textContent=email;list();}
  call('me').then(function(j){start(j.email);}).catch(function(){show(false);});
})();
