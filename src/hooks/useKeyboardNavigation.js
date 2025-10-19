import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = ({
  onStartCamera,
  onPlayRound,
  onResetGame,
  isWebcamOn,
  gameActive,
  gameWinner,
  modelsReady
}) => {
  const handleKeyPress = useCallback((event) => {
    // Prevent default behavior for game controls
    if (['Space', 'Enter', 'KeyC', 'KeyR'].includes(event.code)) {
      event.preventDefault();
    }

    switch (event.code) {
      case 'Space':
      case 'Enter':
        // Start round with spacebar or enter
        if (modelsReady && isWebcamOn && !gameActive && !gameWinner) {
          onPlayRound();
        }
        break;
      
      case 'KeyC':
        // Start camera with 'C' key
        if (!isWebcamOn && modelsReady) {
          onStartCamera();
        }
        break;
      
      case 'KeyR':
        // Reset game with 'R' key
        if (gameWinner) {
          onResetGame();
        }
        break;
      
      case 'Escape':
        // Could be used to return to menu or cancel actions
        break;
      
      default:
        break;
    }
  }, [onStartCamera, onPlayRound, onResetGame, isWebcamOn, gameActive, gameWinner, modelsReady]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Return keyboard shortcuts info for display
  return {
    shortcuts: [
      { key: 'Space/Enter', action: 'Start Round', available: modelsReady && isWebcamOn && !gameActive && !gameWinner },
      { key: 'C', action: 'Start Camera', available: !isWebcamOn && modelsReady },
      { key: 'R', action: 'Reset Game', available: gameWinner },
    ]
  };
};
