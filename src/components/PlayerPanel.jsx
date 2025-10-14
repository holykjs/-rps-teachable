import React from 'react';
import WebcamFeed from './WebcamFeed';
import ComputerDisplay from './ComputerDisplay';

const PlayerPanel = ({ 
  type, 
  score, 
  webcamRef, 
  canvasRef, 
  isWebcamOn, 
  handLandmarks, 
  humanGesture, 
  humanMove, 
  computerMove, 
  shufflingImage, 
  countdown, 
  gestureQuality,
  predictions,
  getEmoji, 
  getComputerImage 
}) => {
  const isHuman = type === 'human';
  
  return (
    <div className={`player-box ${isHuman ? 'human-player' : 'computer-player'}`}>
      {/* Player Header */}
      <div className="player-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: isHuman 
              ? "linear-gradient(135deg, #00f5a0, #00d9f5)"
              : "linear-gradient(135deg, #ff8a80, #ff5722)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px"
          }}>
            {isHuman ? "👤" : "🤖"}
          </div>
          <span style={{ letterSpacing: "0.5px" }}>
            {isHuman ? "YOU" : "AI"}
          </span>
        </div>
        <div style={{ 
          background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))", 
          padding: "12px 20px", 
          borderRadius: "20px",
          fontSize: "clamp(20px, 3vw, 32px)",
          fontWeight: "900",
          minWidth: "60px",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.2)",
        }}>
          {score}
        </div>
      </div>

      {/* Player Content */}
      <div className="player-content">
        {isHuman ? (
          <WebcamFeed
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
        ) : (
          <ComputerDisplay
            computerMove={computerMove}
            shufflingImage={shufflingImage}
            countdown={countdown}
            getComputerImage={getComputerImage}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerPanel;
