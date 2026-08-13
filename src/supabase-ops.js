'use strict';
const { AppError } = require('./errors');

class SupabaseOps {
  constructor(config, fetchImpl = fetch) { this.url = config.supabaseUrl.replace(/\/$/, ''); this.key = config.supabaseServiceRoleKey; this.fetch = fetchImpl; }
  configured() { return Boolean(this.url && this.key); }
  async request(path, { method = 'GET', body, headers = {} } = {}) {
    if (!this.configured()) throw new AppError(503, 'operations_store_not_configured', 'SUPABASE_SERVICE_ROLE_KEY is required by the operations service.');
    const response = await this.fetch(`${this.url}/rest/v1/${path}`, { method, headers: { apikey: this.key, authorization: `Bearer ${this.key}`, 'content-type': 'application/json', prefer: 'return=representation', ...headers }, body: body == null ? undefined : JSON.stringify(body) });
    if (!response.ok) throw new AppError(502, 'operations_store_error', `Operations database returned ${response.status}: ${await response.text()}`);
    const text = await response.text(); return text ? JSON.parse(text) : null;
  }
  rpc(name, args = {}) { return this.request(`rpc/${name}`, { method: 'POST', body: args }); }
  recordProviderEvent(event) { return this.request('provider_events', { method: 'POST', headers: { prefer: 'resolution=ignore-duplicates,return=representation' }, body: event }); }
  claimWork(limit = 25) { return this.rpc('worker_claim_bot_enrollments', { p_limit: limit }); }
  acquireLease(key, owner, seconds = 90) { return this.rpc('acquire_worker_lease', { p_key: key, p_owner: owner, p_seconds: seconds }); }
  saveSignal(signal) { return this.request('strategy_signals', { method: 'POST', body: signal }); }
  savePaperOrder(order) { return this.request('paper_orders', { method: 'POST', headers: { prefer: 'resolution=ignore-duplicates,return=representation' }, body: order }); }
  saveReconciliation(run) { return this.request('reconciliation_runs', { method: 'POST', body: run }); }
}
module.exports = { SupabaseOps };
