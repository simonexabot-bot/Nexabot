'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PaperBroker } = require('../src/paper-broker');

test('paper broker fills with fees and slippage and is idempotent', () => {
  const broker = new PaperBroker({ feeBps: 10, slippageBps: 5 });
  const input = { accountId: 'customer-1', product: 'BTC-USD', side: 'buy', quantity: 0.1, referencePrice: 50_000, idempotencyKey: 'candle-1' };
  const first = broker.submit(input), second = broker.submit(input);
  assert.equal(first.id, second.id); assert.equal(first.fillPrice, 50_025); assert.equal(first.fee, 5.0025);
  assert.equal(broker.listPositions('customer-1')[0].quantity, 0.1);
});

test('paper broker rejects overselling', () => {
  const broker = new PaperBroker();
  assert.throws(() => broker.submit({ accountId: 'a', product: 'ETH-USD', side: 'sell', quantity: 1, referencePrice: 100, idempotencyKey: 'x' }), /exceeds/);
});
