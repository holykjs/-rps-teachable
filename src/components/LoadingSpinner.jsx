import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  progress = null,
  fullScreen = false 
}) => {
  const sizes = {
    small: { spinner: 24, text: 14 },
    medium: { spinner: 48, text: 16 },
    large: { spinner: 72, text: 18 }
  };

  const { spinner: spinnerSize, text: textSize } = sizes[size];

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: 'white',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 15, 35, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999
    })
  };

  return (
    <div style={containerStyle}>
      {/* Animated Spinner */}
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid #00f5a0',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      {/* Loading Message */}
      <div style={{
        fontSize: textSize,
        fontWeight: '600',
        textAlign: 'center',
        opacity: 0.9
      }}>
        {message}
      </div>
      
      {/* Progress Bar (if progress is provided) */}
      {progress !== null && (
        <div style={{
          width: '200px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f5a0, #00d9f5)',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      )}
      
      {progress !== null && (
        <div style={{
          fontSize: '12px',
          opacity: 0.7
        }}>
          {Math.round(progress)}% complete
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
