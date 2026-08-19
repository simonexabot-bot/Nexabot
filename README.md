# NexaTrade / Nexabot

Customer portal, operations console, secured Railway API, and deterministic paper-trading worker for a managed digital-asset product.

## Run locally

1. Configure the values documented in `.env.example`.
2. Apply the existing Supabase schema, followed by `supabase/migrations/020_operations_runtime.sql`.
   Apply `supabase/migrations/021_anxb_airdrop_admin.sql` afterward to enable customer ANXB claims, administrator approval, credited balances, and administrator gifts.
   Apply `supabase/migrations/022_monthly_arbitrage_simulation.sql` and `023_simulation_bulk_controls.sql`. For Academy and ANXB product purchases, apply `supabase/migrations/025_anxb_product_commerce.sql` after migration 021. Migration 025 is self-contained and replaces the broken customer dependency on migration 024. It treats approved ANXB airdrops and administrator gifts as spendable product credit, records purchases in an immutable spend ledger, and gives existing customers complimentary early-member course access.
   Apply `supabase/migrations/026_anxb_ecosystem_complete.sql` afterward for the marketplace, statements, refunds, spending freezes, course progress, presale order verification, authentic-review moderation, and disabled-by-default on-chain configuration.
   Apply `supabase/migrations/027_anxb_delivery_and_controls.sql` for locked course delivery, quizzes, resume position, certificates, complete statements, balance exports, verified public reviews, security events and the emergency commerce pause.
3. Run `npm start` for the website/API and `npm run worker` as a separate service.
   The worker must remain online for the whole simulation period. Each active run stores its balance, worker heartbeat, trades, fees, spreads, and profit in Supabase, so browser windows may be closed.
4. Run `npm test` and `npm run lint` before deployment.

`LIVE_TRADING_ENABLED` defaults to `false`. Paper orders simulate fees and slippage. A real custody/exchange provider must be configured and certified before live operation.
