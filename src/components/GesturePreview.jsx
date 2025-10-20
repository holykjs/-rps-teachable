import React from 'react';
import { CONFIDENCE_THRESHOLDS } from '../utils/gestureRecognition';

const GesturePreview = ({ 
  predictions, 
  currentGesture, 
  gestureQuality,
  showAllPredictions = false,
  position = 'top-right' 
}) => {
  if (!predictions && !currentGesture) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      padding: 'clamp(8px, 2vw, 10px)',
      color: 'white',
      fontSize: 'clamp(10px, 2.5vw, 11px)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: 'clamp(160px, 40vw, 180px)',
      maxWidth: 'clamp(200px, 50vw, 220px)',
      // Responsive positioning
      transform: 'translateY(-2px)', // Slight lift from bottom edge
      boxSizing: 'border-box'
    };

    return baseStyles;
  };

  const getGestureEmoji = (gesture) => {
    switch (gesture?.toLowerCase()) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '❓';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return '#00f5a0';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return '#ffd700';
    if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={getPositionStyles()}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '6px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <span style={{ fontSize: '14px' }}>🤖</span>
        <span style={{ fontWeight: '600', fontSize: '11px' }}>
          AI Recognition
        </span>
      </div>

      {/* Current Best Gesture */}
      {currentGesture && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: showAllPredictions ? '8px' : '0',
          padding: '6px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '6px',
          border: `1px solid ${getConfidenceColor(currentGesture.confidence)}50`
        }}>
          <div style={{ fontSize: '18px' }}>
            {getGestureEmoji(currentGesture.gesture)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: '600',
              color: getConfidenceColor(currentGesture.confidence),
              marginBottom: '1px',
              fontSize: '11px'
            }}>
              {currentGesture.gesture}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '9px',
              opacity: 0.8
            }}>
              <span>{Math.round(currentGesture.confidence * 100)}%</span>
              {gestureQuality?.stability && (
                <span style={{ color: '#00f5a0' }}>✓</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Predictions */}
      {showAllPredictions && predictions && predictions.length > 0 && (
        <div>
          <div style={{
            fontSize: '9px',
            opacity: 0.7,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            All Predictions
          </div>
          {predictions
            .sort((a, b) => b.probability - a.probability)
            .map((prediction, index) => {
              const gesture = prediction.className.toLowerCase().includes('rock') ? 'Rock' :
                            prediction.className.toLowerCase().includes('paper') ? 'Paper' :
                            prediction.className.toLowerCase().includes('scissors') ? 'Scissors' :
                            prediction.className;
              
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    marginBottom: '2px',
                    borderRadius: '6px',
                    background: index === 0 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '14px' }}>
                      {getGestureEmoji(gesture)}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: index === 0 ? 'white' : 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {gesture}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <div
                      style={{
                        width: '40px',
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${prediction.probability * 100}%`,
                          height: '100%',
                          background: getConfidenceColor(prediction.probability),
                          borderRadius: '2px',
                          transition: 'width 0.2s ease'
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: '10px',
                      color: getConfidenceColor(prediction.probability),
                      minWidth: '30px',
                      textAlign: 'right'
                    }}>
                      {Math.round(prediction.probability * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Gesture Quality Indicators */}
      {gestureQuality && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '10px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ opacity: 0.7 }}>Quality:</span>
            <span style={{ 
              color: getConfidenceColor(gestureQuality.confidence),
              fontWeight: '600'
            }}>
              {gestureQuality.confidenceLevel}
            </span>
          </div>
          
          {gestureQuality.consistency !== undefined && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ opacity: 0.7 }}>Consistency:</span>
              <span>{Math.round(gestureQuality.consistency * 100)}%</span>
            </div>
          )}
          
          {gestureQuality.stabilityFrames > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ opacity: 0.7 }}>Stability:</span>
              <span style={{ color: '#00f5a0' }}>
                {gestureQuality.stabilityFrames} frames
              </span>
            </div>
          )}
        </div>
      )}

      {/* No Gesture Detected */}
      {!currentGesture && (!predictions || predictions.length === 0) && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          opacity: 0.6
        }}>
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>👋</div>
          <div style={{ fontSize: '9px' }}>
            Show your hand to start recognition
          </div>
        </div>
      )}
    </div>
  );
};

export default GesturePreview;
