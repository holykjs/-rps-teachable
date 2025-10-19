import React from 'react';

const GameStatusBar = ({ 
  isMultiplayerMode, 
  connected, 
  roomId, 
  opponentName, 
  waitingForOpponent,
  gameActive,
  countdown 
}) => {
  const getStatusInfo = () => {
    if (isMultiplayerMode) {
      if (!connected) {
        return { text: '🔴 Disconnected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      }
      if (waitingForOpponent) {
        return { text: `⏳ Waiting for ${opponentName}...`, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      }
      if (gameActive && countdown) {
        return { text: `⏱️ Round starting in ${countdown}...`, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
      }
      return { text: `🟢 Playing vs ${opponentName}`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    } else {
      if (gameActive && countdown) {
        return { text: `⏱️ Round starting in ${countdown}...`, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
      }
      return { text: '🤖 Playing vs AI', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' };
    }
  };

  const status = getStatusInfo();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: status.bg,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${status.color}40`,
      borderRadius: '24px',
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: `0 8px 32px ${status.color}20`,
      animation: 'slideDown 0.3s ease-out'
    }}>
      <div style={{
        color: status.color,
        fontWeight: '600',
        fontSize: '14px',
        whiteSpace: 'nowrap'
      }}>
        {status.text}
      </div>
      
      {isMultiplayerMode && roomId && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#fff',
          fontFamily: 'monospace',
          fontWeight: '600'
        }}>
          {roomId}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GameStatusBar;
