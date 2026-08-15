const express = require('express');
const helmet = require('helmet');
const fs = require('node:fs/promises');
const path = require('node:path');
const { loadConfig } = require('./src/config');
const { createAuth } = require('./src/auth');
const { CoinbaseMarketData } = require('./src/market-data');
const { CustodyProvider } = require('./src/provider');
const { PaperBroker } = require('./src/paper-broker');
const { SupabaseOps } = require('./src/supabase-ops');
const { ReconciliationService } = require('./src/reconciliation');
const { createApi, webhookHandler } = require('./src/api');

const app = express();
const config = loadConfig();
const auth = createAuth(config), market = new CoinbaseMarketData(config.marketBaseUrl), provider = new CustodyProvider(config), paper = new PaperBroker(), store = new SupabaseOps(config), reconciliation = new ReconciliationService({ provider, store });
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.post('/api/webhooks/provider', express.raw({ type: 'application/json', limit: '256kb' }), webhookHandler({ provider, store }));
app.use('/api', express.json({ limit: '64kb' }), createApi({ config, auth, market, paper, provider, store, reconciliation }));
app.use(async (request, response, next) => {
  try {
    if (request.method !== 'GET') return next();
    if (path.extname(request.path) && path.extname(request.path) !== '.html') return next();
    const requested = request.path === '/' ? 'index.html' : request.path.replace(/^\//, '');
    const relative = requested.endsWith('.html') ? requested : `${requested}.html`;
    const fullPath = path.resolve(__dirname, relative);
    if (!fullPath.startsWith(path.resolve(__dirname) + path.sep)) return next();
    let html; try { html = await fs.readFile(fullPath, 'utf8'); } catch { return next(); }
    const bootstrap = '<link rel="icon" href="images/favicon_io/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="images/favicon_io/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="images/favicon_io/favicon-16x16.png"><link rel="apple-touch-icon" sizes="180x180" href="images/favicon_io/apple-touch-icon.png"><link rel="manifest" href="images/favicon_io/site.webmanifest"><link rel="stylesheet" href="logo.css"><script src="site-config.js"></script><script defer src="site.js"></script>';
    html = html.replace('</head>', `${bootstrap}</head>`).replaceAll('+19171231234', '+16593002482').replaceAll('+1 917 123 1234', '+1 659 300 2482').replaceAll('19171231234', '16593002482');
    response.type('html').send(html);
  } catch (error) { next(error); }
});
app.use(express.static(__dirname, { extensions: ['html'], index: 'index.html' }));
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
app.use((error, _request, response, _next) => { const status = error.status || 500; if (status >= 500) console.error(error); response.status(status).json({ error: { code: error.code || 'internal_error', message: status >= 500 ? 'The service could not complete the request.' : error.message } }); });

const port = config.port;
app.listen(port, () => console.log(`NexaTrade starter listening on ${port}`));
