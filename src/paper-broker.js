'use strict';
const crypto = require('node:crypto');
const { AppError } = require('./errors');

class PaperBroker {
  constructor({ feeBps = 10, slippageBps = 5 } = {}) { this.feeBps = feeBps; this.slippageBps = slippageBps; this.orders = new Map(); this.positions = new Map(); }
  submit(input) {
    const { accountId, product, side, quantity, referencePrice, idempotencyKey } = input;
    if (!accountId || !product || !['buy', 'sell'].includes(side) || !(quantity > 0) || !(referencePrice > 0)) throw new AppError(400, 'invalid_order', 'Account, product, side, positive quantity, and reference price are required.');
    const key = idempotencyKey || crypto.randomUUID();
    if (this.orders.has(key)) return this.orders.get(key);
    const slip = this.slippageBps / 10_000, fillPrice = referencePrice * (side === 'buy' ? 1 + slip : 1 - slip), fee = fillPrice * quantity * this.feeBps / 10_000;
    const order = { id: crypto.randomUUID(), idempotencyKey: key, accountId, product, side, quantity, referencePrice, fillPrice, fee, status: 'filled', mode: 'paper', filledAt: new Date().toISOString() };
    const positionKey = `${accountId}:${product}`, current = this.positions.get(positionKey) || { quantity: 0, cost: 0 };
    if (side === 'buy') { current.cost += fillPrice * quantity + fee; current.quantity += quantity; }
    else { if (quantity > current.quantity) throw new AppError(409, 'insufficient_paper_position', 'Paper sell quantity exceeds the position.'); current.quantity -= quantity; current.cost *= current.quantity === 0 ? 0 : current.quantity / (current.quantity + quantity); }
    this.positions.set(positionKey, current); this.orders.set(key, order); return order;
  }
  listOrders(accountId) { return [...this.orders.values()].filter(x => !accountId || x.accountId === accountId); }
  listPositions(accountId) { return [...this.positions].filter(([key]) => !accountId || key.startsWith(`${accountId}:`)).map(([key, value]) => ({ product: key.split(':').slice(1).join(':'), ...value })); }
}
module.exports = { PaperBroker };
