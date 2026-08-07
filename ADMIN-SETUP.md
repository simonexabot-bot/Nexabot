# Separate customer and administrator accounts

One Supabase Auth user has one profile and one role. Do not use the same email/password for a customer and an administrator.

## 1. Preserve the existing account as a customer

Replace the email and run this in Supabase SQL Editor:

```sql
update public.profiles
set role = 'customer'
where id = (select id from auth.users where lower(email) = lower('EXISTING-CUSTOMER@example.com'));
```

This is safer than deleting the user because customer accounts and requests may already reference it.

After migration `007_identity_administration.sql`, the equivalent checked command is:

```sql
select private.demote_user_to_customer('EXISTING-CUSTOMER@example.com');
```

## 2. Create a dedicated staff identity

In Supabase Dashboard, open **Authentication → Users → Add user**. Create a new user with a different staff-only email and a strong temporary password. Enable email confirmation as appropriate.

After the user exists, promote only that new identity:

```sql
select private.promote_user_to_compliance_admin('NEW-ADMIN@example.com');
```

Verify the separation:

```sql
 
```

The customer must show `customer`; the dedicated staff identity must show `compliance_admin`.

## Delete an unused test identity

The Supabase dashboard cannot directly delete a user while the automatically created customer account references it. Use this only for a disposable test identity with no financial, legal, or administrative history:

```sql
select private.delete_unused_test_user(
  'TEST-USER@example.com',
  'DELETE TEST-USER@example.com'
);
```

The confirmation is case-sensitive and must match exactly. The function automatically removes disposable wallet/setup records. It refuses deletion when the identity has deposits, ledger entries, consents, reviews, or administrative history.

## 3. Use the correct portals

- Customers: `login.html`
- Administrators: `admin-login.html`

Log out before switching between portals. Production administrators must enable MFA in Supabase Auth.

## 4. Complete operations

After running migration `006_admin_operations.sql`, the administrator console can:

- activate or restrict customer accounts;
- approve or reject wallet ownership requests;
- assign a provider-issued deposit address to a customer account.

Only enter a deposit address issued by the approved custody/exchange provider for that exact customer, asset, and chain. The console does not move funds or edit balances.
