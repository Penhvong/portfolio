// Client (POS, App, Web) -> Payment Gateway -> Bakong KHQR -> SQL Server Integration Engine
// 100% license-safe enterprise integration pipeline without proprietary vendor dependencies.
(function(){
  var PROCESS_NODES = {
    clients: {
      id: 'clients',
      name: 'Client Channels (POS, Mobile & Web)',
      subtitle: 'Flutter Mobile · Hardware POS Terminal · Web Platform',
      badge: 'Channel Ingress',
      status: 'Active · Multi-Channel Ingress',
      icon: '📱',
      description: 'Unified client ingress across physical and digital touchpoints. Hardware POS checkouts, Flutter field mobile apps, and customer web applications generate standard payment requests with local offline caching and automatic synchronization.',
      metrics: {
        'Supported Channels': 'Hardware POS, Flutter (iOS/Android), Web Portal',
        'Ingress Protocols': 'HTTPS REST, WebSockets, Bluetooth BLE (POS)',
        'Offline Resilience': 'Local SQLite store-and-forward queueing',
        'Device Telemetry': 'GPS Geotag, Terminal ID, Device Fingerprint'
      },
      codeSnippet: `// Unified Client Checkout Dispatch (Dart / Flutter & Web)
Future<PaymentRequestResult> dispatchCheckout({
  required String channel,    // 'POS' | 'MOBILE' | 'WEB'
  required double amount,
  required String currency,   // 'KHR' | 'USD'
}) async {
  final payload = {
    'channel': channel,
    'amount': amount,
    'currency': currency,
    'terminalId': 'TERM-PHNOMPENH-04',
    'timestamp': DateTime.now().toUtc().toIso8601String(),
  };
  
  // Submit to Payment Gateway
  final response = await http.post(
    Uri.parse('https://api.gateway.local/v1/payments/create'),
    headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
    body: jsonEncode(payload),
  );
  return PaymentRequestResult.fromJson(jsonDecode(response.body));
}`
    },
    gateway: {
      id: 'gateway',
      name: 'Payment Processing Gateway',
      subtitle: 'ASP.NET Core 8 · C# Microservice · Reverse Proxy',
      badge: 'Processing Core',
      status: 'Active · 1.4ms Ingress',
      icon: '⚡',
      description: 'High-throughput payment orchestrator engineered in ASP.NET Core 8. Validates channel authentication tokens, enforces idempotency, parses EMV Tag-Length-Value specifications, and routes requests to the Bakong settlement switch with sub-millisecond overhead.',
      metrics: {
        'Engine': 'ASP.NET Core 8 & C# 12 Kestrel',
        'Authentication': 'RS256 JWT Bearer & API Key Verification',
        'Ingress Latency': '1.4ms (p99: 3.8ms)',
        'Idempotency': 'Distributed Cache Lock on RequestId'
      },
      codeSnippet: `// ASP.NET Core Payment Processing Controller (C#)
[HttpPost("api/v1/payments/create")]
public async Task<IActionResult> CreatePayment([FromBody] PaymentRequestDto dto) {
  // 1. Verify idempotency and channel authentication
  if (!await _authService.ValidateChannelAsync(Request.Headers["X-Channel-Key"]))
    return Unauthorized(new { error = "INVALID_CHANNEL_KEY" });

  // 2. Build EMVCo-compliant KHQR payload
  var khqrPayload = _khqrEngine.GeneratePayload(new KHQROptions {
    MerchantId = "chipmong.merchant",
    Amount = dto.Amount,
    Currency = dto.Currency == "KHR" ? 116 : 840,
    TerminalId = dto.TerminalId
  });

  // 3. Dispatch to Bakong Clearing Switch
  var switchResponse = await _bakongClient.RegisterTransactionAsync(khqrPayload);
  return Ok(switchResponse);
}`
    },
    bakong: {
      id: 'bakong',
      name: 'Bakong KHQR Integration',
      subtitle: 'National Bank of Cambodia (NBC) Clearing Switch',
      badge: 'National Switch',
      status: 'Connected · Verified Webhooks',
      icon: '🏦',
      description: 'Direct integration with the National Bank of Cambodia (NBC) Bakong payment switch. Generates dynamic individual and merchant QR codes, verifies incoming payment webhooks via cryptographic signatures, and completes real-time clearing.',
      metrics: {
        'Standard': 'National KHQR Specification (EMVCo TLV)',
        'Settlement Speed': 'Average 18ms End-to-End',
        'Checksum Algorithm': 'CRC16-CCITT (Polynomial 0x1021)',
        'Webhook Security': 'HMAC-SHA256 Signature Verification'
      },
      codeSnippet: `// NBC Bakong Webhook Cryptographic Verification (C#)
public bool ValidateBakongWebhook(string rawPayload, string signatureHeader) {
  using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_webhookSecret));
  var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawPayload));
  var computed = Convert.ToHexString(hash);

  // Constant-time comparison to prevent timing attacks
  return CryptographicOperations.FixedTimeEquals(
    Encoding.UTF8.GetBytes(computed),
    Encoding.UTF8.GetBytes(signatureHeader)
  );
}`
    },
    sql_server: {
      id: 'sql_server',
      name: 'SQL Server Database & Analytics',
      subtitle: 'Microsoft SQL Server 2022 · High-Performance T-SQL Queries',
      badge: 'Data Ledger',
      status: 'Nominal · Real-Time Indexing',
      icon: '🗄️',
      description: 'Enterprise ACID transaction ledger and reporting engine in Microsoft SQL Server. Stores immutable payment transaction logs and executes high-performance analytical SELECT queries with window functions to calculate merchant cumulative totals, channel volume, and daily settlement ranking.',
      metrics: {
        'Database Engine': 'Microsoft SQL Server 2022 Enterprise',
        'Query Tuning': 'Index Seek with NOLOCK concurrency',
        'Analytical Functions': 'SUM() OVER, DENSE_RANK(), PARTITION BY',
        'Execution Latency': '< 14ms on 1M+ Partitioned Records'
      },
      codeSnippet: `-- Microsoft SQL Server: Analytical Transaction Reconciliation Query
SELECT 
    t.TransactionId,
    t.MerchantCode,
    m.MerchantName,
    t.Channel,              -- 'POS', 'MOBILE_APP', 'WEB'
    t.Currency,             -- 'KHR' or 'USD'
    t.Amount,
    t.CreatedAt,
    t.Status,
    -- High-Performance Window Aggregations
    SUM(t.Amount) OVER (
        PARTITION BY t.MerchantCode, t.Currency 
        ORDER BY t.CreatedAt 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS CumulativeMerchantTotal,
    DENSE_RANK() OVER (
        PARTITION BY t.Currency 
        ORDER BY t.Amount DESC
    ) AS DailyRank
FROM dbo.PaymentTransactions t WITH (NOLOCK)
INNER JOIN dbo.Merchants m WITH (NOLOCK) 
    ON t.MerchantCode = m.MerchantCode
WHERE t.Status = 'SETTLED'
  AND t.CreatedAt >= CAST(GETDATE() AS DATE)
ORDER BY t.CreatedAt DESC;`
    }
  };

  var activeKey = 'sql_server';
  var isRunningSimulation = false;
  var simCounter = 3840;

  function renderNode(key){
    var n = PROCESS_NODES[key] || PROCESS_NODES.sql_server;
    activeKey = key;

    document.querySelectorAll('.pipe-card').forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-pipe') === key);
    });

    var titleEl = document.getElementById('pipeDetailTitle');
    var subEl = document.getElementById('pipeDetailSub');
    var badgeEl = document.getElementById('pipeDetailBadge');
    var descEl = document.getElementById('pipeDetailDesc');
    var gridEl = document.getElementById('pipeDetailGrid');
    var codeEl = document.getElementById('pipeDetailCode');

    if(titleEl) titleEl.textContent = n.name;
    if(subEl) subEl.textContent = n.subtitle;
    if(badgeEl) badgeEl.textContent = n.badge;
    if(descEl) descEl.textContent = n.description;

    if(gridEl){
      gridEl.innerHTML = '';
      Object.keys(n.metrics).forEach(function(k){
        var item = document.createElement('div');
        item.className = 'pipe-metric-item';
        item.innerHTML = '<span class="pipe-metric-k">' + k + '</span><span class="pipe-metric-v">' + n.metrics[k] + '</span>';
        gridEl.appendChild(item);
      });
    }

    if(codeEl){
      codeEl.textContent = n.codeSnippet;
    }
  }

  function logFeed(msg, level){
    var feed = document.getElementById('pipeLogFeed');
    if(!feed) return;
    var now = new Date();
    var timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    var row = document.createElement('div');
    row.className = 'pipe-log-row ' + (level || 'info');
    row.innerHTML = '<span class="pipe-log-time">[' + timeStr + ']</span> <span class="pipe-log-msg">' + msg + '</span>';
    feed.insertBefore(row, feed.firstChild);
    while(feed.children.length > 8){
      feed.removeChild(feed.lastChild);
    }
  }

  function runProcessSimulation(){
    if(isRunningSimulation) return;
    isRunningSimulation = true;
    simCounter++;

    var btn = document.getElementById('pipeSimBtn');
    if(btn){
      btn.disabled = true;
      btn.innerHTML = '<span class="wb-spinner"></span> <span>Executing Flow...</span>';
    }

    if(window.playSfx) window.playSfx('packet');
    var channels = ['POS Terminal #03', 'Flutter Mobile App (iOS)', 'Web Checkout Portal'];
    var ch = channels[Math.floor(Math.random() * channels.length)];
    logFeed('Step 1 [Client]: Payment request initiated via ' + ch + ' ($24.00 KHR eq)', 'info');

    setTimeout(function(){
      if(window.playSfx) window.playSfx('tick');
      logFeed('Step 2 [Gateway]: ASP.NET Core 8 verified JWT token & constructed EMV Tag 29 payload', 'gateway');
    }, 400);

    setTimeout(function(){
      if(window.playSfx) window.playSfx('scan');
      logFeed('Step 3 [Bakong]: NBC switch validated CRC16: 0x4A19 -> Customer confirmed via ABA/Wing', 'switch');
    }, 850);

    setTimeout(function(){
      if(window.playSfx) window.playSfx('success');
      var txnId = 'TXN-' + (84000 + Math.floor(Math.random() * 9000));
      logFeed('Step 4 [SQL Server]: Executed SELECT & Transaction Insert (' + txnId + ') -> Settled in 12ms', 'success');

      var countEl = document.getElementById('pipeTxnCount');
      if(countEl) countEl.textContent = simCounter.toLocaleString();

      if(btn){
        btn.disabled = false;
        btn.innerHTML = '<span>Simulate Process Flow ▶</span>';
      }
      isRunningSimulation = false;
    }, 1300);
  }

  function init(){
    var section = document.getElementById('architecture');
    if(!section) return;

    document.querySelectorAll('.pipe-card').forEach(function(el){
      el.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        var k = el.getAttribute('data-pipe');
        renderNode(k);
      });
    });

    var simBtn = document.getElementById('pipeSimBtn');
    if(simBtn){
      simBtn.addEventListener('click', runProcessSimulation);
    }

    renderNode('sql_server');
  }

  window.ProcessPipeline = {
    renderNode: renderNode,
    runSimulation: runProcessSimulation
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
