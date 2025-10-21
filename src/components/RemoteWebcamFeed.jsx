import React, { useEffect, useRef } from 'react';

const RemoteWebcamFeed = ({ 
  remoteStream, 
  isConnected, 
  opponentName = "Opponent",
  error 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(240, 147, 251, 0.3)',
    boxShadow: '0 10px 40px rgba(240, 147, 251, 0.2)'
  };

  const videoStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // Mirror the video like a selfie
    borderRadius: '18px'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    borderRadius: '18px',
    backdropFilter: 'blur(10px)'
  };

  const statusStyle = {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    textAlign: 'center',
    opacity: 0.9
  };

  const iconStyle = {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.7
  };

  // Show loading state while connecting
  if (!remoteStream && !error) {
    return (
      <div style={containerStyle}>
        <div style={overlayStyle}>
          <div style={iconStyle}>📹</div>
          <div style={statusStyle}>
            {isConnected ? 'Waiting for video...' : 'Connecting to opponent...'}
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(240, 147, 251, 0.3)',
            borderTop: '3px solid #f093fb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={containerStyle}>
        <div style={overlayStyle}>
          <div style={iconStyle}>⚠️</div>
          <div style={statusStyle}>Connection Error</div>
          <div style={{
            fontSize: '12px',
            opacity: 0.7,
            textAlign: 'center',
            maxWidth: '200px'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Show video feed
  return (
    <div style={containerStyle}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Always mute remote video to prevent feedback
        style={videoStyle}
      />
      
      {/* Connection status indicator */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: isConnected 
          ? 'rgba(0, 245, 160, 0.2)' 
          : 'rgba(255, 152, 128, 0.2)',
        border: `1px solid ${isConnected ? '#00f5a0' : '#ff9880'}`,
        borderRadius: '20px',
        padding: '4px 8px',
        fontSize: '10px',
        fontWeight: '600',
        color: isConnected ? '#00f5a0' : '#ff9880',
        backdropFilter: 'blur(10px)'
      }}>
        {isConnected ? '🟢 LIVE' : '🔴 CONNECTING'}
      </div>

      {/* Opponent name overlay */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white',
        backdropFilter: 'blur(10px)'
      }}>
        👥 {opponentName}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RemoteWebcamFeed;
