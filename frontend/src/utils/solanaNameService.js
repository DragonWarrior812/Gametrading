/**
 * Utility functions for resolving Solana Name Service (SNS) .sol domain names
 * This allows you to get human-readable names for wallet addresses
 */

/**
 * Resolves a wallet address to its .sol domain name (if it has one)
 * Uses Bonfida API to resolve reverse lookups
 * 
 * @param {string} walletAddress - The Solana wallet address (public key)
 * @returns {Promise<string|null>} - The .sol domain name or null if not found
 */
export async function resolveWalletToName(walletAddress) {
  try {
    // Use Bonfida API for reverse lookup
    const response = await fetch(
      `https://api.bonfida.com/solana/reverse/${walletAddress}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // If the wallet has a .sol domain, it will be in the response
    if (data && data.domain) {
      return data.domain;
    }
    
    return null;
  } catch (error) {
    console.warn("Failed to resolve wallet name:", error);
    return null;
  }
}

/**
 * Resolves a .sol domain name to a wallet address
 * 
 * @param {string} domainName - The .sol domain name (e.g., "example.sol")
 * @returns {Promise<string|null>} - The wallet address or null if not found
 */
export async function resolveNameToWallet(domainName) {
  try {
    // Remove .sol suffix if present
    const name = domainName.replace(/\.sol$/, '');
    
    const response = await fetch(
      `https://api.bonfida.com/solana/domain/${name}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      return data.address;
    }
    
    return null;
  } catch (error) {
    console.warn("Failed to resolve domain name:", error);
    return null;
  }
}

/**
 * Formats a wallet address for display
 * Shows .sol name if available, otherwise shows shortened address
 * 
 * @param {string} walletAddress - The wallet address
 * @param {string|null} domainName - Optional .sol domain name
 * @param {number} chars - Number of characters to show on each side (default: 4)
 * @returns {string} - Formatted display string
 */
export function formatWalletAddress(walletAddress, domainName = null, chars = 4) {
  if (domainName) {
    return domainName;
  }
  
  if (!walletAddress) {
    return "Unknown";
  }
  
  return `${walletAddress.slice(0, chars)}...${walletAddress.slice(-chars)}`;
}

