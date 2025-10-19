import React from 'react';

const ComputerDisplay = ({ 
  computerMove, 
  shufflingImage, 
  countdown, 
  getComputerImage,
  isOpponent = false,
  waitingForOpponent = false
}) => {
  return (
    <div className="webcam-area" style={{ flexDirection: "column" }}>
      {/* Computer/Opponent Display - Idle State */}
      {!computerMove && !shufflingImage && !waitingForOpponent && (
        <div style={{
          color: "white",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center"
        }}>
          {isOpponent ? "👥 Opponent" : "🤖 AI Opponent"}
        </div>
      )}

      {/* Waiting for Opponent */}
      {waitingForOpponent && !computerMove && (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(240, 147, 251, 0.3)",
            borderTop: "4px solid #f093fb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <div style={{
            color: "#f093fb",
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center"
          }}>
            Waiting for opponent...
          </div>
        </div>
      )}
      
      {/* Computer/Opponent Shuffling Animation */}
      {shufflingImage && (countdown || waitingForOpponent) && (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img 
            src={getComputerImage(shufflingImage)}
            alt={`Shuffling ${shufflingImage}`}
            style={{
              width: "95%",
              height: "auto",
              maxHeight: "85%",
              objectFit: "contain",
              borderRadius: "12px",
              border: "2px solid #FFD700",
              opacity: 0.9,
              transition: "all 0.2s ease",
              transform: "scale(0.98)"
            }}
          />
          <div style={{
            color: isOpponent ? "#f093fb" : "#FFD700",
            fontSize: 14,
            fontWeight: "bold",
            marginTop: 10,
            textAlign: "center",
            animation: "pulse 0.5s infinite"
          }}>
            {isOpponent ? "🤔 Thinking..." : "🎲 Choosing..."}
          </div>
        </div>
      )}

      {/* Computer Final Gesture Image */}
      {computerMove && !shufflingImage && (
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <img 
            src={getComputerImage(computerMove)}
            alt={`Computer ${computerMove}`}
            style={{
              width: "95%",
              height: "auto",
              maxHeight: "85%",
              objectFit: "contain",
              borderRadius: "12px",
              border: "2px solid rgba(255,255,255,0.35)",
              animation: "computerReveal 0.5s ease-out"
            }}
          />
          <div style={{
            color: "white",
            fontSize: 16,
            fontWeight: "bold",
            marginTop: 10,
            textAlign: "center"
          }}>
            {computerMove}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComputerDisplay;
