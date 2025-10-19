import React from 'react';
import Webcam from 'react-webcam';
import GesturePreview from './GesturePreview';
import GestureConfidence from './GestureConfidence';
import GestureIndicator from './GestureIndicator';

const WebcamFeed = ({ 
  webcamRef, 
  canvasRef, 
  isWebcamOn, 
  handLandmarks, 
  humanGesture, 
  humanMove, 
  gestureQuality,
  predictions,
  getEmoji 
}) => {
  return (
    <div className="webcam-area">
      {/* Webcam Component */}
      <Webcam
        ref={webcamRef}
        mirrored={true}
        videoConstraints={{
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16 / 9,
          facingMode: "user"
        }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: "12px"
        }}
      />
      
      {/* Canvas overlay for hand skeleton */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "12px",
          zIndex: 10
        }}
      />
      
      {!isWebcamOn && (
        <div style={{
          position: "absolute",
          color: "white",
          fontSize: 16,
          zIndex: 20
        }}>
          📷 Starting camera...
        </div>
      )}

      {/* Hand Detection Status */}
      {handLandmarks && (
        <div style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(0,255,0,0.8)",
          color: "white",
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: "bold"
        }}>
          ✋ Hand Detected
        </div>
      )}
      
      {/* Enhanced Gesture Indicator */}
      <GestureIndicator
        gesture={humanGesture?.gesture}
        confidence={humanGesture?.confidence || 0}
        isActive={!!humanGesture}
      />

      {/* Human Last Move */}
      {humanMove && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))",
            color: "white",
            padding: "10px 14px",
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            zIndex: 30
          }}
        >
          <div style={{ fontSize: 22, lineHeight: 1 }}>{getEmoji(humanMove)}</div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.2,
            textTransform: "capitalize"
          }}>
            {humanMove}
          </div>
        </div>
      )}

      {/* Advanced Gesture Recognition Overlays */}
      <GesturePreview
        predictions={predictions}
        currentGesture={humanGesture}
        gestureQuality={gestureQuality}
        showAllPredictions={true}
        position="top-left"
      />

      {/* Gesture Confidence Display */}
      {(humanGesture || gestureQuality) && (
        <div style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: 50
        }}>
          <GestureConfidence
            gesture={humanGesture}
            quality={gestureQuality}
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
