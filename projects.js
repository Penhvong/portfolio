// Project detail popup: click (or press Enter on) a project card to see it bigger.
// Enriched with architectural specs, metric scorecards, system dataflow breadcrumbs, and live simulator links.
(function(){
  var grid=document.getElementById('projectGrid');if(!grid)return;
  var m=document.createElement('div');
  m.id='pmodal';m.hidden=true;m.style.cssText='display:none;position:fixed;inset:0;z-index:40;place-items:center;padding:20px;background:rgba(6,12,24,.6)';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
  m.innerHTML='<div class="pm-box glow"><button type="button" class="pm-x" aria-label="Close">&times;</button><div class="pm-body"></div><div class="pm-actions"><button type="button" class="pm-share"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M5 13v6h14v-6"/></svg><span></span></button><p class="pm-status" role="status" aria-live="polite"></p></div></div>';
  document.body.appendChild(m);
  var body=m.querySelector('.pm-body'),x=m.querySelector('.pm-x'),share=m.querySelector('.pm-share'),status=m.querySelector('.pm-status'),shareLabel=share.querySelector('span'),last=null,returnHash='#projects';

  var PROJECT_SPECS = {
    'khqr-payment-integration': {
      eyebrow: 'Fintech & National Switch Integration',
      role: 'Lead Payment Systems Architect @ Chipmong',
      highlights: [
        'Engineered high-throughput ASP.NET Core 8 Kestrel API Gateway with 1.4ms ingress latency',
        'Implemented EMVCo-compliant TLV payload generation with strict CRC16-CCITT polynomial validation',
        'Integrated real-time NBC Bakong Webhook settlement engine with HMAC-SHA256 signature verification',
        'Automated daily reconciliation pipeline committing settled transactions to SQL Server 2022'
      ],
      metrics: [
        { lbl: 'Settlement Speed', val: '18ms (Instant)' },
        { lbl: 'Uptime SLA', val: '99.98%' },
        { lbl: 'Security Standard', val: 'EMVCo / HMAC' }
      ],
      architecture: ['POS Client', 'ASP.NET Core Gateway', 'NBC Bakong Switch', 'SQL Server 2022'],
      liveDemoAnchor: '#demo'
    },
    'field-sales-mobile-app': {
      eyebrow: 'Cross-Platform Mobility & Offline Sync',
      role: 'Mobile Software Developer @ ICCKH',
      highlights: [
        'Architected cross-platform mobile client in Flutter with reactive Dart BLoC state management',
        'Implemented local SQLite store-and-forward queueing ensuring 100% data integrity during network drops',
        'Engineered automated geospatial GPS check-in/out geo-fencing for sales reps across 14 districts',
        'Constructed background synchronization worker packaging AES-256 encrypted visit packets'
      ],
      metrics: [
        { lbl: 'Field Coverage', val: '14 Districts' },
        { lbl: 'Offline Queue', val: 'SQLite Drift' },
        { lbl: 'State Pattern', val: 'BLoC Pattern' }
      ],
      architecture: ['Flutter Client', 'SQLite Local Cache', 'Isolate Sync Worker', 'ICCKH REST API'],
      liveDemoAnchor: '#mobileDemo'
    },
    'samaki-appointment-booking': {
      eyebrow: 'Full-Stack Enterprise Web Architecture',
      role: 'Lead Architect & Engineer @ Norton University Capstone',
      highlights: [
        'Engineered full-stack customer appointment scheduler and real-time staff dispatch platform in C# ASP.NET',
        'Designed normalized relational schema with ACID transactional integrity in MS SQL Server',
        'Implemented role-based identity authentication and multi-tier department approval workflows',
        'Built responsive client booking portal with real-time slot conflict resolution'
      ],
      metrics: [
        { lbl: 'Architecture', val: 'N-Tier Layered' },
        { lbl: 'Database', val: 'SQL Server' },
        { lbl: 'Framework', val: 'ASP.NET MVC' }
      ],
      architecture: ['Client Browser', 'ASP.NET MVC Controller', 'Business Logic Layer', 'SQL Server Database']
    },
    'procurement-management': {
      eyebrow: 'Enterprise Operations & Supply Chain',
      role: 'Enterprise Systems Developer @ ICCKH',
      highlights: [
        'Architected multi-department purchase requisition and approval workflow in ASP.NET MVC',
        'Integrated dynamic approver hierarchy with automated signature validation routing',
        'Engineered real-time purchase order status tracking and budget commitment audit logs',
        'Developed operational export reports supporting multi-currency procurement flows'
      ],
      metrics: [
        { lbl: 'Workflow Engine', val: 'Multi-Tier RBAC' },
        { lbl: 'Audit Trail', val: '100% Immutable' },
        { lbl: 'Stack', val: 'C# / ASP.NET' }
      ],
      architecture: ['Department Requester', 'Approval Router', 'Procurement Core', 'Enterprise Database']
    },
    'sell-in-sell-out-report': {
      eyebrow: 'High-Throughput Analytics & T-SQL Tuning',
      role: 'Database Developer @ ICCKH',
      highlights: [
        'Engineered high-performance analytical window queries (SUM OVER, DENSE_RANK) in SQL Server 2022',
        'Optimized clustered indexes and partitioned schemas for sub-14ms reporting query execution',
        'Automated multi-warehouse stock allocation and district sell-through calculation engines',
        'Delivered automated scheduled Crystal Reports and RDLC exports for executive management'
      ],
      metrics: [
        { lbl: 'Query Latency', val: '< 14ms' },
        { lbl: 'Engine', val: 'SQL Server 2022' },
        { lbl: 'Functions', val: 'T-SQL Windowing' }
      ],
      architecture: ['ERP Invoices', 'T-SQL Analytical Queries', 'Index Optimization', 'Executive Dashboard'],
      liveDemoAnchor: '#dashboard'
    },
    'visit-tracking-map-report': {
      eyebrow: 'Geospatial Analytics & Field Tracking',
      role: 'Full-Stack Developer @ ICCKH',
      highlights: [
        'Engineered interactive Leaflet.js map visualization rendering field sales travel routes and numbered visit pins',
        'Implemented geospatial distance calculation and visit duration metrics across Phnom Penh districts',
        'Constructed automated daily sales rep efficiency scoring and visit compliance reporting',
        'Integrated RESTful telemetry endpoints accepting encrypted GPS coordinate packets'
      ],
      metrics: [
        { lbl: 'Map Engine', val: 'Leaflet.js' },
        { lbl: 'Telemetry', val: 'GPS Coordinates' },
        { lbl: 'Backend', val: 'ASP.NET Core' }
      ],
      architecture: ['GPS Mobile Device', 'Telemetry Ingress', 'Geospatial Aggregator', 'Interactive Map UI']
    },
    'price-request-approval': {
      eyebrow: 'Transactional Document Generation & Signatures',
      role: 'Enterprise Software Developer @ ICCKH',
      highlights: [
        'Engineered dynamic price negotiation and quotation request workflow with multi-level approval hierarchies',
        'Developed native high-resolution Khmer language Unicode PDF generation engine with digital signature stamping',
        'Constructed real-time WebSocket notifications alerting department heads of pending urgent price reviews',
        'Implemented strict versioning audit logs tracking discount tolerances and profit margin thresholds'
      ],
      metrics: [
        { lbl: 'PDF Engine', val: 'Khmer Unicode PDF' },
        { lbl: 'Routing', val: 'Hierarchical RBAC' },
        { lbl: 'Platform', val: 'ASP.NET Web' }
      ],
      architecture: ['Sales Portal', 'Approval Hierarchy', 'Khmer PDF Generator', 'Audit Store']
    }
  };

  function projectUrl(card){
    var url=new URL(window.location.href);
    url.hash='project='+encodeURIComponent(card.dataset.projectId);
    return url.href;
  }

  function open(card,fromLocation){
    if(!card)return;
    last=card;body.innerHTML='';
    var pid=card.dataset.projectId;
    var spec = PROJECT_SPECS[pid];

    var c=card.cloneNode(true);c.className='pm-card';c.removeAttribute('tabindex');c.removeAttribute('role');

    if(spec){
      // Prepend role & eyebrow
      var roleRow = document.createElement('div');
      roleRow.className = 'pm-role-bar';
      roleRow.innerHTML = '<span class="pm-eyebrow">' + spec.eyebrow + '</span><span class="pm-role-pill">⚡ ' + spec.role + '</span>';
      c.insertBefore(roleRow, c.firstChild);

      // Scorecard metrics
      var metricsRow = document.createElement('div');
      metricsRow.className = 'pm-metrics-row';
      spec.metrics.forEach(function(m){
        metricsRow.innerHTML += '<div class="pm-metric-item"><small>' + m.lbl + '</small><b>' + m.val + '</b></div>';
      });
      c.appendChild(metricsRow);

      // Engineering Highlights Box
      var hlBox = document.createElement('div');
      hlBox.className = 'pm-hl-box';
      hlBox.innerHTML = '<div class="pm-hl-title">Key Engineering Deliverables:</div><ul class="pm-hl-list">' +
        spec.highlights.map(function(h){ return '<li>' + h + '</li>'; }).join('') +
        '</ul>';
      c.appendChild(hlBox);

      // Architecture Path
      if(spec.architecture && spec.architecture.length > 0){
        var pathBox = document.createElement('div');
        pathBox.className = 'pm-path-box';
        pathBox.innerHTML = '<span class="pm-path-lbl">System Architecture Flow:</span>' +
          '<div class="pm-path-nodes">' +
          spec.architecture.map(function(n, i){
            return '<span class="pm-path-node">' + n + '</span>' + (i < spec.architecture.length - 1 ? '<span class="pm-path-arrow">➔</span>' : '');
          }).join('') +
          '</div>';
        c.appendChild(pathBox);
      }

      // Map SVG preview if visit-tracking
      if(pid === 'visit-tracking-map-report'){
        var mapBox = document.createElement('div');
        mapBox.className = 'pm-map-preview';
        mapBox.innerHTML = '<div class="pm-map-head">' +
          '<span>🗺️ Phnom Penh District Route #04 (Leaflet.js Telemetry)</span>' +
          '<span class="pipe-code-tag">GPS Geofence</span>' +
          '</div>' +
          '<svg viewBox="0 0 540 160" class="pm-route-svg">' +
          '<path d="M 40 120 Q 140 30, 240 80 T 400 40 T 500 110" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4"/>' +
          '<circle cx="40" cy="120" r="7" fill="#10b981"/>' +
          '<text x="40" y="142" font-size="10" fill="#94a3b8" text-anchor="middle">Daun Penh (09:15)</text>' +
          '<circle cx="240" cy="80" r="7" fill="#38bdf8"/>' +
          '<text x="240" y="102" font-size="10" fill="#94a3b8" text-anchor="middle">Sen Sok (11:30)</text>' +
          '<circle cx="400" cy="40" r="7" fill="#f59e0b"/>' +
          '<text x="400" y="24" font-size="10" fill="#94a3b8" text-anchor="middle">Tuol Kork (14:00)</text>' +
          '<circle cx="500" cy="110" r="7" fill="#10b981"/>' +
          '<text x="500" y="132" font-size="10" fill="#94a3b8" text-anchor="middle">Chamkar Mon (16:45)</text>' +
          '</svg>';
        c.appendChild(mapBox);
      }
    }
    
    // Enrich with interactive architecture action bar
    var actionsRow=document.createElement('div');
    actionsRow.className='pm-action-row';

    if(spec && spec.liveDemoAnchor){
      var demoLink = document.createElement('a');
      demoLink.className = 'btn primary';
      demoLink.href = spec.liveDemoAnchor;
      demoLink.innerHTML = '<span>⚡ Launch Live Simulator</span>';
      demoLink.addEventListener('click', function(){
        close();
      });
      actionsRow.appendChild(demoLink);
    }
    
    var labLink=document.createElement('a');
    labLink.className='btn' + (spec && spec.liveDemoAnchor ? '' : ' primary');
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
  window.addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)close();});
  window.addEventListener('popstate',syncLocation);
  syncLocation();
})();
