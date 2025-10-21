import React, { useState } from 'react';
import GestureAnalytics from './GestureAnalytics';
import GestureCalibration from './GestureCalibration';

const GameControls = ({ 
  model,
  modelsReady,
  isWebcamOn,
  gameActive,
  gameWinner,
  countdown,
  startWebcam,
  playRound,
  resetGame,
  currentGesture,
  gestureQuality,
  getGestureAnalytics,
  resetGestureRecognition,
  predictions
}) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  return (
    <div style={{ 
      position: "fixed", 
      bottom: "clamp(15px, 3vh, 25px)", 
      left: "50%", 
      transform: "translateX(-50%)",
      display: "flex",
      flexWrap: "wrap",
      gap: "clamp(8px, 1.5vw, 16px)",
      zIndex: 1000,
      padding: "clamp(12px, 2vw, 16px)",
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
      maxWidth: "calc(100vw - 40px)",
      justifyContent: "center"
    }}>
      {/* Start Camera Button */}
      {!isWebcamOn && modelsReady && (
        <button 
          onClick={startWebcam}
          aria-label="Start camera for gesture recognition"
          tabIndex={0}
          style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            fontWeight: "700",
            padding: "16px 24px",
            background: "linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0, 245, 160, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 40px rgba(0, 245, 160, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 32px rgba(0, 245, 160, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
          }}
        >
          📷 Start Camera
        </button>
      )}

      {/* Play Round Button */}
      <button 
        onClick={playRound} 
        disabled={!modelsReady || !isWebcamOn || gameActive || gameWinner}
        aria-label={gameActive ? "Round in progress" : "Start new round"}
        tabIndex={0}
        style={{
          fontSize: "clamp(16px, 2.5vw, 20px)",
          fontWeight: "800",
          padding: "20px 40px",
          background: gameActive || gameWinner 
            ? "linear-gradient(135deg, rgba(156, 163, 175, 0.6), rgba(107, 114, 128, 0.6))" 
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          cursor: gameActive || !modelsReady || !isWebcamOn || gameWinner ? "not-allowed" : "pointer",
          opacity: gameActive || !modelsReady || !isWebcamOn || gameWinner ? 0.6 : 1,
          boxShadow: gameActive || gameWinner 
            ? "0 8px 32px rgba(156, 163, 175, 0.3)" 
            : "0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          minWidth: "160px"
        }}
        onMouseEnter={(e) => {
          if (!gameActive && modelsReady && isWebcamOn && !gameWinner) {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 16px 50px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!gameActive && modelsReady && isWebcamOn && !gameWinner) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
          }
        }}
      >
        {countdown ? `${countdown}...` : gameActive ? "Capturing..." : "▶ Start Round"}
      </button>


      {/* Gesture Analytics Button */}
      {isWebcamOn && (
        <button 
          onClick={() => setShowAnalytics((v) => !v)} 
          style={{ 
            fontSize: "clamp(12px, 1.8vw, 14px)",
            fontWeight: "600",
            padding: "12px 20px",
            background: showAnalytics
              ? "linear-gradient(135deg, rgba(168,237,234,0.4) 0%, rgba(254,214,227,0.4) 100%)"
              : "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            color: showAnalytics ? "white" : "#333",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "14px",
            cursor: "pointer",
            backdropFilter: "blur(20px)",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            boxShadow: "0 6px 24px rgba(168, 237, 234, 0.3)"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 32px rgba(168, 237, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 6px 24px rgba(168, 237, 234, 0.3)";
          }}
        >
          {showAnalytics ? "⬇ Close" : "📊 Stats"}
        </button>
      )}

      {/* Reset Game Button */}
      <button 
        onClick={resetGame} 
        style={{ 
          fontSize: "clamp(14px, 2vw, 16px)",
          fontWeight: "600",
          padding: "16px 24px",
          background: "rgba(255, 255, 255, 0.1)",
          color: "white",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "16px",
          cursor: "pointer",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s ease",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          boxShadow: "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(255, 255, 255, 0.2)";
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 12px 40px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(255, 255, 255, 0.1)";
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)";
        }}
      >
        Reset Game
      </button>

      {/* Gesture Analytics Modal */}
      <GestureAnalytics
        isVisible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        getGestureAnalytics={getGestureAnalytics}
        gestureQuality={gestureQuality}
        currentGesture={currentGesture}
      />

      {/* Gesture Calibration Modal */}
      {showCalibration && (
        <GestureCalibration
          onClose={() => setShowCalibration(false)}
          predictions={predictions}
          currentGesture={currentGesture}
        />
      )}
    </div>
  );
};

export default GameControls;
