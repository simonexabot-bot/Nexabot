# Deploy the complete admin console

## 1. Apply the database migration

In Supabase SQL Editor, run the complete file:

`supabase/migrations/011_complete_admin_console.sql`

It must be run after migrations 001 through 010.

## 2. Deploy the browser files

Publish these updated files to the live website:

- `admin.html`
- `admin-auth.js`
- `app.css`
- `supabase-config.js`

After GitHub Pages reports a successful deployment, open the live `admin-login.html` in a dedicated administrator browser profile and hard-refresh with Ctrl+Shift+R.

## 3. Use two staff identities for trade approvals

One staff member prepares a trade request. A different `compliance_admin` must approve it. The database rejects self-approval.

## 4. Provider-dependent actions

Approved trades remain `provider_pending`; approved withdrawals remain internal approvals. They cannot execute until the Railway backend is connected to a custody/exchange provider or approved DEX and verifies signed provider webhooks.

Never place provider secrets, service-role keys, private keys, or recovery phrases in browser files or GitHub Pages.
