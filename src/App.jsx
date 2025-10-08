import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

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
  
  // Single webcam state for both players
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const webcamRef = useRef(null);
  const webcam2Ref = useRef(null);
  const tmWebcamRef = useRef(null);
  const rafIdRef = useRef(null);
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [player1Gesture, setPlayer1Gesture] = useState(null);
  const [player2Gesture, setPlayer2Gesture] = useState(null);
  
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [player1Move, setPlayer1Move] = useState(null);
  const [player2Move, setPlayer2Move] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0, ties: 0 });
  const [countdown, setCountdown] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameWinner, setGameWinner] = useState(null);

  // Load model and auto-start cameras
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const modelURL = MODEL_BASE_URL + "model.json";
        const metadataURL = MODEL_BASE_URL + "metadata.json";
        const loaded = await tmImage.load(modelURL, metadataURL);
        setModel(loaded);
        
        // Auto-start webcam after model loads
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

  // Start single webcam for both players
  async function startWebcam() {
    if (!model) return;
    try {
      setIsWebcamOn(true);
      const tmWebcam = new tmImage.Webcam(640, 480, true);
      tmWebcamRef.current = tmWebcam;
      await tmWebcam.setup();
      await tmWebcam.play();

      // Create canvas elements for each player view
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      canvas1.width = 360;
      canvas1.height = 400;
      canvas2.width = 360;
      canvas2.height = 400;
      
      canvas1Ref.current = canvas1;
      canvas2Ref.current = canvas2;

      // Add canvases to player boxes
      if (webcamRef.current) {
        webcamRef.current.innerHTML = "";
        webcamRef.current.appendChild(canvas1);
        canvas1.style.width = "100%";
        canvas1.style.height = "100%";
        canvas1.style.objectFit = "cover";
      }

      if (webcam2Ref.current) {
        webcam2Ref.current.innerHTML = "";
        webcam2Ref.current.appendChild(canvas2);
        canvas2.style.width = "100%";
        canvas2.style.height = "100%";
        canvas2.style.objectFit = "cover";
      }

      const loop = async () => {
        tmWebcam.update();
        
        // Draw webcam feed to both canvases
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        // Player 1: Show left half (mirrored)
        ctx1.save();
        ctx1.scale(-1, 1);
        ctx1.drawImage(tmWebcam.canvas, 0, 0, 320, 480, -360, 0, 360, 400);
        ctx1.restore();
        
        // Player 2: Show right half (mirrored)
        ctx2.save();
        ctx2.scale(-1, 1);
        ctx2.drawImage(tmWebcam.canvas, 320, 0, 320, 480, -360, 0, 360, 400);
        ctx2.restore();
        
        // Get predictions from the full frame
        const fullPredictions = await model.predict(tmWebcam.canvas);
        setPredictions(fullPredictions);
        
        // Analyze left and right halves of the frame for each player
        await analyzePlayerGestures(tmWebcam.canvas);
        
        rafIdRef.current = requestAnimationFrame(loop);
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

  // Analyze gestures from left and right sides of the webcam
  async function analyzePlayerGestures(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Create temporary canvases for left and right halves
    const leftCanvas = document.createElement('canvas');
    const rightCanvas = document.createElement('canvas');
    leftCanvas.width = width / 2;
    leftCanvas.height = height;
    rightCanvas.width = width / 2;
    rightCanvas.height = height;
    
    const leftCtx = leftCanvas.getContext('2d');
    const rightCtx = rightCanvas.getContext('2d');
    
    // Extract left half (Player 1)
    leftCtx.drawImage(canvas, 0, 0, width / 2, height, 0, 0, width / 2, height);
    const leftPredictions = await model.predict(leftCanvas);
    const player1Result = extractGesture(leftPredictions);
    setPlayer1Gesture(player1Result);
    
    // Extract right half (Player 2)
    rightCtx.drawImage(canvas, width / 2, 0, width / 2, height, 0, 0, width / 2, height);
    const rightPredictions = await model.predict(rightCanvas);
    const player2Result = extractGesture(rightPredictions);
    setPlayer2Gesture(player2Result);
  }

  // Stop webcam
  function stopWebcam() {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (tmWebcamRef.current) {
      try {
        tmWebcamRef.current.stop();
      } catch (e) {}
      tmWebcamRef.current = null;
    }
    
    // Clean up canvas elements
    if (webcamRef.current) {
      webcamRef.current.innerHTML = "";
    }
    if (webcam2Ref.current) {
      webcam2Ref.current.innerHTML = "";
    }
    
    canvas1Ref.current = null;
    canvas2Ref.current = null;
    setIsWebcamOn(false);
    setPredictions([]);
    setPlayer1Gesture(null);
    setPlayer2Gesture(null);
  }

  // Game Logic
  function determineWinner(p1, p2) {
    if (p1 === p2) return "tie";
    if (
      (p1 === "Rock" && p2 === "Scissors") ||
      (p1 === "Paper" && p2 === "Rock") ||
      (p1 === "Scissors" && p2 === "Paper")
    ) {
      return "player1";
    }
    return "player2";
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

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          captureGestures();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function captureGestures() {
    const p1Result = player1Gesture;
    const p2Result = player2Gesture;

    if (!p1Result || p1Result.confidence < 0.6) {
      setError("Player 1 gesture not detected clearly!");
      setGameActive(false);
      return;
    }

    if (!p2Result || p2Result.confidence < 0.6) {
      setError("Player 2 gesture not detected clearly!");
      setGameActive(false);
      return;
    }

    const winner = determineWinner(p1Result.gesture, p2Result.gesture);

    setPlayer1Move(p1Result.gesture);
    setPlayer2Move(p2Result.gesture);
    setRoundResult(winner);

    // Update scores
    const newScores = {
      player1: scores.player1 + (winner === "player1" ? 1 : 0),
      player2: scores.player2 + (winner === "player2" ? 1 : 0),
      ties: scores.ties + (winner === "tie" ? 1 : 0),
    };
    setScores(newScores);

    // Check for game winner (race to 5)
    if (newScores.player1 >= WIN_SCORE) {
      setGameWinner("Player 1");
    } else if (newScores.player2 >= WIN_SCORE) {
      setGameWinner("Player 2");
    }

    // Add to history
    setRoundHistory((prev) => [
      { 
        player1: p1Result.gesture, 
        player2: p2Result.gesture, 
        winner, 
        conf1: p1Result.confidence,
        conf2: p2Result.confidence 
      },
      ...prev.slice(0, 9),
    ]);

    setGameActive(false);
  }

  function resetGame() {
    setScores({ player1: 0, player2: 0, ties: 0 });
    setRoundHistory([]);
    setPlayer1Move(null);
    setPlayer2Move(null);
    setRoundResult(null);
    setGameWinner(null);
    setError(null);
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
    if (roundResult === "player1") return "🎉 Player 1 Wins Round!";
    if (roundResult === "player2") return "🎉 Player 2 Wins Round!";
    return "🤝 It's a Tie!";
  };

  const getRoundResultColor = () => {
    if (roundResult === "player1") return "#3b82f6";
    if (roundResult === "player2") return "#ef4444";
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
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: "bold", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>✊✋✌️ 2-Player Rock Paper Scissors</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 16 }}>Race to {WIN_SCORE} Wins! • AI Gesture Recognition</p>
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
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
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
          🏆 {gameWinner} WINS THE GAME! 🏆
        </div>
      )}


      {/* Split Screen Layout - Inspired by the image */}
      <div style={{ 
        display: "flex", 
        gap: 40, 
        padding: "40px", 
        height: "calc(100vh - 200px)", 
        marginTop: "40px",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {/* Player 1 Box */}
        <div style={{ 
          width: 400,
          height: 500,
          background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
          border: "4px solid #7c3aed",
          borderRadius: 20,
          position: "relative",
          boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)"
        }}>
          {/* Player 1 Header */}
          <div style={{
            background: "#7c3aed",
            color: "white",
            padding: "12px 20px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: "bold"
          }}>
            <span>PLAYER 1</span>
            <span style={{ 
              background: "rgba(255,255,255,0.2)", 
              padding: "4px 12px", 
              borderRadius: 12,
              fontSize: 24,
              fontWeight: "bold"
            }}>
              {scores.player1}
            </span>
          </div>

          {/* Player 1 Webcam Area */}
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
              {!isWebcamOn && <span>Starting camera...</span>}
            </div>

            {/* Player 1 Gesture Overlay */}
            {player1Gesture && (
              <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: "bold"
              }}>
                {player1Gesture.gesture} ({(player1Gesture.confidence * 100).toFixed(0)}%)
              </div>
            )}

            {/* Player 1 Last Move */}
            {player1Move && (
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
                <div style={{ fontSize: 32 }}>{getEmoji(player1Move)}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{player1Move}</div>
              </div>
            )}
          </div>
        </div>

        {/* Player 2 Box */}
        <div style={{ 
          width: 400,
          height: 500,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "4px solid #059669",
          borderRadius: 20,
          position: "relative",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)"
        }}>
          {/* Player 2 Header */}
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
            <span>PLAYER 2</span>
            <span style={{ 
              background: "rgba(255,255,255,0.2)", 
              padding: "4px 12px", 
              borderRadius: 12,
              fontSize: 24,
              fontWeight: "bold"
            }}>
              {scores.player2}
            </span>
          </div>

          {/* Player 2 Webcam Area - Right half of the same webcam */}
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
              ref={webcam2Ref}
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
              {!isWebcamOn && <span>Starting camera...</span>}
            </div>

            {/* Player 2 Gesture Overlay */}
            {player2Gesture && (
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
                {player2Gesture.gesture} ({(player2Gesture.confidence * 100).toFixed(0)}%)
              </div>
            )}

            {/* Player 2 Last Move */}
            {player2Move && (
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
                <div style={{ fontSize: 32 }}>{getEmoji(player2Move)}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{player2Move}</div>
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
              <div>{getEmoji(player1Move)}</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Player 1</div>
            </div>
            <div style={{ fontSize: 24, opacity: 0.6 }}>vs</div>
            <div style={{ textAlign: "center" }}>
              <div>{getEmoji(player2Move)}</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Player 2</div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animation for countdown */}
      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
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
