import React, { useState } from "react";
import { useAIModel } from "./hooks/useAIModel";
import { useEnhancedGameLogic } from "./hooks/useEnhancedGameLogic";
import { useMultiplayer } from "./hooks/useMultiplayer";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useToast } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import AIErrorBoundary from "./components/AIErrorBoundary";
import GameHeader from "./components/GameHeader";
import PlayerPanel from "./components/PlayerPanel";
import GameControls from "./components/GameControls";
import CountdownOverlay from "./components/CountdownOverlay";
import RoundResultOverlay from "./components/RoundResultOverlay";
import MainMenu from "./components/MainMenu";
import MultiplayerLobby from "./components/MultiplayerLobby";
import GestureIndicator from "./components/GestureIndicator";
import GameStatusBar from "./components/GameStatusBar";
import ParticleEffect from "./components/ParticleEffect";
import GesturePreview from "./components/GesturePreview";
import "./App.css";
import "./responsive.css";

/**
 * Configuration from environment variables
 * Create .env file to customize these values
 */
const MODEL_BASE_URL = import.meta.env.VITE_MODEL_URL || "https://teachablemachine.withgoogle.com/models/GuM5MHK94/";
const WIN_SCORE = parseInt(import.meta.env.VITE_WIN_SCORE) || 5;

function AppContent() {
  // Custom hooks for AI model, game logic, and toast notifications
  const [showMenu, setShowMenu] = useState(true);
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState(false);
  const [gameMode, setGameMode] = useState('single'); // 'single' or 'multiplayer'
  const {
    model,
    modelsReady,
    loading,
    loadingProgress,
    error,
    isWebcamOn,
    humanGesture,
    handLandmarks,
    gestureQuality,
    predictions,
    webcamRef,
    canvasRef,
    startWebcam,
    retryLoadModels,
    resetGestureRecognition,
    getGestureAnalytics,
    isRetrying,
    setError
  } = useAIModel(MODEL_BASE_URL);

  const toast = useToast();
  const ToastContainer = toast.ToastContainer;

  // Multiplayer functionality
  const multiplayer = useMultiplayer();

  const {
    gameActive,
    humanMove,
    computerMove,
    roundResult,
    scores,
    countdown,
    gameWinner,
    shufflingImage,
    isMultiplayerMode,
    waitingForOpponent,
    opponentName,
    playRound,
    resetGame
  } = useEnhancedGameLogic(WIN_SCORE, multiplayer);

  // Helper functions
  const getEmoji = (choice) => {
    if (choice === "Rock") return "✊";
    if (choice === "Paper") return "✋";
    if (choice === "Scissors") return "✌️";
    return "❓";
  };

  const getComputerImage = (move) => {
    if (!move) return null;
    const imageMap = {
      "Rock": "/images/rock-ai.png",
      "Paper": "/images/paper-ai.png",
      "Scissors": "/images/scissors-ai.png"
    };
    return imageMap[move];
  };

  // Enhanced error handling with toast notifications
  const handlePlayRound = () => {
    if (!model || !isWebcamOn) {
      toast.error("Please wait for the camera to start before playing!");
      return;
    }
    
    if (!humanGesture) {
      toast.warning("Please show your hand to the camera!");
      return;
    }
    
    playRound(humanGesture, (errorMsg) => {
      toast.error(errorMsg);
    });
  };

  const handleRetryModels = () => {
    toast.info("Retrying model loading...");
    retryLoadModels();
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleStartFromMenu = () => {
    setShowMenu(false);
    setShowMultiplayerLobby(false);
    setGameMode('single');
    // Disconnect from multiplayer if connected
    if (multiplayer.isMultiplayer) {
      multiplayer.leaveRoom();
    }
    // Encourage user to start camera if not auto-started yet
    if (!isWebcamOn) {
      toast.info("Tip: Click Start Camera, then Start Round.");
    }
  };

  const handleStartMultiplayer = () => {
    setShowMenu(false);
    setShowMultiplayerLobby(true);
    setGameMode('multiplayer');
  };

  const handleMultiplayerGameReady = () => {
    setShowMultiplayerLobby(false);
    if (!isWebcamOn) {
      toast.info("Tip: Start your camera to begin playing!");
    }
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
    setShowMultiplayerLobby(false);
    setGameMode('single');
    if (multiplayer.isMultiplayer) {
      multiplayer.leaveRoom();
    }
  };

  // Keyboard navigation (after all functions are defined)
  const { shortcuts } = useKeyboardNavigation({
    onStartCamera: startWebcam,
    onPlayRound: handlePlayRound,
    onResetGame: resetGame,
    isWebcamOn,
    gameActive,
    gameWinner,
    modelsReady
  });

  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
      height: "100%", 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)", 
      display: "flex", 
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Game Header */}
      <AIErrorBoundary onRetry={handleRetryModels}>
        <GameHeader
          winScore={WIN_SCORE}
          loading={loading}
          loadingProgress={loadingProgress}
          model={model}
          isWebcamOn={isWebcamOn}
          error={error}
          gameWinner={gameWinner}
          onRetryModels={handleRetryModels}
          onDismissError={handleDismissError}
          isRetrying={isRetrying}
        />
      </AIErrorBoundary>

      {/* Toast Container */}
      <ToastContainer />



      <ParticleEffect 
        trigger={gameWinner} 
        type="win" 
      />

      <ParticleEffect 
        trigger={roundResult && roundResult !== 'tie'} 
        type="round" 
      />

      {/* Left Side Gesture Preview */}
      {isWebcamOn && !showMenu && !showMultiplayerLobby && (
        <div style={{
          position: 'fixed',
          left: 'clamp(8px, 2vw, 20px)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          maxWidth: 'clamp(180px, 25vw, 250px)'
        }}>
          <GesturePreview
            predictions={predictions}
            currentGesture={humanGesture}
            gestureQuality={gestureQuality}
            showAllPredictions={true}
            position="left-side"
          />
        </div>
      )}

      {/* Split Screen Layout - Human vs Computer */}
      <div className="game-container">
        {/* Game Status Bar - Top Center */}
        {!showMenu && !showMultiplayerLobby && (
          <div style={{
            position: 'absolute',
            top: 'clamp(16px, 3vh, 24px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100
          }}>
            <GameStatusBar
              isMultiplayerMode={isMultiplayerMode}
              connected={multiplayer.connected}
              roomId={multiplayer.roomId}
              opponentName={opponentName}
              waitingForOpponent={waitingForOpponent}
              gameActive={gameActive}
              countdown={countdown}
            />
          </div>
        )}
        {/* Human Player Panel */}
        <AIErrorBoundary onRetry={handleRetryModels}>
          <PlayerPanel
            type="human"
            score={scores.human}
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            isWebcamOn={isWebcamOn}
            handLandmarks={handLandmarks}
            humanGesture={humanGesture}
            humanMove={humanMove}
            gestureQuality={gestureQuality}
            predictions={predictions}
            getEmoji={getEmoji}
          />
        </AIErrorBoundary>

        {/* Computer/Opponent Player Panel */}
        <PlayerPanel
          type={isMultiplayerMode ? "opponent" : "computer"}
          score={scores.computer}
          computerMove={computerMove}
          shufflingImage={shufflingImage}
          countdown={countdown}
          getComputerImage={getComputerImage}
          opponentName={isMultiplayerMode ? opponentName : "Computer"}
          waitingForOpponent={waitingForOpponent}
        />
      </div>

      {/* Game Overlays */}
      <CountdownOverlay countdown={countdown} />
      
      <RoundResultOverlay
        roundResult={roundResult}
        humanMove={humanMove}
        computerMove={computerMove}
        getEmoji={getEmoji}
        getComputerImage={getComputerImage}
      />

      {/* Game Controls */}
      <GameControls
        model={model}
        modelsReady={modelsReady}
        isWebcamOn={isWebcamOn}
        gameActive={gameActive}
        gameWinner={gameWinner}
        countdown={countdown}
        startWebcam={startWebcam}
        playRound={handlePlayRound}
        resetGame={resetGame}
        currentGesture={humanGesture}
        gestureQuality={gestureQuality}
        getGestureAnalytics={getGestureAnalytics}
        resetGestureRecognition={resetGestureRecognition}
        predictions={predictions}
      />
      {/* Spacer to prevent overlap with fixed control bar */}
      <div className="controls-spacer" />

      {/* Floating Menu Button */}
      {!showMenu && !showMultiplayerLobby && (
        <button
          onClick={handleBackToMenu}
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 1000,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.12)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            backdropFilter: "blur(8px)"
          }}
        >
          ☰ Menu
        </button>
      )}

      {/* Main Menu Overlay */}
      <MainMenu
        isVisible={showMenu}
        onStart={handleStartFromMenu}
        onStartMultiplayer={handleStartMultiplayer}
        onOpenStats={() => toast.info("Open Stats from the bottom controls after starting.")}
      />

      {/* Multiplayer Lobby */}
      {showMultiplayerLobby && (
        <MultiplayerLobby
          multiplayer={multiplayer}
          onStartSinglePlayer={handleStartFromMenu}
          onGameReady={handleMultiplayerGameReady}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes computerReveal {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Main App component with ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
