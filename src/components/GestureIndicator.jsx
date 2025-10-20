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
    if (confidence >= 0.8) return '#10b981'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  if (!gesture) return null;

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: `2px solid ${getConfidenceColor(confidence)}`,
      boxShadow: `0 8px 32px ${getConfidenceColor(confidence)}40`,
      animation: isActive ? 'gestureDetected 0.3s ease-out' : 'none'
    }}>
      <div style={{
        fontSize: '24px',
        animation: 'bounce 0.6s ease-in-out infinite alternate'
      }}>
        {getGestureEmoji(gesture)}
      </div>
      
      <div>
        <div style={{
          color: '#fff',
          fontWeight: '700',
          fontSize: '14px',
          marginBottom: '2px'
        }}>
          {gesture}
        </div>
        <div style={{
          color: getConfidenceColor(confidence),
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {Math.round(confidence * 100)}% confident
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{
        width: '40px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
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
