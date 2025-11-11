import React from 'react';

function HUD({ balance, stake, currentMarket, currentTimeframe, onStakeChange, onMarketChange, onTimeframeChange, onDepositClick, onConnectWalletClick, onWithdrawClick }) {

  return (
    <div className="hud">
      <button className="hud-button left" id="withdrawBtn" onClick={onWithdrawClick}>
        🏦 Withdraw
      </button>
      <div className="stake-container">
        <div className="market-section">
          <span className="market-label">Market:</span>
          
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

