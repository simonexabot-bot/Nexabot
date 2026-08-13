'use strict';

function bool(value, fallback = false) {
  if (value == null) return fallback;
  return String(value).toLowerCase() === 'true';
}

function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT || 3000),
    supabaseUrl: env.SUPABASE_URL || '',
    supabasePublishableKey: env.SUPABASE_PUBLISHABLE_KEY || '',
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || '',
    internalApiToken: env.INTERNAL_API_TOKEN || '',
    providerName: env.CUSTODY_PROVIDER_NAME || 'unconfigured',
    providerBaseUrl: env.CUSTODY_PROVIDER_BASE_URL || '',
    providerApiKey: env.CUSTODY_PROVIDER_API_KEY || '',
    webhookSecret: env.PROVIDER_WEBHOOK_SECRET || '',
    marketBaseUrl: env.MARKET_DATA_BASE_URL || 'https://api.exchange.coinbase.com',
    workerIntervalMs: Math.max(10_000, Number(env.WORKER_INTERVAL_MS || 60_000)),
    liveTradingEnabled: bool(env.LIVE_TRADING_ENABLED, false),
    nodeEnv: env.NODE_ENV || 'development'
  };
}

module.exports = { loadConfig };
