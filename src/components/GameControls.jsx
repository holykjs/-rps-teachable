import React from 'react';

const GameControls = ({ 
  model,
  isWebcamOn,
  gameActive,
  gameWinner,
  countdown,
  startWebcam,
  playRound,
  resetGame
}) => {
  return (
    <div style={{ 
      position: "fixed", 
      bottom: "clamp(20px, 5vh, 40px)", 
      left: "50%", 
      transform: "translateX(-50%)",
      display: "flex",
      gap: "clamp(12px, 2vw, 20px)",
      zIndex: 20,
      padding: "16px",
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)"
    }}>
      {/* Start Camera Button */}
      {!isWebcamOn && model && (
        <button 
          onClick={startWebcam} 
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
        disabled={!model || !isWebcamOn || gameActive || gameWinner}
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
          cursor: gameActive || !model || !isWebcamOn || gameWinner ? "not-allowed" : "pointer",
          opacity: gameActive || !model || !isWebcamOn || gameWinner ? 0.6 : 1,
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
          if (!gameActive && model && isWebcamOn && !gameWinner) {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 16px 50px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!gameActive && model && isWebcamOn && !gameWinner) {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
          }
        }}
      >
        {countdown ? `${countdown}...` : gameActive ? "Capturing..." : "▶ Start Round"}
      </button>

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
    </div>
  );
};

export default GameControls;
