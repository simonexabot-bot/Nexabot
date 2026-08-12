# Supabase deployment order

## Existing project: repair it now

If migration 019 has not been applied, run `supabase/migrations/019_final_schema_reconciliation.sql` first. Then run `supabase/migrations/020_live_staff_chat_handoff.sql`.

The final result row must show:

- `schema_version` = `020`
- `customer_presence_ready` = `true`
- `staff_claim_ready` = `true`
- `automation_handoff_ready` = `true`

Wait about 10 seconds for the Supabase API schema cache to reload, hard-refresh the customer and staff pages, then open Admin → System health → Run checks. Every module must say `ready`.

Do not approve or settle the current BTC test request shown as chain `1` with an `0x…` destination. That mixes native Bitcoin with Ethereum. Use **Cancel & release reservation**, then submit a correctly matched asset, network and address.

## Clean Supabase project

For a brand-new database, run every file individually in numeric order from `001` through `020`. Stop on the first SQL error and resolve it before proceeding. Never skip an earlier migration.

## Staff account creation

1. In Supabase Dashboard → Authentication → Users, create/invite a separate email/password user.
2. Sign into the website as compliance administrator.
3. Open Admin → Staff chat.
4. Enter that exact Auth email, display name and chat capacity, then choose **Enable staff chat access**.
5. The staff member signs in through `staff-login.html`.

The public website intentionally cannot create privileged staff or administrator Auth users.

## Withdrawal settlement behavior

- Submitted/approved withdrawals reduce **available balance** immediately by reservation.
- Approval alone does not reduce settled portfolio holdings.
- After the provider genuinely broadcasts the transfer, record its real transaction ID.
- After confirmation, **Confirm settlement & deduct ledger** inserts one immutable negative ledger entry and changes the request to `completed`.
- The customer total portfolio then reflects the deduction after refresh.
- If an approved request has the wrong asset/network/address and was not broadcast, cancel it to release the reservation.

Never enter a fabricated hash or confirmation count. The website records provider evidence; it does not independently prove an on-chain transfer.
