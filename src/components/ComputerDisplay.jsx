import React from 'react';

const ComputerDisplay = ({ 
  computerMove, 
  shufflingImage, 
  countdown, 
  getComputerImage 
}) => {
  return (
    <div className="webcam-area" style={{ flexDirection: "column" }}>
      {/* Computer Display - Idle State */}
      {!computerMove && !shufflingImage && (
        <div style={{
          color: "white",
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center"
        }}>
          🤖 AI Opponent
        </div>
      )}
      
      {/* Computer Shuffling Animation */}
      {shufflingImage && countdown && (
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
            color: "#FFD700",
            fontSize: 14,
            fontWeight: "bold",
            marginTop: 10,
            textAlign: "center",
            animation: "pulse 0.5s infinite"
          }}>
            🎲 Choosing...
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
