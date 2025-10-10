import React, { useState, useEffect } from 'react';

const GestureAnalytics = ({ 
  isVisible, 
  onClose, 
  getGestureAnalytics,
  gestureQuality,
  currentGesture 
}) => {
  const [analytics, setAnalytics] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (isVisible && getGestureAnalytics) {
      // Initial load
      setAnalytics(getGestureAnalytics());
      
      // Set up auto-refresh
      const interval = setInterval(() => {
        setAnalytics(getGestureAnalytics());
      }, 1000);
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isVisible, getGestureAnalytics]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isVisible]);

  if (!isVisible || !analytics) return null;

  const { totalGestures, gestureBreakdown, averageConfidence, historySize, currentStability } = analytics;

  const getGestureEmoji = (gesture) => {
    switch (gesture.toLowerCase()) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '❓';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#00f5a0';
    if (confidence >= 0.6) return '#ffd700';
    if (confidence >= 0.4) return '#ff9800';
    return '#f44336';
  };

  const getPerformanceRating = (confidence) => {
    if (confidence >= 0.9) return 'Excellent';
    if (confidence >= 0.8) return 'Very Good';
    if (confidence >= 0.7) return 'Good';
    if (confidence >= 0.6) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 15, 35, 0.98)',
      backdropFilter: 'blur(25px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: 'clamp(10px, 2vw, 20px)',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(30px)',
        borderRadius: '20px',
        padding: 'clamp(18px, 3vw, 24px)',
        width: 'min(550px, calc(100vw - 40px))',
        maxHeight: 'min(650px, calc(100vh - 40px))',
        overflowY: 'auto',
        color: 'white',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(16px, 3vw, 20px)',
          paddingBottom: 'clamp(12px, 2vw, 16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(18px, 4vw, 22px)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00f5a0, #00d9f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📊 Gesture Analytics
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 'clamp(20px, 4vw, 24px)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            ×
          </button>
        </div>

        {/* Current Session Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
          marginBottom: 'clamp(16px, 3vw, 20px)'
        }}>
          <div style={{
            background: 'rgba(0, 245, 160, 0.1)',
            border: '1px solid rgba(0, 245, 160, 0.3)',
            borderRadius: '10px',
            padding: 'clamp(12px, 2.5vw, 16px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: '700', color: '#00f5a0' }}>
              {totalGestures}
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', opacity: 0.8 }}>Total Gestures</div>
          </div>

          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: '10px',
            padding: 'clamp(12px, 2.5vw, 16px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: '700', color: '#ffd700' }}>
              {Math.round(averageConfidence * 100)}%
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', opacity: 0.8 }}>Avg Confidence</div>
          </div>

          <div style={{
            background: 'rgba(0, 217, 245, 0.1)',
            border: '1px solid rgba(0, 217, 245, 0.3)',
            borderRadius: '10px',
            padding: 'clamp(12px, 2.5vw, 16px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: '700', color: '#00d9f5' }}>
              {currentStability}
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', opacity: 0.8 }}>Stability Frames</div>
          </div>
        </div>

        {/* Performance Rating */}
        <div style={{
          background: `rgba(${getConfidenceColor(averageConfidence).slice(1, 3)}, ${getConfidenceColor(averageConfidence).slice(3, 5)}, ${getConfidenceColor(averageConfidence).slice(5, 7)}, 0.1)`,
          border: `1px solid ${getConfidenceColor(averageConfidence)}50`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: getConfidenceColor(averageConfidence),
            marginBottom: '8px'
          }}>
            Performance: {getPerformanceRating(averageConfidence)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {averageConfidence >= 0.8 
              ? "Excellent gesture recognition! Keep it up!" 
              : averageConfidence >= 0.6 
                ? "Good performance. Try to hold gestures more steadily."
                : "Consider using the training mode to improve recognition."}
          </div>
        </div>

        {/* Gesture Breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Gesture Breakdown
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(gestureBreakdown).map(([gesture, stats]) => (
              <div
                key={gesture}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ fontSize: '32px' }}>
                  {getGestureEmoji(gesture)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                      {gesture}
                    </span>
                    <span style={{ fontSize: '14px', opacity: 0.8 }}>
                      {stats.count} times
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${stats.avgConfidence * 100}%`,
                          height: '100%',
                          background: getConfidenceColor(stats.avgConfidence),
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: getConfidenceColor(stats.avgConfidence),
                      minWidth: '40px'
                    }}>
                      {Math.round(stats.avgConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Gesture Status */}
        {currentGesture && gestureQuality && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Current Gesture
            </h3>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ fontSize: '32px' }}>
                {getGestureEmoji(currentGesture.gesture)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {currentGesture.gesture}
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  <span>Confidence: {Math.round(currentGesture.confidence * 100)}%</span>
                  <span>Quality: {gestureQuality.confidenceLevel}</span>
                  {gestureQuality.stability && <span style={{ color: '#00f5a0' }}>✓ Stable</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips and Recommendations */}
        <div style={{
          background: 'rgba(0, 217, 245, 0.1)',
          border: '1px solid rgba(0, 217, 245, 0.3)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#00d9f5'
          }}>
            💡 Tips for Better Recognition
          </h3>
          
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: 1.6,
            opacity: 0.9
          }}>
            <li>Hold gestures steady for 2-3 seconds</li>
            <li>Ensure good lighting on your hand</li>
            <li>Keep your hand centered in the camera view</li>
            <li>Make clear, distinct gestures</li>
            <li>Use the training mode to improve accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GestureAnalytics;
