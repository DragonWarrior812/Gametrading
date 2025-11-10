import React from 'react';

const CRYPTO_LOGOS = {
  SOL: (
    <svg className="crypto-logo" width="20" height="20" viewBox="0 0 397.7 311.7" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="solGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00FFA3", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#DC1FFF", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path fill="url(#solGradient)" d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
      <path fill="url(#solGradient)" d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
      <path fill="url(#solGradient)" d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
    </svg>
  ),
  ETH: (
    <svg className="crypto-logo" width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.927 23.959l-9.823-5.797 9.817 13.839 9.828-13.839-9.828 5.797zM16.073 0l-9.819 16.297 9.819 5.807 9.823-5.801z" fill="#8A92B2"/>
    </svg>
  ),
  BTC: (
    <svg className="crypto-logo" width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#f7931a"/>
      <path d="M21.03 13.44c.26-1.77-1.09-2.72-2.94-3.36l.6-2.42-1.47-.36-.58 2.34c-.38-.09-.77-.18-1.16-.26l.59-2.37-1.47-.36-.6 2.43c-.31-.07-.62-.15-.92-.23l.01-.03-2.03-.5-.39 1.54s1.09.25 1.06.27c.59.15.69.53.67.83l-.67 2.7c.04.01.08.02.13.03l-.13-.03-.94 3.78c-.07.17-.24.42-.63.33.01.02-1.06-.27-1.06-.27l-.73 1.68 1.92.48c.36.09.71.19 1.05.28l-.61 2.47 1.47.36.6-2.43c.4.11.8.21 1.18.31l-.6 2.42 1.47.36.61-2.46c2.5.47 4.38.28 5.17-1.98.64-1.81-.03-2.86-1.35-3.55.96-.22 1.68-.86 1.87-2.17Zm-3.36 4.74c-.45 1.81-3.48.83-4.47.59l.8-3.21c.99.25 4.14.75 3.67 2.62Zm.45-4.76c-.41 1.66-2.93.82-3.75.61l.72-2.9c.82.21 3.46.6 3.03 2.29Z" fill="white"/>
    </svg>
  ),
};

function HUD({ balance, stake, currentMarket, currentTimeframe, onStakeChange, onMarketChange, onTimeframeChange, onDepositClick, onConnectWalletClick, onWithdrawClick }) {
  return (
    <div className="hud">
      <button className="hud-button left" id="withdrawBtn" onClick={onWithdrawClick}>
        🏦 Withdraw
      </button>
      <div className="stake-container">
        <div className="market-section">
          <span className="market-label">Market:</span>
          {CRYPTO_LOGOS[currentMarket]}
          <select
            className="market-dropdown"
            id="marketDropdown"
            value={currentMarket}
            onChange={(e) => onMarketChange(e.target.value)}
          >
            <option value="SOL">SOL/USDC</option>
            <option value="ETH">ETH/USDC</option>
            <option value="BTC">BTC/USDC</option>
          </select>
        </div>

        <div className="trade-size-section">
          <span className="trade-label">Trade size:</span>
          <input
            type="number"
            className="stake-input"
            id="stakeInput"
            value={stake.toFixed(2)}
            min="5"
            step="0.1"
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 5;
              onStakeChange(Math.max(5, value));
            }}
          />
          <span className="dollar-sign">$</span>

          <span className="trade-label">Time:</span>
          <select
            className="market-dropdown"
            id="timeframeDropdown"
            value={currentTimeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
          >
            <option value="10s">10 sec</option>
            <option value="30s">30 sec</option>
            <option value="10m">10 min</option>
            <option value="30m">30 min</option>
            <option value="1h">01 hour</option>
          </select>
        </div>
      </div>

      <div className="hud-buttons-right">
        <button className="hud-button right-connect" id="connectWalletBtn" onClick={onConnectWalletClick}>
          💎 Connect Wallet
        </button>
        <button className="hud-button right" id="depositBtn" onClick={onDepositClick}>
          💰 Deposit
        </button>
      </div>
    </div>
  );
}

export default HUD;

