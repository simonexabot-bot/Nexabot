'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { CoinbaseMarketData } = require('../src/market-data');

test('market adapter normalizes candles oldest first', async () => {
  const fakeFetch = async () => ({ ok: true, json: async () => [[2, 9, 12, 10, 11, 4], [1, 8, 11, 9, 10, 3]] });
  const candles = await new CoinbaseMarketData('https://example.test', fakeFetch).candles('BTC-USD', 60, 2);
  assert.deepEqual(candles.map(x => x.time), [1, 2]); assert.equal(candles[1].close, 11);
});
