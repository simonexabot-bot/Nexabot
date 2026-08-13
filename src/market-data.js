'use strict';
const { AppError } = require('./errors');

const GRANULARITIES = new Set([60, 300, 900, 3600, 21600, 86400]);
class CoinbaseMarketData {
  constructor(baseUrl, fetchImpl = fetch) { this.baseUrl = baseUrl.replace(/\/$/, ''); this.fetch = fetchImpl; }
  async candles(product = 'BTC-USD', granularity = 3600, limit = 100) {
    if (!/^[A-Z0-9]{2,12}-[A-Z0-9]{2,12}$/.test(product)) throw new AppError(400, 'invalid_product', 'Use a product such as BTC-USD.');
    if (!GRANULARITIES.has(granularity)) throw new AppError(400, 'invalid_granularity', 'Unsupported candle granularity.');
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await this.fetch(`${this.baseUrl}/products/${product}/candles?granularity=${granularity}`, { headers: { 'user-agent': 'NexaTrade/0.2' }, signal: controller.signal });
      if (!response.ok) throw new AppError(502, 'market_data_unavailable', `Market data returned ${response.status}.`);
      const rows = await response.json();
      return rows.slice(0, Math.min(300, limit)).map(([time, low, high, open, close, volume]) => ({ time, low, high, open, close, volume })).sort((a, b) => a.time - b.time);
    } finally { clearTimeout(timeout); }
  }
}
module.exports = { CoinbaseMarketData };
