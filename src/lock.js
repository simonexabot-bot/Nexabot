'use strict';
class ProcessLock {
  constructor() { this.held = new Set(); }
  async run(key, work) { if (this.held.has(key)) return { skipped: true, reason: 'locked' }; this.held.add(key); try { return await work(); } finally { this.held.delete(key); } }
}
module.exports = { ProcessLock };
