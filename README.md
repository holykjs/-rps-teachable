# ✊✋✌️ 2-Player Rock Paper Scissors - AI Gesture Recognition

A real-time 2-player Rock Paper Scissors game using AI gesture recognition powered by Google Teachable Machine and TensorFlow.js.

![React](https://img.shields.io/badge/React-19.1.1-blue) ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-orange) ![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)

## 🎮 Features

- **2-Player Split Screen** - Dual webcam support for head-to-head gameplay
- **Race to 5 Wins** - First player to reach 5 wins takes victory
- **Auto-Start Cameras** - Cameras initialize automatically on load
- **Real-Time AI Recognition** - Live gesture detection with confidence scores
- **Match History** - Track last 10 rounds with confidence levels
- **Full-Screen Layout** - Optimized UI that fills the entire viewport

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### First-Time Setup

1. **Train Your Model** (one-time):
   - Go to [Teachable Machine](https://teachablemachine.withgoogle.com/train/image)
   - Create 3 classes: Rock, Paper, Scissors
   - Capture 50-100 samples per class using webcam
   - Click "Train Model" → "Export Model" → "Upload (shareable link)"
   - Copy the model URL

2. **Update Model URL**:
   - Open `src/App.jsx`
   - Replace line 8 with your model URL:
   ```javascript
   const MODEL_BASE_URL = "YOUR_TEACHABLE_MACHINE_URL_HERE/";
   ```

3. **Play!**
   - Both cameras start automatically
   - Click "🎮 PLAY ROUND"
   - Make gestures during countdown
   - First to 5 wins!

## 🎯 How to Play

1. **Cameras Auto-Start** - Both Player 1 (left/blue) and Player 2 (right/red) cameras initialize automatically
2. **Click Play Round** - Press the central "🎮 PLAY ROUND" button
3. **Countdown** - 3... 2... 1... countdown appears on screen
4. **Show Gestures** - Both players make Rock/Paper/Scissors gestures simultaneously
5. **Winner Announced** - AI determines round winner, scores update
6. **Race to Victory** - First to 5 wins gets the trophy! 🏆

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 + Vite 7.1.7
- **AI/ML**: Google Teachable Machine + TensorFlow.js 4.22.0
- **Computer Vision**: @teachablemachine/image 0.8.5

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
