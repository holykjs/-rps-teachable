# 🎮 Rock Paper Scissors - LAN Multiplayer Setup

This guide will help you set up and test the LAN multiplayer functionality for the Rock Paper Scissors gesture recognition game.

## 🚀 Quick Start

### 1. Install Dependencies

First, install the client-side dependencies:
```bash
npm install
```

Then, install the server dependencies:
```bash
cd server
npm install
```

### 2. Start the Multiplayer Server

In the `server` directory:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

The server will start on `http://localhost:3001`

### 3. Start the Game Client

In the main project directory:
```bash
npm run dev
```

The game will be available at `http://localhost:5173`

## 🎯 How to Play Multiplayer

### Creating a Game
1. Open the game in your browser
2. Click **"👥 Multiplayer"** from the main menu
3. Enter your name
4. Click **"🏠 Create Room"**
5. Share the 6-digit room code with your friend

### Joining a Game
1. Open the game in another browser/device on the same network
2. Click **"👥 Multiplayer"** from the main menu
3. Enter your name
4. Click **"🚪 Join Room"**
5. Enter the room code provided by the host
6. Wait for the host to start the game

### Playing
1. Both players need to start their cameras
2. The host clicks **"🚀 Start Game"**
3. Show your gesture (Rock ✊, Paper ✋, or Scissors ✌️) to the camera
4. Click **"Start Round"** when ready
5. First player to 5 wins!

## 🔧 Technical Details

### Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Player 1      │    │   Player 2      │
│   (Browser)     │◄──►│   (Browser)     │
│                 │    │                 │
│ React Frontend  │    │ React Frontend  │
│ Socket.IO Client│    │ Socket.IO Client│
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │  Node.js Server │
         │  Socket.IO      │
         │  Port 3001      │
         └─────────────────┘
```

### Key Components

#### Backend (`server/`)
- **`server.js`** - Main Socket.IO server with room management
- **Game state synchronization** - Handles moves, scores, and round results
- **Room management** - Create/join rooms with 6-digit codes

#### Frontend (`src/`)
- **`useMultiplayer.js`** - Hook for network communication
- **`useEnhancedGameLogic.js`** - Enhanced game logic supporting both single and multiplayer
- **`MultiplayerLobby.jsx`** - UI for creating/joining games
- **Updated components** - PlayerPanel, ComputerDisplay support opponent display

### Network Events

#### Client → Server
- `create-room` - Create a new game room
- `join-room` - Join existing room with code
- `start-game` - Host starts the game
- `player-move` - Send gesture and confidence
- `reset-game` - Host resets the game

#### Server → Client
- `room-created` - Room successfully created
- `player-joined` - Another player joined
- `game-started` - Game has begun
- `round-result` - Round outcome with moves and winner
- `player-disconnected` - Opponent left

## 🌐 Network Configuration

### LAN Setup
The multiplayer server runs on your local network. Other players can connect using:
- **Same WiFi network** - Use your computer's IP address
- **Ethernet** - Direct connection or through router
- **Hotspot** - Share your connection

### Finding Your IP Address
**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig
# Look for "inet" address under your active interface
```

### Connecting from Other Devices
1. Update `SERVER_URL` in `src/hooks/useMultiplayer.js`:
   ```javascript
   const SERVER_URL = 'http://YOUR_IP_ADDRESS:3001';
   ```
2. Restart the client application
3. Other players can now connect using `http://YOUR_IP_ADDRESS:5173`

## 🐛 Troubleshooting

### Common Issues

#### "Failed to connect to multiplayer server"
- ✅ Check if the server is running on port 3001
- ✅ Verify firewall settings allow connections
- ✅ Ensure both devices are on the same network

#### "Room not found"
- ✅ Double-check the 6-digit room code
- ✅ Make sure the host's game is still running
- ✅ Room codes are case-sensitive

#### Camera not working
- ✅ Allow camera permissions in browser
- ✅ Close other applications using the camera
- ✅ Try refreshing the page

#### Gesture recognition issues
- ✅ Ensure good lighting
- ✅ Keep hand clearly visible in camera frame
- ✅ Wait for gesture confidence to be high (>60%)

### Server Logs
Monitor the server console for connection and game events:
```bash
cd server
npm start
# Watch for connection logs and error messages
```

### Browser Console
Check browser developer tools (F12) for client-side errors and network issues.

## 🔒 Security Notes

- The server runs locally and doesn't store any personal data
- Room codes are temporary and expire when players disconnect
- All communication happens over your local network
- No internet connection required once models are loaded

## 🎨 Customization

### Changing Server Port
Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to your preferred port
```

And update `src/hooks/useMultiplayer.js`:
```javascript
const SERVER_URL = 'http://localhost:YOUR_NEW_PORT';
```

### Adjusting Game Settings
Edit `src/App.jsx`:
```javascript
const WIN_SCORE = 5; // Change winning score
```

### UI Customization
- **Colors** - Update gradient colors in components
- **Icons** - Change emojis in PlayerPanel and MainMenu
- **Animations** - Modify CSS animations in component styles

## 📱 Mobile Support

The game works on mobile devices with cameras:
1. Open the game URL in mobile browser
2. Allow camera permissions
3. Use landscape orientation for better experience
4. Ensure stable network connection

## 🚀 Production Deployment

For production use:
1. **Deploy server** to cloud platform (Heroku, AWS, etc.)
2. **Update SERVER_URL** to production server address
3. **Configure CORS** for your domain
4. **Add HTTPS** for secure connections
5. **Set up monitoring** for server health

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console for errors
3. Verify network connectivity
4. Ensure all dependencies are installed

---

**Have fun playing Rock Paper Scissors with friends! 🎉**
