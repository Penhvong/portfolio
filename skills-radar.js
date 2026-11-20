// Interactive Architecture Competency Hexagon Radar
// Visualizes the 6 pillars of Chanpenhvong's engineering expertise with SVG polygon math, animated callouts, and morphing profiles.
(function(){
  var PILLARS = [
    {
      key: 'fintech',
      name: 'FinTech & KHQR',
      rating: 98,
      badge: 'Pillar Focus · 98% Senior Mastery',
      title: 'FinTech & KHQR Integration',
      desc: 'Architecting national payment rails, EMVCo-compliant TLV payload generation, CRC16 validation, and real-time NBC Bakong clearing webhooks with sub-20ms settlement latency.',
      metrics: [
        { val: '18ms', lbl: 'Clearing Latency' },
        { val: '100%', lbl: 'ACID Reconciliation' },
        { val: 'EMVCo', lbl: 'National Standard' }
      ],
      tags: ['EMVCo TLV', 'CRC16-CCITT', 'HMAC-SHA256', 'ASP.NET Core 8']
    },
    {
      key: 'backend',
      name: 'ASP.NET Core & C#',
      rating: 95,
      badge: 'Core Engine · 95% High-Throughput',
      title: 'ASP.NET Core 8 & C# Architecture',
      desc: 'High-throughput asynchronous Kestrel microservices, RS256 JWT bearer authentication, distributed idempotency locks, and resilient error recovery.',
      metrics: [
        { val: '1.4ms', lbl: 'Ingress Latency' },
        { val: 'C# 12', lbl: 'Modern Language' },
        { val: 'Kestrel', lbl: 'Reverse Proxy' }
      ],
      tags: ['ASP.NET Core 8', 'C# 12', 'JWT RS256', 'Kestrel Engine']
    },
    {
      key: 'sql',
      name: 'SQL Server 2022',
      rating: 94,
      badge: 'Data Ledger · 94% Expert Tuning',
      title: 'SQL Server 2022 & Analytical Queries',
      desc: 'Relational schema design, ACID transactional ledger integrity, advanced analytical window functions (SUM OVER, DENSE_RANK), and clustered index tuning with NOLOCK concurrency.',
      metrics: [
        { val: '< 14ms', lbl: 'Query Latency' },
        { val: 'Zero', lbl: 'Deadlock Ratio' },
        { val: 'T-SQL', lbl: 'Window Partitions' }
      ],
      tags: ['SQL Server 2022', 'T-SQL', 'Clustered Indexes', 'Execution Plan Tuning']
    },
    {
      key: 'mobile',
      name: 'Flutter & SQLite',
      rating: 90,
      badge: 'Field Mobility · 90% Production Shipped',
      title: 'Flutter & SQLite Offline-First Mobility',
      desc: 'Cross-platform iOS and Android mobile engineering with local SQLite store-and-forward queueing, background geo-fencing GPS check-ins, and thermal printer BLE dispatch.',
      metrics: [
        { val: '14 Dist', lbl: 'Active Coverage' },
        { val: 'Offline', lbl: 'Store-and-Forward' },
        { val: 'Flutter 3', lbl: 'Cross-Platform' }
      ],
      tags: ['Flutter', 'Dart', 'SQLite Sync', 'Geofencing GPS']
    },
    {
      key: 'web',
      name: 'Enterprise Web',
      rating: 92,
      badge: 'Enterprise Portals · 92% Full-Stack',
      title: 'Enterprise Web Platforms & MVC',
      desc: 'Dynamic form systems, approval routing workflows, responsive glassmorphism interfaces, and real-time WebSocket transaction streams.',
      metrics: [
        { val: 'Sub-Sec', lbl: 'Page Transitions' },
        { val: 'Glass UI', lbl: 'Design System' },
        { val: 'WebSockets', lbl: 'Real-Time Sync' }
      ],
      tags: ['ASP.NET MVC', 'HTML5 / CSS3', 'JavaScript', 'WebSocket']
    },
    {
      key: 'devops',
      name: 'DevOps & Docker',
      rating: 86,
      badge: 'Infrastructure · 86% Resilient',
      title: 'DevOps, Containerization & Tooling',
      desc: 'Dockerized application packaging, Git branching workflows, reverse proxy configurations, and automated report compilation.',
      metrics: [
        { val: 'Docker', lbl: 'Containerized' },
        { val: 'Git Flow', lbl: 'Branching Strategy' },
        { val: 'Crystal', lbl: 'Automated Reports' }
      ],
      tags: ['Docker', 'Git', 'Linux / Windows', 'RDLC & Crystal']
    }
  ];

  var PROFILES = {
    senior: {
      name: 'Senior Full-Stack Lead',
      badge: 'Balanced Senior Architecture · 98% Peak',
      ratings: [98, 95, 94, 90, 92, 86],
      focus: 0,
      desc: 'Balanced senior engineering profile spanning high-throughput ASP.NET Core microservices, EMVCo KHQR payment rails, SQL Server transactional tuning, and enterprise mobility.'
    },
    fintech: {
      name: 'FinTech & National Switch Lead',
      badge: 'FinTech Rails & National Switch · 100% Peak',
      ratings: [100, 97, 96, 84, 88, 88],
      focus: 0,
      desc: 'Specialized FinTech architecture focusing on national payment switches, EMVCo TLV cryptographic validation, sub-20ms NBC Bakong clearing, and ACID ledger reconciliation.'
    },
    mobile: {
      name: 'Enterprise Mobility & POS Lead',
      badge: 'Offline-First Mobility & Field POS · 99% Peak',
      ratings: [86, 90, 92, 99, 95, 88],
      focus: 3,
      desc: 'Specialized enterprise mobility engineering focusing on cross-platform Flutter, offline-first SQLite queues, geospatial GPS geo-fencing, and Bluetooth thermal POS integration.'
    }
  };

  var activeProfileKey = 'senior';
  var currentRatings = [98, 95, 94, 90, 92, 86];
  var targetRatings = [98, 95, 94, 90, 92, 86];
  var animFrameId = null;

  function init(){
    var svg = document.getElementById('skillsRadarSvg');
    if(!svg) return;

    var cx = 250, cy = 190, maxR = 115;
    var count = PILLARS.length;
    var angleStep = (Math.PI * 2) / count;
    var startAngle = -Math.PI / 2; // top vertex

    // Helper to get coordinates
    function getPoint(index, ratio){
      var a = startAngle + index * angleStep;
      var r = maxR * ratio;
      return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a)
      };
    }

    // 1. Draw concentric background guide hexagons (20%, 40%, 60%, 80%, 100%)
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(function(ratio){
      var pts = [];
      for(var i = 0; i < count; i++){
        var pt = getPoint(i, ratio);
        pts.push(pt.x.toFixed(1) + ',' + pt.y.toFixed(1));
      }
      var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pts.join(' '));
      poly.setAttribute('fill', ratio === 1.0 ? 'rgba(255, 255, 255, 0.02)' : 'none');
      poly.setAttribute('stroke', ratio === 1.0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)');
      poly.setAttribute('stroke-width', ratio === 1.0 ? '1.5' : '1');
      svg.appendChild(poly);
    });

    // 2. Draw radial axis lines from center to outer vertices
    for(var i = 0; i < count; i++){
      var outer = getPoint(i, 1.0);
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', outer.x.toFixed(1));
      line.setAttribute('y2', outer.y.toFixed(1));
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // 3. Draw filled competency data polygon
    var dataPts = [];
    for(var i = 0; i < count; i++){
      var pt = getPoint(i, currentRatings[i] / 100);
      dataPts.push(pt.x.toFixed(1) + ',' + pt.y.toFixed(1));
    }
    var dataPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    dataPoly.setAttribute('id', 'radarDataPolygon');
    dataPoly.setAttribute('points', dataPts.join(' '));
    dataPoly.setAttribute('fill', 'url(#radarMeshGrad)');
    dataPoly.setAttribute('stroke', '#00f5d4');
    dataPoly.setAttribute('stroke-width', '2.5');
    dataPoly.setAttribute('stroke-linejoin', 'round');
    dataPoly.style.filter = 'drop-shadow(0 0 10px rgba(0, 245, 212, 0.5))';
    svg.appendChild(dataPoly);

    // 4. Draw interactive vertex circles & labels
    var vertexElements = [];

    function selectPillar(idx){
      var p = PILLARS[idx];
      if(!p) return;

      if(window.playSfx) window.playSfx('tick');

      // Update card
      var badge = document.getElementById('radarCardBadge');
      var title = document.getElementById('radarCardTitle');
      var desc = document.getElementById('radarCardDesc');
      var metrics = document.getElementById('radarCardMetrics');
      var tags = document.getElementById('radarCardTags');

      var currentRatingVal = Math.round(currentRatings[idx]);
      if(badge) badge.textContent = p.name + ' · ' + currentRatingVal + '% Mastery';
      if(title) title.textContent = p.title;
      if(desc) desc.textContent = p.desc;

      if(metrics){
        metrics.innerHTML = p.metrics.map(function(m){
          return '<div class="radar-stat"><b>' + m.val + '</b><span>' + m.lbl + '</span></div>';
        }).join('');
      }

      if(tags){
        tags.innerHTML = p.tags.map(function(t){
          return '<span>' + t + '</span>';
        }).join('');
      }

      // Highlight active vertex
      vertexElements.forEach(function(v, i){
        v.circle.setAttribute('r', i === idx ? '7' : '4.5');
        v.circle.setAttribute('fill', i === idx ? '#fff' : '#00f5d4');
        v.label.setAttribute('fill', i === idx ? '#fff' : 'var(--muted)');
        v.label.setAttribute('font-weight', i === idx ? 'bold' : 'normal');
      });
    }

    for(var i = 0; i < count; i++){
      (function(idx){
        var p = PILLARS[idx];
        var pt = getPoint(idx, currentRatings[idx] / 100);
        var labelPt = getPoint(idx, 1.25);

        // Vertex circle
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x.toFixed(1));
        circle.setAttribute('cy', pt.y.toFixed(1));
        circle.setAttribute('r', idx === 0 ? '7' : '4.5');
        circle.setAttribute('fill', idx === 0 ? '#fff' : '#00f5d4');
        circle.setAttribute('stroke', '#070b14');
        circle.setAttribute('stroke-width', '2');
        circle.style.cursor = 'pointer';

        // Perimeter Label
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelPt.x.toFixed(1));
        text.setAttribute('y', (labelPt.y + (labelPt.y > cy ? 5 : -2)).toFixed(1));
        text.setAttribute('text-anchor', labelPt.x > cx + 10 ? 'start' : (labelPt.x < cx - 10 ? 'end' : 'middle'));
        text.setAttribute('font-size', '11');
        text.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif');
        text.setAttribute('fill', idx === 0 ? '#fff' : 'var(--muted)');
        text.setAttribute('font-weight', idx === 0 ? 'bold' : 'normal');
        text.style.cursor = 'pointer';
        text.textContent = p.name + ' (' + Math.round(currentRatings[idx]) + '%)';

        circle.addEventListener('mouseenter', function(){ selectPillar(idx); });
        circle.addEventListener('click', function(){ selectPillar(idx); });
        text.addEventListener('mouseenter', function(){ selectPillar(idx); });
        text.addEventListener('click', function(){ selectPillar(idx); });

        svg.appendChild(circle);
        svg.appendChild(text);

        vertexElements.push({ circle: circle, label: text });
      })(i);
    }

    // Smooth Polygon & Vertex Morphing Animation Engine
    function morphToProfile(profileKey){
      var prof = PROFILES[profileKey];
      if(!prof) return;

      activeProfileKey = profileKey;
      targetRatings = prof.ratings.slice();

      if(animFrameId) cancelAnimationFrame(animFrameId);

      var startTime = performance.now();
      var startRatings = currentRatings.slice();

      function step(now){
        var elapsed = (now - startTime) / 450; // 450ms spring transition
        var t = Math.min(1, elapsed);
        // Ease out back / cubic spring easing
        var ease = 1 - Math.pow(1 - t, 3);

        var pts = [];
        var maxDiff = 0;

        for(var i = 0; i < count; i++){
          currentRatings[i] = startRatings[i] + (targetRatings[i] - startRatings[i]) * ease;
          var pt = getPoint(i, currentRatings[i] / 100);
          pts.push(pt.x.toFixed(1) + ',' + pt.y.toFixed(1));

          // Update vertex circle position
          if(vertexElements[i]){
            vertexElements[i].circle.setAttribute('cx', pt.x.toFixed(1));
            vertexElements[i].circle.setAttribute('cy', pt.y.toFixed(1));
            vertexElements[i].label.textContent = PILLARS[i].name + ' (' + Math.round(currentRatings[i]) + '%)';
          }

          var diff = Math.abs(targetRatings[i] - currentRatings[i]);
          if(diff > maxDiff) maxDiff = diff;
        }

        dataPoly.setAttribute('points', pts.join(' '));

        if(t < 1 && maxDiff > 0.1){
          animFrameId = requestAnimationFrame(step);
        } else {
          // Snap to exact target
          currentRatings = targetRatings.slice();
          var finalPts = [];
          for(var j = 0; j < count; j++){
            var fpt = getPoint(j, currentRatings[j] / 100);
            finalPts.push(fpt.x.toFixed(1) + ',' + fpt.y.toFixed(1));
            if(vertexElements[j]){
              vertexElements[j].circle.setAttribute('cx', fpt.x.toFixed(1));
              vertexElements[j].circle.setAttribute('cy', fpt.y.toFixed(1));
              vertexElements[j].label.textContent = PILLARS[j].name + ' (' + targetRatings[j] + '%)';
            }
          }
          dataPoly.setAttribute('points', finalPts.join(' '));
          selectPillar(prof.focus);
        }
      }

      animFrameId = requestAnimationFrame(step);
    }

    window.setRadarProfile = function(k){
      document.querySelectorAll('.radar-profile-pill').forEach(function(btn){
        btn.classList.toggle('active', btn.getAttribute('data-profile') === k);
      });
      morphToProfile(k);
    };

    // Wire profile toggle buttons
    document.querySelectorAll('.radar-profile-pill').forEach(function(btn){
      btn.addEventListener('click', function(){
        var p = btn.getAttribute('data-profile');
        if(p && p !== activeProfileKey){
          if(window.playSfx) window.playSfx('switch');
          window.setRadarProfile(p);
        }
      });
    });

    // Toggle between Radar and Bars view
    var btnRadar = document.getElementById('btnSkillsRadar');
    var btnBars = document.getElementById('btnSkillsBars');
    var wrapRadar = document.getElementById('skillsRadarWrap');
    var wrapBars = document.getElementById('skillsGridBars');

    if(btnRadar && btnBars){
      btnRadar.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        btnRadar.classList.add('active');
        btnBars.classList.remove('active');
        if(wrapRadar) wrapRadar.style.display = 'block';
        if(wrapBars) wrapBars.style.display = 'none';
      });

      btnBars.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        btnBars.classList.add('active');
        btnRadar.classList.remove('active');
        if(wrapRadar) wrapRadar.style.display = 'none';
        if(wrapBars) wrapBars.style.display = 'grid';
      });
    }

    // Wire up quick currency presets in #demo
    document.querySelectorAll('.rate-pill').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        var cur = btn.getAttribute('data-cur');
        var amt = btn.getAttribute('data-amt');

        var qrCur = document.getElementById('qrCur');
        var qrAmt = document.getElementById('qrAmt');
        var qrMake = document.getElementById('qrMake');

        if(qrCur && cur) qrCur.value = cur;
        if(qrAmt && amt) qrAmt.value = amt;
        if(qrMake) qrMake.click();

        location.hash = '#demo';
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
