# What is required for deposits, wallet connections, and admin trading

## Fix customer data first

1. Run `004_backfill_and_deposit_workflow.sql` after migrations `001`–`003`.
2. Create a new test account. It will appear in **Authentication → Users** and also in `profiles` and `customer_accounts`.
3. Passwords will never appear in a database table; Supabase Auth handles password storage.
4. To make your own test account an admin, run this in Supabase SQL editor, replacing the email:

```sql
update public.profiles
set role = 'compliance_admin'
where id = (select id from auth.users where email = 'YOUR-ADMIN-EMAIL@example.com');
```

## Wallet connection

Use a wallet connector (for example, WalletConnect/Reown or a provider SDK) through the Railway API. The API should:

1. Generate a one-time message/nonce.
2. Ask the customer to connect and sign that message in their wallet.
3. Verify the signature server-side and store only the public address, chain, and exact permission summary.
4. Require a fresh customer signature for every transfer or trade approval where the model is non-custodial.

Never request a seed phrase/private key or create a blanket “admin can withdraw” permission.

## Managed deposits and portfolio balances

1. Integrate an appropriately approved custody or exchange provider that can issue a deposit address for each customer/account/asset/chain.
2. Railway requests that address and records it in `deposit_instructions`.
3. The provider webhook reports an on-chain deposit. Railway verifies the webhook signature, transaction hash, network, asset, address, amount, and confirmation count.
4. A different authorised staff member approves the reviewed deposit.
5. Railway inserts an immutable positive `deposit` entry into `portfolio_ledger`; the customer dashboard calculates balance from the ledger.

## Trading/admin workflow

1. Customer consents to the selected strategy and account/custody terms.
2. Operator submits a trade instruction with account, asset, limits, and provider reference.
3. A different compliance admin approves it after checks.
4. Railway sends the order to the approved provider, verifies its fill webhook, then writes a `trade_fill` ledger entry and audit event.

No browser page, Supabase RLS rule, or administrator should directly update balances, custody assets, or execute trades without this server-controlled workflow.
