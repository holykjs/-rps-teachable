import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import * as handpose from "@tensorflow-models/handpose";

/**
 * Replace with YOUR Teachable Machine model URL after training
 * Get the shareable link from: https://teachablemachine.withgoogle.com/
 */
const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/ZvFDAj_Qi/";

// Game choices
const CHOICES = ["Rock", "Paper", "Scissors"];
const WIN_SCORE = 5; // Race to 5!

export default function App() {
  // Model state
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Single webcam state for human player
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const webcamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [humanGesture, setHumanGesture] = useState(null);
  const [computerMove, setComputerMove] = useState(null);
  const [handLandmarks, setHandLandmarks] = useState(null);
  const [handposeModel, setHandposeModel] = useState(null);
  const [shufflingImage, setShufflingImage] = useState(null);
  const shuffleIntervalRef = useRef(null);
  
  // Gesture smoothing - track recent gestures to reduce jitter
  const humanGestureHistory = useRef([]);
  
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [humanMove, setHumanMove] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [scores, setScores] = useState({ human: 0, computer: 0, ties: 0 });
  const [countdown, setCountdown] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameWinner, setGameWinner] = useState(null);

  // Load models and auto-start cameras
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        // Load Teachable Machine model
        const modelURL = MODEL_BASE_URL + "model.json";
        const metadataURL = MODEL_BASE_URL + "metadata.json";
        const loaded = await tmImage.load(modelURL, metadataURL);
        setModel(loaded);
        
        // Load HandPose model
        console.log("Loading HandPose model...");
        const handModel = await handpose.load();
        setHandposeModel(handModel);
        console.log("HandPose model loaded successfully");
        
        // Auto-start webcam after models load
        setTimeout(() => {
          startWebcam();
        }, 500);
      } catch (e) {
        console.error("Model load error:", e);
        setError("Unable to load model. Check model path or network.");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      stopWebcam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start webcam with hand detection
  async function startWebcam() {
    if (!model || !handposeModel) return;
    try {
      setIsWebcamOn(true);
      console.log("Starting webcam with hand detection...");
      
      // Use Teachable Machine webcam
      const tmWebcam = new tmImage.Webcam(640, 480, true);
      videoRef.current = tmWebcam;
      await tmWebcam.setup();
      await tmWebcam.play();
      
      console.log("Webcam started successfully");

      // Create single canvas for human player
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      canvasRef.current = canvas;

      // Add canvas to webcam container
      if (webcamRef.current) {
        webcamRef.current.innerHTML = "";
        webcamRef.current.appendChild(canvas);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.objectFit = "cover";
        canvas.style.borderRadius = "8px";
      }

      // Rendering loop with real hand detection
      let frameCount = 0;
      const loop = async () => {
        try {
          tmWebcam.update();
          frameCount++;
          
          const ctx = canvas.getContext('2d');
          
          // Draw full webcam feed (mirrored for natural interaction)
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(tmWebcam.canvas, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
          
          // Run hand detection every 3rd frame for performance
          if (frameCount % 3 === 0 && handposeModel) {
            try {
              const hands = await handposeModel.estimateHands(tmWebcam.canvas);
              if (hands.length > 0) {
                const hand = hands[0];
                setHandLandmarks(hand.landmarks);
                
                // Draw hand skeleton
                drawHandSkeleton(ctx, hand.landmarks, canvas.width, canvas.height);
              } else {
                setHandLandmarks(null);
              }
            } catch (handError) {
              console.error("Hand detection error:", handError);
            }
          }
          
          // Run gesture predictions every 2nd frame
          if (frameCount % 2 === 0) {
            const predictions = await model.predict(tmWebcam.canvas);
            const gesture = extractGesture(predictions);
            const smoothed = smoothGesture(gesture, humanGestureHistory);
            setHumanGesture(smoothed);
          }
          
          requestAnimationFrame(loop);
        } catch (loopError) {
          console.error("Error in render loop:", loopError);
        }
      };
      loop();
      
    } catch (e) {
      console.error("Webcam error:", e);
      if (e.name === 'NotAllowedError') {
        setError("Camera permission denied. Please allow camera access and refresh the page.");
      } else if (e.name === 'NotFoundError') {
        setError("No camera found. Please connect a camera and refresh the page.");
      } else if (e.name === 'NotReadableError') {
        setError("Camera is being used by another application. Please close other apps using the camera.");
      } else {
        setError(`Webcam error: ${e.message || 'Unable to access camera'}`);
      }
      setIsWebcamOn(false);
    }
  }
  
  // Draw hand skeleton with connections
  function drawHandSkeleton(ctx, landmarks, canvasWidth, canvasHeight) {
    // Hand connections (finger bones)
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index finger
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle finger
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring finger
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm
      [0, 5], [5, 9], [9, 13], [13, 17]
    ];
    
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvasWidth, 0);
    
    // Draw connections (green lines)
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      ctx.moveTo(startPoint[0], startPoint[1]);
      ctx.lineTo(endPoint[0], endPoint[1]);
    });
    
    ctx.stroke();
    
    // Draw landmarks (red dots)
    ctx.fillStyle = '#FF0000';
    landmarks.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    ctx.restore();
  }

  // Generate computer move with image
  function generateComputerMove() {
    const moves = ["Rock", "Paper", "Scissors"];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return randomMove; // Don't set it immediately, return for later reveal
  }
  
  // Start image shuffling animation
  function startImageShuffle() {
    const moves = ["Rock", "Paper", "Scissors"];
    let currentIndex = 0;
    
    // Set initial shuffling image
    setShufflingImage(moves[0]);
    
    // Shuffle every 200ms for fast animation
    shuffleIntervalRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % moves.length;
      setShufflingImage(moves[currentIndex]);
    }, 200);
  }
  
  // Stop image shuffling animation
  function stopImageShuffle() {
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
    setShufflingImage(null);
  }
  
  // Get computer gesture image path
  function getComputerImage(move) {
    if (!move) return null;
    const imageMap = {
      "Rock": "/images/rock-ai.png",
      "Paper": "/images/paper-ai.png",
      "Scissors": "/images/scissors-ai.png"
    };
    return imageMap[move];
  }

  // Stop webcam
  function stopWebcam() {
    try {
      if (videoRef.current && videoRef.current.stop) {
        videoRef.current.stop();
      }
      
      // Clean up canvas elements
      if (webcamRef.current) {
        webcamRef.current.innerHTML = "";
      }
      
      canvasRef.current = null;
      videoRef.current = null;
      setIsWebcamOn(false);
      setPredictions([]);
      setHumanGesture(null);
      setComputerMove(null);
      setHandLandmarks(null);
      setHandposeModel(null);
    } catch (e) {
      console.error("Error stopping webcam:", e);
    }
  }

  // Game Logic
  function determineWinner(human, computer) {
    if (human === computer) return "tie";
    if (
      (human === "Rock" && computer === "Scissors") ||
      (human === "Paper" && computer === "Rock") ||
      (human === "Scissors" && computer === "Paper")
    ) {
      return "human";
    }
    return "computer";
  }

  function extractGesture(preds) {
    if (!preds || preds.length === 0) return null;
    const sorted = [...preds].sort((a, b) => b.probability - a.probability);
    const detected = sorted[0];
    const className = detected?.className?.toLowerCase() || "";
    
    if (className.includes("rock")) return { gesture: "Rock", confidence: detected.probability };
    if (className.includes("paper")) return { gesture: "Paper", confidence: detected.probability };
    if (className.includes("scissors")) return { gesture: "Scissors", confidence: detected.probability };
    return null;
  }

  // Smooth gesture detection to reduce jitter
  function smoothGesture(newGesture, historyRef) {
    if (!newGesture || newGesture.confidence < 0.5) return null;
    
    // Add to history (keep last 5 detections)
    historyRef.current.push(newGesture);
    if (historyRef.current.length > 5) {
      historyRef.current.shift();
    }
    
    // Find most common gesture in recent history
    const gestureCounts = {};
    let totalConfidence = 0;
    
    historyRef.current.forEach(g => {
      if (g && g.gesture) {
        gestureCounts[g.gesture] = (gestureCounts[g.gesture] || 0) + 1;
        totalConfidence += g.confidence;
      }
    });
    
    // Return most frequent gesture with average confidence
    const mostFrequent = Object.keys(gestureCounts).reduce((a, b) => 
      gestureCounts[a] > gestureCounts[b] ? a : b, null);
    
    if (mostFrequent && gestureCounts[mostFrequent] >= 2) {
      return {
        gesture: mostFrequent,
        confidence: totalConfidence / historyRef.current.length
      };
    }
    
    return newGesture;
  }

  function playRound() {
    if (!model || !isWebcamOn) {
      setError("Webcam must be started!");
      return;
    }

    if (gameWinner) {
      setError("Game over! Reset to play again.");
      return;
    }

    setGameActive(true);
    setRoundResult(null);
    setCountdown(3);
    setComputerMove(null); // Hide previous computer move

    // Generate computer move but don't show it yet
    const computerChoice = generateComputerMove();
    
    // Start shuffling animation for AI images
    startImageShuffle();

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          stopImageShuffle(); // Stop shuffling
          setComputerMove(computerChoice); // Reveal final computer choice
          captureGestures(computerChoice);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function captureGestures(computerChoice) {
    const humanResult = humanGesture;

    if (!humanResult || humanResult.confidence < 0.6) {
      setError("Human gesture not detected clearly! Try again.");
      setGameActive(false);
      return;
    }

    const winner = determineWinner(humanResult.gesture, computerChoice);

    setHumanMove(humanResult.gesture);
    setRoundResult(winner);

    // Update scores
    const newScores = {
      human: scores.human + (winner === "human" ? 1 : 0),
      computer: scores.computer + (winner === "computer" ? 1 : 0),
      ties: scores.ties + (winner === "tie" ? 1 : 0),
    };
    setScores(newScores);

    // Check for game winner (race to 5)
    if (newScores.human >= WIN_SCORE) {
      setGameWinner("Human");
    } else if (newScores.computer >= WIN_SCORE) {
      setGameWinner("Computer");
    }

    // Add to history
    setRoundHistory((prev) => [
      { 
        human: humanResult.gesture, 
        computer: computerChoice, 
        winner, 
        confidence: humanResult.confidence
      },
      ...prev.slice(0, 9),
    ]);

    setGameActive(false);
  }

  function resetGame() {
    setScores({ human: 0, computer: 0, ties: 0 });
    setRoundHistory([]);
    setHumanMove(null);
    setComputerMove(null);
    setRoundResult(null);
    setGameWinner(null);
    setError(null);
    stopImageShuffle(); // Stop any ongoing shuffle
  }

  // UI helpers
  const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);

  const getEmoji = (choice) => {
    if (choice === "Rock") return "✊";
    if (choice === "Paper") return "✋";
    if (choice === "Scissors") return "✌️";
    return "❓";
  };

  const getRoundResultText = () => {
    if (roundResult === "human") return "🎉 You Win This Round!";
    if (roundResult === "computer") return "🤖 Computer Wins Round!";
    return "🤝 It's a Tie!";
  };

  const getRoundResultColor = () => {
    if (roundResult === "human") return "#10b981";
    if (roundResult === "computer") return "#ef4444";
    return "#f59e0b";
  };

  return (
    <div style={{ 
      fontFamily: "Inter, system-ui", 
      height: "100%", 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 25%, #a855f7 50%, #d946ef 75%, #ec4899 100%)", 
      display: "flex", 
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Header */}
      <header style={{ padding: "20px", color: "white", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>✊✋✌️ Human vs Computer RPS</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 16 }}>Race to {WIN_SCORE} Wins! • AI Gesture Recognition vs Random AI</p>
      </header>

      {loading && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20, color: "white" }}>🔄 Loading AI model…</p>}
      {!loading && !model && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20, color: "white" }}>⚠️ Model failed to load</p>}
      {model && !isWebcamOn && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20, color: "white" }}>📷 Starting camera...</p>}
      {error && (
        <div style={{ background: "#fee", padding: 12, margin: "16px auto", maxWidth: 800, borderRadius: 8, textAlign: "center" }}>
          <p style={{ color: "crimson", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Game Winner Banner */}
      {gameWinner && (
        <div style={{ 
          background: gameWinner === "Human" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          padding: 30, 
          margin: "20px auto",
          maxWidth: 800,
          borderRadius: 12,
          textAlign: "center",
          color: "white",
          fontSize: 36,
          fontWeight: "bold",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}>
          {gameWinner === "Human" ? "🎉 YOU WIN THE GAME! 🎉" : "🤖 COMPUTER WINS THE GAME! 🤖"}
        </div>
      )}


      {/* Split Screen Layout - Human vs Computer */}
      <div style={{ 
        display: "flex", 
        gap: 40, 
        padding: "40px", 
        height: "calc(100vh - 200px)", 
        marginTop: "40px",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Human Player Box */}
        <div style={{ 
          width: 500,
          height: 500,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "4px solid #059669",
          borderRadius: 20,
          position: "relative",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)"
        }}>
          {/* Human Player Header */}
          <div style={{
            background: "#059669",
            color: "white",
            padding: "12px 20px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: "bold"
          }}>
            <span>👤 YOU</span>
            <span style={{ 
              background: "rgba(255,255,255,0.2)", 
              padding: "4px 12px", 
              borderRadius: 12,
              fontSize: 24,
              fontWeight: "bold"
            }}>
              {scores.human}
            </span>
          </div>

          {/* Human Webcam Area */}
          <div style={{
            position: "absolute",
            top: 80,
            left: 20,
            right: 20,
            bottom: 20,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div
              ref={webcamRef}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 16
              }}
            >
              {!isWebcamOn && <span>📷 Starting camera...</span>}
            </div>

            {/* Hand Detection Status */}
            {handLandmarks && (
              <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(0,255,0,0.8)",
                color: "white",
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: "bold"
              }}>
                ✋ Hand Detected
              </div>
            )}
            
            {/* Human Gesture Overlay */}
            {humanGesture && (
              <div style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: "bold"
              }}>
                {humanGesture.gesture} ({(humanGesture.confidence * 100).toFixed(0)}%)
              </div>
            )}

            {/* Human Last Move */}
            {humanMove && (
              <div style={{
                position: "absolute",
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: "12px 20px",
                borderRadius: 12,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 32 }}>{getEmoji(humanMove)}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{humanMove}</div>
              </div>
            )}
          </div>
        </div>

        {/* Computer Player Box */}
        <div style={{ 
          width: 500,
          height: 500,
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          border: "4px solid #dc2626",
          borderRadius: 20,
          position: "relative",
          boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)"
        }}>
          {/* Computer Player Header */}
          <div style={{
            background: "#dc2626",
            color: "white",
            padding: "12px 20px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: "bold"
          }}>
            <span>🤖 COMPUTER</span>
            <span style={{ 
              background: "rgba(255,255,255,0.2)", 
              padding: "4px 12px", 
              borderRadius: 12,
              fontSize: 24,
              fontWeight: "bold"
            }}>
              {scores.computer}
            </span>
          </div>

          {/* Computer Display Area */}
          <div style={{
            position: "absolute",
            top: 80,
            left: 20,
            right: 20,
            bottom: 20,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column"
          }}>
            {/* Computer Display - Idle State */}
            {!computerMove && !shufflingImage && (
              <div style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center"
              }}>
                🤖 AI Opponent
              </div>
            )}
            
            {/* Computer Shuffling Animation */}
            {shufflingImage && countdown && (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img 
                  src={getComputerImage(shufflingImage)}
                  alt={`Shuffling ${shufflingImage}`}
                  style={{
                    width: "80%",
                    height: "70%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #FFD700",
                    opacity: 0.8,
                    transition: "all 0.1s ease",
                    transform: "scale(0.95)"
                  }}
                />
                <div style={{
                  color: "#FFD700",
                  fontSize: 14,
                  fontWeight: "bold",
                  marginTop: 10,
                  textAlign: "center",
                  animation: "pulse 0.5s infinite"
                }}>
                  🎲 Choosing...
                </div>
              </div>
            )}

            {/* Computer Final Gesture Image */}
            {computerMove && !shufflingImage && (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img 
                  src={getComputerImage(computerMove)}
                  alt={`Computer ${computerMove}`}
                  style={{
                    width: "80%",
                    height: "70%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    animation: "computerReveal 0.5s ease-out"
                  }}
                />
                <div style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginTop: 10,
                  textAlign: "center"
                }}>
                  {computerMove}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Central Countdown Timer - Like in the image */}
      {countdown && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 120,
          height: 120,
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          border: "4px solid #d97706",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: "bold",
          color: "white",
          zIndex: 1000,
          boxShadow: "0 10px 30px rgba(245, 158, 11, 0.5)",
          animation: "pulse 1s infinite"
        }}>
          {countdown}
        </div>
      )}

      {/* Game Controls - Centered like in the image */}
      <div style={{ 
        position: "fixed", 
        bottom: 40, 
        left: "50%", 
        transform: "translateX(-50%)",
        display: "flex",
        gap: 16,
        zIndex: 20
      }}>
        {!isWebcamOn && model && (
          <button 
            onClick={startWebcam} 
            style={{
              fontSize: 16,
              fontWeight: "600",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease"
            }}
          >
            📷 Start Camera
          </button>
        )}
        <button 
          onClick={playRound} 
          disabled={!model || !isWebcamOn || gameActive || gameWinner}
          style={{
            fontSize: 18,
            fontWeight: "600",
            padding: "16px 32px",
            background: gameActive || gameWinner ? "rgba(156, 163, 175, 0.8)" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            borderRadius: 12,
            cursor: gameActive || !model || !isWebcamOn || gameWinner ? "not-allowed" : "pointer",
            opacity: gameActive || !model || !isWebcamOn || gameWinner ? 0.6 : 1,
            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease"
          }}
        >
          {countdown ? `${countdown}...` : gameActive ? "Capturing..." : "▶ Start Round"}
        </button>
        <button 
          onClick={resetGame} 
          style={{ 
            fontSize: 16,
            fontWeight: "500",
            padding: "12px 24px",
            background: "rgba(255, 255, 255, 0.15)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: 12,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease"
          }}
        >
          Reset Game
        </button>
      </div>

      {/* Round Result - Floating in center */}
      {roundResult && (
        <div style={{ 
          position: "fixed",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: 24,
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          borderRadius: 16,
          textAlign: "center",
          zIndex: 15,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
        }}>
          <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>{getRoundResultText()}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, fontSize: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div>{getEmoji(humanMove)}</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>You</div>
            </div>
            <div style={{ fontSize: 24, opacity: 0.6 }}>vs</div>
            <div style={{ textAlign: "center" }}>
              {computerMove && getComputerImage(computerMove) ? (
                <img 
                  src={getComputerImage(computerMove)}
                  alt={computerMove}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)"
                  }}
                />
              ) : (
                <div>{getEmoji(computerMove)}</div>
              )}
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Computer</div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes computerReveal {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const buttonStyle = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "#2563eb",
  color: "white",
  border: "none",
  cursor: "pointer",
};
