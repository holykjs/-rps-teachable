const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Production configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configure Express CORS
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());

// Game state management
const rooms = new Map();
const players = new Map();

class GameRoom {
  constructor(roomId, hostId) {
    this.id = roomId;
    this.hostId = hostId;
    this.players = [];
    this.gameState = {
      status: 'waiting', // waiting, countdown, playing, finished
      scores: { player1: 0, player2: 0, ties: 0 },
      currentRound: null,
      winScore: 5,
      countdown: null
    };
    this.roundData = {
      player1Move: null,
      player2Move: null,
      player1Ready: false,
      player2Ready: false
    };
  }

  addPlayer(playerId, playerName) {
    if (this.players.length >= 2) return false;
    
    const player = {
      id: playerId,
      name: playerName,
      isHost: playerId === this.hostId,
      position: this.players.length === 0 ? 'player1' : 'player2'
    };
    
    this.players.push(player);
    return player;
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    if (this.players.length === 0) {
      return true; // Room should be deleted
    }
    return false;
  }

  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  isFull() {
    return this.players.length === 2;
  }

  resetRound() {
    this.roundData = {
      player1Move: null,
      player2Move: null,
      player1Ready: false,
      player2Ready: false
    };
  }

  setPlayerMove(playerId, move) {
    const player = this.getPlayer(playerId);
    if (!player) return false;

    this.roundData[`${player.position}Move`] = move;
    this.roundData[`${player.position}Ready`] = true;

    return this.roundData.player1Ready && this.roundData.player2Ready;
  }

  calculateRoundResult() {
    const { player1Move, player2Move } = this.roundData;
    
    if (!player1Move || !player2Move) return null;

    if (player1Move === player2Move) {
      this.gameState.scores.ties++;
      return { winner: 'tie', player1Move, player2Move };
    }

    const player1Wins = 
      (player1Move === 'Rock' && player2Move === 'Scissors') ||
      (player1Move === 'Paper' && player2Move === 'Rock') ||
      (player1Move === 'Scissors' && player2Move === 'Paper');

    if (player1Wins) {
      this.gameState.scores.player1++;
      return { winner: 'player1', player1Move, player2Move };
    } else {
      this.gameState.scores.player2++;
      return { winner: 'player2', player1Move, player2Move };
    }
  }

  checkGameWinner() {
    const { player1, player2 } = this.gameState.scores;
    if (player1 >= this.gameState.winScore) return 'player1';
    if (player2 >= this.gameState.winScore) return 'player2';
    return null;
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create or join room
  socket.on('create-room', (playerName) => {
    const roomId = generateRoomId();
    const room = new GameRoom(roomId, socket.id);
    const player = room.addPlayer(socket.id, playerName);
    
    rooms.set(roomId, room);
    players.set(socket.id, { roomId, playerName });
    
    socket.join(roomId);
    socket.emit('room-created', { roomId, player, room: getRoomData(room) });
    
    console.log(`Room created: ${roomId} by ${playerName}`);
  });

  socket.on('join-room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('join-error', 'Room not found');
      return;
    }
    
    if (room.isFull()) {
      socket.emit('join-error', 'Room is full');
      return;
    }

    const player = room.addPlayer(socket.id, playerName);
    players.set(socket.id, { roomId, playerName });
    
    socket.join(roomId);
    
    // Notify both players
    io.to(roomId).emit('player-joined', { 
      player, 
      room: getRoomData(room) 
    });
    
    console.log(`${playerName} joined room: ${roomId}`);
  });

  // Game actions
  socket.on('start-game', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room || !room.isFull()) return;
    
    const player = room.getPlayer(socket.id);
    if (!player.isHost) return; // Only host can start
    
    room.gameState.status = 'playing';
    io.to(playerData.roomId).emit('game-started', getRoomData(room));
  });

  socket.on('player-move', ({ move, confidence }) => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room || room.gameState.status !== 'playing') return;
    
    const bothReady = room.setPlayerMove(socket.id, { gesture: move, confidence });
    
    if (bothReady) {
      // Calculate result
      const result = room.calculateRoundResult();
      const gameWinner = room.checkGameWinner();
      
      if (gameWinner) {
        room.gameState.status = 'finished';
      }
      
      // Send result to both players
      io.to(playerData.roomId).emit('round-result', {
        result,
        gameWinner,
        scores: room.gameState.scores,
        room: getRoomData(room)
      });
      
      // Reset for next round
      room.resetRound();
    } else {
      // Notify other player that this player is ready
      socket.to(playerData.roomId).emit('player-ready', {
        playerId: socket.id,
        playerName: playerData.playerName
      });
    }
  });

  socket.on('reset-game', () => {
    const playerData = players.get(socket.id);
    if (!playerData) return;
    
    const room = rooms.get(playerData.roomId);
    if (!room) return;
    
    const player = room.getPlayer(socket.id);
    if (!player.isHost) return; // Only host can reset
    
    room.gameState.scores = { player1: 0, player2: 0, ties: 0 };
    room.gameState.status = 'playing';
    room.resetRound();
    
    io.to(playerData.roomId).emit('game-reset', getRoomData(room));
  });

  // WebRTC Signaling handlers
  socket.on('webrtc-offer', ({ roomId, offer }) => {
    console.log(`WebRTC offer from ${socket.id} in room ${roomId}`);
    socket.to(roomId).emit('webrtc-offer', offer);
  });

  socket.on('webrtc-answer', ({ roomId, answer }) => {
    console.log(`WebRTC answer from ${socket.id} in room ${roomId}`);
    socket.to(roomId).emit('webrtc-answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    console.log(`ICE candidate from ${socket.id} in room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        const shouldDeleteRoom = room.removePlayer(socket.id);
        
        if (shouldDeleteRoom) {
          rooms.delete(playerData.roomId);
        } else {
          // Notify remaining player
          socket.to(playerData.roomId).emit('player-disconnected', {
            playerId: socket.id,
            playerName: playerData.playerName,
            room: getRoomData(room)
          });
        }
      }
      players.delete(socket.id);
    }
  });
});

// Helper functions
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomData(room) {
  return {
    id: room.id,
    players: room.players,
    gameState: room.gameState,
    isFull: room.isFull()
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size, 
    players: players.size 
  });
});

server.listen(PORT, () => {
  console.log(`🎮 RPS Multiplayer Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`🔧 Environment: ${NODE_ENV}`);
  if (NODE_ENV === 'production') {
    console.log(`🚀 Production server ready!`);
  }
});
