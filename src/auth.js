'use strict';
const { AppError } = require('./errors');

function bearer(request) {
  const value = request.get('authorization') || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function createAuth(config) {
  async function customer(request, _response, next) {
    try {
      const token = bearer(request);
      if (!token) throw new AppError(401, 'authentication_required', 'Sign in before using this endpoint.');
      const result = await fetch(`${config.supabaseUrl}/auth/v1/user`, { headers: { authorization: `Bearer ${token}`, apikey: config.supabasePublishableKey } });
      if (!result.ok) throw new AppError(401, 'invalid_session', 'The session is invalid or expired.');
      request.user = await result.json();
      next();
    } catch (error) { next(error); }
  }
  function internal(request, _response, next) {
    const token = bearer(request);
    if (!config.internalApiToken || token !== config.internalApiToken) return next(new AppError(401, 'internal_auth_required', 'A valid internal service token is required.'));
    next();
  }
  return { customer, internal };
}
module.exports = { createAuth };
