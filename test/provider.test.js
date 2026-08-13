'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { CustodyProvider } = require('../src/provider');

test('provider verifies signed webhook bodies', () => {
  const secret = 'test-secret', body = Buffer.from('{"id":"evt_1"}'), signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const provider = new CustodyProvider({ webhookSecret: secret });
  assert.equal(provider.verifyWebhook(body, `sha256=${signature}`), true);
  assert.equal(provider.verifyWebhook(body, 'sha256=bad'), false);
});

test('live orders are disabled by default', () => {
  const provider = new CustodyProvider({ providerName: 'sandbox', providerBaseUrl: 'https://provider.invalid', providerApiKey: 'key', liveTradingEnabled: false });
  assert.throws(() => provider.submitOrder({}), /Live trading is disabled/);
});
