import React from 'react';

function LaunchScreen({ onLaunch }) {
  return (
    <div className="launch-screen" id="launchScreen">
      <button className="launch-button" id="launchButton" onClick={onLaunch}>
        Launch Game
      </button>
    </div>
  );
}

export default LaunchScreen;

