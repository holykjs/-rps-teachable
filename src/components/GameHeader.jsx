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
        padding: "clamp(8px, 1.5vh, 12px) 16px", 
        color: "white", 
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated background elements */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(252, 70, 107, 0.1) 0%, transparent 50%)",
          animation: "headerGlow 6s ease-in-out infinite alternate",
          zIndex: -1
        }} />
        
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "clamp(8px, 2vw, 12px)",
          marginBottom: "clamp(2px, 0.5vh, 4px)",
          position: "relative",
          zIndex: 1
        }}>
          <div style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
            animation: "emojiFloat 3s ease-in-out infinite alternate",
            display: "flex",
            gap: "2px"
          }}>
            <span style={{ animationDelay: "0s" }}>✊</span>
            <span style={{ animationDelay: "0.5s" }}>✋</span>
            <span style={{ animationDelay: "1s" }}>✌️</span>
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(16px, 3vw, 24px)", 
            fontWeight: "800", 
            background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            position: "relative"
          }}>
            Rock Paper Scissors AI
            <div style={{
              position: "absolute",
              bottom: "-2px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "2px",
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              borderRadius: "1px"
            }} />
          </h1>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(8px, 2vw, 12px)",
          margin: 0,
          position: "relative",
          zIndex: 1
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)",
            background: "rgba(165, 180, 252, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(165, 180, 252, 0.2)"
          }}>
            <span style={{ fontSize: "12px" }}>🏆</span>
            <span style={{
              fontSize: "clamp(10px, 1.5vw, 12px)",
              fontWeight: "600",
              color: "#a5b4fc"
            }}>
              First to {winScore}
            </span>
          </div>
          <div style={{
            width: "1px",
            height: "16px",
            background: "rgba(255, 255, 255, 0.2)"
          }} />
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)",
            background: "rgba(78, 205, 196, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(78, 205, 196, 0.2)"
          }}>
            <span style={{ fontSize: "12px" }}>🤖</span>
            <span style={{
              fontSize: "clamp(10px, 1.5vw, 12px)",
              fontWeight: "600",
              color: "#4ecdc4"
            }}>
              AI Powered
            </span>
          </div>
        </div>
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
        <div style={{ 
          textAlign: "center", 
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}>
          <div style={{ fontSize: "20px" }}>📷</div>
          <p style={{ color: "white", fontSize: 14, margin: 0 }}>
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
