# ✊✋✌️ Rock Paper Scissors - AI Gesture Recognition

A real-time Rock Paper Scissors game with AI gesture recognition and LAN multiplayer support, powered by Google Teachable Machine and TensorFlow.js.

![React](https://img.shields.io/badge/React-19.1.1-blue) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-orange) ![Vite](https://img.shields.io/badge/Vite-7.1.7-purple) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-green)

## 🎮 Features

### **Single Player Mode**
- **Play vs AI** - Challenge an intelligent computer opponent
- **Advanced Gesture Recognition** - Real-time hand tracking with confidence scores
- **Temporal Smoothing** - 8-frame history with consensus threshold for accuracy
- **Gesture Analytics** - Performance metrics and improvement recommendations

### **Multiplayer Mode with Dual Webcam**
- **Real-time Multiplayer** - Play against friends anywhere in the world
- **Dual Webcam Streaming** - See each other's live video feeds via WebRTC
- **Room System** - Create/join games with 6-digit room codes
- **Cross-device Support** - Works on desktop and mobile browsers
- **Synchronized Gameplay** - Real-time gesture recognition for both players

### **General Features**
- **Race to 5 Wins** - First player to reach 5 wins takes victory
- **Match History** - Track rounds with confidence levels and statistics
- **Responsive Design** - Optimized for desktop and mobile devices
- **Modern UI** - Beautiful gradients and smooth animations

## 🚀 Quick Start

### Single Player Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser and click **"🤖 Play vs Computer"**.

### Multiplayer Setup

```bash
# Install client dependencies
npm install --legacy-peer-deps

# Install server dependencies
cd server && npm install

# Start multiplayer server (Terminal 1)
cd server && npm start

# Start game client (Terminal 2)
npm run dev
```

1. Open `http://localhost:5173` in two browser windows/devices
2. Click **"👥 Multiplayer"** in both
3. One player creates a room, the other joins with the room code
4. Start playing with real-time gesture recognition!

### Optional: Custom AI Model

1. **Train Your Model** (optional - default model included):
   - Go to [Teachable Machine](https://teachablemachine.withgoogle.com/train/image)
   - Create 3 classes: Rock, Paper, Scissors
   - Capture 50-100 samples per class using webcam
   - Click "Train Model" → "Export Model" → "Upload (shareable link)"

2. **Update Model URL**:
   - Create `.env` file in project root:
   ```bash
   VITE_MODEL_URL=YOUR_TEACHABLE_MACHINE_URL_HERE/
   ```

## 🎯 How to Play

### Single Player Mode
1. **Start Camera** - Allow camera permissions when prompted
2. **Show Gesture** - Make Rock ✊, Paper ✋, or Scissors ✌️ gesture
3. **Click Start Round** - Press the button when ready
4. **AI Responds** - Computer makes its move simultaneously
5. **Winner Announced** - First to 5 wins gets the trophy! 🏆

### Multiplayer Mode
1. **Create/Join Room** - Host creates room, guest joins with code
2. **Both Start Cameras** - Each player allows camera permissions
3. **Host Starts Game** - Click "🚀 Start Game" when both ready
4. **Make Gestures** - Both players show gestures simultaneously
5. **Real-time Results** - Synchronized scoring across devices

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 + Vite 7.1.7
- **AI/ML**: Google Teachable Machine + TensorFlow.js 4.22.0
- **Computer Vision**: @teachablemachine/image 0.8.5, MediaPipe Hands
- **Multiplayer**: Socket.IO 4.7.2 + Node.js Express server
- **Gesture Recognition**: Advanced temporal smoothing with confidence scoring

## ⚙️ Configuration

### Adjust Win Score
```javascript
// Line 12 in src/App.jsx
const WIN_SCORE = 5; // Change to 3, 7, 10, etc.
```

### Confidence Threshold
```javascript
// Lines 224, 230 in src/App.jsx
if (!p1Result || p1Result.confidence < 0.6) {
  // Adjust 0.6 (60%) threshold
}
```

### Webcam Resolution
```javascript
// Lines 73, 123 in src/App.jsx
const tmWebcam = new tmImage.Webcam(400, 300, true);
//                                  width, height, flip
```

## 📦 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
Drag & drop `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

## 🐛 Troubleshooting

**Cameras won't start**
- Allow camera permissions in browser
- Check two cameras are available (built-in + USB, or two devices)

**Gestures not detected**
- Improve lighting
- Make clearer, more distinct gestures
- Lower confidence threshold (lines 224, 230)

**Model won't load**
- Verify `MODEL_BASE_URL` ends with `/`
- Check internet connection
- Test URL: `YOUR_MODEL_URL/model.json` should show JSON

## 📝 Game Rules

- Rock beats Scissors
- Scissors beats Paper  
- Paper beats Rock
- Same gesture = Tie (no points)
- First to 5 wins = Game Winner 🏆

## 🎓 Educational Value

This project demonstrates:
- **Machine Learning**: Image classification, transfer learning
- **Computer Vision**: Real-time video processing
- **React**: Hooks, state management, refs
- **Web APIs**: MediaDevices (dual webcam), TensorFlow.js

## 📄 License

MIT License - Free to use for educational purposes

## 🙏 Acknowledgments

- Google Teachable Machine team
- TensorFlow.js community
- React + Vite teams

---

**Built with ❤️ using AI Gesture Recognition**
