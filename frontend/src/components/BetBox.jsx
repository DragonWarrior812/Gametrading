import React, { useEffect, useState } from 'react';

const TIMEFRAMES = {
  "1s": 1,
  "10s": 10,
  "30s": 30,
  "1m": 60,
  "5m": 300,
  "10m": 600,
  "30m": 1800,
  "1h": 3600,
};

function BetBox({ box }) {
  const [remaining, setRemaining] = useState(box.duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remainingMs = Math.max(0, (box.endTime || box.startTime + box.duration * 1000) - now);
      const remainingSec = Math.ceil(remainingMs / 1000);
      setRemaining(remainingSec);
    }, 100);

    return () => clearInterval(interval);
  }, [box]);

  const formatRemaining = (sec) => {
    if (sec >= 60) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    } else {
      return `${Math.ceil(sec)}s`;
    }
  };

  const className = `bet-box ${box.won ? "win" : box.settled && box.won === false ? "lose" : ""}`;

  return (
    <div
      className={className}
      style={{
        left: box.x + "px",
        top: box.y + "px",
      }}
    >
      <div className="bet-inner">
        <div className="top-row">
          <span className="bet-type">{box.side === "long" ? "📈" : "📉"}</span>
          <span className="bet-stake">${box.stake.toFixed(2)}</span>
        </div>
        <div className="bet-entry">{box.entryPrice.toFixed(4)}</div>
        <div className="bet-timer">{formatRemaining(remaining)}</div>
      </div>
    </div>
  );
}

export default BetBox;

