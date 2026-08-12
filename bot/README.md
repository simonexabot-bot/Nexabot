# Bot execution boundary

`strategy-engine.js` is a deterministic paper-trading signal engine. It is not an AI model and it does not place orders.

It accepts at least 60 completed OHLC candles and returns:

- `trend`: bullish, bearish or neutral
- `signal`: enter_long, exit or hold
- `reason`: the filter or risk rule responsible
- target/stop reference prices when applicable

The engine combines EMA direction, a longer regime filter, adaptive volatility bands and (for Growth) a Donchian breakout. It evaluates only completed candles supplied by the future worker.

Current boundary: long-only spot behaviour. A bearish trend exits or remains uninvested. Short orders require a separately approved derivatives provider, leverage/margin controls, jurisdiction review and explicit customer suitability.

## Still required for paper operation

1. Server-side market-data adapter with completed-candle validation.
2. Scheduler and distributed lock so only one worker handles an enrollment.
3. Paper positions/orders tables and fee/slippage simulation.
4. Account-level exposure, daily-loss and drawdown service.
5. Signal-version and candle-source audit records.
6. Reconciliation that converts simulated fills into reporting records.

## Still required for live operation

1. Named custody/exchange or DEX provider.
2. Server-held provider credentials or constrained smart-account signer.
3. Provider subaccount/wallet capability checks.
4. Idempotent order submission, partial-fill handling and cancellation.
5. Market, limit, precision, minimum-size and balance validation.
6. Provider webhooks plus independent fill reconciliation.
7. Emergency-stop testing under provider/network failure.
8. Paper-to-live release approval for each strategy version.

Targets of 0.6%, 1% and 3% are gross price exits. They are not net profit guarantees. Fees, spread, slippage, gaps, failed exits and taxes can reduce or reverse results.
