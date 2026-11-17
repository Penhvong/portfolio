// Project detail popup: click (or press Enter on) a project card to see it bigger.
// It copies the card's own text, so it follows the language you picked (EN / ខ្មែរ / 中文).
(function(){
  var grid=document.getElementById('projectGrid');if(!grid)return;
  var m=document.createElement('div');
  m.id='pmodal';m.hidden=true;m.style.cssText='display:none;position:fixed;inset:0;z-index:40;place-items:center;padding:20px;background:rgba(6,12,24,.6)';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
  m.innerHTML='<div class="pm-box"><button type="button" class="pm-x" aria-label="Close">&times;</button><div class="pm-body"></div><div class="pm-actions"><button type="button" class="pm-share"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M5 13v6h14v-6"/></svg><span></span></button><p class="pm-status" role="status" aria-live="polite"></p></div></div>';
  document.body.appendChild(m);
  var body=m.querySelector('.pm-body'),x=m.querySelector('.pm-x'),share=m.querySelector('.pm-share'),status=m.querySelector('.pm-status'),shareLabel=share.querySelector('span'),last=null,returnHash='#projects';
  function projectUrl(card){
    var url=new URL(window.location.href);
    url.hash='project='+encodeURIComponent(card.dataset.projectId);
    return url.href;
  }
  function open(card,fromLocation){
    if(!card)return;
    last=card;body.innerHTML='';
    var c=card.cloneNode(true);c.className='pm-card';c.removeAttribute('tabindex');c.removeAttribute('role');
    
    // Enrich with interactive architecture action bar
    var pid=card.dataset.projectId;
    var actionsRow=document.createElement('div');
    actionsRow.className='pm-action-row';
    
    var labLink=document.createElement('a');
    labLink.className='btn primary';
    labLink.href='#workbench';
    labLink.innerHTML='<span>Inspect Code in Lab ⚡</span>';
    labLink.addEventListener('click',function(){
      close();
      var snipKey=pid==='khqr-payment-integration'?'khqr':(pid==='field-sales-mobile-app'?'flutter':'sql');
      var tab=document.querySelector('.wb-tab[data-snip="'+snipKey+'"]');
      if(tab)tab.click();
    });
    actionsRow.appendChild(labLink);

    var flowLink=document.createElement('a');
    flowLink.className='btn';
    flowLink.href='#architecture';
    flowLink.innerHTML='<span>View Process Flow 🚀</span>';
    flowLink.addEventListener('click',function(){
      close();
      if(window.ProcessPipeline)window.ProcessPipeline.runSimulation();
    });
    actionsRow.appendChild(flowLink);

    c.appendChild(actionsRow);
    body.appendChild(c);
    
    if(window.playSfx)window.playSfx('scan');
    status.textContent='';shareLabel.textContent=window.t?window.t('Copy project link'):'Copy project link';
    if(!fromLocation){
      returnHash=window.location.hash&&window.location.hash.indexOf('#project=')!==0?window.location.hash:'#projects';
      window.history.pushState({projectId:card.dataset.projectId},'',projectUrl(card));
    }
    m.hidden=false;m.style.display='grid';document.body.style.overflow='hidden';x.focus();
  }
  function close(restoreLocation){
    m.hidden=true;m.style.display='none';document.body.style.overflow='';
    if(restoreLocation!==false&&window.location.hash.indexOf('#project=')===0)window.history.replaceState({},'',window.location.pathname+window.location.search+returnHash);
    if(last)last.focus();
  }
  function cardFromLocation(){
    var match=window.location.hash.match(/^#project=([^&]+)/);if(!match)return null;
    var id;try{id=decodeURIComponent(match[1]);}catch(e){return null;}
    return [].find.call(grid.querySelectorAll('.card'),function(card){return card.dataset.projectId===id;})||null;
  }
  function syncLocation(){var card=cardFromLocation();if(card)open(card,true);else if(!m.hidden)close(false);}
  function copyLink(){
    if(!last)return;
    var link=projectUrl(last);
    function fallback(){
      var field=document.createElement('textarea');field.value=link;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();
      var copied=false;try{copied=document.execCommand('copy');}catch(e){}
      field.remove();return copied?Promise.resolve():Promise.reject();
    }
    var copy=navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(link).catch(fallback):fallback();
    copy.then(function(){status.textContent=window.t?window.t('Project link copied'):'Project link copied';}).catch(function(){status.textContent=window.t?window.t('Unable to copy project link'):'Unable to copy project link';});
  }
  [].forEach.call(grid.querySelectorAll('.card'),function(c){c.tabIndex=0;c.setAttribute('role','button');c.style.cursor='pointer';});
  grid.addEventListener('click',function(e){var c=e.target.closest('.card');if(c)open(c);});
  grid.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;var c=e.target.closest('.card');if(c){e.preventDefault();open(c);}
  });
  x.addEventListener('click',close);
  share.addEventListener('click',copyLink);
  m.addEventListener('click',function(e){if(e.target===m)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)close();});
  document.addEventListener('langchange',function(){if(!m.hidden)close();});
  window.addEventListener('popstate',syncLocation);
  window.addEventListener('hashchange',syncLocation);
  syncLocation();
})();
