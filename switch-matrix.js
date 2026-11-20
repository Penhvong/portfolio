// Cambodian National Banking Switch & Bakong Interbank Clearing Matrix
// Simulates live cryptographic handshakes, mutual TLS, and EMVCo TLV packet dispatch across NBC member banks.
(function(){
  var BANKS = [
    { id: 'chipmong', name: 'Chip Mong Bank', baseLat: 4.2, jitter: 0.6, port: '8443 (Fiber)', cipher: 'mTLS Dedicated' },
    { id: 'nbc', name: 'NBC Bakong Core', baseLat: 11.8, jitter: 1.4, port: '443 (HTTPS)', cipher: 'TLS 1.3 / SHA-256' },
    { id: 'aba', name: 'ABA Bank Clearing', baseLat: 14.5, jitter: 1.8, port: '443 (REST)', cipher: 'HMAC-SHA256' },
    { id: 'wing', name: 'Wing Bank Gateway', baseLat: 13.7, jitter: 1.5, port: '443 (Push)', cipher: 'Webhook Push' },
    { id: 'canadia', name: 'Canadia Bank Node', baseLat: 16.2, jitter: 2.2, port: '443 (ISO)', cipher: 'ISO-8583 / KHQR' }
  ];

  var isPinging = false;

  function pingRails(){
    if(isPinging) return;
    isPinging = true;

    var btn = document.getElementById('btnPingBanks');
    var trace = document.getElementById('bmAuditTrace');

    if(btn){
      btn.disabled = true;
      btn.innerHTML = '<span class="wb-spinner"></span> <span>Pinging Rails...</span>';
    }

    if(window.playSfx) window.playSfx('packet');

    var now = new Date();
    function getTime(offsetMs){
      var d = new Date(now.getTime() + (offsetMs || 0));
      return d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
    }

    var lines = [
      '[' + getTime(0) + '] INITIATING CONCURRENT INTERBANK HANDSHAKE (5 Member Switches)...',
      '[' + getTime(4) + '] Dedicated Intranet Fiber -> Chip Mong Bank Core (core.chipmongbank.com:8443) -> Handshake OK'
    ];

    if(trace) trace.textContent = lines.join('\n');

    // Staggered node responses
    BANKS.forEach(function(bank, idx){
      setTimeout(function(){
        var lat = (bank.baseLat + (Math.random() * bank.jitter * 2 - bank.jitter)).toFixed(1);
        var el = document.getElementById('lat-' + bank.id);
        var card = document.querySelector('.b-node-card[data-bank="' + bank.id + '"]');

        if(el) el.textContent = lat + 'ms';
        if(card){
          card.classList.add('ping-flash');
          setTimeout(function(){ card.classList.remove('ping-flash'); }, 600);
        }

        if(window.playSfx && idx > 0) window.playSfx('tick');

        var tOffset = Math.round(parseFloat(lat));
        if(bank.id === 'nbc'){
          lines.push('[' + getTime(tOffset) + '] TLS 1.3 Handshake (ECDHE-RSA-AES256-GCM) -> NBC Bakong Central Node -> ' + lat + 'ms [200 OK]');
        } else if(bank.id === 'aba'){
          lines.push('[' + getTime(tOffset) + '] EMVCo TLV Ingress Packet -> ABA Retail Clearing Gateway -> ' + lat + 'ms [ACK]');
        } else if(bank.id === 'wing'){
          lines.push('[' + getTime(tOffset) + '] Webhook Push Cleared -> Wing Agent Network -> ' + lat + 'ms [ACK]');
        } else if(bank.id === 'canadia'){
          lines.push('[' + getTime(tOffset) + '] Interbank ISO-8583 Bridge -> Canadia Bank -> ' + lat + 'ms [ACK]');
        }

        if(trace) {
          trace.textContent = lines.join('\n');
          trace.scrollTop = trace.scrollHeight;
        }
      }, 100 + idx * 160);
    });

    // Final reconciliation stamp
    setTimeout(function(){
      lines.push('[' + getTime(85) + '] VERIFYING EMVCo CRC16 Checksum (0x6304): VALID ✅');
      lines.push('[' + getTime(92) + '] ACID Transaction Balanced in Microsoft SQL Server 2022 (Cluster latency: 1.4ms).');
      lines.push('[' + getTime(95) + '] Interbank clearing cycle completed successfully with 100% SLA.');

      if(trace){
        trace.textContent = lines.join('\n');
        trace.scrollTop = trace.scrollHeight;
      }

      if(window.playSfx) window.playSfx('success');

      // Also log to main pipeline telemetry feed if available
      var feed = document.getElementById('pipeLogFeed');
      if(feed){
        var row = document.createElement('div');
        row.className = 'pipe-log-row switch';
        row.innerHTML = '<span class="pipe-log-time">[' + getTime(95) + ']</span> <span class="pipe-log-msg">[Interbank Switch]: NBC Bakong, Chip Mong, ABA, Wing, Canadia verified (Fastest: Chip Mong 4.1ms)</span>';
        feed.insertBefore(row, feed.firstChild);
      }

      if(btn){
        btn.disabled = false;
        btn.innerHTML = '<span class="bm-ping-icon">⚡</span> <span>Ping Interbank Rails ▶</span>';
      }

      isPinging = false;
    }, 1150);
  }

  function init(){
    var btn = document.getElementById('btnPingBanks');
    if(btn){
      btn.addEventListener('click', pingRails);
    }
  }

  window.pingInterbankRails = pingRails;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
