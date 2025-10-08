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
  
  // Player 1 webcam state
  const [isWebcam1On, setIsWebcam1On] = useState(false);
  const webcam1Ref = useRef(null);
  const tmWebcam1Ref = useRef(null);
  const raf1IdRef = useRef(null);
  const [preds1, setPreds1] = useState([]);
  
  // Player 2 webcam state
  const [isWebcam2On, setIsWebcam2On] = useState(false);
  const webcam2Ref = useRef(null);
  const tmWebcam2Ref = useRef(null);
  const raf2IdRef = useRef(null);
  const [preds2, setPreds2] = useState([]);
  
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
        
        // Auto-start both cameras after model loads
        setTimeout(() => {
          startWebcam1();
          startWebcam2();
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
      stopWebcam1();
      stopWebcam2();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start Player 1 webcam
  async function startWebcam1() {
    if (!model) return;
    try {
      setIsWebcam1On(true);
      const tmWebcam = new tmImage.Webcam(400, 300, true);
      tmWebcam1Ref.current = tmWebcam;
      await tmWebcam.setup();
      await tmWebcam.play();

      if (webcam1Ref.current) {
        webcam1Ref.current.innerHTML = "";
        webcam1Ref.current.appendChild(tmWebcam.webcam);
      }

      const loop = async () => {
        tmWebcam.update();
        const predictions = await model.predict(tmWebcam.canvas);
        setPreds1(predictions);
        raf1IdRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      console.error("Player 1 webcam error:", e);
      setError("Player 1 webcam not available.");
      setIsWebcam1On(false);
    }
  }

  // Stop Player 1 webcam
  function stopWebcam1() {
    if (raf1IdRef.current) {
      cancelAnimationFrame(raf1IdRef.current);
      raf1IdRef.current = null;
    }
    if (tmWebcam1Ref.current) {
      try {
        tmWebcam1Ref.current.stop();
      } catch (e) {}
      if (webcam1Ref.current && tmWebcam1Ref.current.webcam) {
        try {
          webcam1Ref.current.removeChild(tmWebcam1Ref.current.webcam);
        } catch (e) {}
      }
      tmWebcam1Ref.current = null;
    }
    setIsWebcam1On(false);
    setPreds1([]);
  }

  // Start Player 2 webcam
  async function startWebcam2() {
    if (!model) return;
    try {
      setIsWebcam2On(true);
      const tmWebcam = new tmImage.Webcam(400, 300, true);
      tmWebcam2Ref.current = tmWebcam;
      await tmWebcam.setup();
      await tmWebcam.play();

      if (webcam2Ref.current) {
        webcam2Ref.current.innerHTML = "";
        webcam2Ref.current.appendChild(tmWebcam.webcam);
      }

      const loop = async () => {
        tmWebcam.update();
        const predictions = await model.predict(tmWebcam.canvas);
        setPreds2(predictions);
        raf2IdRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      console.error("Player 2 webcam error:", e);
      setError("Player 2 webcam not available.");
      setIsWebcam2On(false);
    }
  }

  // Stop Player 2 webcam
  function stopWebcam2() {
    if (raf2IdRef.current) {
      cancelAnimationFrame(raf2IdRef.current);
      raf2IdRef.current = null;
    }
    if (tmWebcam2Ref.current) {
      try {
        tmWebcam2Ref.current.stop();
      } catch (e) {}
      if (webcam2Ref.current && tmWebcam2Ref.current.webcam) {
        try {
          webcam2Ref.current.removeChild(tmWebcam2Ref.current.webcam);
        } catch (e) {}
      }
      tmWebcam2Ref.current = null;
    }
    setIsWebcam2On(false);
    setPreds2([]);
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
    if (!model || !isWebcam1On || !isWebcam2On) {
      setError("Both webcams must be started!");
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
    const p1Result = extractGesture(preds1);
    const p2Result = extractGesture(preds2);

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
  const sorted1 = [...preds1].sort((a, b) => b.probability - a.probability);
  const sorted2 = [...preds2].sort((a, b) => b.probability - a.probability);

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
    <div style={{ fontFamily: "Inter, system-ui", height: "100%", minHeight: "100vh", background: "#f3f4f6", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px", color: "white", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>✊✋✌️ 2-Player Rock Paper Scissors</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9 }}>Race to {WIN_SCORE} Wins! • AI Gesture Recognition</p>
      </header>

      {loading && <p style={{ textAlign: "center", fontSize: 18, marginTop: 20 }}>🔄 Loading AI model…</p>}
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

      {/* Score Board */}
      <div style={{ display: "flex", justifyContent: "center", gap: 40, padding: "20px", marginBottom: 20 }}>
        <div style={{ textAlign: "center", background: "#3b82f6", color: "white", padding: "20px 40px", borderRadius: 12, minWidth: 150 }}>
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 8 }}>PLAYER 1</div>
          <div style={{ fontSize: 64, fontWeight: "bold" }}>{scores.player1}</div>
        </div>
        <div style={{ textAlign: "center", background: "#6b7280", color: "white", padding: "20px 40px", borderRadius: 12, minWidth: 100 }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>TIES</div>
          <div style={{ fontSize: 48, fontWeight: "bold" }}>{scores.ties}</div>
        </div>
        <div style={{ textAlign: "center", background: "#ef4444", color: "white", padding: "20px 40px", borderRadius: 12, minWidth: 150 }}>
          <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 8 }}>PLAYER 2</div>
          <div style={{ fontSize: 64, fontWeight: "bold" }}>{scores.player2}</div>
        </div>
      </div>

      {/* Countdown Display */}
      {countdown && (
        <div style={{ 
          position: "fixed", 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)",
          fontSize: 120,
          fontWeight: "bold",
          color: "#667eea",
          zIndex: 1000,
          textShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>
          {countdown}
        </div>
      )}

      {/* Split Screen Layout */}
      <div style={{ display: "flex", gap: 0, maxWidth: 1600, margin: "0 auto", flex: 1, overflow: "hidden" }}>
        {/* Player 1 Side */}
        <div style={{ flex: 1, padding: 20, background: "#e0f2fe", borderRight: "4px solid #3b82f6" }}>
          <h2 style={{ textAlign: "center", color: "#3b82f6", marginTop: 0 }}>🎮 Player 1</h2>
          
          <div
            ref={webcam1Ref}
            style={{
              width: "100%",
              maxWidth: 400,
              height: 300,
              margin: "0 auto",
              border: "3px solid #3b82f6",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1e3a8a",
              color: "white",
              overflow: "hidden"
            }}
          >
            {!isWebcam1On && <span>Starting camera...</span>}
          </div>

          {/* Player 1 Predictions */}
          <div style={{ marginTop: 20, background: "white", padding: 16, borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>Live Predictions</h4>
            {sorted1.map((p) => (
              <div key={p.className} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <strong>{p.className}</strong>
                  <span>{(p.probability * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: "#ddd", borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${(p.probability * 100).toFixed(1)}%`, background: "#3b82f6", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Player 1 Last Move */}
          {player1Move && (
            <div style={{ marginTop: 16, textAlign: "center", background: "white", padding: 20, borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#666" }}>Last Move</div>
              <div style={{ fontSize: 64 }}>{getEmoji(player1Move)}</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#3b82f6" }}>{player1Move}</div>
            </div>
          )}
        </div>

        {/* Player 2 Side */}
        <div style={{ flex: 1, padding: 20, background: "#fee2e2" }}>
          <h2 style={{ textAlign: "center", color: "#ef4444", marginTop: 0 }}>🎮 Player 2</h2>
          
          <div
            ref={webcam2Ref}
            style={{
              width: "100%",
              maxWidth: 400,
              height: 300,
              margin: "0 auto",
              border: "3px solid #ef4444",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#7f1d1d",
              color: "white",
              overflow: "hidden"
            }}
          >
            {!isWebcam2On && <span>Starting camera...</span>}
          </div>

          {/* Player 2 Predictions */}
          <div style={{ marginTop: 20, background: "white", padding: 16, borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>Live Predictions</h4>
            {sorted2.map((p) => (
              <div key={p.className} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <strong>{p.className}</strong>
                  <span>{(p.probability * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: "#ddd", borderRadius: 4 }}>
                  <div style={{ height: "100%", width: `${(p.probability * 100).toFixed(1)}%`, background: "#ef4444", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Player 2 Last Move */}
          {player2Move && (
            <div style={{ marginTop: 16, textAlign: "center", background: "white", padding: 20, borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#666" }}>Last Move</div>
              <div style={{ fontSize: 64 }}>{getEmoji(player2Move)}</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#ef4444" }}>{player2Move}</div>
            </div>
          )}
        </div>
      </div>

      {/* Game Controls */}
      <div style={{ textAlign: "center", padding: 20, marginTop: 20 }}>
        <button 
          onClick={playRound} 
          disabled={!model || !isWebcam1On || !isWebcam2On || gameActive || gameWinner}
          style={{
            ...buttonStyle,
            fontSize: 24,
            padding: "16px 48px",
            background: gameActive || gameWinner ? "#9ca3af" : "#10b981",
            cursor: gameActive || !model || !isWebcam1On || !isWebcam2On || gameWinner ? "not-allowed" : "pointer",
            opacity: gameActive || !model || !isWebcam1On || !isWebcam2On || gameWinner ? 0.6 : 1,
            marginRight: 16
          }}
        >
          {countdown ? `${countdown}...` : gameActive ? "Capturing..." : "🎮 PLAY ROUND"}
        </button>
        <button onClick={resetGame} style={{ ...buttonStyle, fontSize: 18, padding: "12px 32px", background: "#6b7280" }}>
          Reset Game
        </button>
      </div>

      {/* Round Result */}
      {roundResult && (
        <div style={{ 
          margin: "20px auto",
          padding: 20,
          maxWidth: 600,
          background: getRoundResultColor(),
          color: "white",
          borderRadius: 12,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>{getRoundResultText()}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40, fontSize: 48 }}>
            <div>
              <div style={{ fontSize: 14 }}>P1: {getEmoji(player1Move)}</div>
            </div>
            <div style={{ fontSize: 32, alignSelf: "center" }}>vs</div>
            <div>
              <div style={{ fontSize: 14 }}>P2: {getEmoji(player2Move)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Match History */}
      {roundHistory.length > 0 && (
        <div style={{ maxWidth: 800, margin: "20px auto", padding: 20, background: "white", borderRadius: 12 }}>
          <h3 style={{ textAlign: "center", marginTop: 0 }}>📊 Match History</h3>
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {roundHistory.map((round, i) => (
              <div key={i} style={{ 
                padding: 12, 
                background: i % 2 === 0 ? "#f9fafb" : "white",
                borderRadius: 6,
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: 24 }}>
                  {getEmoji(round.player1)} vs {getEmoji(round.player2)}
                </span>
                <span style={{ 
                  fontWeight: "bold",
                  fontSize: 16,
                  color: round.winner === "player1" ? "#3b82f6" : round.winner === "player2" ? "#ef4444" : "#f59e0b"
                }}>
                  {round.winner === "player1" ? "P1 WINS" : round.winner === "player2" ? "P2 WINS" : "TIE"}
                </span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {(round.conf1 * 100).toFixed(0)}% | {(round.conf2 * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", padding: 20, color: "#666", fontSize: 12 }}>
        💡 Tip: Both players make clear gestures during countdown. Requires 60%+ confidence.
      </div>
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
