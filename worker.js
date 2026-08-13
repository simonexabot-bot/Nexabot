'use strict';
const crypto = require('node:crypto');
const { loadConfig } = require('./src/config');
const { CoinbaseMarketData } = require('./src/market-data');
const { SupabaseOps } = require('./src/supabase-ops');
const { PaperBroker } = require('./src/paper-broker');
const { ProcessLock } = require('./src/lock');
const { evaluate } = require('./bot/strategy-engine');

const config = loadConfig(), market = new CoinbaseMarketData(config.marketBaseUrl), store = new SupabaseOps(config), paper = new PaperBroker(), lock = new ProcessLock(), workerId = crypto.randomUUID();
async function cycle() {
  return lock.run('worker-cycle', async () => {
    const acquired = await store.acquireLease('paper-strategy-worker', workerId, Math.ceil(config.workerIntervalMs / 1000) + 30);
    if (!(acquired === true || acquired?.[0]?.acquire_worker_lease === true)) return { skipped: true, reason: 'distributed_lock' };
    const enrollments = await store.claimWork(25);
    for (const enrollment of enrollments || []) {
      const product = `${enrollment.asset_symbol}-USD`, candles = await market.candles(product, enrollment.granularity || 3600, 100), result = evaluate(candles, enrollment.strategy_code, enrollment.paper_position || null);
      await store.saveSignal({ enrollment_id: enrollment.id, customer_id: enrollment.customer_id, asset_symbol: enrollment.asset_symbol, trend: result.trend, signal: result.signal, reason: result.reason, reference_price: result.price, generated_at: new Date().toISOString(), metadata: { product, candleTime: candles.at(-1)?.time } });
      if (result.signal === 'enter_long' || result.signal === 'exit') {
        const side = result.signal === 'enter_long' ? 'buy' : 'sell', quantity = side === 'buy' ? Number(enrollment.paper_quantity) : Number(enrollment.paper_position?.quantity || 0);
        if (quantity > 0) { const order = paper.submit({ accountId: enrollment.account_id, product, side, quantity, referencePrice: result.price, idempotencyKey: `${enrollment.id}:${candles.at(-1).time}:${side}` }); await store.savePaperOrder({ id: order.id, enrollment_id: enrollment.id, idempotency_key: order.idempotencyKey, side, product, quantity, reference_price: order.referencePrice, fill_price: order.fillPrice, fee: order.fee, status: order.status, filled_at: order.filledAt }); }
      }
    }
    return { processed: enrollments?.length || 0, runId: crypto.randomUUID() };
  });
}

cycle().then(result => console.log('Worker cycle', result)).catch(error => console.error('Worker cycle failed', error));
setInterval(() => cycle().then(result => console.log('Worker cycle', result)).catch(error => console.error('Worker cycle failed', error)), config.workerIntervalMs);
