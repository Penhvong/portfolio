// Interactive Flutter Field Sales Mobile App Simulator (Offline-First SQLite Sync)
// Demonstrates cross-platform Dart BLoC, SQLite local queue, GPS geofencing, and background synchronization.
(function(){
  var isOnline = true;
  var queue = [];
  var activeStoreIdx = 0;
  var isSyncing = false;

  var STORES = [
    { id: 's1', name: 'Daun Penh Wholesale Mart', code: 'DP-802', district: 'Daun Penh', checkedIn: false, time: null },
    { id: 's2', name: 'Sen Sok Distribution Depot', code: 'SS-419', district: 'Sen Sok', checkedIn: false, time: null },
    { id: 's3', name: 'Tuol Kork Retail Center', code: 'TK-105', district: 'Tuol Kork', checkedIn: false, time: null }
  ];

  function $(id){ return document.getElementById(id); }

  function init(){
    var sim = $('mobileAppSim');
    if(!sim) return;

    var netToggle = $('mNetToggle');
    var netLabel = $('mNetLabel');
    var netBadge = $('mNetBadge');
    var checkinBtn = $('mCheckinBtn');
    var queueBadge = $('mQueueBadge');
    var syncLog = $('mSyncLog');
    var blocState = $('mBlocState');
    var storesContainer = $('mStoresList');

    function renderStores(){
      if(!storesContainer) return;
      var html = '';
      STORES.forEach(function(store, idx){
        var isAct = idx === activeStoreIdx;
        var statusBadge = store.checkedIn 
          ? '<span class="m-store-done">✔ Checked in (' + store.time + ')</span>'
          : '<span class="m-store-pending">Pending Check-in</span>';
        
        html += '<div class="m-store-card' + (isAct ? ' active' : '') + (store.checkedIn ? ' checked-done' : '') + '" data-idx="' + idx + '" tabindex="0" role="button">' +
          '<div class="m-store-icon">' + (store.checkedIn ? '📍' : '🏬') + '</div>' +
          '<div class="m-store-info">' +
            '<b>' + store.name + '</b>' +
            '<small>' + store.district + ' · #' + store.code + '</small>' +
          '</div>' +
          '<div class="m-store-status">' + statusBadge + '</div>' +
        '</div>';
      });
      storesContainer.innerHTML = html;

      storesContainer.querySelectorAll('.m-store-card').forEach(function(el){
        el.addEventListener('click', function(){
          if(window.playSfx) window.playSfx('tick');
          activeStoreIdx = parseInt(el.getAttribute('data-idx'), 10);
          renderStores();
        });
      });
    }

    function logTerminal(msg, type){
      if(!syncLog) return;
      var now = new Date();
      var t = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      var row = document.createElement('div');
      row.className = 'm-log-line ' + (type || 'info');
      row.innerHTML = '<span class="m-log-time">[' + t + ']</span> ' + msg;
      syncLog.insertBefore(row, syncLog.firstChild);
      while(syncLog.children.length > 6){
        syncLog.removeChild(syncLog.lastChild);
      }
    }

    function updateQueueUI(){
      if(queueBadge){
        queueBadge.textContent = queue.length + ' in queue';
        queueBadge.classList.toggle('has-queue', queue.length > 0);
      }
    }

    function setOnlineState(online){
      isOnline = online;
      if(netLabel) netLabel.textContent = isOnline ? 'ONLINE (4G)' : 'OFFLINE (Airplane)';
      if(netBadge){
        netBadge.className = 'm-net-pill ' + (isOnline ? 'online' : 'offline');
        netBadge.textContent = isOnline ? '● 4G LTE' : '○ NO SIGNAL';
      }
      if(blocState){
        blocState.textContent = isOnline ? 'SyncState.online' : 'SyncState.offlineQueued';
        blocState.className = 'bloc-val ' + (isOnline ? 'green' : 'amber');
      }

      if(isOnline){
        logTerminal('📶 Network connection established with ICCKH Gateway.', 'success');
        if(queue.length > 0){
          processOfflineQueue();
        }
      } else {
        logTerminal('📵 Network offline. Switching Flutter isolate to SQLite local queue.', 'warn');
      }
    }

    function processOfflineQueue(){
      if(isSyncing || queue.length === 0) return;
      isSyncing = true;
      logTerminal('⚡ SQLite Background Worker: Dispatching ' + queue.length + ' queued visits...', 'sync');
      if(window.playSfx) window.playSfx('packet');

      setTimeout(function(){
        var count = queue.length;
        queue = [];
        updateQueueUI();
        isSyncing = false;
        logTerminal('✅ Pushed ' + count + ' visits to API Gateway. Local SQLite rows marked SYNCED.', 'success');
        if(window.playSfx) window.playSfx('success');
        if(window.fireConfetti && checkinBtn){
          var r = checkinBtn.getBoundingClientRect();
          window.fireConfetti({ x: r.left + r.width / 2, y: r.top });
        }
        if(window.toast) window.toast('Synchronized ' + count + ' offline visits with cloud server');
      }, 700);
    }

    function handleCheckin(){
      var store = STORES[activeStoreIdx];
      var now = new Date();
      var timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      store.checkedIn = true;
      store.time = timeStr;
      renderStores();

      if(isOnline){
        if(window.playSfx) window.playSfx('success');
        logTerminal('📍 GPS Check-in [' + store.name + ']: Synced via HTTPS (14.2ms)', 'success');
        if(window.toast) window.toast('Checked in at ' + store.name);
      } else {
        if(window.playSfx) window.playSfx('laser');
        queue.push({ store: store.name, time: timeStr, lat: 11.5683, lon: 104.9182 });
        updateQueueUI();
        logTerminal('💾 OFFLINE: [' + store.name + '] committed to local SQLite queue table.', 'warn');
        if(window.toast) window.toast('Offline: Saved to local SQLite queue');
      }

      // Automatically advance to next unchecked store
      for(var i = 0; i < STORES.length; i++){
        if(!STORES[i].checkedIn){
          activeStoreIdx = i;
          renderStores();
          break;
        }
      }
    }

    if(netToggle){
      netToggle.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('switch');
        setOnlineState(!isOnline);
      });
    }

    if(checkinBtn){
      checkinBtn.addEventListener('click', handleCheckin);
    }

    var resetBtn = $('mResetSimBtn');
    if(resetBtn){
      resetBtn.addEventListener('click', function(){
        STORES.forEach(function(s){ s.checkedIn = false; s.time = null; });
        queue = [];
        activeStoreIdx = 0;
        updateQueueUI();
        renderStores();
        if(window.playSfx) window.playSfx('switch');
        logTerminal('🔄 Field sales route reset to initial schedule.', 'info');
        if(window.toast) window.toast('Mobile simulator route reset');
      });
    }

    // Initial render
    renderStores();
    updateQueueUI();
    setOnlineState(true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
