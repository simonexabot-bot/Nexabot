'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../bot/strategy-engine');

test('strategy engine holds until enough completed candles exist', () => assert.equal(evaluate([], 'balanced_v1').reason, 'insufficient_data'));
test('strategy engine identifies an established rising market', () => {
  const candles = Array.from({ length: 80 }, (_, index) => ({ open: 100 + index, high: 101 + index, low: 99 + index, close: 100 + index }));
  assert.equal(evaluate(candles, 'conservative_v1').signal, 'enter_long');
});
