(function (global) {
  const ANXB_CONFIG = {
    symbol: 'ANXB',
    name: 'AINexaBot',
    description: 'Arbitrage-backed wallet yield token',
    airdropMultiplier: 1,
    rewardTiers: [
      { label: 'Starter', min: 0, max: 500, dailyYield: 0.5 },
      { label: 'Growth', min: 500, max: 2000, dailyYield: 0.75 },
      { label: 'Momentum', min: 2000, max: 10000, dailyYield: 1 },
      { label: 'Alpha', min: 10000, dailyYield: 1.5 }
    ]
  };

  const SUPPORTED_NETWORKS = [
    { chainId: 1, name: 'Ethereum', symbol: 'USDT', usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { chainId: 10, name: 'Optimism', symbol: 'USDT', usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
    { chainId: 56, name: 'BNB Chain', symbol: 'USDT', usdt: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    { chainId: 137, name: 'Polygon', symbol: 'USDT', usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { chainId: 250, name: 'Fantom', symbol: 'USDT', usdt: '0x049d68029B375EF3d6b9c08F9c925aDC6671ff20', decimals: 6 },
    { chainId: 42161, name: 'Arbitrum', symbol: 'USDT', usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
    { chainId: 8453, name: 'Base', symbol: 'USDT', usdt: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
    { chainId: 43114, name: 'Avalanche', symbol: 'USDT', usdt: '0x9702230A8657203FB529F0DC7B46D6F2aa1C9456', decimals: 6 }
  ];

  function calculateAirdrop(depositAmount) {
    const value = Number(depositAmount || 0);
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value * ANXB_CONFIG.airdropMultiplier;
  }

  function getSupportedNetworks() {
    return SUPPORTED_NETWORKS.map((network) => ({ ...network }));
  }

  function getNetworkByChainId(chainId) {
    return SUPPORTED_NETWORKS.find((network) => Number(network.chainId) === Number(chainId)) || null;
  }

  const api = {
    ANXB_CONFIG,
    SUPPORTED_NETWORKS,
    calculateAirdrop,
    getSupportedNetworks,
    getNetworkByChainId
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.AINEXABOT_CONFIG = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
