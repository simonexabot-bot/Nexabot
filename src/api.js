'use strict';
const express = require('express');
const crypto = require('node:crypto');

function createApi({ config, auth, market, paper, provider, store, reconciliation }) {
  const api = express.Router();
  api.get('/health', (_request, response) => response.json({ status: 'ok', liveTradingEnabled: config.liveTradingEnabled, providerConfigured: config.providerName !== 'unconfigured' && Boolean(config.providerApiKey), operationsStoreConfigured: store.configured() }));
  api.get('/market/candles', async (request, response) => response.json({ candles: await market.candles(String(request.query.product || 'BTC-USD').toUpperCase(), Number(request.query.granularity || 3600), Number(request.query.limit || 100)) }));
  api.post('/paper/orders', auth.customer, (request, response) => response.status(201).json(paper.submit({ ...request.body, accountId: request.user.id })));
  api.get('/paper/orders', auth.customer, (request, response) => response.json({ orders: paper.listOrders(request.user.id), positions: paper.listPositions(request.user.id) }));
  api.post('/deposits/instructions', auth.customer, async (request, response) => {
    const result = await provider.provisionDeposit({ customerId: request.user.id, asset: request.body.asset, chainId: request.body.chainId, idempotencyKey: request.get('idempotency-key') || crypto.randomUUID() });
    response.status(201).json({ address: result.address, asset: result.asset, chainId: result.chainId, providerReference: result.id });
  });
  api.post('/live/orders', auth.internal, async (request, response) => response.status(202).json(await provider.submitOrder({ ...request.body, idempotencyKey: request.get('idempotency-key') || crypto.randomUUID() })));
  api.post('/reconciliation/run', auth.internal, async (_request, response) => response.json(await reconciliation.run()));
  return api;
}

function webhookHandler({ provider, store }) {
  return async (request, response) => {
    const raw = request.body;
    if (!provider.verifyWebhook(raw, request.get('x-provider-signature'))) return response.status(401).json({ error: { code: 'invalid_webhook_signature', message: 'Webhook signature was not valid.' } });
    let event; try { event = JSON.parse(raw.toString('utf8')); } catch { return response.status(400).json({ error: { code: 'invalid_json', message: 'Webhook body must be JSON.' } }); }
    if (!event.id || !event.type) return response.status(400).json({ error: { code: 'invalid_event', message: 'Provider event id and type are required.' } });
    await store.recordProviderEvent({ provider_event_id: event.id, event_type: event.type, payload: event, received_at: new Date().toISOString(), processing_status: 'received' });
    response.status(202).json({ accepted: true, eventId: event.id });
  };
}
module.exports = { createApi, webhookHandler };
