# Run this in Supabase now

The SQL files have dependencies. Run them individually in Supabase SQL Editor, in this exact order:

1. `supabase/migrations/001_secure_customer_ledger.sql` — already run.
2. `supabase/migrations/002_legal_consents.sql`
3. `supabase/migrations/003_auth_bootstrap.sql`
4. `supabase/migrations/004_backfill_and_deposit_workflow.sql`
5. `supabase/migrations/005_customer_funding_requests.sql`

Click **Run** after pasting each complete file. Stop immediately if a file displays an error; do not run the next file yet.

## Verify tables

Run this after all five complete:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

You must see: `profiles`, `customer_accounts`, `deposit_instructions`, `funding_requests`, `withdrawal_requests`, and `wallet_connection_requests`.

## Make the logged-in user admin

First check the account exists:

```sql
select p.id, p.display_name, p.role, u.email
from public.profiles p
join auth.users u on u.id = p.id;
```

Then update your row using the exact email shown in the result:

```sql
update public.profiles
set role = 'compliance_admin'
where id = (select id from auth.users where email = 'YOUR-EMAIL@example.com');
```

## Test deposit address only

After `deposit_instructions` exists, find the customer account ID:

```sql
select a.id as account_id, u.email, a.status
from public.customer_accounts a
join auth.users u on u.id = a.customer_id;
```

For a test account only, add a confirmed provider-issued address in Table Editor → `deposit_instructions`, or use this SQL after replacing every placeholder:

```sql
insert into public.deposit_instructions
  (account_id, chain_id, asset_symbol, deposit_address, provider_reference, status)
values
  ('CUSTOMER_ACCOUNT_UUID', 1, 'USDT', 'PROVIDER_ISSUED_ADDRESS', 'test-address-001', 'active');
```

The chain ID and address must match the exact network shown to the customer. Never use this test process for customer funds; a live address must be issued and monitored by the approved custody/exchange provider.
