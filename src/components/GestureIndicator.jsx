import React from 'react';

const GestureIndicator = ({ gesture, confidence, isActive }) => {
  const getGestureEmoji = (gesture) => {
    switch (gesture) {
      case 'Rock': return '✊';
      case 'Paper': return '✋';
      case 'Scissors': return '✌️';
      default: return '❓';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#10b981'; // Green
    if (confidence >= 0.5) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  if (!gesture) return null;

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '8px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: `2px solid ${getConfidenceColor(confidence)}`,
      boxShadow: `0 4px 16px ${getConfidenceColor(confidence)}40`,
      animation: isActive ? 'gestureDetected 0.3s ease-out' : 'none',
      minWidth: '120px',
      maxWidth: '140px',
      width: 'fit-content'
    }}>
      <div style={{
        fontSize: '18px',
        animation: 'bounce 0.6s ease-in-out infinite alternate',
        flexShrink: 0
      }}>
        {getGestureEmoji(gesture)}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: '#fff',
          fontWeight: '700',
          fontSize: '11px',
          marginBottom: '1px',
          whiteSpace: 'nowrap'
        }}>
          {gesture}
        </div>
        <div style={{
          color: getConfidenceColor(confidence),
          fontSize: '9px',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          {Math.round(confidence * 100)}%
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{
        width: '24px',
        height: '3px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{
          width: `${confidence * 100}%`,
          height: '100%',
          background: getConfidenceColor(confidence),
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <style jsx>{`
        @keyframes gestureDetected {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default GestureIndicator;
