import React from 'react';

function PlayerInfo({ balance, playerCount }) {
  return (
    <div className="player-info" id="playerInfo">
      <div className="player-count-container">
        <span className="player-icon">👥</span>
        <span id="playerCount">{playerCount} players online</span>
      </div>
      <span className="balance-hud" id="balanceHud">
        Balance: {balance.toFixed(2)} USDC
      </span>
    </div>
  );
}

export default PlayerInfo;

