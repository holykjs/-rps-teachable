import React, { useState } from "react";
import { useAIModel } from "./hooks/useAIModel";
import { useGameLogic } from "./hooks/useGameLogic";
import { useToast } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import GameHeader from "./components/GameHeader";
import PlayerPanel from "./components/PlayerPanel";
import GameControls from "./components/GameControls";
import CountdownOverlay from "./components/CountdownOverlay";
import RoundResultOverlay from "./components/RoundResultOverlay";
import MainMenu from "./components/MainMenu";
import "./App.css";
import "./responsive.css";

/**
 * Replace with YOUR Teachable Machine model URL after training
 * Get the shareable link from: https://teachablemachine.withgoogle.com/
 */
const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/GuM5MHK94/";
const WIN_SCORE = 5; // Race to 5!

function AppContent() {
  // Custom hooks for AI model, game logic, and toast notifications
  const [showMenu, setShowMenu] = useState(true);
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

  const {
    gameActive,
    humanMove,
    computerMove,
    roundResult,
    scores,
    countdown,
    gameWinner,
    shufflingImage,
    playRound,
    resetGame
  } = useGameLogic(WIN_SCORE);

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
    // Encourage user to start camera if not auto-started yet
    if (!isWebcamOn) {
      toast.info("Tip: Click Start Camera, then Start Round.");
    }
  };

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

      {/* Toast Container */}
      <ToastContainer />

      {/* Split Screen Layout - Human vs Computer */}
      <div className="game-container">
        {/* Human Player Panel */}
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

        {/* Computer Player Panel */}
        <PlayerPanel
          type="computer"
          score={scores.computer}
          computerMove={computerMove}
          shufflingImage={shufflingImage}
          countdown={countdown}
          getComputerImage={getComputerImage}
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
      />
      {/* Spacer to prevent overlap with fixed control bar */}
      <div className="controls-spacer" />

      {/* Floating Menu Button */}
      {!showMenu && (
        <button
          onClick={() => setShowMenu(true)}
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
        onOpenStats={() => toast.info("Open Stats from the bottom controls after starting.")}
      />

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
