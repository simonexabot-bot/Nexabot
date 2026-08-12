# NexaTrade strategy research library

These scripts are research and paper-trading candidates. They are not promises of profit and must not be connected to customer capital until data-quality, backtest, walk-forward, fee/slippage, paper-trading and risk reviews pass.

## Submitted code review

### Double EMA Trend Color (Pine indicator)

- Type: indicator and alert generator, not a trading strategy.
- Signal: bullish when EMA(5) crosses above EMA(13); bearish on the reverse.
- Best use: a simple momentum/trend component or visual confirmation.
- Main weakness: frequent false signals in sideways markets.
- Missing: order rules, position sizing, stop loss, take profit, fee/slippage model, trend filter, cooldown and maximum-loss controls.
- Alert safety: production alerts should trigger on a confirmed bar, not an unfinished candle.

### AdaptiveTrendFlow_Simple.mq5

All four supplied attachments have the same SHA-256 content and end with a literal ellipsis, so the EA is incomplete and cannot be compiled as supplied.

What it attempts to do:

1. Calculate a fast and slow center from HLC3 prices.
2. Estimate volatility and smooth it.
3. Build upper/lower volatility bands around the center.
4. Change bullish when price breaks the upper band and bearish when it breaks the lower band.
5. Close the opposite position and open a fixed-lot trade with fixed-point SL/TP.

Material issues:

- `fastEMA` and `slowEMA` are arithmetic means, not EMAs.
- Volatility is measured around the current HLC3 value instead of a window mean.
- It reads bar index 0 immediately after a new candle opens; signals are based on an unfinished bar.
- `ActiveLevel` is displayed/stored but not used for the transition test.
- A fixed lot and fixed number of points do not normalize risk across symbols.
- No spread, minimum-stop-distance, market-hours, liquidity or stale-price checks are visible.
- `OrderSend()` success alone is insufficient; the trade result code must also be verified.
- No daily loss, equity drawdown, exposure, cooldown or correlated-position controls are visible.
- The constant magic number can collide across accounts/strategies.
- The file carries third-party copyright; confirm licensing before reuse.

## Research candidates included

| Script | Market regime | Core idea | Principal risk |
|---|---|---|---|
| `ema_trend_guard.pine` | Directional/trending | EMA cross with long-term trend filter | Whipsaw after trend ends |
| `adaptive_trend_flow.pine` | Medium/strong trends | Volatility-band state change | Late entry after large move |
| `donchian_atr_breakout.pine` | Expanding volatility | Break prior range with ATR exits | False breakout/slippage |
| `bollinger_rsi_reversion.pine` | Liquid uptrends with pullbacks | Buy statistical oversold pullbacks | Continuing selloff |

Do not combine them by majority vote without testing. Trend and mean-reversion models intentionally react differently; a regime selector should decide which family may trade.

## Required promotion gates

1. Define venue, symbols, timeframe and long/short permissions.
2. Use point-in-time candles with missing-bar and duplicate handling.
3. Backtest with maker/taker fees, spread, slippage and funding costs.
4. Separate development, validation and untouched out-of-sample periods.
5. Run walk-forward tests and parameter-stability tests.
6. Stress gaps, API failures, partial fills and price-feed delays.
7. Paper trade for a meaningful period using the exact production order path.
8. Enforce account-level maximum daily loss and drawdown outside strategy code.
9. Require an independent strategy-version approval before live activation.
10. Reconcile every provider fill into the immutable portfolio ledger.

Useful metrics: net return, maximum drawdown, profit factor, expectancy, Sharpe/Sortino with caveats, turnover, exposure time, average slippage, tail loss, consecutive losses and performance by market regime. Win rate alone is not sufficient.
