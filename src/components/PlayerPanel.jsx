import React from 'react';
import WebcamFeed from './WebcamFeed';
import ComputerDisplay from './ComputerDisplay';
import RemoteWebcamFeed from './RemoteWebcamFeed';

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
  getComputerImage,
  opponentName = "Computer",
  waitingForOpponent = false,
  playerName = "YOU",
  // WebRTC props for remote webcam
  remoteStream = null,
  webrtcConnected = false,
  webrtcError = null,
  isMultiplayerMode = false
}) => {
  const isHuman = type === 'human';
  const isOpponent = type === 'opponent';
  
  return (
    <div 
      className={`player-box ${isHuman ? 'human-player' : 'computer-player'}`}
      role="region"
      aria-label={isHuman ? "Your game area" : isOpponent ? `${opponentName}'s game area` : "Computer opponent area"}
    >
      {/* Player Header */}
      <div className="player-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: isHuman 
              ? "linear-gradient(135deg, #00f5a0, #00d9f5)"
              : isOpponent
                ? "linear-gradient(135deg, #f093fb, #f5576c)"
                : "linear-gradient(135deg, #ff8a80, #ff5722)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px"
          }}>
            {isHuman ? "👤" : isOpponent ? "👥" : "🤖"}
          </div>
          <span style={{ letterSpacing: "0.5px" }}>
            {isHuman ? (playerName || "YOU").toUpperCase() : isOpponent ? opponentName.toUpperCase() : "AI"}
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
        ) : isOpponent && isMultiplayerMode ? (
          <RemoteWebcamFeed
            remoteStream={remoteStream}
            isConnected={webrtcConnected}
            opponentName={opponentName}
            error={webrtcError}
          />
        ) : (
          <ComputerDisplay
            computerMove={computerMove}
            shufflingImage={shufflingImage}
            countdown={countdown}
            getComputerImage={getComputerImage}
            isOpponent={isOpponent}
            waitingForOpponent={waitingForOpponent}
          />
        )}
      </div>
    </div>
  );
};

export default PlayerPanel;
