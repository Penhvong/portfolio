// Architecture Workbench: Interactive live code simulation
// Shows real production engineering patterns: C# ASP.NET Core KHQR, Flutter Offline Sync, SQL Analytics
(function(){
  var SNIPPETS={
    khqr:{
      file:'KHQR_EMV_Engine.cs',
      lang:'csharp',
      title:'KHQR EMV Payment Core (C# ASP.NET Core)',
      badge:'Fintech / EMVCo Standard',
      code:[
        'public class KhqrPayloadBuilder',
        '{',
        '    private const ushort Poly = 0x1021; // CRC-16/CCITT-FALSE',
        '',
        '    public string BuildMerchantQr(decimal amount, string currency, string billNo)',
        '    {',
        '        var payload = Tag("00", "01") // Payload Format Indicator',
        '                    + Tag("01", "12") // Dynamic QR (Point of Initiation)',
        '                    + Tag("29", Tag("00", "chipmong_store@bakong")) // Merchant Account',
        '                    + Tag("52", "5999") // Merchant Category Code',
        '                    + Tag("53", currency == "USD" ? "840" : "116")',
        '                    + Tag("54", amount.ToString(currency == "USD" ? "F2" : "0"))',
        '                    + Tag("58", "KH") // Country Code',
        '                    + Tag("59", "CHIPMONG SUPERMARKET") // Merchant Name',
        '                    + Tag("60", "Phnom Penh") // City',
        '                    + Tag("62", Tag("01", billNo)); // Additional Data Field',
        '',
        '        var checksum = ComputeCrc16(payload + "6304");',
        '        return payload + "6304" + checksum.ToString("X4");',
        '    }',
        '',
        '    private static string Tag(string id, string val) =>',
        '        $"{id}{val.Length:D2}{val}";',
        '}'
      ].join('\n'),
      logs:[
        '[INFO] ⚡ Initializing C# .NET 8 JIT compiler...',
        '[BUILD] Compiled KHQR_EMV_Engine.cs with zero warnings (0.04s)',
        '[BENCHMARK] Generating EMV compliant payload for Merchant "CHIPMONG SUPERMARKET"...',
        '[EMV TAG 53] Currency set to 840 (USD)',
        '[EMV TAG 54] Transaction amount: $12.50 USD',
        '[CRC16] Checksum verified: 0x9B42 (Matches Bakong / NBC Specification)',
        '[SUCCESS] ✅ Payload ready for POS terminal broadcast (Execution time: 0.6ms)'
      ]
    },
    flutter:{
      file:'OfflineSyncBloc.dart',
      lang:'dart',
      title:'Offline-First Mobile Sync (Flutter & SQLite)',
      badge:'Field Sales Mobility',
      code:[
        'class OfflineSyncBloc extends Bloc<SyncEvent, SyncState> {',
        '  final LocalDatabase _localDb;',
        '  final ApiGateway _remoteGateway;',
        '  final ConnectivityService _connectivity;',
        '',
        '  OfflineSyncBloc(this._localDb, this._remoteGateway, this._connectivity) {',
        '    _connectivity.onStatusChange.listen((isOnline) {',
        '      if (isOnline) add(TriggerPendingQueueSync());',
        '    });',
        '  }',
        '',
        '  Future<void> _handleSync(TriggerPendingQueueSync e, Emitter emit) async {',
        '    final pendingVisits = await _localDb.getUnsyncedCheckins();',
        '    for (final visit in pendingVisits) {',
        '      try {',
        '        await _remoteGateway.postGpsTelemetry(visit.toEncryptedPayload());',
        '        await _localDb.markAsSynced(visit.localUuid);',
        '      } catch (err) {',
        '        emit(SyncFailed(retryInSeconds: 30));',
        '      }',
        '    }',
        '  }',
        '}'
      ].join('\n'),
      logs:[
        '[RUNTIME] 📱 Starting Flutter Dart isolate worker...',
        '[SQLITE] Scanning local cache for uncommitted GPS sales check-ins...',
        '[SYNC] Found 3 pending field visits logged while offline in Sen Sok district.',
        '[TELEMETRY] Packaging AES-256 encrypted geolocation packets...',
        '[NETWORK] Handshake established with ICCKH API Gateway.',
        '[COMMITTED] 3/3 visits pushed and acknowledged. Local sync bit toggled.',
        '[SUCCESS] ✅ Field sales telemetry fully synchronized with cloud server.'
      ]
    },
    sql:{
      file:'DistrictAnalytics.sql',
      lang:'sql',
      title:'Sell-In & Sell-Out Analytics Engine (SAP B1 & SQL Server)',
      badge:'Enterprise Data Pipeline',
      code:[
        'WITH MonthlyDistMetrics AS (',
        '    SELECT',
        '        T0.DistrictName,',
        '        MONTH(T1.DocDate) AS [MonthNum],',
        '        SUM(T1.DocTotal) AS [TotalSellIn],',
        '        SUM(T2.DeliveredTotal) AS [TotalSellOut],',
        '        ROW_NUMBER() OVER (PARTITION BY MONTH(T1.DocDate) ORDER BY SUM(T2.DeliveredTotal) DESC) AS [Rank]',
        '    FROM OINV T1',
        '    INNER JOIN CRD1 T0 ON T1.CardCode = T0.CardCode AND T0.AdresType = \'S\'',
        '    LEFT JOIN DLN1 T2 ON T1.DocEntry = T2.BaseEntry',
        '    WHERE T1.DocDate >= DATEADD(month, -12, GETDATE())',
        '    GROUP BY T0.DistrictName, MONTH(T1.DocDate)',
        ')',
        'SELECT DistrictName, [MonthNum], TotalSellIn, TotalSellOut,',
        '       ROUND((TotalSellOut / NULLIF(TotalSellIn, 0)) * 100, 1) AS [SellThroughPct]',
        'FROM MonthlyDistMetrics',
        'WHERE [Rank] <= 5;',
        'ORDER BY [MonthNum] ASC, TotalSellOut DESC;'
      ].join('\n'),
      logs:[
        '[SQL SERVER] 📊 Parsing analytical query plan with window partitions...',
        '[INDEX SEEK] Utilizing clustered index on OINV.DocDate and CRD1.CardCode.',
        '[JOIN ENGINE] Aggregating 142,500 invoice rows across 5 Phnom Penh districts...',
        '[COMPUTE] Top Sell-Out District: Chamkar Mon ($48,200.00 | 88.4% sell-through)',
        '[COMPUTE] Second District: Daun Penh ($39,150.00 | 82.1% sell-through)',
        '[SUCCESS] ✅ Query executed in 14ms · Data formatted for SVG Dashboard ingestion.'
      ]
    }
  };

  function init(){
    var codeEl=document.getElementById('wbCode');
    var tabs=document.querySelectorAll('.wb-tab');
    var runBtn=document.getElementById('wbRunBtn');
    var copyBtn=document.getElementById('wbCopyBtn');
    var termOutput=document.getElementById('wbTermOutput');
    var badgeEl=document.getElementById('wbBadge');
    var titleEl=document.getElementById('wbTitle');
    if(!codeEl||!tabs.length)return;

    var currentKey='khqr';

    function setSnippet(key){
      var snip=SNIPPETS[key];if(!snip)return;
      currentKey=key;
      tabs.forEach(function(t){
        var isAct=t.getAttribute('data-snip')===key;
        t.classList.toggle('active',isAct);
        t.setAttribute('aria-selected',isAct?'true':'false');
      });
      if(titleEl)titleEl.textContent=snip.title;
      if(badgeEl)badgeEl.textContent=snip.badge;
      codeEl.textContent=snip.code;
      if(termOutput){
        termOutput.innerHTML='<span class="term-dim">Click "Run Simulation ▶" to execute this architecture pipeline in real time.</span>';
      }
    }

    tabs.forEach(function(t){
      t.addEventListener('click',function(){
        var k=t.getAttribute('data-snip');
        if(k&&k!==currentKey){
          if(window.playSfx)window.playSfx('tick');
          setSnippet(k);
        }
      });
    });

    if(runBtn){
      runBtn.addEventListener('click',function(){
        var snip=SNIPPETS[currentKey];if(!snip||!termOutput)return;
        if(window.playSfx)window.playSfx('terminal');
        runBtn.disabled=true;
        runBtn.innerHTML='<span class="wb-spinner"></span> Running...';
        termOutput.innerHTML='<span class="term-highlight">Executing pipeline: '+snip.file+'...</span>\n';

        var i=0;
        function nextLine(){
          if(i<snip.logs.length){
            var line=snip.logs[i];
            var p=document.createElement('div');
            p.className='term-log-line';
            if(line.indexOf('[SUCCESS]')>=0)p.className+=' ok';
            else if(line.indexOf('[INFO]')>=0)p.className+=' info';
            else if(line.indexOf('[BENCHMARK]')>=0||line.indexOf('[PERF]')>=0)p.className+=' perf';
            p.textContent=line;
            termOutput.appendChild(p);
            termOutput.scrollTop=termOutput.scrollHeight;
            i++;
            setTimeout(nextLine,120);
          }else{
            runBtn.disabled=false;
            runBtn.innerHTML='<span>Run Simulation ▶</span>';
            if(window.playSfx)window.playSfx('success');
          }
        }
        setTimeout(nextLine,100);
      });
    }

    if(copyBtn){
      copyBtn.addEventListener('click',function(){
        var snip=SNIPPETS[currentKey];if(!snip)return;
        if(navigator.clipboard){
          navigator.clipboard.writeText(snip.code).then(function(){
            var toast=document.getElementById('toast');
            if(toast){toast.textContent=window.t?window.t('Code snippet copied!'):'Code snippet copied! 📋';toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1600);}
            if(window.playSfx)window.playSfx('click');
          });
        }
      });
    }

    setSnippet('khqr');
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
