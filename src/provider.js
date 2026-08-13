'use strict';
const crypto = require('node:crypto');
const { AppError } = require('./errors');

class CustodyProvider {
  constructor(config, fetchImpl = fetch) { this.config = config; this.fetch = fetchImpl; }
  assertConfigured() {
    if (!this.config.providerApiKey || !this.config.providerBaseUrl || this.config.providerName === 'unconfigured') throw new AppError(503, 'provider_not_configured', 'Custody provider integration has not been configured.');
  }
  async request(path, body) {
    this.assertConfigured();
    const response = await this.fetch(`${this.config.providerBaseUrl.replace(/\/$/, '')}${path}`, { method: 'POST', headers: { authorization: `Bearer ${this.config.providerApiKey}`, 'content-type': 'application/json', 'idempotency-key': body.idempotencyKey }, body: JSON.stringify(body) });
    if (!response.ok) throw new AppError(502, 'provider_error', `Custody provider returned ${response.status}.`);
    return response.json();
  }
  provisionDeposit(input) { return this.request('/v1/deposit-addresses', input); }
  submitOrder(input) {
    if (!this.config.liveTradingEnabled) throw new AppError(409, 'live_trading_disabled', 'Live trading is disabled. Use paper mode.');
    return this.request('/v1/orders', input);
  }
  verifyWebhook(rawBody, signature) {
    if (!this.config.webhookSecret || !signature) return false;
    const expected = crypto.createHmac('sha256', this.config.webhookSecret).update(rawBody).digest('hex');
    const supplied = String(signature).replace(/^sha256=/, '');
    return expected.length === supplied.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
  }
}
module.exports = { CustodyProvider };
