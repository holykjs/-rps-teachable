import React, { useState } from "react";

const MainMenu = ({ isVisible, onStart, onOpenStats, onOpenTraining }) => {
  const [showHowTo, setShowHowTo] = useState(false);

  if (!isVisible) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, rgba(15,15,35,0.85), rgba(15,52,96,0.85))",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        width: "min(880px, 92vw)",
        maxHeight: "90vh",
        borderRadius: 24,
        background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        padding: "28px 28px 24px",
        color: "#fff",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>✊✋✌️</span>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>Rock Paper Scissors AI</h2>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
          {/* Left: Hero */}
          <div style={{
            background: "linear-gradient(135deg, rgba(102,126,234,0.35), rgba(118,75,162,0.3))",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.18)",
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div>
              <h3 style={{ margin: "6px 0 10px", fontSize: 18, opacity: 0.95 }}>Real‑time Hand Tracking</h3>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                Use your webcam to play Rock‑Paper‑Scissors against an AI. The model recognizes your hand gesture in real time.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => setShowHowTo(true)} style={ghostBtnStyle}>How to Play</button>
              <button onClick={onOpenTraining} style={ghostBtnStyle}>Train Gestures</button>
              <button onClick={onOpenStats} style={ghostBtnStyle}>View Stats</button>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={onStart} style={bigBtnStyle}>▶ Start Game</button>
            <button onClick={() => setShowHowTo(true)} style={softBtnStyle}>📖 How to Play</button>
            <a href="https://teachablemachine.withgoogle.com/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <button style={softBtnStyle}>🤖 About the AI</button>
            </a>
          </div>
        </div>

        {/* How to Play Modal (lightweight) */}
        {showHowTo && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100001
          }}>
            <div style={{
              width: "min(720px, 92vw)",
              background: "rgba(30, 30, 60, 0.95)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 16,
              padding: 22,
              color: "#fff"
            }}>
              <h3 style={{ marginTop: 0 }}>How to Play</h3>
              <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, opacity: 0.9 }}>
                <li>Click Play to load models and start the camera.</li>
                <li>Show Rock ✊, Paper ✋, or Scissors ✌️ in front of the camera.</li>
                <li>Press Start Round to lock in and see who wins. First to 5 wins!</li>
              </ol>
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowHowTo(false)} style={primaryBtnStyle}>Got it</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const primaryBtnStyle = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  color: "#fff",
  fontWeight: 800,
  letterSpacing: 0.4,
  cursor: "pointer",
};

const bigBtnStyle = {
  ...primaryBtnStyle,
  padding: "16px 22px",
  fontSize: 16,
};

const softBtnStyle = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontWeight: 700,
  letterSpacing: 0.3,
  cursor: "pointer",
  width: "100%"
};

const ghostBtnStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "#fff",
  fontWeight: 600,
  letterSpacing: 0.3,
  cursor: "pointer",
};

export default MainMenu;
