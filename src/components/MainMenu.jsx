import React, { useState, useRef, useEffect } from "react";

const MainMenu = ({ isVisible, onStart, onOpenStats, onOpenTraining }) => {
  const [showHowTo, setShowHowTo] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [testActive, setTestActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureCount, setGestureCount] = useState({ Rock: 0, Paper: 0, Scissors: 0 });
  
  const webcamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        } 
      });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        await webcamRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Please enable camera permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const tracks = webcamRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCurrentGesture(null);
  };

  const handleTestToggle = async () => {
    if (testActive) {
      stopCamera();
      setTestActive(false);
    } else {
      setTestActive(true);
      // Automatically start camera when switching to test mode
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  const practiceGesture = (gesture) => {
    setCurrentGesture(gesture);
    setGestureCount(prev => ({ ...prev, [gesture]: prev[gesture] + 1 }));
  };

  const resetPractice = () => {
    setGestureCount({ Rock: 0, Paper: 0, Scissors: 0 });
    setCurrentGesture(null);
  };

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
      animation: "fadeIn 0.3s ease-out"
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
        animation: "slideUp 0.4s ease-out"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28, animation: "bounce 2s ease-in-out infinite" }}>✊✋✌️</span>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>Rock Paper Scissors AI</h2>
        </div>

        {/* Test Toggle */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleTestToggle()}
            onMouseEnter={() => setHoveredBtn('info-tab')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.3)',
              background: !testActive ? 'rgba(102,126,234,0.4)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hoveredBtn === 'info-tab' ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            ℹ️ Info
          </button>
          <button
            onClick={() => handleTestToggle()}
            onMouseEnter={() => setHoveredBtn('test-tab')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.3)',
              background: testActive ? 'rgba(102,126,234,0.4)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: hoveredBtn === 'test-tab' ? 'translateY(-2px)' : 'translateY(0)'
            }}
          >
            📹 Camera Test
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
          {/* Left: Hero or Game */}
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
            {!testActive ? (
              <>
            <div>
              <h3 style={{ margin: "6px 0 10px", fontSize: 18, opacity: 0.95 }}>Real‑time Hand Tracking</h3>
              <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.5 }}>
                Use your webcam to play Rock‑Paper‑Scissors against an AI. The model recognizes your hand gesture in real time.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button 
                onClick={() => setShowHowTo(true)} 
                onMouseEnter={() => setHoveredBtn('howto1')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...ghostBtnStyle,
                  transform: hoveredBtn === 'howto1' ? 'translateY(-2px)' : 'translateY(0)',
                  background: hoveredBtn === 'howto1' ? 'rgba(255,255,255,0.15)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                How to Play
              </button>
              <button 
                onClick={onOpenTraining} 
                onMouseEnter={() => setHoveredBtn('train')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...ghostBtnStyle,
                  transform: hoveredBtn === 'train' ? 'translateY(-2px)' : 'translateY(0)',
                  background: hoveredBtn === 'train' ? 'rgba(255,255,255,0.15)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                Train Gestures
              </button>
              <button 
                onClick={onOpenStats} 
                onMouseEnter={() => setHoveredBtn('stats')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...ghostBtnStyle,
                  transform: hoveredBtn === 'stats' ? 'translateY(-2px)' : 'translateY(0)',
                  background: hoveredBtn === 'stats' ? 'rgba(255,255,255,0.15)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                View Stats
              </button>
            </div>
            </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
                {/* Camera Test Header */}
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, opacity: 0.95 }}>Gesture Practice</h3>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
                    Practice your hand gestures with the camera
                  </p>
                </div>

                {/* Camera Feed */}
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 200, 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {cameraActive ? (
                    <>
                      <video 
                        ref={webcamRef}
                        autoPlay
                        playsInline
                        muted
                        width="640"
                        height="480"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transform: 'scaleX(-1)',
                          display: 'block'
                        }}
                      />
                      {currentGesture && (
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(102,126,234,0.9)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 14,
                          animation: 'popIn 0.3s ease-out'
                        }}>
                          {currentGesture === 'Rock' ? '✊' : currentGesture === 'Paper' ? '✋' : '✌️'} {currentGesture}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      <div style={{ fontSize: 32, opacity: 0.5 }}>📹</div>
                      <div style={{ fontSize: 13, opacity: 0.6 }}>Camera Off</div>
                    </div>
                  )}
                </div>

                {/* Gesture Detection Info */}
                {cameraActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                      Click to mark your current gesture:
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => practiceGesture('Rock')}
                        onMouseEnter={() => setHoveredBtn('rock')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: currentGesture === 'Rock' ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 20,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: hoveredBtn === 'rock' ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: currentGesture === 'Rock' ? '0 0 12px rgba(102,126,234,0.6)' : 'none'
                        }}
                      >
                        ✊
                      </button>
                      <button
                        onClick={() => practiceGesture('Paper')}
                        onMouseEnter={() => setHoveredBtn('paper')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: currentGesture === 'Paper' ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 20,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: hoveredBtn === 'paper' ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: currentGesture === 'Paper' ? '0 0 12px rgba(102,126,234,0.6)' : 'none'
                        }}
                      >
                        ✋
                      </button>
                      <button
                        onClick={() => practiceGesture('Scissors')}
                        onMouseEnter={() => setHoveredBtn('scissors')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          flex: 1,
                          padding: '12px 8px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: currentGesture === 'Scissors' ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 20,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: hoveredBtn === 'scissors' ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: currentGesture === 'Scissors' ? '0 0 12px rgba(102,126,234,0.6)' : 'none'
                        }}
                      >
                        ✌️
                      </button>
                    </div>
                    
                    {/* Practice Counter */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-around', 
                      padding: '10px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.08)',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      <div style={{ opacity: gestureCount.Rock > 0 ? 1 : 0.5 }}>✊ {gestureCount.Rock}</div>
                      <div style={{ opacity: gestureCount.Paper > 0 ? 1 : 0.5 }}>✋ {gestureCount.Paper}</div>
                      <div style={{ opacity: gestureCount.Scissors > 0 ? 1 : 0.5 }}>✌️ {gestureCount.Scissors}</div>
                    </div>
                  </div>
                )}
                
                {!cameraActive && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 8,
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.4)',
                    fontSize: 13,
                    textAlign: 'center',
                    opacity: 0.9
                  }}>
                    📹 Starting camera...
                  </div>
                )}

                {/* Control Buttons */}
                {cameraActive && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button
                      onClick={resetPractice}
                      onMouseEnter={() => setHoveredBtn('reset-practice')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: hoveredBtn === 'reset-practice' ? 'translateY(-2px)' : 'translateY(0)'
                      }}
                    >
                      🔄 Reset Counter
                    </button>
                  </div>
                )}

                {error && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: '#fff',
                    fontSize: 12,
                    opacity: 0.9
                  }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button 
              onClick={onStart} 
              onMouseEnter={() => setHoveredBtn('start')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...bigBtnStyle,
                transform: hoveredBtn === 'start' ? 'scale(1.05)' : 'scale(1)',
                boxShadow: hoveredBtn === 'start' ? '0 8px 24px rgba(102,126,234,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              ▶ Start Game
            </button>
            <button 
              onClick={() => setShowHowTo(true)} 
              onMouseEnter={() => setHoveredBtn('howto2')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...softBtnStyle,
                transform: hoveredBtn === 'howto2' ? 'translateY(-2px)' : 'translateY(0)',
                background: hoveredBtn === 'howto2' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              📖 How to Play
            </button>
            <a href="https://teachablemachine.withgoogle.com/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <button 
                onMouseEnter={() => setHoveredBtn('about')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...softBtnStyle,
                  transform: hoveredBtn === 'about' ? 'translateY(-2px)' : 'translateY(0)',
                  background: hoveredBtn === 'about' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                🤖 About the AI
              </button>
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
                <button 
                  onClick={() => setShowHowTo(false)} 
                  onMouseEnter={() => setHoveredBtn('gotit')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...primaryBtnStyle,
                    transform: hoveredBtn === 'gotit' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
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
