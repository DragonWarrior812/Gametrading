import React, { useState, useEffect } from 'react';
import LaunchScreen from './components/LaunchScreen';
import GameApp from './components/GameApp';
import { TradingGameProvider } from './context/TradingGameContext';

function App() {
  const [launched, setLaunched] = useState(false);

  const handleLaunch = () => {
    setLaunched(true);
  };

  // Prevent scrolling and zooming on mobile
  useEffect(() => {
    const preventTouch = (e) => {
      e.preventDefault();
    };

    const preventGesture = (e) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouch, { passive: false });
    document.addEventListener('gesturestart', preventGesture);

    return () => {
      document.removeEventListener('touchmove', preventTouch);
      document.removeEventListener('gesturestart', preventGesture);
    };
  }, []);

  return (
    <TradingGameProvider>
      <div id="app">
        {!launched ? (
          <LaunchScreen onLaunch={handleLaunch} />
        ) : (
          <GameApp />
        )}
      </div>
    </TradingGameProvider>
  );
}

export default App;

