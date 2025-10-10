import { useState, useEffect, useRef } from 'react';
import * as tmImage from "@teachablemachine/image";
import * as handpose from "@tensorflow-models/handpose";
import { drawHand } from "../utilities";

export const useAIModel = (modelBaseUrl) => {
  // Model state
  const [model, setModel] = useState(null);
  const [handposeModel, setHandposeModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Webcam state
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [humanGesture, setHumanGesture] = useState(null);
  const [handLandmarks, setHandLandmarks] = useState(null);
  
  // Refs
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const handDetectionRef = useRef(null);
  const humanGestureHistory = useRef([]);

  // Enhanced model loading with retry mechanism
  const loadModels = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      if (isRetry) {
        setIsRetrying(true);
      }
      setLoadingProgress(0);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 80));
      }, 200);
      
      // Load Teachable Machine model
      console.log("Loading Teachable Machine model...");
      setLoadingProgress(20);
      const modelURL = modelBaseUrl + "model.json";
      const metadataURL = modelBaseUrl + "metadata.json";
      
      // Test model URL accessibility first
      const response = await fetch(modelURL);
      if (!response.ok) {
        throw new Error(`Model not accessible: ${response.status} ${response.statusText}`);
      }
      
      const loaded = await tmImage.load(modelURL, metadataURL);
      setModel(loaded);
      setLoadingProgress(60);
      
      // Load TensorFlow HandPose model
      console.log("Loading HandPose model...");
      const handModel = await handpose.load();
      setHandposeModel(handModel);
      setLoadingProgress(90);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      console.log("All models loaded successfully");
      setRetryCount(0); // Reset retry count on success
      
      // Auto-start webcam after models load
      setTimeout(() => {
        startWebcam();
      }, 500);
      
    } catch (e) {
      console.error("Model load error:", e);
      
      // Enhanced error messages
      let errorMessage = "Unable to load AI models. ";
      if (e.message.includes('fetch')) {
        errorMessage += "Please check your internet connection.";
      } else if (e.message.includes('Model not accessible')) {
        errorMessage += "The AI model is currently unavailable.";
      } else if (e.message.includes('CORS')) {
        errorMessage += "Cross-origin request blocked. Please check model URL.";
      } else {
        errorMessage += "Please try again or refresh the page.";
      }
      
      setError({
        message: errorMessage,
        details: e.message,
        canRetry: retryCount < 3,
        isNetworkError: e.message.includes('fetch') || e.message.includes('Network')
      });
    } finally {
      setLoading(false);
      setIsRetrying(false);
      setLoadingProgress(0);
    }
  };

  // Retry function
  const retryLoadModels = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      loadModels(true);
    }
  };

  // Load models on mount
  useEffect(() => {
    loadModels();
    return () => {
      stopWebcam();
    };
  }, [modelBaseUrl]);

  // Gesture extraction and smoothing
  const extractGesture = (preds) => {
    if (!preds || preds.length === 0) return null;
    const sorted = [...preds].sort((a, b) => b.probability - a.probability);
    const detected = sorted[0];
    const className = detected?.className?.toLowerCase() || "";
    
    if (className.includes("rock")) return { gesture: "Rock", confidence: detected.probability };
    if (className.includes("paper")) return { gesture: "Paper", confidence: detected.probability };
    if (className.includes("scissors")) return { gesture: "Scissors", confidence: detected.probability };
    return null;
  };

  const smoothGesture = (newGesture, historyRef) => {
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
  };

  // Hand detection
  const detectHands = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current &&
      handposeModel &&
      model
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
        // Detect hands using HandPose
        const hands = await handposeModel.estimateHands(video);
        
        if (hands.length > 0) {
          setHandLandmarks(hands[0].landmarks);
          
          // Draw hand skeleton
          drawHand(hands, ctx);
          
          // Get gesture predictions from Teachable Machine
          const predictions = await model.predict(video);
          setPredictions(predictions);
          
          // Extract and smooth gesture
          const rawGesture = extractGesture(predictions);
          const smoothedGesture = smoothGesture(rawGesture, humanGestureHistory);
          setHumanGesture(smoothedGesture);
        } else {
          setHandLandmarks(null);
          setPredictions([]);
          setHumanGesture(null);
        }
      } catch (error) {
        console.error("Hand detection error:", error);
      }
    }
  };

  const startHandDetection = () => {
    handDetectionRef.current = setInterval(() => {
      detectHands();
    }, 100);
  };

  const startWebcam = async () => {
    if (!model || !handposeModel) {
      setError({
        message: "AI models must be loaded before starting camera.",
        canRetry: false
      });
      return;
    }

    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('NoCamera');
      }

      setIsWebcamOn(true);
      console.log("Starting webcam with hand detection...");
      startHandDetection();
      console.log("Webcam started successfully");
      
    } catch (e) {
      console.error("Webcam error:", e);
      
      let errorMessage = "Camera access failed. ";
      let canRetry = true;
      let actionLabel = "Try Again";
      
      if (e.name === 'NotAllowedError' || e.message.includes('Permission')) {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings and try again.";
        actionLabel = "Grant Permission";
      } else if (e.name === 'NotFoundError' || e.message === 'NoCamera') {
        errorMessage = "No camera found. Please connect a camera and refresh the page.";
        canRetry = false;
      } else if (e.name === 'NotReadableError') {
        errorMessage = "Camera is being used by another application. Please close other apps using the camera.";
      } else if (e.name === 'OverconstrainedError') {
        errorMessage = "Camera doesn't support the required settings. Try a different camera.";
      } else {
        errorMessage += e.message || 'Unknown camera error occurred.';
      }
      
      setError({
        message: errorMessage,
        details: e.message,
        canRetry,
        actionLabel,
        isCameraError: true
      });
      setIsWebcamOn(false);
    }
  };

  const stopWebcam = () => {
    try {
      if (webcamRef.current) {
        webcamRef.current.innerHTML = "";
      }
      
      canvasRef.current = null;
      setIsWebcamOn(false);
      setPredictions([]);
      setHumanGesture(null);
      setHandLandmarks(null);
      
      // Stop hand detection interval
      if (handDetectionRef.current) {
        clearInterval(handDetectionRef.current);
        handDetectionRef.current = null;
      }
    } catch (e) {
      console.error("Error stopping webcam:", e);
    }
  };

  return {
    // State
    model,
    handposeModel,
    loading,
    loadingProgress,
    error,
    isWebcamOn,
    predictions,
    humanGesture,
    handLandmarks,
    retryCount,
    isRetrying,
    
    // Refs
    webcamRef,
    canvasRef,
    
    // Actions
    startWebcam,
    stopWebcam,
    retryLoadModels,
    setError
  };
};
