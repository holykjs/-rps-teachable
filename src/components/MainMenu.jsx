import React, { useState, useRef, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import * as handpose from "@tensorflow-models/handpose";
import { drawHand } from "../utilities";

const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/GuM5MHK94/";

const MainMenu = ({ isVisible, onStart, onOpenStats }) => {
  const [showHowTo, setShowHowTo] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [testActive, setTestActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureCount, setGestureCount] = useState({ Rock: 0, Paper: 0, Scissors: 0 });
  const [localPredictions, setLocalPredictions] = useState([]);
  const [localGesture, setLocalGesture] = useState(null);
  const [handposeModel, setHandposeModel] = useState(null);
  const [tmModel, setTmModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  useEffect(() => {
    // Load models when Train Gestures tab is activated
    if (testActive && !tmModel && !modelLoading) {
      const loadModels = async () => {
        try {
          setModelLoading(true);
          console.log("Loading AI models for training...");
          
          // Load Teachable Machine model
          const modelURL = MODEL_BASE_URL + "model.json";
          const metadataURL = MODEL_BASE_URL + "metadata.json";
          const loaded = await tmImage.load(modelURL, metadataURL);
          setTmModel(loaded);
          console.log("Teachable Machine model loaded");
          
          // Load handpose model for hand tracking visualization
          const handModel = await handpose.load();
          setHandposeModel(handModel);
          console.log("Handpose model loaded");
          
          setModelLoading(false);
        } catch (err) {
          console.error("Failed to load models:", err);
          setError("Failed to load AI models. Please check your internet connection.");
          setModelLoading(false);
        }
      };
      
      loadModels();
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [testActive, tmModel, modelLoading]);

  useEffect(() => {
    if (testActive && tmModel && !modelLoading) {
      // Small delay to ensure DOM is ready and models are loaded
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => clearTimeout(timer);
    } else if (!testActive) {
      stopCamera();
    }
  }, [testActive, tmModel, modelLoading]);

  const detectHandsAndGestures = async () => {
    if (!webcamRef.current || !canvasRef.current) {
      console.log("Detection skipped - missing refs:", {
        webcam: !!webcamRef.current,
        canvas: !!canvasRef.current
      });
      return;
    }

    const video = webcamRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready
    if (video.readyState !== 4) {
      return; // Silently skip if video not ready
    }
    
    // Check if video has valid dimensions
    if (!video.videoWidth || !video.videoHeight) {
      return; // Silently skip if no dimensions yet
    }
    
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Detect hands using HandPose for visualization (if loaded)
      if (handposeModel) {
        const hands = await handposeModel.estimateHands(video);
        if (hands.length > 0) {
          drawHand(hands, ctx);
          // Log occasionally to confirm hand detection is working
          if (Math.random() < 0.02) {
            console.log("👋 Hand detected and drawn");
          }
        }
      }

      // Get gesture predictions from Teachable Machine model (if loaded)
      if (tmModel) {
        const preds = await tmModel.predict(video);
        setLocalPredictions(preds);

        // Extract the gesture with highest confidence
        if (preds && preds.length > 0) {
          const maxPred = preds.reduce((max, pred) =>
            pred.probability > max.probability ? pred : max
          );

          // Log every 20 detections (reduce console spam)
          if (Math.random() < 0.05) {
            console.log("✅ Detection working:", maxPred.className, (maxPred.probability * 100).toFixed(1) + "%");
          }

          if (maxPred.probability > 0.5) {
            setLocalGesture(maxPred.className);
          } else {
            setLocalGesture(null);
          }
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  };
  
  const startCamera = async () => {
    try {
      setError(null);
      console.log("Requesting camera access...");
      
      if (!webcamRef.current) {
        console.error("Video element not found");
        setError("Video element not ready. Please try again.");
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        } 
      });
      
      console.log("Camera stream obtained:", stream);
      webcamRef.current.srcObject = stream;
      await webcamRef.current.play();
      setCameraActive(true);
      console.log("Camera started successfully");
      
      // Start hand detection loop
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      
      // Wait a bit for video to be fully ready
      setTimeout(() => {
        detectionIntervalRef.current = setInterval(detectHandsAndGestures, 100);
        console.log("Detection loop started");
      }, 500);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === 'NotAllowedError') {
        setError("Camera access denied. Please allow camera permissions in your browser.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found. Please connect a camera.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const tracks = webcamRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setCameraActive(false);
    setCurrentGesture(null);
    setLocalGesture(null);
    setLocalPredictions([]);
  };

  const handleTestToggle = () => {
    setTestActive(!testActive);
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
            📹 Train Gestures
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
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, opacity: 0.95 }}>AI Gesture Training</h3>
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
                    {modelLoading ? 'Loading AI models...' : tmModel ? 'Real-time AI gesture recognition with confidence scores' : 'AI model ready'}
                  </p>
                </div>

                {/* Camera Feed */}
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 320, 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
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
                      opacity: cameraActive ? 1 : 0
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    width="640"
                    height="480"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      transform: 'scaleX(-1)',
                      opacity: cameraActive ? 1 : 0,
                      pointerEvents: 'none'
                    }}
                  />
                  {!cameraActive && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      gap: 8,
                      position: 'absolute',
                      inset: 0
                    }}>
                      <div style={{ fontSize: 32, opacity: 0.5 }}>📹</div>
                      <div style={{ fontSize: 13, opacity: 0.6 }}>Camera Off</div>
                    </div>
                  )}
                  {localGesture && cameraActive && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'rgba(102,126,234,0.95)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16,
                      animation: 'popIn 0.3s ease-out',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      {localGesture === 'Rock' ? '✊' : localGesture === 'Paper' ? '✋' : '✌️'} {localGesture}
                    </div>
                  )}
                  {!tmModel && cameraActive && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'rgba(239,68,68,0.9)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 12,
                    }}>
                      ⚠️ {modelLoading ? 'Loading model...' : 'AI Model not loaded'}
                    </div>
                  )}
                </div>

                {/* AI Recognition Display */}
                {cameraActive && tmModel && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4, fontWeight: 600 }}>
                      🤖 AI Recognition:
                    </div>
                    {localPredictions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {localPredictions.map((pred, idx) => {
                          const percentage = (pred.probability * 100).toFixed(1);
                          const isHighest = pred.className === localGesture;
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ 
                                fontSize: 16, 
                                minWidth: 24,
                                opacity: isHighest ? 1 : 0.5
                              }}>
                                {pred.className === 'Rock' ? '✊' : pred.className === 'Paper' ? '✋' : '✌️'}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  fontSize: 11, 
                                  marginBottom: 2,
                                  opacity: 0.8
                                }}>
                                  <span style={{ fontWeight: isHighest ? 700 : 600 }}>{pred.className}</span>
                                  <span>{percentage}%</span>
                                </div>
                                <div style={{
                                  height: 6,
                                  background: 'rgba(255,255,255,0.1)',
                                  borderRadius: 3,
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    background: isHighest 
                                      ? 'linear-gradient(90deg, #667eea, #764ba2)'
                                      : 'rgba(255,255,255,0.3)',
                                    transition: 'width 0.3s ease',
                                    borderRadius: 3
                                  }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ 
                        padding: '12px', 
                        textAlign: 'center', 
                        fontSize: 12, 
                        opacity: 0.6,
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 8
                      }}>
                        Show your hand to the camera
                      </div>
                    )}
                  </div>
                )}

                {!cameraActive && modelLoading && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 8,
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.4)',
                    fontSize: 13,
                    textAlign: 'center',
                    opacity: 0.9
                  }}>
                    🔄 Loading AI models...
                  </div>
                )}
                
                {!cameraActive && !modelLoading && tmModel && (
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
