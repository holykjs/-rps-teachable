import React, { useState, useEffect } from 'react';

const MultiplayerLobby = ({ 
  multiplayer, 
  onStartSinglePlayer, 
  onGameReady,
  onBackToMenu
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    connected,
    connectionError,
    connectToServer,
    gameMode,
    roomId,
    room,
    opponent,
    gameStatus,
    isHost,
    canStartGame,
    createRoom,
    joinRoom,
    startGame,
    leaveRoom
  } = multiplayer;

  // Auto-connect when component mounts
  useEffect(() => {
    if (!connected && !isConnecting) {
      setIsConnecting(true);
      connectToServer();
    }
  }, [connected, connectToServer, isConnecting]);

  // Reset connecting state when connection is established
  useEffect(() => {
    if (connected) {
      setIsConnecting(false);
    }
  }, [connected]);

  // Notify parent when game is ready to start
  useEffect(() => {
    if (gameStatus === 'playing') {
      onGameReady();
    }
  }, [gameStatus, onGameReady]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim());
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim(), playerName.trim());
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setShowJoinForm(false);
    setRoomCode('');
  };

  // Connection status
  if (isConnecting) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2>🌐 Connecting to Multiplayer Server...</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.spinner}></div>
            <p>Please wait while we connect to the game server.</p>
            <button 
              onClick={onStartSinglePlayer}
              style={styles.secondaryButton}
            >
              Play Single Player Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2>❌ Connection Failed</h2>
          </div>
          <div style={styles.content}>
            <p>Unable to connect to the multiplayer server.</p>
            {connectionError && (
              <p style={styles.error}>{connectionError}</p>
            )}
            <div style={styles.buttonGroup}>
              <button 
                onClick={() => {
                  setIsConnecting(true);
                  connectToServer();
                }}
                style={styles.primaryButton}
              >
                Retry Connection
              </button>
              <button 
                onClick={onStartSinglePlayer}
                style={styles.secondaryButton}
              >
                Play Single Player
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Waiting in room
  if (gameMode !== 'single' && gameStatus === 'waiting') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2>🎮 Room: {roomId}</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.roomInfo}>
              <p><strong>Room Code:</strong> <span style={styles.roomCode}>{roomId}</span></p>
              <p><strong>Players:</strong> {room?.players?.length || 0}/2</p>
            </div>
            
            {isHost ? (
              <div>
                <p>Share this room code with your friend:</p>
                <div style={styles.shareCode}>
                  <code style={styles.codeDisplay}>{roomId}</code>
                  <button 
                    onClick={() => navigator.clipboard?.writeText(roomId)}
                    style={styles.copyButton}
                  >
                    📋 Copy
                  </button>
                </div>
                <p style={styles.waitingText}>Waiting for another player to join...</p>
              </div>
            ) : (
              <p style={styles.waitingText}>Waiting for host to start the game...</p>
            )}

            <div style={styles.playerList}>
              {room?.players?.map((player, index) => (
                <div key={player.id} style={styles.playerItem}>
                  <span>{player.name}</span>
                  {player.isHost && <span style={styles.hostBadge}>HOST</span>}
                </div>
              ))}
            </div>

            <div style={styles.buttonGroup}>
              <button 
                onClick={handleLeaveRoom}
                style={styles.secondaryButton}
              >
                Leave Room
              </button>
              <button 
                onClick={onBackToMenu}
                style={styles.homeButton}
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Room ready to start
  if (gameMode !== 'single' && gameStatus === 'ready') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2>✅ Room Ready!</h2>
          </div>
          <div style={styles.content}>
            <div style={styles.roomInfo}>
              <p><strong>Room:</strong> {roomId}</p>
              <p><strong>Opponent:</strong> {opponent?.name}</p>
            </div>

            <div style={styles.playerList}>
              {room?.players?.map((player) => (
                <div key={player.id} style={styles.playerItem}>
                  <span>{player.name}</span>
                  {player.isHost && <span style={styles.hostBadge}>HOST</span>}
                </div>
              ))}
            </div>

            {canStartGame ? (
              <button 
                onClick={handleStartGame}
                style={styles.primaryButton}
              >
                🚀 Start Game
              </button>
            ) : (
              <p style={styles.waitingText}>Waiting for host to start...</p>
            )}

            <div style={styles.buttonGroup}>
              <button 
                onClick={handleLeaveRoom}
                style={styles.secondaryButton}
              >
                Leave Room
              </button>
              <button 
                onClick={onBackToMenu}
                style={styles.homeButton}
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main lobby menu
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>🎮 Multiplayer Lobby</h2>
        </div>
        <div style={styles.content}>
          {connectionError && (
            <div style={styles.errorBanner}>
              {connectionError}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              style={styles.input}
              maxLength={20}
            />
          </div>

          {!showJoinForm ? (
            <div style={styles.buttonGroup}>
              <button 
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                style={styles.primaryButton}
              >
                🏠 Create Room
              </button>
              <button 
                onClick={() => setShowJoinForm(true)}
                disabled={!playerName.trim()}
                style={styles.primaryButton}
              >
                🚪 Join Room
              </button>
            </div>
          ) : (
            <div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Room Code:</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit room code"
                  style={styles.input}
                  maxLength={6}
                />
              </div>
              <div style={styles.buttonGroup}>
                <button 
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  style={styles.primaryButton}
                >
                  Join Game
                </button>
                <button 
                  onClick={() => setShowJoinForm(false)}
                  style={styles.secondaryButton}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          <div style={styles.divider}>
            <span>or</span>
          </div>

          <div style={styles.buttonGroup}>
            <button 
              onClick={onStartSinglePlayer}
              style={styles.secondaryButton}
            >
              🤖 Play vs Computer
            </button>
            <button 
              onClick={onBackToMenu}
              style={styles.homeButton}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)'
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: 16,
    padding: 0,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  },
  header: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center'
  },
  content: {
    padding: '24px',
    color: '#fff'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#fff'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: 16,
    boxSizing: 'border-box'
  },
  buttonGroup: {
    display: 'flex',
    gap: 12,
    marginBottom: 20
  },
  primaryButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s ease'
  },
  secondaryButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s ease'
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.6)'
  },
  roomInfo: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
  },
  roomCode: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80'
  },
  shareCode: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  codeDisplay: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '8px 12px',
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    flex: 1
  },
  copyButton: {
    padding: '8px 12px',
    borderRadius: 6,
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12
  },
  waitingText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    margin: '16px 0'
  },
  playerList: {
    marginBottom: 20
  },
  playerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    marginBottom: 8
  },
  hostBadge: {
    background: '#f59e0b',
    color: '#000',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold'
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  errorBanner: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center'
  },
  error: {
    color: '#fca5a5',
    fontSize: 14,
    marginTop: 8
  },
  homeButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s ease'
  }
};

// Add CSS animation for spinner
const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerCSS;
  document.head.appendChild(style);
}

export default MultiplayerLobby;
