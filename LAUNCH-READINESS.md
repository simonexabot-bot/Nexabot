# NexaTrade launch readiness

## Included in this starter

- Landing page, customer access pages, onboarding choices, and dashboard prototype.
- Restricted operations-console prototype for review and dual approval—not direct financial controls.
- Node/Express entry point for Railway and `/health` endpoint.
- Supabase migration with Auth IDs, Row Level Security, protected roles, an append-only portfolio ledger, and audit records.

## Non-negotiable product rules

1. **Never edit balances.** Calculate balances from immutable journal entries. Corrections are new offsetting entries tied to an approval and external reference.
2. **Never collect recovery phrases or private keys.** A customer must sign a non-custodial wallet transaction. Store public wallet addresses and permission summaries only.
3. **Never give one administrator unilateral transfer or trade power.** Use an appropriate provider, enforced staff MFA, separate requester/approver roles, spend limits, provider-webhook verification, and immutable audit logs.
4. **Never put the Supabase service-role key in browser code.** Store it exclusively as a Railway secret.

## Deployment sequence

1. Create a Supabase project and apply `supabase/migrations/001_secure_customer_ledger.sql` in its SQL editor.
2. Configure Supabase Auth: verified email, strong password rules, protected redirect URLs, rate limits/CAPTCHA, and MFA mandatory for operators.
3. Create a Railway service from this `outputs` folder. Railway runs `npm start`; add `.env.example` values using Railway's secret-variable interface. Verify `/health` returns `{"status":"ok"}`.
4. Replace the browser prototype’s `localStorage` login with Supabase Auth. Browser code can use only the Supabase URL and publishable key; privileged writes belong in a Railway API.
5. Build a Railway API that validates the Supabase JWT, checks KYC/risk status, enforces MFA and a two-person approval rule, calls the selected provider, verifies webhooks, and only then appends the ledger and audit records.
6. Integrate a wallet connector after security review. Show precise permissions, request customer signatures, simulate transactions, and give customers disconnect/revocation controls.
7. Select a custody/exchange partner and get counsel on licensing, KYC/AML, sanctions screening, consumer disclosures, reporting, geography, and asset safeguarding before accepting funds.
8. Complete independent smart-contract/application security audits, penetration testing, incident-response drills, monitoring, encrypted backups, and disaster-recovery testing.

## Release gates

- Counsel has approved product classification, registrations/licenses, disclosures, terms, privacy notice, and launch regions.
- The custody/exchange provider has passed production certification.
- KYC/AML and sanctions checks run before funding and continuously thereafter.
- Operator actions have MFA, least privilege, dual controls, rate limits, session monitoring, and append-only audit records.
- No test data, provider credentials, service-role keys, private keys, or recovery phrases exist in production code or repositories.
- An independent security review and a live incident-response exercise are complete.

## Decisions you still need to make

- Launch jurisdictions and the legal entity.
- Strictly non-custodial model vs. regulated custody partner.
- Custody/exchange provider, trading venue, supported chains/assets, and transfer limits.
- KYC/AML, sanctions-screening, and wallet-connector vendors.
