// Client (POS, App, Web) -> Payment Gateway -> Bakong KHQR -> SQL Server Integration Engine
// 100% license-safe enterprise integration pipeline without proprietary vendor dependencies.
(function(){
  var CLIENT_SUBCHANNELS = {
    flutter: {
      name: 'Flutter Mobile App (iOS / Android)',
      tag: 'Dart / Flutter Cross-Platform',
      description: 'Mobile field checkout client with local SQLite store-and-forward queueing. If network drops, payments are cryptographically queued and dispatched when connectivity resumes.',
      codeSnippet: `// Flutter Mobile Field Checkout Dispatch (Dart)
Future<PaymentRequestResult> dispatchMobileCheckout({
  required double amount,
  required String currency, // 'KHR' | 'USD'
  required String customerRef,
}) async {
  final payload = {
    'channel': 'MOBILE_APP',
    'terminalId': 'TERM-MOBILE-APP-09',
    'amount': amount,
    'currency': currency,
    'customerRef': customerRef,
    'idempotencyKey': Uuid().v4(),
    'timestamp': DateTime.now().toUtc().toIso8601String(),
  };

  try {
    final response = await http.post(
      Uri.parse('https://gateway.chipmong.local/v1/payments/create'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken',
        'X-Channel-Origin': 'FLUTTER_EDGE'
      },
      body: jsonEncode(payload),
    ).timeout(const Duration(milliseconds: 2500));
    return PaymentRequestResult.fromJson(jsonDecode(response.body));
  } catch (socketEx) {
    // Offline resilience: store in local SQLite queue
    await SQLiteOfflineQueue.enqueue(payload);
    return PaymentRequestResult.offlineQueued();
  }
}`
    },
    pos: {
      name: 'Hardware POS Supermarket Client',
      tag: 'C# / .NET 8 WinForms & ESC/POS',
      description: 'Physical supermarket and retail lane checkout terminal. Interacts with barcode scanner, displays dynamic KHQR on customer-facing dual monitor, and fires thermal ESC/POS print.',
      codeSnippet: `// Hardware POS Terminal Lane Controller (C# .NET 8)
public async Task<LaneCheckoutResult> ProcessPosTransactionAsync(decimal cartTotal, string currency) {
    var checkoutPayload = new {
        Channel = "POS_LANE_04",
        RegisterId = "REG-CHIPMONG-MEGA-04",
        CashierId = "USR-2914",
        Amount = cartTotal,
        Currency = currency,
        CreatedAt = DateTimeOffset.UtcNow
    };

    // 1. Dispatch to local high-speed ASP.NET Core Ingress
    var gatewayResponse = await _httpClient.PostAsJsonAsync(
        "https://gateway.chipmong.local/v1/payments/pos", checkoutPayload);
    var paymentResult = await gatewayResponse.Content.ReadFromJsonAsync<PosPaymentResponse>();

    // 2. Render dynamic KHQR bitmap to customer LCD Pole Display
    _dualDisplayService.DisplayKhqr(paymentResult.QrPayload);

    // 3. Await Bakong Webhook confirmation signal via local WebSocket
    var settled = await _switchListener.WaitForSettlementAsync(paymentResult.TxnId, timeoutSeconds: 60);
    if (settled) {
        _thermalPrinter.PrintEscPosReceipt(paymentResult);
    }
    return new LaneCheckoutResult(settled, paymentResult.TxnId);
}`
    },
    web: {
      name: 'E-Commerce & Digital Web Portal',
      tag: 'TypeScript / REST API & WebSockets',
      description: 'High-volume web checkout platform. Handles online shopping cart payments, automated retry loops, and push notification webhooks with sub-second payment confirmation.',
      codeSnippet: `// Web Checkout Dispatch & Real-Time Socket Listener (TypeScript)
export async function initiateWebPayment(orderId: string, amount: number, currency: 'KHR'|'USD') {
  const response = await fetch('/api/v1/payments/web-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      orderId,
      channel: 'WEB_PORTAL',
      amount,
      currency,
      returnUrl: window.location.origin + '/checkout/verify'
    })
  });
  const data = await response.json();

  // Connect to live WebSocket channel for instantaneous Bakong confirmation
  const ws = new WebSocket(\`wss://gateway.chipmong.local/ws/payments/\${data.txnId}\`);
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.status === 'SETTLED') {
      window.dispatchEvent(new CustomEvent('payment:settled', { detail: msg }));
    }
  };
  return data;
}`
    }
  };

  var SQL_VARIANTS = {
    reconciliation: {
      title: 'Analytical Window Function (Running Totals)',
      code: `-- Microsoft SQL Server 2022: Analytical Transaction Reconciliation Query
SELECT 
    t.TransactionId,
    t.MerchantCode,
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
ORDER BY t.CreatedAt DESC;`,
      meta: { rows: 4, duration: '8.2ms', engine: 'SQL Server 2022 Enterprise', plan: 'Clustered Index Seek (NOLOCK)' },
      columns: ['TxnID', 'Merchant', 'Channel', 'Currency', 'Amount', 'Cumulative Total', 'Daily Rank', 'Status'],
      data: [
        { txn: 'TXN-98421', merchant: 'CHIPMONG-RETAIL-01', channel: 'POS', cur: 'KHR', amt: '48,500', cum: '14,285,000', rank: 1, status: 'SETTLED' },
        { txn: 'TXN-98420', merchant: 'CHIPMONG-ECOMM', channel: 'WEB', cur: 'USD', amt: '32.00', cum: '2,450.00', rank: 1, status: 'SETTLED' },
        { txn: 'TXN-98419', merchant: 'CHIPMONG-FIELD-SALES', channel: 'MOBILE_APP', cur: 'KHR', amt: '195,000', cum: '14,236,500', rank: 2, status: 'SETTLED' },
        { txn: 'TXN-98418', merchant: 'CHIPMONG-SUPERMARKET', channel: 'POS', cur: 'USD', amt: '16.50', cum: '2,418.00', rank: 2, status: 'SETTLED' }
      ]
    },
    channels: {
      title: 'Channel Volumes & Latency Metrics',
      code: `-- Multi-Channel Performance & Settlement Analysis (SQL Server 2022)
SELECT 
    Channel,
    COUNT(TransactionId) AS TotalTxns,
    SUM(CASE WHEN Currency = 'USD' THEN Amount ELSE Amount / 4100.0 END) AS VolumeEquivalentUSD,
    AVG(LatencyMs) AS AvgGatewayLatencyMs,
    ROUND(100.0 * COUNT(CASE WHEN Status = 'SETTLED' THEN 1 END) / COUNT(*), 2) AS SuccessRatePct
FROM dbo.PaymentTransactions WITH (NOLOCK)
WHERE CreatedAt >= DATEADD(day, -7, GETDATE())
GROUP BY Channel
ORDER BY VolumeEquivalentUSD DESC;`,
      meta: { rows: 3, duration: '6.4ms', engine: 'SQL Server 2022 Enterprise', plan: 'Index Scan on IX_Channel_CreatedAt' },
      columns: ['Channel', 'Total Txns', 'Volume Eq (USD)', 'Avg Latency', 'Success Rate'],
      data: [
        { channel: 'POS Hardware', total: '2,410', vol: '$38,450.00', lat: '1.4ms', rate: '99.98%' },
        { channel: 'Flutter Mobile App', total: '1,120', vol: '$19,820.00', lat: '2.1ms', rate: '99.95%' },
        { channel: 'Web E-Commerce', total: '310', vol: '$8,120.00', lat: '1.8ms', rate: '100.00%' }
      ]
    },
    daily_summary: {
      title: 'Daily Settlement Reconciliation',
      code: `-- Daily Merchant Settlement Ledger & NBC Clearing Reconciliation
SELECT 
    CAST(CreatedAt AS DATE) AS SettlementDate,
    Currency,
    COUNT(DISTINCT MerchantCode) AS ActiveMerchants,
    COUNT(TransactionId) AS SettledTransactions,
    SUM(Amount) AS GrossSettlementAmount,
    SUM(FeeAmount) AS TotalNBCSwitchFees
FROM dbo.DailySettlementLedger WITH (NOLOCK)
WHERE Status = 'CLEARED'
GROUP BY CAST(CreatedAt AS DATE), Currency
ORDER BY SettlementDate DESC, Currency ASC;`,
      meta: { rows: 2, duration: '9.1ms', engine: 'SQL Server 2022 Enterprise', plan: 'Parallel Hash Match (Aggregate)' },
      columns: ['Settlement Date', 'Currency', 'Active Merchants', 'Settled Txns', 'Gross Settlement', 'NBC Switch Fees'],
      data: [
        { date: '2026-11-16', cur: 'KHR', merch: '18', txns: '2,180', gross: '89,450,000 KHR', fees: '0 KHR' },
        { date: '2026-11-16', cur: 'USD', merch: '24', txns: '1,660', gross: '$41,200.00', fees: '$0.00' }
      ]
    }
  };

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
      }
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
      }
    }
  };

  var activeKey = 'sql_server';
  var activeSubchannel = 'flutter';
  var activeSqlVariant = 'reconciliation';
  var activeSqlTab = 'grid';
  var isRunningSimulation = false;
  var simCounter = 3840;

  function renderSqlTable(variantKey){
    var v = SQL_VARIANTS[variantKey] || SQL_VARIANTS.reconciliation;
    var container = document.getElementById('sqlTableContainer');
    var rowsEl = document.getElementById('sqlRowsCount');
    var durEl = document.getElementById('sqlDuration');

    if(rowsEl) rowsEl.textContent = v.meta.rows;
    if(durEl) durEl.textContent = v.meta.duration;

    if(!container) return;

    var html = '<table class="sql-grid-table"><thead><tr>';
    v.columns.forEach(function(col){
      html += '<th>' + col + '</th>';
    });
    html += '</tr></thead><tbody>';

    if(variantKey === 'reconciliation'){
      v.data.forEach(function(r){
        html += '<tr>' +
          '<td><b style="color:var(--primary)">' + r.txn + '</b></td>' +
          '<td>' + r.merchant + '</td>' +
          '<td><span class="subchannel-pill" style="padding:1px 6px;font-size:0.68rem">' + r.channel + '</span></td>' +
          '<td>' + r.cur + '</td>' +
          '<td class="sql-num">' + r.amt + '</td>' +
          '<td class="sql-num" style="color:var(--ink)">' + r.cum + '</td>' +
          '<td style="text-align:center;font-weight:700">#' + r.rank + '</td>' +
          '<td><span class="sql-badge-settled">● ' + r.status + '</span></td>' +
        '</tr>';
      });
    } else if(variantKey === 'channels'){
      v.data.forEach(function(r){
        html += '<tr>' +
          '<td><b style="color:var(--ink)">' + r.channel + '</b></td>' +
          '<td class="sql-num">' + r.total + '</td>' +
          '<td class="sql-num" style="color:#10b981">' + r.vol + '</td>' +
          '<td>' + r.lat + '</td>' +
          '<td><span class="sql-badge-settled">' + r.rate + '</span></td>' +
        '</tr>';
      });
    } else if(variantKey === 'daily_summary'){
      v.data.forEach(function(r){
        html += '<tr>' +
          '<td><b style="color:var(--ink)">' + r.date + '</b></td>' +
          '<td><span class="pipe-code-tag">' + r.cur + '</span></td>' +
          '<td style="text-align:center">' + r.merch + '</td>' +
          '<td class="sql-num">' + r.txns + '</td>' +
          '<td class="sql-num" style="color:#10b981">' + r.gross + '</td>' +
          '<td class="sql-num">' + r.fees + '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function renderExecutionPlan(variantKey){
    var wrap = document.getElementById('sqlPlanTreeWrap');
    if(!wrap) return;

    var planHtml = [
      '<div class="plan-meta-summary">',
        '<span class="plan-meta-pill">Optimizer: <b>Cost-Based (SQL Server 2022 v16.0)</b></span>',
        '<span class="plan-meta-pill">Subtree Cost: <b>0.003184</b></span>',
        '<span class="plan-meta-pill">Optimization: <b>FULL (Cost Threshold Met)</b></span>',
        '<span class="plan-meta-pill">Memory Grant: <b>1,024 KB</b></span>',
        '<span class="plan-meta-pill">Parallelism: <b>1 Worker Thread (OLTP)</b></span>',
      '</div>',
      '<div class="plan-tree-list">',
        '<div class="plan-tree-node">',
          '<span class="plan-node-icon">📦</span>',
          '<div class="plan-node-body">',
            '<div class="plan-node-head"><span class="plan-node-title">[1] SELECT Execution Output</span><span class="plan-node-cost">Cost: 0.0%</span></div>',
            '<div class="plan-node-pred">Output List: [t.TransactionId], [t.MerchantCode], [t.Amount], [CumulativeMerchantTotal], [DailyRank]</div>',
          '</div>',
        '</div>',
        '<div class="plan-tree-node plan-indent-1">',
          '<span class="plan-node-icon">🔄</span>',
          '<div class="plan-node-body">',
            '<div class="plan-node-head"><span class="plan-node-title">[2] Top N Sort Operator</span><span class="plan-node-cost">Cost: 1.2%</span></div>',
            '<div class="plan-node-pred">OrderBy: [t.CreatedAt DESC] · Cardinality: 4 rows</div>',
          '</div>',
        '</div>',
        '<div class="plan-tree-node plan-indent-2">',
          '<span class="plan-node-icon">🪟</span>',
          '<div class="plan-node-body">',
            '<div class="plan-node-head"><span class="plan-node-title">[3] Window Spool & Segment Aggregate</span><span class="plan-node-cost">Cost: 14.2%</span></div>',
            '<div class="plan-node-pred">Segment By: [t.MerchantCode], [t.Currency] · Computes: SUM(t.Amount) OVER, DENSE_RANK() OVER</div>',
          '</div>',
        '</div>',
        '<div class="plan-tree-node plan-indent-2">',
          '<span class="plan-node-icon">🔗</span>',
          '<div class="plan-node-body">',
            '<div class="plan-node-head"><span class="plan-node-title">[4] Nested Loops (Inner Join)</span><span class="plan-node-cost">Cost: 3.4%</span></div>',
            '<div class="plan-node-pred">Predicate: [t.MerchantCode] = [m.MerchantCode]</div>',
          '</div>',
        '</div>',
        '<div class="plan-tree-node plan-indent-3">',
          '<span class="plan-node-icon">⚡</span>',
          '<div class="plan-node-body">',
            '<div class="plan-node-head"><span class="plan-node-title">[5] Clustered Index Seek: PK_PaymentTransactions (dbo.PaymentTransactions)</span><span class="plan-node-cost" style="color:#10b981;background:rgba(16,185,129,0.15)">Cost: 65.8% (Seek)</span></div>',
            '<div class="plan-node-pred">Index: IX_PaymentTransactions_Status_CreatedAt · Seek Predicate: [t.Status] = \'SETTLED\' AND [t.CreatedAt] &gt;= Today · Logical Reads: 32</div>',
          '</div>',
        '</div>',
        '<div class="plan-tree-node plan-indent-3">',
          '<span class="plan-node-icon">🔍</span>',
          '<div class="plan-node-body">',
            '<div class="plan-node-head"><span class="plan-node-title">[6] Clustered Index Seek: PK_Merchants (dbo.Merchants)</span><span class="plan-node-cost">Cost: 15.4%</span></div>',
            '<div class="plan-node-pred">Seek Predicate: [m.MerchantCode] = [t.MerchantCode] · Logical Reads: 8</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    wrap.innerHTML = planHtml;
  }

  function executeSqlQuery(){
    var v = SQL_VARIANTS[activeSqlVariant] || SQL_VARIANTS.reconciliation;
    var btn = document.getElementById('pipeSqlRunBtn');
    if(!btn) return;

    if(window.playSfx) window.playSfx('scan');

    btn.disabled = true;
    var originalHtml = btn.innerHTML;
    btn.innerHTML = '<span class="wb-spinner"></span> <span>Executing on SQL Server...</span>';

    var codeWrap = document.querySelector('.pipe-code-wrap');
    var scanline = codeWrap && codeWrap.querySelector('.code-scanline');
    if(codeWrap && !scanline){
      scanline = document.createElement('div');
      scanline.className = 'code-scanline active';
      codeWrap.appendChild(scanline);
    } else if(scanline){
      scanline.classList.add('active');
    }

    setTimeout(function(){
      if(window.playSfx) window.playSfx('success');
      if(window.fireConfetti){
        var rect = btn.getBoundingClientRect();
        window.fireConfetti({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      }

      renderSqlTable(activeSqlVariant);
      renderExecutionPlan(activeSqlVariant);

      var resultsEl = document.getElementById('pipeSqlResults');
      if(resultsEl) resultsEl.classList.add('open');

      logFeed('[SQL Server 2022]: Executed query variant [' + v.title + '] -> ' + v.meta.rows + ' rows in ' + v.meta.duration, 'success');

      btn.disabled = false;
      btn.innerHTML = originalHtml;
      if(scanline) scanline.classList.remove('active');
    }, 450);
  }

  function renderNode(key){
    var n = PROCESS_NODES[key] || PROCESS_NODES.sql_server;
    activeKey = key;

    // Highlight cards
    document.querySelectorAll('.pipe-card').forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-pipe') === key);
    });

    // Highlight bus steps
    document.querySelectorAll('.bus-node').forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-pipe-target') === key);
    });

    var titleEl = document.getElementById('pipeDetailTitle');
    var subEl = document.getElementById('pipeDetailSub');
    var badgeEl = document.getElementById('pipeDetailBadge');
    var descEl = document.getElementById('pipeDetailDesc');
    var gridEl = document.getElementById('pipeDetailGrid');
    var codeEl = document.getElementById('pipeDetailCode');
    var subchannelBar = document.getElementById('pipeSubchannels');
    var sqlActions = document.getElementById('pipeSqlActions');
    var sqlResults = document.getElementById('pipeSqlResults');
    var codeTitle = document.getElementById('pipeCodeTitle');
    var codeTag = document.getElementById('pipeCodeTag');

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

    if(key === 'clients'){
      if(subchannelBar) subchannelBar.hidden = false;
      if(sqlActions) sqlActions.style.display = 'none';
      if(sqlResults) sqlResults.style.display = 'none';
      var sub = CLIENT_SUBCHANNELS[activeSubchannel] || CLIENT_SUBCHANNELS.flutter;
      if(codeTitle) codeTitle.textContent = sub.name;
      if(codeTag) codeTag.textContent = sub.tag;
      if(codeEl) codeEl.textContent = sub.codeSnippet;
    } else if(key === 'sql_server'){
      if(subchannelBar) subchannelBar.hidden = true;
      if(sqlActions) sqlActions.style.display = 'flex';
      if(sqlResults) sqlResults.style.display = 'block';
      var v = SQL_VARIANTS[activeSqlVariant] || SQL_VARIANTS.reconciliation;
      if(codeTitle) codeTitle.textContent = 'Microsoft SQL Server 2022 Analytical SELECT Query';
      if(codeTag) codeTag.textContent = 'T-SQL / SQL Server 2022';
      if(codeEl) codeEl.textContent = v.code;
      renderSqlTable(activeSqlVariant);
      renderExecutionPlan(activeSqlVariant);
    } else {
      if(subchannelBar) subchannelBar.hidden = true;
      if(sqlActions) sqlActions.style.display = 'none';
      if(sqlResults) sqlResults.style.display = 'none';
      if(codeTitle) codeTitle.textContent = n.name + ' Implementation Excerpt';
      if(codeTag) codeTag.textContent = key === 'gateway' ? 'ASP.NET Core 8 / C#' : 'EMVCo / HMAC-SHA256';
      if(codeEl) codeEl.textContent = n.codeSnippet;
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

    var codeWrap = document.querySelector('.pipe-code-wrap');
    var scanline = codeWrap && codeWrap.querySelector('.code-scanline');
    if(codeWrap && !scanline){
      scanline = document.createElement('div');
      scanline.className = 'code-scanline active';
      codeWrap.appendChild(scanline);
    } else if(scanline){
      scanline.classList.add('active');
    }

    // Step 1: Clients
    renderNode('clients');
    if(window.playSfx) window.playSfx('packet');
    var channels = ['POS Terminal #03', 'Flutter Mobile App (iOS)', 'Web Checkout Portal'];
    var ch = channels[Math.floor(Math.random() * channels.length)];
    logFeed('Step 1 [Client]: Payment request initiated via ' + ch + ' ($24.00 KHR eq)', 'info');

    // Trigger canvas packet surge if canvas exists
    if(window.surgeCanvasPackets) window.surgeCanvasPackets();

    // Step 2: Gateway
    setTimeout(function(){
      renderNode('gateway');
      if(window.playSfx) window.playSfx('tick');
      logFeed('Step 2 [Gateway]: ASP.NET Core 8 verified JWT token & constructed EMV Tag 29 payload', 'gateway');
    }, 450);

    // Step 3: Bakong
    setTimeout(function(){
      renderNode('bakong');
      if(window.playSfx) window.playSfx('scan');
      logFeed('Step 3 [Bakong]: NBC switch validated CRC16: 0x4A19 -> Customer confirmed via ABA/Wing', 'switch');
    }, 900);

    // Step 4: SQL Server
    setTimeout(function(){
      renderNode('sql_server');
      if(window.playSfx) window.playSfx('success');
      if(window.fireConfetti){
        var btnRect = btn ? btn.getBoundingClientRect() : null;
        window.fireConfetti({
          x: btnRect ? btnRect.left + btnRect.width / 2 : window.innerWidth / 2,
          y: btnRect ? btnRect.top : window.innerHeight / 2
        });
      }
      var txnId = 'TXN-' + (84000 + Math.floor(Math.random() * 9000));
      logFeed('Step 4 [SQL Server]: Executed SELECT & Transaction Insert (' + txnId + ') -> Settled in 8.2ms', 'success');

      var countEl = document.getElementById('pipeTxnCount');
      if(countEl) countEl.textContent = simCounter.toLocaleString();

      if(btn){
        btn.disabled = false;
        btn.innerHTML = '<span>Simulate Process Flow ▶</span>';
      }
      if(scanline) scanline.classList.remove('active');
      isRunningSimulation = false;
    }, 1400);
  }

  // ===== Real-Time Interactive Cyber Topology Canvas Visualizer =====
  function initCyberCanvas(){
    var cv = document.getElementById('topologyCanvas');
    if(!cv) return;
    var ctx = cv.getContext('2d');
    var tip = document.getElementById('canvasNodeTip');
    var surgeBtn = document.getElementById('canvasSurgeBtn');

    var W = 940, H = 320;
    function resize(){
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = cv.parentElement ? cv.parentElement.getBoundingClientRect() : null;
      W = rect && rect.width ? Math.floor(rect.width) : 940;
      H = 320;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var nodes = [
      { id: 'pos', key: 'clients', name: 'POS Lane #04', icon: '🖥️', x: 0.12, y: 0.22, col: '#00f5d4', desc: 'Hardware POS · Supermarket Lane #04' },
      { id: 'flutter', key: 'clients', name: 'Flutter Mobile App', icon: '📱', x: 0.12, y: 0.50, col: '#00f5d4', desc: 'Field Client · Offline SQLite Queue' },
      { id: 'web', key: 'clients', name: 'E-Commerce Web', icon: '🌐', x: 0.12, y: 0.78, col: '#00f5d4', desc: 'Online Checkout · WebSocket Stream' },
      { id: 'gateway', key: 'gateway', name: 'ASP.NET Core 8 Gateway', icon: '⚡', x: 0.42, y: 0.50, col: '#a78bfa', desc: 'Reverse Proxy · 1.4ms Ingress · RS256 Auth' },
      { id: 'bakong', key: 'bakong', name: 'NBC Bakong KHQR Switch', icon: '🏦', x: 0.68, y: 0.50, col: '#f59e0b', desc: 'National Switch · EMVCo TLV · 18ms Clearing' },
      { id: 'sql', key: 'sql_server', name: 'SQL Server 2022 Cluster', icon: '🗄️', x: 0.90, y: 0.50, col: '#10b981', desc: 'Primary ACID Ledger · Window Query Engine' }
    ];

    var routes = [
      { from: 0, to: 3, col: '#00f5d4' },
      { from: 1, to: 3, col: '#00f5d4' },
      { from: 2, to: 3, col: '#00f5d4' },
      { from: 3, to: 4, col: '#a78bfa' },
      { from: 4, to: 5, col: '#f59e0b' }
    ];

    var packets = [];
    function spawnPacket(routeIdx, speed){
      var r = routes[routeIdx];
      packets.push({
        from: nodes[r.from],
        to: nodes[r.to],
        col: r.col,
        t: 0,
        speed: speed || (0.008 + Math.random() * 0.007)
      });
    }

    // Initial ambient packets
    for(var i = 0; i < routes.length; i++){
      spawnPacket(i, 0.006 + Math.random() * 0.006);
      spawnPacket(i, 0.009 + Math.random() * 0.006);
    }

    function surgePackets(){
      if(window.playSfx) window.playSfx('packet');
      for(var k = 0; k < 30; k++){
        var rIdx = Math.floor(Math.random() * routes.length);
        spawnPacket(rIdx, 0.02 + Math.random() * 0.02);
      }
    }
    window.surgeCanvasPackets = surgePackets;

    if(surgeBtn){
      surgeBtn.addEventListener('click', surgePackets);
    }

    var hoveredNode = null;
    cv.addEventListener('mousemove', function(e){
      var rect = cv.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;

      hoveredNode = null;
      for(var i = 0; i < nodes.length; i++){
        var n = nodes[i];
        var nx = n.x * W, ny = n.y * H;
        var dist = Math.hypot(mx - nx, my - ny);
        if(dist < 26){
          hoveredNode = n;
          break;
        }
      }

      if(hoveredNode && tip){
        tip.hidden = false;
        tip.style.left = (hoveredNode.x * W) + 'px';
        tip.style.top = (hoveredNode.y * H) + 'px';
        tip.innerHTML = '<b>' + hoveredNode.icon + ' ' + hoveredNode.name + '</b><br><small style="color:var(--muted)">' + hoveredNode.desc + '</small>';
      } else if(tip){
        tip.hidden = true;
      }
    });

    cv.addEventListener('click', function(){
      if(hoveredNode){
        if(window.playSfx) window.playSfx('click');
        renderNode(hoveredNode.key);
      }
    });

    var animId = null;
    var stepCounter = 0;

    function draw(){
      stepCounter++;
      ctx.clearRect(0, 0, W, H);

      // Subtle background cyber grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for(var gx = 40; gx < W; gx += 40){
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for(var gy = 40; gy < H; gy += 40){
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Draw connection Bezier wires
      for(var r = 0; r < routes.length; r++){
        var route = routes[r];
        var fn = nodes[route.from], tn = nodes[route.to];
        var fx = fn.x * W, fy = fn.y * H;
        var tx = tn.x * W, ty = tn.y * H;
        var cx1 = fx + (tx - fx) * 0.5, cy1 = fy;
        var cx2 = fx + (tx - fx) * 0.5, cy2 = ty;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
        ctx.stroke();
      }

      // Draw & update moving packets
      for(var p = packets.length - 1; p >= 0; p--){
        var pkt = packets[p];
        pkt.t += pkt.speed;
        if(pkt.t >= 1){
          packets.splice(p, 1);
          var nextR = Math.floor(Math.random() * routes.length);
          spawnPacket(nextR);
          continue;
        }

        var pfx = pkt.from.x * W, pfy = pkt.from.y * H;
        var ptx = pkt.to.x * W, pty = pkt.to.y * H;
        var pcx1 = pfx + (ptx - pfx) * 0.5, pcy1 = pfy;
        var pcx2 = pfx + (ptx - pfx) * 0.5, pcy2 = pty;

        // Cubic Bezier interpolation
        var u = 1 - pkt.t;
        var px = u*u*u*pfx + 3*u*u*pkt.t*pcx1 + 3*u*pkt.t*pkt.t*pcx2 + pkt.t*pkt.t*pkt.t*ptx;
        var py = u*u*u*pfy + 3*u*u*pkt.t*pcy1 + 3*u*pkt.t*pkt.t*pcy2 + pkt.t*pkt.t*pkt.t*pty;

        ctx.fillStyle = pkt.col;
        ctx.shadowColor = pkt.col;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Nodes
      for(var n = 0; n < nodes.length; n++){
        var node = nodes[n];
        var nx = node.x * W, ny = node.y * H;
        var isHov = hoveredNode === node;
        var isAct = node.key === activeKey;

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(nx, ny, isHov || isAct ? 22 : 16, 0, Math.PI * 2);
        ctx.fillStyle = isAct ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)';
        ctx.fill();

        // Node center disc
        ctx.beginPath();
        ctx.arc(nx, ny, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#080d1a';
        ctx.strokeStyle = isAct ? '#00f5d4' : node.col;
        ctx.lineWidth = isAct ? 3 : 2;
        ctx.stroke();
        ctx.fill();

        // Node label
        ctx.fillStyle = isAct ? '#ffffff' : '#94a3b8';
        ctx.font = (isAct ? 'bold 11px' : '10px') + ' -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny + 28);
      }

      animId = requestAnimationFrame(draw);
    }

    draw();
  }

  function init(){
    var section = document.getElementById('architecture');
    if(!section) return;

    // Card click handlers
    document.querySelectorAll('.pipe-card').forEach(function(el){
      el.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        var k = el.getAttribute('data-pipe');
        renderNode(k);
      });
    });

    // Flow bus node click handlers
    document.querySelectorAll('.bus-node').forEach(function(el){
      el.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        var k = el.getAttribute('data-pipe-target');
        renderNode(k);
      });
    });

    // Subchannel pills
    document.querySelectorAll('.subchannel-pill').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        document.querySelectorAll('.subchannel-pill').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        activeSubchannel = btn.getAttribute('data-sub');
        renderNode('clients');
      });
    });

    // SQL variant select
    var sqlSelect = document.getElementById('pipeSqlVariantSelect');
    if(sqlSelect){
      sqlSelect.addEventListener('change', function(){
        if(window.playSfx) window.playSfx('click');
        activeSqlVariant = sqlSelect.value;
        renderNode('sql_server');
      });
    }

    // SQL tab switcher (Grid vs Plan)
    var btnTabGrid = document.getElementById('sqlTabGridBtn');
    var btnTabPlan = document.getElementById('sqlTabPlanBtn');
    var tblContainer = document.getElementById('sqlTableContainer');
    var planWrap = document.getElementById('sqlPlanTreeWrap');

    if(btnTabGrid && btnTabPlan){
      btnTabGrid.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        activeSqlTab = 'grid';
        btnTabGrid.classList.add('active');
        btnTabPlan.classList.remove('active');
        if(tblContainer) tblContainer.style.display = 'block';
        if(planWrap) planWrap.style.display = 'none';
      });

      btnTabPlan.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        activeSqlTab = 'plan';
        btnTabPlan.classList.add('active');
        btnTabGrid.classList.remove('active');
        if(tblContainer) tblContainer.style.display = 'none';
        if(planWrap){
          planWrap.style.display = 'block';
          renderExecutionPlan(activeSqlVariant);
        }
      });
    }

    // SQL run button
    var sqlRunBtn = document.getElementById('pipeSqlRunBtn');
    if(sqlRunBtn){
      sqlRunBtn.addEventListener('click', executeSqlQuery);
    }

    // SQL copy JSON button
    var sqlExportBtn = document.getElementById('sqlGridExportBtn');
    if(sqlExportBtn){
      sqlExportBtn.addEventListener('click', function(){
        var v = SQL_VARIANTS[activeSqlVariant] || SQL_VARIANTS.reconciliation;
        var jsonStr = JSON.stringify(v.data, null, 2);
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(jsonStr).then(function(){
            if(window.toast) window.toast('Query results copied as JSON');
          });
        }
      });
    }

    // Simulate flow button
    var simBtn = document.getElementById('pipeSimBtn');
    if(simBtn){
      simBtn.addEventListener('click', runProcessSimulation);
    }

    // View toggle buttons (Cards vs Cyber Visualizer)
    var btnCards = document.getElementById('btnViewCards');
    var btnCanvas = document.getElementById('btnViewCanvas');
    var canvasWrap = document.getElementById('pipeCanvasWrap');
    var cardsGrid = document.querySelector('.pipe-grid-wrap');

    if(btnCards && btnCanvas){
      btnCards.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        btnCards.classList.add('active');
        btnCanvas.classList.remove('active');
        if(canvasWrap) canvasWrap.style.display = 'none';
        if(cardsGrid) cardsGrid.style.display = 'block';
      });

      btnCanvas.addEventListener('click', function(){
        if(window.playSfx) window.playSfx('click');
        btnCanvas.classList.add('active');
        btnCards.classList.remove('active');
        if(cardsGrid) cardsGrid.style.display = 'none';
        if(canvasWrap){
          canvasWrap.style.display = 'block';
          window.dispatchEvent(new Event('resize'));
        }
      });
    }

    // Initialize Cyber Canvas
    initCyberCanvas();

    // Initial render
    renderNode('sql_server');
  }

  window.ProcessPipeline = {
    renderNode: renderNode,
    runSimulation: runProcessSimulation,
    executeSqlQuery: executeSqlQuery
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
