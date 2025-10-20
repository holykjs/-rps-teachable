import React, { useState } from "react";

const LandingPage = ({ onStartGame }) => {
  const [nickname, setNickname] = useState("");
  const [hoveredBtn, setHoveredBtn] = useState(false);

  const handleStartGame = () => {
    if (nickname.trim()) {
      onStartGame(nickname.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && nickname.trim()) {
      handleStartGame();
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(135deg, #1a2e1a, #243324, #2d4a2a, #1f3a1f, #152815)",
      backgroundSize: "400% 400%",
      animation: "gradientShift 15s ease infinite",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      zIndex: 100002
    }}>
      {/* Hamburger Menu Button */}
      <button
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid rgba(139, 195, 74, 0.3)",
          background: "rgba(0,0,0,0.3)",
          color: "#fff",
          fontSize: 24,
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          transition: "all 0.2s ease"
        }}
      >
        ☰
      </button>

      {/* Main Content */}
      <div style={{
        textAlign: "center",
        zIndex: 1,
        maxWidth: "90%"
      }}>
        {/* Gesture Icons */}
        <div style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          marginBottom: 40,
          animation: "bounce 2s ease-in-out infinite"
        }}>
          <div style={{
            fontSize: 100,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
            transform: "rotate(-15deg)"
          }}>✊</div>
          <div style={{
            fontSize: 100,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
            transform: "rotate(15deg)"
          }}>✋</div>
          <div style={{
            fontSize: 100,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.4))",
            transform: "rotate(-15deg)"
          }}>✌️</div>
        </div>

        {/* Title */}
        <h1 style={{
          margin: "0 0 16px",
          fontSize: "clamp(28px, 6vw, 48px)",
          fontWeight: 900,
          color: "#fff",
          textShadow: "0 4px 12px rgba(0,0,0,0.5)",
          letterSpacing: "0.5px"
        }}>
          The Ultimate RPS Challenge: Emoji Gestures
        </h1>

        {/* Subtitle */}
        <p style={{
          margin: "0 0 48px",
          fontSize: "clamp(14px, 2.5vw, 18px)",
          color: "rgba(255,255,255,0.85)",
          fontWeight: 500
        }}>
          Enter your nickname to start the game.
        </p>

        {/* Input and Button Container */}
        <div style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          alignItems: "center",
          maxWidth: 500,
          margin: "0 auto"
        }}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter Nickname"
            maxLength={20}
            style={{
              flex: 1,
              padding: "16px 24px",
              borderRadius: 12,
              border: "1px solid rgba(139, 195, 74, 0.3)",
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 500,
              outline: "none",
              transition: "all 0.2s ease"
            }}
          />
          <button
            onClick={handleStartGame}
            onMouseEnter={() => setHoveredBtn(true)}
            onMouseLeave={() => setHoveredBtn(false)}
            disabled={!nickname.trim()}
            style={{
              padding: "16px 32px",
              borderRadius: 12,
              border: "none",
              background: nickname.trim()
                ? hoveredBtn
                  ? "linear-gradient(135deg, #9ccc65, #7cb342)"
                  : "linear-gradient(135deg, #8bc34a, #689f38)"
                : "rgba(139, 195, 74, 0.3)",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: nickname.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              transform: hoveredBtn && nickname.trim() ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hoveredBtn && nickname.trim()
                ? "0 6px 20px rgba(139, 195, 74, 0.4)"
                : "0 4px 12px rgba(0,0,0,0.3)",
              opacity: nickname.trim() ? 1 : 0.5
            }}
          >
            Start Game
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute",
        bottom: 24,
        textAlign: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: 14
      }}>
        © 2023 RPS Challenge. All rights reserved.
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
