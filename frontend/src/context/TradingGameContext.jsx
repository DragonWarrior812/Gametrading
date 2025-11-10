import React, { createContext } from 'react';
import { useTradingGame } from '../hooks/useTradingGame';

export const TradingGameContext = createContext(null);

export function TradingGameProvider({ children }) {
  const gameState = useTradingGame();
  return (
    <TradingGameContext.Provider value={gameState}>
      {children}
    </TradingGameContext.Provider>
  );
}

