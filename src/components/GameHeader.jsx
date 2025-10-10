import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

const GameHeader = ({ 
  winScore, 
  loading, 
  loadingProgress, 
  model, 
  isWebcamOn, 
  error, 
  gameWinner, 
  onRetryModels,
  onDismissError,
  isRetrying 
}) => {
  return (
    <>
      {/* Modern Header */}
      <header style={{ 
        padding: "32px 24px", 
        color: "white", 
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "12px"
        }}>
          <div style={{
            fontSize: "48px",
            background: "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}>✊✋✌️</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(24px, 4vw, 42px)", 
            fontWeight: "800", 
            background: "linear-gradient(135deg, #ffffff, #e0e7ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em"
          }}>Rock Paper Scissors AI</h1>
        </div>
        <p style={{ 
          margin: 0, 
          opacity: 0.8, 
          fontSize: "clamp(14px, 2vw, 18px)",
          fontWeight: "500",
          color: "#a5b4fc"
        }}>First to {winScore} wins • Real-time hand tracking powered by AI</p>
      </header>

      {/* Enhanced Status Messages */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <LoadingSpinner 
            size="medium"
            message={isRetrying ? "Retrying model loading..." : "Loading AI models..."}
            progress={loadingProgress}
          />
        </div>
      )}
      
      {!loading && !model && !error && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
          <p style={{ color: "white", fontSize: 18, margin: 0 }}>
            AI models failed to load
          </p>
        </div>
      )}
      
      {model && !isWebcamOn && !loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📷</div>
          <p style={{ color: "white", fontSize: 18, margin: 0 }}>
            Initializing camera...
          </p>
        </div>
      )}
      
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={onRetryModels}
          onDismiss={onDismissError}
        />
      )}

      {/* Modern Game Winner Banner */}
      {gameWinner && (
        <div style={{ 
          background: gameWinner === "Human" 
            ? "linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)" 
            : "linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)",
          padding: "40px 32px", 
          margin: "24px auto",
          maxWidth: "90%",
          borderRadius: "24px",
          textAlign: "center",
          color: "white",
          fontSize: "clamp(24px, 5vw, 48px)",
          fontWeight: "900",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "2px solid rgba(255,255,255,0.2)",
          animation: "winnerPulse 2s infinite"
        }}>
          <div style={{ marginBottom: "12px", fontSize: "64px" }}>
            {gameWinner === "Human" ? "🎉" : "🤖"}
          </div>
          {gameWinner === "Human" ? "VICTORY!" : "AI WINS!"}
          <div style={{ 
            fontSize: "clamp(12px, 2vw, 16px)", 
            opacity: 0.9, 
            marginTop: "8px",
            fontWeight: "600"
          }}>
            {gameWinner === "Human" ? "Congratulations, human!" : "Better luck next time!"}
          </div>
        </div>
      )}
    </>
  );
};

export default GameHeader;
