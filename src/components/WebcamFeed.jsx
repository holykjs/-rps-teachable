import React from 'react';
import Webcam from 'react-webcam';
import GesturePreview from './GesturePreview';
import GestureConfidence from './GestureConfidence';

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
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "8px"
        }}
      />
      
      {/* Canvas overlay for hand skeleton */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "8px",
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
      
      {/* Human Gesture Overlay */}
      {humanGesture && (
        <div style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: "bold"
        }}>
          {humanGesture.gesture} ({(humanGesture.confidence * 100).toFixed(0)}%)
        </div>
      )}

      {/* Human Last Move */}
      {humanMove && (
        <div style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "12px 20px",
          borderRadius: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 32 }}>{getEmoji(humanMove)}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{humanMove}</div>
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
