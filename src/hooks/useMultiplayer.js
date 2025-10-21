import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useWebRTC } from './useWebRTC';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useMultiplayer = () => {
  // Connection state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Game state
  const [gameMode, setGameMode] = useState('single'); // 'single', 'host', 'guest'
  const [roomId, setRoomId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [room, setRoom] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, finished
  
  // Round state
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [multiplayerScores, setMultiplayerScores] = useState({ player1: 0, player2: 0, ties: 0 });
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Helper functions (moved up to use in WebRTC)
  const isHost = gameMode === 'host';
  const isGuest = gameMode === 'guest';
  const isMultiplayer = gameMode !== 'single';
  
  // WebRTC integration
  const webrtc = useWebRTC(socket, roomId, isHost);

  // Initialize socket connection
  const connectToServer = useCallback(() => {
    if (socketRef.current?.connected) return;

    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to multiplayer server');
      setConnected(true);
      setConnectionError(null);
      setSocket(newSocket);
      socketRef.current = newSocket;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setConnected(false);
      setSocket(null);
      
      // Auto-reconnect after 3 seconds
      if (reason !== 'io client disconnect') {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectToServer();
        }, 3000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect to multiplayer server');
      setConnected(false);
    });

    // Room events
    newSocket.on('room-created', ({ roomId: newRoomId, player, room: roomData }) => {
      setRoomId(newRoomId);
      setRoom(roomData);
      setGameMode('host');
      setGameStatus('waiting');
      console.log('Room created:', newRoomId);
    });

    newSocket.on('player-joined', ({ player, room: roomData }) => {
      setRoom(roomData);
      if (roomData.players.length === 2) {
        const otherPlayer = roomData.players.find(p => p.id !== newSocket.id);
        setOpponent(otherPlayer);
        setGameStatus('ready');
      }
      console.log('Player joined room');
    });

    newSocket.on('join-error', (error) => {
      setConnectionError(error);
      console.error('Join error:', error);
    });

    // Game events
    newSocket.on('game-started', (roomData) => {
      setRoom(roomData);
      setGameStatus('playing');
      setRoundResult(null);
      console.log('Game started');
    });

    newSocket.on('player-ready', ({ playerId, playerName: opponentName }) => {
      setWaitingForOpponent(true);
      console.log(`${opponentName} is ready`);
    });

    newSocket.on('round-result', ({ result, gameWinner, scores, room: roomData }) => {
      setRoundResult(result);
      setMultiplayerScores(scores);
      setRoom(roomData);
      setWaitingForOpponent(false);
      
      if (gameWinner) {
        setGameStatus('finished');
      }
      
      console.log('Round result:', result);
    });

    newSocket.on('game-reset', (roomData) => {
      setRoom(roomData);
      setGameStatus('playing');
      setRoundResult(null);
      setMultiplayerScores({ player1: 0, player2: 0, ties: 0 });
      setWaitingForOpponent(false);
      console.log('Game reset');
    });

    newSocket.on('player-disconnected', ({ playerName: disconnectedName, room: roomData }) => {
      setOpponent(null);
      setRoom(roomData);
      setGameStatus('waiting');
      setConnectionError(`${disconnectedName} disconnected`);
      console.log('Player disconnected:', disconnectedName);
    });

    return newSocket;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Game actions
  const createRoom = useCallback((name) => {
    if (!socket || !connected) {
      setConnectionError('Not connected to server');
      return;
    }
    
    setPlayerName(name);
    socket.emit('create-room', name);
  }, [socket, connected]);

  const joinRoom = useCallback((roomCode, name) => {
    if (!socket || !connected) {
      setConnectionError('Not connected to server');
      return;
    }
    
    setPlayerName(name);
    setGameMode('guest');
    socket.emit('join-room', { roomId: roomCode.toUpperCase(), playerName: name });
  }, [socket, connected]);

  const startGame = useCallback(() => {
    if (!socket || gameMode !== 'host') return;
    socket.emit('start-game');
    
    // Initialize WebRTC when game starts
    if (webrtc.initializeWebRTC) {
      webrtc.initializeWebRTC();
    }
  }, [socket, gameMode, webrtc]);

  const sendMove = useCallback((gesture, confidence) => {
    if (!socket || gameStatus !== 'playing') return;
    
    setWaitingForOpponent(true);
    socket.emit('player-move', { move: gesture, confidence });
  }, [socket, gameStatus]);

  const resetGame = useCallback(() => {
    if (!socket || gameMode !== 'host') return;
    socket.emit('reset-game');
  }, [socket, gameMode]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
    
    // Reset all state
    setGameMode('single');
    setRoomId(null);
    setRoom(null);
    setOpponent(null);
    setGameStatus('waiting');
    setRoundResult(null);
    setMultiplayerScores({ player1: 0, player2: 0, ties: 0 });
    setWaitingForOpponent(false);
    setConnectionError(null);
  }, [socket]);

  const switchToSinglePlayer = useCallback(() => {
    leaveRoom();
  }, [leaveRoom]);

  // Helper functions (variables moved up, only derived values here)
  const canStartGame = isHost && room?.isFull && gameStatus === 'ready';
  const canResetGame = isHost && gameStatus === 'finished';

  const getPlayerPosition = useCallback(() => {
    if (!room || !socket) return null;
    const player = room.players.find(p => p.id === socket.id);
    return player?.position || null;
  }, [room, socket]);

  const getOpponentMove = useCallback(() => {
    if (!roundResult) return null;
    const playerPosition = getPlayerPosition();
    if (playerPosition === 'player1') {
      return roundResult.player2Move;
    } else if (playerPosition === 'player2') {
      return roundResult.player1Move;
    }
    return null;
  }, [roundResult, getPlayerPosition]);

  const getPlayerMove = useCallback(() => {
    if (!roundResult) return null;
    const playerPosition = getPlayerPosition();
    if (playerPosition === 'player1') {
      return roundResult.player1Move;
    } else if (playerPosition === 'player2') {
      return roundResult.player2Move;
    }
    return null;
  }, [roundResult, getPlayerPosition]);

  const getRoundWinner = useCallback(() => {
    if (!roundResult) return null;
    const playerPosition = getPlayerPosition();
    
    if (roundResult.winner === 'tie') return 'tie';
    if (roundResult.winner === playerPosition) return 'player';
    return 'opponent';
  }, [roundResult, getPlayerPosition]);

  return {
    // Connection state
    connected,
    connectionError,
    connectToServer,
    
    // Game state
    gameMode,
    roomId,
    playerName,
    room,
    opponent,
    gameStatus,
    isMultiplayer,
    isHost,
    isGuest,
    
    // Round state
    waitingForOpponent,
    roundResult,
    multiplayerScores,
    
    // Actions
    createRoom,
    joinRoom,
    startGame,
    sendMove,
    resetGame,
    leaveRoom,
    switchToSinglePlayer,
    
    // Helpers
    canStartGame,
    canResetGame,
    getPlayerPosition,
    getOpponentMove,
    getPlayerMove,
    getRoundWinner,
    
    // WebRTC
    webrtc
  };
};
