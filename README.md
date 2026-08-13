# NexaTrade / Nexabot

Customer portal, operations console, secured Railway API, and deterministic paper-trading worker for a managed digital-asset product.

## Run locally

1. Configure the values documented in `.env.example`.
2. Apply the existing Supabase schema, followed by `supabase/migrations/020_operations_runtime.sql`.
3. Run `npm start` for the website/API and `npm run worker` as a separate service.
4. Run `npm test` and `npm run lint` before deployment.

`LIVE_TRADING_ENABLED` defaults to `false`. Paper orders simulate fees and slippage. A real custody/exchange provider must be configured and certified before live operation.
