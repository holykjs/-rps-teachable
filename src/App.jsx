import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "./utilities";
import "./App.css";

/**
 * Replace with YOUR Teachable Machine model URL after training
 * Get the shareable link from: https://teachablemachine.withgoogle.com/
 */
const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/GuM5MHK94/";

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
  const handDetectionRef = useRef(null);
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
        
        // Load TensorFlow HandPose model (like the provided example)
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

  // Start webcam with hand detection (using their approach)
  async function startWebcam() {
    if (!model || !handposeModel) return;
    try {
      setIsWebcamOn(true);
      console.log("Starting webcam with hand detection...");
      
      // Start hand detection loop (like their implementation)
      startHandDetection();
      
      console.log("Webcam started successfully");
      
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
  
  // Hand detection function (adapted from their approach)
  const startHandDetection = () => {
    handDetectionRef.current = setInterval(() => {
      detectHands();
    }, 100); // Run every 100ms for good performance
  };
  
  const detectHands = async () => {
    // Check if webcam and canvas are ready
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current &&
      handposeModel
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      try {
        // Detect hands using HandPose (max 1 hand like cvzone)
        const hands = await handposeModel.estimateHands(video);
        
        if (hands.length > 0) {
          setHandLandmarks(hands[0].landmarks);
          
          // Draw hand skeleton (cvzone-like)
          drawHand(hands, ctx);
          
          // Also run gesture prediction for game logic
          if (model) {
            const predictions = await model.predict(video);
            const gesture = extractGesture(predictions);
            const smoothed = smoothGesture(gesture, humanGestureHistory);
            setHumanGesture(smoothed);
          }
        } else {
          setHandLandmarks(null);
        }
      } catch (error) {
        console.error('Hand detection error:', error);
      }
    }
  };
  

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
      
      // Stop hand detection interval
      if (handDetectionRef.current) {
        clearInterval(handDetectionRef.current);
        handDetectionRef.current = null;
      }
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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
      height: "100%", 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)", 
      display: "flex", 
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Modern Header */}
      <header style={{ 
        padding: "32px 24px", 
        color: "white", 
        textAlign: "center",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "12px"
        }}>
          <div style={{
            fontSize: "48px",
            background: "linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          }}>✊✋✌️</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(24px, 4vw, 42px)", 
            fontWeight: "800", 
            background: "linear-gradient(135deg, #ffffff, #e0e7ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em"
          }}>Rock Paper Scissors AI</h1>
        </div>
        <p style={{ 
          margin: 0, 
          opacity: 0.8, 
          fontSize: "clamp(14px, 2vw, 18px)",
          fontWeight: "500",
          color: "#a5b4fc"
        }}>First to {WIN_SCORE} wins • Real-time hand tracking powered by AI</p>
      </header>

      {loading && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20, color: "white" }}>🔄 Loading AI model…</p>}
      {!loading && !model && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20, color: "white" }}>⚠️ Model failed to load</p>}
      {model && !isWebcamOn && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20, color: "white" }}>📷 Starting camera...</p>}
      {error && (
        <div style={{ background: "#fee", padding: 12, margin: "16px auto", maxWidth: 800, borderRadius: 8, textAlign: "center" }}>
          <p style={{ color: "crimson", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Modern Game Winner Banner */}
      {gameWinner && (
        <div style={{ 
          background: gameWinner === "Human" 
            ? "linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)" 
            : "linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)",
          padding: "40px 32px", 
          margin: "24px auto",
          maxWidth: "90%",
          borderRadius: "24px",
          textAlign: "center",
          color: "white",
          fontSize: "clamp(24px, 5vw, 48px)",
          fontWeight: "900",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "2px solid rgba(255,255,255,0.2)",
          animation: "winnerPulse 2s infinite"
        }}>
          <div style={{ marginBottom: "12px", fontSize: "64px" }}>
            {gameWinner === "Human" ? "🎉" : "🤖"}
          </div>
          {gameWinner === "Human" ? "VICTORY!" : "AI WINS!"}
          <div style={{ 
            fontSize: "clamp(12px, 2vw, 16px)", 
            opacity: 0.9, 
            marginTop: "8px",
            fontWeight: "600"
          }}>
            {gameWinner === "Human" ? "Congratulations, human!" : "Better luck next time!"}
          </div>
        </div>
      )}


      {/* Split Screen Layout - Human vs Computer */}
      <div className="game-container">
        {/* Modern Human Player Box */}
        <div className="player-box human-player">
          {/* Modern Human Player Header */}
          <div className="player-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>👤</div>
              <span style={{ letterSpacing: "0.5px" }}>YOU</span>
            </div>
            <div style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))", 
              padding: "12px 20px", 
              borderRadius: "20px",
              fontSize: "clamp(20px, 3vw, 32px)",
              fontWeight: "900",
              minWidth: "60px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)"
            }}>
              {scores.human}
            </div>
          </div>

          {/* Human Webcam Area */}
          <div className="webcam-area">
            {/* Webcam Component (like their implementation) */}
            <Webcam
              ref={webcamRef}
              mirrored={true}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px"
              }}
            />
            
            {/* Canvas overlay for hand skeleton (like their implementation) */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
                zIndex: 10
              }}
            />
            
            {!isWebcamOn && (
              <div style={{
                position: "absolute",
                color: "white",
                fontSize: 16,
                zIndex: 20
              }}>
                📷 Starting camera...
              </div>
            )}

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

        {/* Modern Computer Player Box */}
        <div className="player-box computer-player">
          {/* Modern Computer Player Header */}
          <div className="player-header">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #ff8a80, #ff5722)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>🤖</div>
              <span style={{ letterSpacing: "0.5px" }}>AI</span>
            </div>
            <div style={{ 
              background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))", 
              padding: "12px 20px", 
              borderRadius: "20px",
              fontSize: "clamp(20px, 3vw, 32px)",
              fontWeight: "900",
              minWidth: "60px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)"
            }}>
              {scores.computer}
            </div>
          </div>

          {/* Computer Display Area */}
          <div className="webcam-area" style={{ flexDirection: "column" }}>
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

      {/* Modern Countdown Timer */}
      {countdown && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(100px, 15vw, 140px)",
          height: "clamp(100px, 15vw, 140px)",
          background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
          border: "3px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(48px, 8vw, 80px)",
          fontWeight: "900",
          color: "white",
          zIndex: 1000,
          boxShadow: "0 20px 60px rgba(255, 154, 158, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          animation: "modernPulse 1s infinite",
          backdropFilter: "blur(20px)",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}>
          {countdown}
        </div>
      )}

      {/* Modern Game Controls */}
      <div style={{ 
        position: "fixed", 
        bottom: "clamp(20px, 5vh, 40px)", 
        left: "50%", 
        transform: "translateX(-50%)",
        display: "flex",
        gap: "clamp(12px, 2vw, 20px)",
        zIndex: 20,
        padding: "16px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)"
      }}>
        {!isWebcamOn && model && (
          <button 
            onClick={startWebcam} 
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              fontWeight: "700",
              padding: "16px 24px",
              background: "linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0, 245, 160, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 40px rgba(0, 245, 160, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 32px rgba(0, 245, 160, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
          >
            📷 Start Camera
          </button>
        )}
        <button 
          onClick={playRound} 
          disabled={!model || !isWebcamOn || gameActive || gameWinner}
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            fontWeight: "800",
            padding: "20px 40px",
            background: gameActive || gameWinner 
              ? "linear-gradient(135deg, rgba(156, 163, 175, 0.6), rgba(107, 114, 128, 0.6))" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            cursor: gameActive || !model || !isWebcamOn || gameWinner ? "not-allowed" : "pointer",
            opacity: gameActive || !model || !isWebcamOn || gameWinner ? 0.6 : 1,
            boxShadow: gameActive || gameWinner 
              ? "0 8px 32px rgba(156, 163, 175, 0.3)" 
              : "0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            backdropFilter: "blur(20px)",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            minWidth: "160px"
          }}
          onMouseEnter={(e) => {
            if (!gameActive && model && isWebcamOn && !gameWinner) {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 16px 50px rgba(102, 126, 234, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!gameActive && model && isWebcamOn && !gameWinner) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
            }
          }}
        >
          {countdown ? `${countdown}...` : gameActive ? "Capturing..." : "▶ Start Round"}
        </button>
        <button 
          onClick={resetGame} 
          style={{ 
            fontSize: "clamp(14px, 2vw, 16px)",
            fontWeight: "600",
            padding: "16px 24px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "16px",
            cursor: "pointer",
            backdropFilter: "blur(20px)",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            boxShadow: "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 40px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 32px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)";
          }}
        >
          Reset Game
        </button>
      </div>

      {/* Modern Round Result */}
      {roundResult && (
        <div style={{ 
          position: "fixed",
          top: "60%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "32px 40px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))",
          backdropFilter: "blur(30px)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          color: "white",
          borderRadius: "24px",
          textAlign: "center",
          zIndex: 15,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
          animation: "resultSlideIn 0.5s ease-out",
          minWidth: "clamp(280px, 40vw, 400px)"
        }}>
          <div style={{ 
            fontSize: "clamp(18px, 3vw, 24px)", 
            fontWeight: "800", 
            marginBottom: "20px",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>{getRoundResultText()}</div>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            gap: "clamp(20px, 4vw, 32px)", 
            fontSize: "clamp(32px, 6vw, 48px)"
          }}>
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
