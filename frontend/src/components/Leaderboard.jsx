import React from 'react';

function Leaderboard({ players }) {
  const formatTime = (joinTime) => {
    const timeDiff = Math.floor((Date.now() - joinTime) / 60000);
    return timeDiff < 1 ? "Just now" : `${timeDiff}m ago`;
  };

  const getWinRateClass = (winRate) => {
    if (winRate >= 70) return "high";
    if (winRate >= 50) return "medium";
    return "low";
  };

  return (
    <div className="leaderboard-box">
      <div className="leaderboard-header">👥 LIVE PLAYERS</div>
      <div className="leaderboard-content" id="leaderboardContent">
        {players.map((player) => (
          <div key={player.id} className="player-item">
            <div className="player-avatar" style={{ background: player.avatar.bg }}>
              {player.avatar.emoji}
            </div>
            <div className="player-info-text">
              <div className="player-name">{player.name}</div>
              <div className="player-stats">
                <span className="player-time">{formatTime(player.joinTime)}</span>
                <span className={`player-winrate ${getWinRateClass(player.winRate)}`}>
                  {player.winRate}% W
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* Duplicate for infinite scroll */}
        {players.map((player) => (
          <div key={`dup-${player.id}`} className="player-item">
            <div className="player-avatar" style={{ background: player.avatar.bg }}>
              {player.avatar.emoji}
            </div>
            <div className="player-info-text">
              <div className="player-name">{player.name}</div>
              <div className="player-stats">
                <span className="player-time">{formatTime(player.joinTime)}</span>
                <span className={`player-winrate ${getWinRateClass(player.winRate)}`}>
                  {player.winRate}% W
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;

