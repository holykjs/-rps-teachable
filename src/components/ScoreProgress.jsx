import React from 'react';

const ScoreProgress = ({ 
  playerScore, 
  opponentScore, 
  winScore, 
  playerName = "You", 
  opponentName = "Opponent",
  isMultiplayer = false 
}) => {
  const playerProgress = (playerScore / winScore) * 100;
  const opponentProgress = (opponentScore / winScore) * 100;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(16px)',
      borderRadius: '20px',
      padding: '16px 24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
      minWidth: '300px'
    }}>
      {/* Player Progress */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <span style={{
            color: '#00f5a0',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {playerName}
          </span>
          <span style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: '16px'
          }}>
            {playerScore}/{winScore}
          </span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${playerProgress}%`,
            background: 'linear-gradient(90deg, #00f5a0, #00d9f5)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 12px rgba(0, 245, 160, 0.5)'
          }} />
        </div>
      </div>

      {/* VS Divider */}
      <div style={{
        textAlign: 'center',
        margin: '8px 0',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        VS
      </div>

      {/* Opponent Progress */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <span style={{
            color: isMultiplayer ? '#f093fb' : '#ff8a80',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            {opponentName}
          </span>
          <span style={{
            color: '#fff',
            fontWeight: '700',
            fontSize: '16px'
          }}>
            {opponentScore}/{winScore}
          </span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${opponentProgress}%`,
            background: isMultiplayer 
              ? 'linear-gradient(90deg, #f093fb, #f5576c)'
              : 'linear-gradient(90deg, #ff8a80, #ff5722)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
            boxShadow: isMultiplayer 
              ? '0 0 12px rgba(240, 147, 251, 0.5)'
              : '0 0 12px rgba(255, 138, 128, 0.5)'
          }} />
        </div>
      </div>

      {/* Race to Win Indicator */}
      <div style={{
        textAlign: 'center',
        marginTop: '12px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        🏆 First to {winScore} wins!
      </div>
    </div>
  );
};

export default ScoreProgress;
