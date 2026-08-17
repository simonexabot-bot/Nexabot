// NEXA AI Arbitrage Bot Logic
// Handles arbitrage calculations, tier management, and airdrop system

const ARBITRAGE_CONFIG = {
  tiers: [
    {
      id: 'tier1',
      range: { min: 100, max: 500 },
      targetProfit: 0.5,
      maxTrades: 3,
      airdropMultiplier: 0.05,
      name: 'Starter'
    },
    {
      id: 'tier2',
      range: { min: 500, max: 2000 },
      targetProfit: 0.75,
      maxTrades: 5,
      airdropMultiplier: 0.06,
      name: 'Growth'
    },
    {
      id: 'tier3',
      range: { min: 2001, max: 5000 },
      targetProfit: 1.0,
      maxTrades: 5,
      airdropMultiplier: 0.07,
      name: 'Professional'
    },
    {
      id: 'tier4',
      range: { min: 5001, max: 10000 },
      targetProfit: 1.5,
      maxTrades: 7,
      airdropMultiplier: 0.08,
      name: 'Elite'
    },
    {
      id: 'tier5',
      range: { min: 10001, max: Infinity },
      targetProfit: 2.0,
      maxTrades: 7,
      airdropMultiplier: 0.10,
      name: 'Platinum'
    }
  ],
  
  supportedNetworks: [
    { id: 1, name: 'Ethereum', symbol: 'ETH', usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
    { id: 137, name: 'Polygon', symbol: 'MATIC', usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
    { id: 56, name: 'BNB Chain', symbol: 'BNB', usdt: '0x55d398326f99059fF775485246999027B3197955' },
    { id: 43114, name: 'Avalanche', symbol: 'AVAX', usdt: '0x9702230A8657203FB529F0DC7B46D6F2aa1C9456' },
    { id: 250, name: 'Fantom', symbol: 'FTM', usdt: '0x049d68029B375EF3d6b9c08F9c925aDC6671ff20' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH', usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' }
  ],
  
  // ANXB Token Configuration
  anxbToken: {
    symbol: 'ANXB',
    name: 'AINexaBot',
    network: 137, // Polygon
    totalSupply: 1000000000, // 1 billion
    decimals: 18
  }
};

/**
 * Determine which tier a user falls into based on deposit amount
 */
function getUserTier(depositAmount) {
  const deposit = parseFloat(depositAmount);
  for (const tier of ARBITRAGE_CONFIG.tiers) {
    if (deposit >= tier.range.min && deposit <= tier.range.max) {
      return tier;
    }
  }
  return ARBITRAGE_CONFIG.tiers[ARBITRAGE_CONFIG.tiers.length - 1]; // Default to highest
}

/**
 * Calculate airdrop amount based on deposit
 * Airdrop = Deposit * Tier Multiplier
 */
function calculateAirdrop(depositAmount) {
  const tier = getUserTier(depositAmount);
  const airdropAmount = parseFloat(depositAmount) * tier.airdropMultiplier;
  return {
    amount: airdropAmount,
    tier: tier,
    formatted: airdropAmount.toFixed(2)
  };
}

/**
 * Calculate potential earnings for a user's portfolio
 */
function calculatePotentialEarnings(depositAmount, tradesCompleted = 0) {
  const tier = getUserTier(depositAmount);
  const depositVal = parseFloat(depositAmount);
  
  // Calculate per-trade profit
  const profitPerTrade = (depositVal * tier.targetProfit) / 100;
  
  // Calculate for all possible trades at this tier
  const minEarnings = profitPerTrade * tier.maxTrades;
  const maxEarnings = minEarnings; // Since we use target profit
  
  // If trades already completed, calculate actual
  const completedEarnings = profitPerTrade * tradesCompleted;
  
  return {
    tier: tier,
    perTrade: profitPerTrade,
    totalPotential: minEarnings,
    completed: completedEarnings,
    remaining: minEarnings - completedEarnings,
    tradesRemaining: tier.maxTrades - tradesCompleted,
    roi: ((minEarnings / depositVal) * 100).toFixed(2)
  };
}

/**
 * Simulate arbitrage execution
 */
function simulateArbitrage(depositAmount, tradesPerDay = 1) {
  const tier = getUserTier(depositAmount);
  const depositVal = parseFloat(depositAmount);
  
  const trades = [];
  const dailyTarget = (depositVal * tier.targetProfit) / 100;
  
  for (let i = 0; i < tier.maxTrades; i++) {
    const randomVariance = (Math.random() * 0.3 - 0.15); // ±15% variance
    const profit = dailyTarget * (1 + randomVariance);
    const isSuccess = profit > 0;
    
    trades.push({
      id: `trade_${i + 1}`,
      pairFrom: 'USDT',
      pairTo: ['ETH', 'BTC', 'DAI', 'USDC'][Math.floor(Math.random() * 4)],
      entry: depositVal * (0.25 + (i * 0.15)),
      exitPrice: (depositVal * (0.25 + (i * 0.15))) * (1 + (profit / depositVal)),
      profit: isSuccess ? Math.abs(profit) : -Math.abs(profit * 0.5),
      profitPct: isSuccess ? tier.targetProfit + randomVariance : -(tier.targetProfit * 0.5),
      status: isSuccess ? 'success' : 'partial_loss',
      timestamp: new Date(Date.now() - (tier.maxTrades - i) * 86400000)
    });
  }
  
  return {
    tier: tier,
    trades: trades,
    totalProfit: trades.reduce((sum, t) => sum + t.profit, 0),
    successRate: (trades.filter(t => t.status === 'success').length / trades.length * 100).toFixed(1)
  };
}

/**
 * Get network configuration
 */
function getNetworkConfig(chainId) {
  return ARBITRAGE_CONFIG.supportedNetworks.find(n => n.id === chainId);
}

/**
 * Format large numbers for display
 */
function formatNumber(num, decimals = 2) {
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

/**
 * Build strategy HTML for tier display
 */
function buildTierHTML(tier) {
  return `
    <div class="tier-card ${tier.id === 'tier3' ? 'featured' : ''}">
      <div class="tier-badge">${tier.name.toUpperCase()}</div>
      <div class="tier-range">$${formatNumber(tier.range.min)} — $${tier.range.max === Infinity ? '∞' : '$' + formatNumber(tier.range.max)}</div>
      <h3>${tier.name}</h3>
      <div class="tier-stats">
        <div class="stat-item">
          <div class="stat-label">Target per trade</div>
          <div class="stat-value">${tier.targetProfit}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Max trades</div>
          <div class="stat-value">${tier.maxTrades}</div>
        </div>
      </div>
      <ul class="tier-features">
        <li>Up to ${tier.targetProfit}% per trade</li>
        <li>Maximum ${tier.maxTrades} trades</li>
        <li>${(tier.airdropMultiplier * 100).toFixed(0)}% ANXB airdrop</li>
        <li>24/7 bot execution</li>
      </ul>
      <a href="login.html" class="button" style="width: 100%; margin-top: 16px;">Select this tier</a>
    </div>
  `;
}

/**
 * Build airdrop calculator HTML
 */
function buildAirdropCalculator() {
  return `
    <div class="airdrop-section" id="airdrop">
      <div class="airdrop-badge">✨ Free Airdrop</div>
      <h2>Get Free ANXB Tokens</h2>
      <p class="airdrop-description">
        Deposit any amount of USDT and receive free ANXB tokens equal to your deposit multiplied by your tier's airdrop rate.
      </p>
      
      <div style="max-width: 400px; margin: 30px auto;">
        <label style="display: block; margin-bottom: 12px; text-align: left;">
          <span style="display: block; margin-bottom: 6px; color: var(--text-secondary); font-size: 14px;">Your deposit amount</span>
          <input type="number" id="airdrop-input" placeholder="e.g., 5000" 
                 min="100" step="100"
                 style="width: 100%; padding: 12px; border: 2px solid var(--nexa-primary); border-radius: 8px; background: var(--nexa-dark); color: var(--nexa-primary); font-size: 16px; font-weight: 600;">
        </label>
      </div>
      
      <div class="airdrop-calc">
        <div class="calc-item">
          <div class="calc-label">Your tier</div>
          <div class="calc-amount" id="calc-tier">—</div>
        </div>
        <div class="calc-item">
          <div class="calc-label">Free ANXB</div>
          <div class="calc-amount" id="calc-airdrop">—</div>
        </div>
        <div class="calc-item">
          <div class="calc-label">Potential earnings</div>
          <div class="calc-amount" id="calc-earnings">—</div>
        </div>
      </div>
      
      <a href="login.html" class="airdrop-button">Claim Your Airdrop</a>
    </div>
  `;
}

/**
 * Initialize airdrop calculator on page load
 */
function initAirdropCalculator() {
  const input = document.getElementById('airdrop-input');
  if (!input) return;
  
  const updateCalculations = () => {
    const amount = parseFloat(input.value) || 0;
    
    if (amount < 100) {
      document.getElementById('calc-tier').textContent = '—';
      document.getElementById('calc-airdrop').textContent = '—';
      document.getElementById('calc-earnings').textContent = '—';
      return;
    }
    
    const tier = getUserTier(amount);
    const airdrop = calculateAirdrop(amount);
    const earnings = calculatePotentialEarnings(amount);
    
    document.getElementById('calc-tier').textContent = tier.name;
    document.getElementById('calc-airdrop').textContent = formatNumber(airdrop.amount) + ' ANXB';
    document.getElementById('calc-earnings').textContent = '$' + formatNumber(earnings.totalPotential);
  };
  
  input.addEventListener('input', updateCalculations);
  input.addEventListener('change', updateCalculations);
}

/**
 * Render all tiers
 */
function renderAllTiers(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = ARBITRAGE_CONFIG.tiers
    .map(tier => buildTierHTML(tier))
    .join('');
}

/**
 * Export for use in other scripts
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ARBITRAGE_CONFIG,
    getUserTier,
    calculateAirdrop,
    calculatePotentialEarnings,
    simulateArbitrage,
    getNetworkConfig,
    formatNumber,
    buildTierHTML,
    buildAirdropCalculator,
    initAirdropCalculator,
    renderAllTiers
  };
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initAirdropCalculator();
  });
} else {
  initAirdropCalculator();
}
