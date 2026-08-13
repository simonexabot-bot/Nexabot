'use strict';
const crypto = require('node:crypto');

class ReconciliationService {
  constructor({ provider, store }) { this.provider = provider; this.store = store; }
  async run() {
    const startedAt = new Date().toISOString(), id = crypto.randomUUID();
    let status = 'completed', summary;
    try {
      this.provider.assertConfigured();
      const providerState = await this.provider.request('/v1/reconciliation/snapshot', { idempotencyKey: id });
      summary = { provider: this.provider.config.providerName, providerState, mismatches: providerState.mismatches || [] };
      if (summary.mismatches.length) status = 'attention_required';
    } catch (error) { status = 'failed'; summary = { error: error.code || 'reconciliation_failed', message: error.message }; }
    const run = { id, started_at: startedAt, completed_at: new Date().toISOString(), status, summary };
    if (this.store.configured()) await this.store.saveReconciliation(run);
    return run;
  }
}
module.exports = { ReconciliationService };
