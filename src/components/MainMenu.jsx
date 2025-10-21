import React, { useState, useRef, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import { drawHand } from "../utilities";

const MODEL_BASE_URL = "https://teachablemachine.withgoogle.com/models/GuM5MHK94/";

const MainMenu = ({ isVisible, onStart, onStartMultiplayer, onOpenStats }) => {
  const [showHowTo, setShowHowTo] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [testActive, setTestActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [localPredictions, setLocalPredictions] = useState([]);
  const [localGesture, setLocalGesture] = useState(null);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureCount, setGestureCount] = useState({ Rock: 0, Paper: 0, Scissors: 0 });
  const [handposeModel, setHandposeModel] = useState(null);
  const [tmModel, setTmModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const roiCanvasRef = useRef(null);
  const predsHistoryRef = useRef([]);
  const stableTopHistoryRef = useRef([]);

  const handleTestToggle = () => {
    setTestActive(!testActive);
  };

  // Load models when Train Gestures tab is activated
  useEffect(() => {
    if (testActive && !tmModel && !modelLoading) {
      const loadModels = async () => {
        try {
          setModelLoading(true);
          setError(null);
          
          const modelURL = MODEL_BASE_URL + "model.json";
          const metadataURL = MODEL_BASE_URL + "metadata.json";
          const loaded = await tmImage.load(modelURL, metadataURL);
          setTmModel(loaded);
          
          // Load hand detector (MediaPipe runtime) for hand tracking visualization
          const detectorConfig = {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
            modelType: 'full',
            maxHands: 1,
          };
          const detector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            detectorConfig
          );
          setHandposeModel(detector);
          console.log("MediaPipe Hands detector loaded");
          
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

  // Start camera when models are ready
  useEffect(() => {
    if (testActive && tmModel && !modelLoading && !cameraActive) {
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => clearTimeout(timer);
    } else if (!testActive && cameraActive) {
      stopCamera();
    }
  }, [testActive, tmModel, modelLoading]);

  const detectHandsAndGestures = async () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState !== 4 || !video.videoWidth || !video.videoHeight) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Detect hands using MediaPipe detector for visualization (if loaded)
      let hands = [];
      if (handposeModel) {
        const results = await handposeModel.estimateHands(video, { flipHorizontal: false });
        // Convert to the { landmarks: [[x,y,z], ...] } shape expected by drawHand and ROI code
        hands = (results || []).map(h => ({
          landmarks: (h.keypoints || []).map(kp => [kp.x, kp.y, kp.z ?? 0])
        }));
        if (hands.length > 0) {
          drawHand(hands, ctx);
        }
      }

      if (tmModel) {
        let inputForModel = video;
        if (hands.length > 0 && hands[0].landmarks && hands[0].landmarks.length) {
          const { x, y, w, h } = getHandBBox(hands[0].landmarks, canvas.width, canvas.height);
          const off = getOrCreateROICanvas();
          const octx = off.getContext('2d');
          octx.clearRect(0, 0, off.width, off.height);
          octx.drawImage(video, x, y, w, h, 0, 0, off.width, off.height);
          inputForModel = off;
        }

        const rawPreds = await tmModel.predict(inputForModel);
        const smoothed = smoothPredictions(rawPreds);
        setLocalPredictions(smoothed);

        if (smoothed && smoothed.length > 0) {
          const top = smoothed.reduce((m, p) => p.probability > m.probability ? p : m);
          const stableGesture = updateStability(top.className, top.probability);
          if (stableGesture) {
            setLocalGesture(stableGesture);
          } else if (top.probability < 0.45) {
            setLocalGesture(null);
          }
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  };

  const getOrCreateROICanvas = () => {
    if (!roiCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 224;
      c.height = 224;
      roiCanvasRef.current = c;
    }
    return roiCanvasRef.current;
  };

  const getHandBBox = (landmarks, maxW, maxH) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [lx, ly] of landmarks.map(l => [l[0], l[1]])) {
      if (lx < minX) minX = lx; if (ly < minY) minY = ly;
      if (lx > maxX) maxX = lx; if (ly > maxY) maxY = ly;
    }
    const margin = 0.25;
    let w = maxX - minX;
    let h = maxY - minY;
    let cx = minX + w / 2;
    let cy = minY + h / 2;
    const side = Math.max(w, h) * (1 + margin);
    let x = Math.max(0, Math.floor(cx - side / 2));
    let y = Math.max(0, Math.floor(cy - side / 2));
    let s = Math.ceil(side);
    if (x + s > maxW) s = maxW - x;
    if (y + s > maxH) s = maxH - y;
    return { x, y, w: s, h: s };
  };

  const smoothPredictions = (rawPreds) => {
    const map = {};
    rawPreds.forEach(p => { map[p.className] = p.probability; });
    const N = 7;
    predsHistoryRef.current.push(map);
    if (predsHistoryRef.current.length > N) predsHistoryRef.current.shift();
    const avg = {};
    const classes = rawPreds.map(p => p.className);
    classes.forEach(cls => {
      let sum = 0;
      predsHistoryRef.current.forEach(h => { sum += (h[cls] ?? 0); });
      avg[cls] = sum / predsHistoryRef.current.length;
    });
    return classes.map(cls => ({ className: cls, probability: avg[cls] }));
  };

  const updateStability = (topClass, topProb) => {
    const K = 4;
    const MIN_CONF = 0.6;
    stableTopHistoryRef.current.push(topClass);
    if (stableTopHistoryRef.current.length > K) stableTopHistoryRef.current.shift();
    const allSame = stableTopHistoryRef.current.length === K && stableTopHistoryRef.current.every(c => c === topClass);
    if (allSame && topProb >= MIN_CONF) {
      return topClass;
    }
    return null;
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
    // Dispose the detector if present
    try {
      if (handposeModel && typeof handposeModel.dispose === 'function') {
        handposeModel.dispose();
      }
    } catch (_) {}
    setCameraActive(false);
    setCurrentGesture(null);
    setLocalGesture(null);
    setLocalPredictions([]);
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
      background: "radial-gradient(ellipse at center, #1a1f3a 0%, #0a1628 50%, #2d1b4e 100%)",
      animation: "fadeIn 0.3s ease-out",
      overflow: "hidden"
    }}>
      {/* Animated particles background */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none"
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: "rgba(0, 229, 255, 0.3)",
              borderRadius: "50%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Hand logo at top */}
      {!testActive && (
      <div style={{
        position: "absolute",
        top: "2%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        animation: "bounce 2s ease-in-out infinite",
        zIndex: 100001
      }}>
        <div style={{
          fontSize: 80,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
          transform: "rotate(-15deg)"
        }}>✊</div>
        <div style={{
          fontSize: 80,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
          transform: "rotate(15deg)"
        }}>✋</div>
                <div style={{
          fontSize: 80,
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
          transform: "rotate(-15deg)"
        }}>✌️</div>
      </div>
      )}

      <div style={{
        width: "min(720px, 90vw)",
        borderRadius: 24,
        background: "rgba(26, 31, 58, 0.6)",
        backdropFilter: "blur(20px)",
        border: "2px solid rgba(0, 229, 255, 0.3)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0, 229, 255, 0.2)",
        padding: "32px",
        color: "#fff",
        overflow: "hidden",
        animation: "slideUp 0.4s ease-out"
      }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 12, 
          marginBottom: 28 
        }}>
          <h2 style={{ 
            margin: "0 0 0 12px", 
            fontSize: 32, 
            fontWeight: 900, 
            letterSpacing: 0.5,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>
            Rock Paper Scissors AI
          </h2>
        </div>

        {/* Test Toggle */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => handleTestToggle()}
            onMouseEnter={() => setHoveredBtn('info-tab')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.3)',
              background: !testActive ? 'rgba(0, 229, 255, 0.3)' : 'transparent',
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
              background: testActive ? 'rgba(183, 148, 246, 0.3)' : 'transparent',
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

        {/* Body - Two columns */}
        {!testActive ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Left: Description */}
          <div style={{
            background: "rgba(0,0,0,0.2)",
            borderRadius: 16,
            padding: 24,
            border: "1px solid rgba(0, 229, 255, 0.2)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 20
          }}>
            <div>
              <h3 style={{ 
                margin: "0 0 12px", 
                fontSize: 20, 
                fontWeight: 700,
                color: "#fff"
              }}>
                Real-time Hand Tracking
              </h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.85, 
                lineHeight: 1.6,
                fontSize: 14,
                color: "rgba(255,255,255,0.85)"
              }}>
                Use your webcam to play Rock-Paper-Scissors against an AI. The model reads your hand gestures recognizes hand gesture to real time.
              </p>
            </div>
            
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button 
                onClick={onStart}
                onMouseEnter={() => setHoveredBtn('newgame')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 12,
                          border: "none",
                          background: hoveredBtn === 'newgame' 
                            ? "linear-gradient(135deg, #00e5ff, #b794f6)"
                            : "linear-gradient(135deg, #00d4e5, #a78bfa)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          transform: hoveredBtn === 'newgame' ? 'translateY(-2px)' : 'translateY(0)',
                          boxShadow: hoveredBtn === 'newgame' 
                            ? "0 6px 20px rgba(0, 229, 255, 0.4)"
                            : "0 4px 12px rgba(0,0,0,0.3)"
                        }}
                      >
                        New Game
                      </button>
                    </div>
                  </div>

                  {/* Right: Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <button 
                      onClick={onStart} 
                      onMouseEnter={() => setHoveredBtn('play')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: "18px 24px",
                        borderRadius: 16,
                        border: "none",
                        background: hoveredBtn === 'play'
                          ? "linear-gradient(135deg, #00e5ff, #b794f6)"
                          : "linear-gradient(135deg, #00d4e5, #a78bfa)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 16,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        transform: hoveredBtn === 'play' ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: hoveredBtn === 'play'
                          ? "0 8px 24px rgba(0, 229, 255, 0.5)"
                          : "0 4px 16px rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10
                      }}
                    >
                      <span style={{ fontSize: 20 }}>🎮</span>
                      Play vs Computer
                    </button>
                    
                    <button 
                      onClick={onStartMultiplayer} 
                      onMouseEnter={() => setHoveredBtn('multiplayer')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: "18px 24px",
                        borderRadius: 16,
                        border: "none",
                        background: hoveredBtn === 'multiplayer'
                          ? "linear-gradient(135deg, #00e5ff, #b794f6)"
                          : "linear-gradient(135deg, #00d4e5, #a78bfa)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 16,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        transform: hoveredBtn === 'multiplayer' ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: hoveredBtn === 'multiplayer'
                          ? "0 8px 24px rgba(0, 229, 255, 0.5)"
                          : "0 4px 16px rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10
                      }}
                    >
                      <span style={{ fontSize: 20 }}>👥</span>
                      Multiplayer
                    </button>
                    
                    <button 
                      onClick={() => setShowHowTo(true)} 
                      onMouseEnter={() => setHoveredBtn('howto')}
                      onMouseLeave={() => setHoveredBtn(null)}
                      style={{
                        padding: "18px 24px",
                        borderRadius: 16,
                        border: "none",
                        background: hoveredBtn === 'howto'
                          ? "linear-gradient(135deg, #b794f6, #f472b6)"
                          : "linear-gradient(135deg, #a78bfa, #ec4899)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 16,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        transform: hoveredBtn === 'howto' ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: hoveredBtn === 'howto'
                          ? "0 8px 24px rgba(183, 148, 246, 0.5)"
                          : "0 4px 16px rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10
                      }}
                    >
                      <span style={{ fontSize: 20 }}>🎓</span>
                      How to Play
                    </button>
                    
                    <a href="https://teachablemachine.withgoogle.com/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
<button 
  onMouseEnter={() => setHoveredBtn('about')}
  onMouseLeave={() => setHoveredBtn(null)}
  style={{
    width: "100%",
    padding: "18px 24px",
    borderRadius: 16,
    border: "none",
    background: hoveredBtn === 'about'
      ? "linear-gradient(135deg, #1a1f3a, #2d1b4e)"
      : "linear-gradient(135deg, #0a1628, #1a1f3a)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.2s ease",
    transform: hoveredBtn === 'about' ? 'scale(1.02)' : 'scale(1)',
    boxShadow: hoveredBtn === 'about'
      ? "0 8px 24px rgba(0, 229, 255, 0.3)"
      : "0 4px 16px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  }}
>
  <span style={{ fontSize: 20, marginRight: 6 }}>🤖</span>
  About the AI
</button>

            </a>

          </div>
        </div>
        ) : (
        <div style={{
          background: "rgba(0,0,0,0.2)",
          borderRadius: 16,
          padding: 24,
          border: "1px solid rgba(0, 229, 255, 0.2)"
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  fontSize: 12
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
                                  ? 'linear-gradient(90deg, #00e5ff, #b794f6)'
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
        </div>
        )}

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
              background: "rgba(26, 31, 58, 0.95)",
              border: "1px solid rgba(0, 229, 255, 0.3)",
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
  border: "1px solid rgba(0, 229, 255, 0.35)",
  background: "linear-gradient(135deg, #00e5ff, #b794f6)",
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
