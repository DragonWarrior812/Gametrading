export const TOKEN_TOTAL_SUPPLY = 1_000_000_000;
export const TOKEN_DECIMALS = 6;

export const DATATYPE_LASTTOKEN = 0xFF01;
export const DATATYPE_LASTTRADE = 0xFF02;

// Bonding curve constants (from smart contract)
export const INIT_VIRT_BASE = 63_529_411.764705; // ~6.353% of total supply (in full token units)
export const INIT_VIRT_QUOTE = 0.28; // 0.28 SOL (in SOL, not lamports)
export const SEED_TOKENS = 200; // 200 tokens (200_000_000 raw units / 10^6 decimals)
export const COMPLETE_QUOTE_RESERVE = 0.85; // 0.85 SOL (additional, in SOL not lamports)

/**
 * Calculate the graduation market cap based on smart contract constants
 * Formula from backend: 
 * At graduation, total quote = 1.13 SOL, total base = 63,529,611.764705 tokens
 * Price per token = 1.13 / 63,529,611.764705 = 0.00000001779 SOL/token
 * Market cap = 0.00000001779 * 1,000,000,000 = 17.79 SOL
 * 
 * @param {number} solPriceUSD - Current SOL price in USD
 * @returns {number} Graduation market cap in USD
 */
export function calculateGraduationMarketCap(solPriceUSD) {
  // Total SOL at graduation: 0.28 + 0.85 = 1.13 SOL
  const totalSolAtGraduation = INIT_VIRT_QUOTE + COMPLETE_QUOTE_RESERVE;
  
  // Total base tokens at graduation: 200 + 63,529,411.764705 = 63,529,611.764705 tokens
  const totalBaseAtGraduation = SEED_TOKENS + INIT_VIRT_BASE;
  
  // Price per token at graduation (in SOL)
  const pricePerTokenInSol = totalSolAtGraduation / totalBaseAtGraduation;
  
  // Market cap at graduation = price per token * total supply
  // This equals: (1.13 / 63,529,611.764705) * 1,000,000,000 = 17.79 SOL
  const graduationMarketCapInSol = pricePerTokenInSol * TOKEN_TOTAL_SUPPLY;
  
  // Convert to USD
  return graduationMarketCapInSol * solPriceUSD;
}

/**
 * Calculate the initial market cap (at start of bonding curve)
 * @param {number} solPriceUSD - Current SOL price in USD
 * @returns {number} Initial market cap in USD
 */
export function calculateInitialMarketCap(solPriceUSD) {
  // Initial quote: 0.28 SOL
  // Initial base: 63,529,611.764705 tokens
  // Price per token initially: 0.28 / 63,529,611.764705 = 0.00000000441 SOL/token
  // Market cap initially: 0.00000000441 * 1,000,000,000 = 4.41 SOL
  
  const initialBaseTokens = SEED_TOKENS + INIT_VIRT_BASE;
  const pricePerTokenInSol = INIT_VIRT_QUOTE / initialBaseTokens;
  const initialMarketCapInSol = pricePerTokenInSol * TOKEN_TOTAL_SUPPLY;
  
  return initialMarketCapInSol * solPriceUSD;
}

