import React, { useState, useEffect } from 'react';
import { CONFIDENCE_THRESHOLDS } from '../utils/gestureRecognition';

const GestureTraining = ({ 
  isActive, 
  onComplete, 
  onClose, 
  currentGesture, 
  gestureQuality 
}) => {
  const [trainingStep, setTrainingStep] = useState(0);
  const [gestureData, setGestureData] = useState({
    Rock: { samples: [], avgConfidence: 0, bestConfidence: 0 },
    Paper: { samples: [], avgConfidence: 0, bestConfidence: 0 },
    Scissors: { samples: [], avgConfidence: 0, bestConfidence: 0 }
  });
  const [currentTarget, setCurrentTarget] = useState('Rock');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);

  const trainingSteps = [
    { gesture: 'Rock', instruction: 'Make a fist (Rock)', samples: 5 },
    { gesture: 'Paper', instruction: 'Show your palm (Paper)', samples: 5 },
    { gesture: 'Scissors', instruction: 'Show peace sign (Scissors)', samples: 5 }
  ];

  const currentStep = trainingSteps[trainingStep];
  const requiredSamples = currentStep?.samples || 5;

  useEffect(() => {
    if (isActive && currentStep) {
      setCurrentTarget(currentStep.gesture);
    }
  }, [isActive, trainingStep, currentStep]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isActive) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isActive]);

  // Auto-capture when good gesture is detected
  useEffect(() => {
    if (isActive && 
        currentGesture && 
        currentGesture.gesture === currentTarget &&
        gestureQuality?.confidence > CONFIDENCE_THRESHOLDS.MEDIUM &&
        gestureQuality?.stability &&
        !isCapturing) {
      
      captureGestureSample();
    }
  }, [currentGesture, gestureQuality, currentTarget, isActive, isCapturing]);

  const captureGestureSample = () => {
    if (!currentGesture || !gestureQuality) return;

    setIsCapturing(true);
    
    // Simulate capture animation
    let progress = 0;
    const captureInterval = setInterval(() => {
      progress += 20;
      setCaptureProgress(progress);
      
      if (progress >= 100) {
        clearInterval(captureInterval);
        
        // Add sample to data
        const newSample = {
          confidence: currentGesture.confidence,
          timestamp: Date.now(),
          quality: gestureQuality
        };

        setGestureData(prev => {
          const updated = { ...prev };
          const gesture = updated[currentTarget];
          gesture.samples.push(newSample);
          
          // Update statistics
          gesture.avgConfidence = gesture.samples.reduce((sum, s) => sum + s.confidence, 0) / gesture.samples.length;
          gesture.bestConfidence = Math.max(...gesture.samples.map(s => s.confidence));
          
          return updated;
        });

        // Check if step is complete
        if (gestureData[currentTarget].samples.length + 1 >= requiredSamples) {
          setTimeout(() => {
            if (trainingStep < trainingSteps.length - 1) {
              setTrainingStep(prev => prev + 1);
            } else {
              completeTraining();
            }
          }, 1000);
        }

        setIsCapturing(false);
        setCaptureProgress(0);
      }
    }, 100);
  };

  const completeTraining = () => {
    const trainingResults = {
      completed: true,
      timestamp: Date.now(),
      results: gestureData,
      overallQuality: calculateOverallQuality()
    };

    onComplete?.(trainingResults);
  };

  const calculateOverallQuality = () => {
    const allSamples = Object.values(gestureData).flatMap(g => g.samples);
    if (allSamples.length === 0) return 0;

    const avgConfidence = allSamples.reduce((sum, s) => sum + s.confidence, 0) / allSamples.length;
    return avgConfidence;
  };

  const resetTraining = () => {
    setTrainingStep(0);
    setGestureData({
      Rock: { samples: [], avgConfidence: 0, bestConfidence: 0 },
      Paper: { samples: [], avgConfidence: 0, bestConfidence: 0 },
      Scissors: { samples: [], avgConfidence: 0, bestConfidence: 0 }
    });
    setIsCapturing(false);
    setCaptureProgress(0);
  };

  if (!isActive) return null;

  const currentSamples = gestureData[currentTarget]?.samples.length || 0;
  const progressPercentage = (currentSamples / requiredSamples) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 15, 35, 0.98)',
      backdropFilter: 'blur(25px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: 'clamp(10px, 2vw, 20px)',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(30px)',
        borderRadius: '20px',
        padding: 'clamp(20px, 3vw, 28px)',
        width: 'min(450px, calc(100vw - 40px))',
        maxHeight: 'min(580px, calc(100vh - 40px))',
        overflowY: 'auto',
        textAlign: 'center',
        color: 'white',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(20px, 4vw, 28px)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(18px, 4vw, 22px)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00f5a0, #00d9f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎯 Gesture Training
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 'clamp(20px, 4vw, 24px)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            ×
          </button>
        </div>

        {/* Progress Overview */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(8px, 2vw, 16px)',
          marginBottom: 'clamp(20px, 4vw, 28px)',
          flexWrap: 'wrap'
        }}>
          {trainingSteps.map((step, index) => (
            <div
              key={step.gesture}
              style={{
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                borderRadius: '10px',
                background: index === trainingStep 
                  ? 'linear-gradient(135deg, #00f5a0, #00d9f5)'
                  : index < trainingStep 
                    ? 'rgba(0, 245, 160, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: '600',
                minWidth: 'fit-content'
              }}
            >
              {step.gesture}
              {index < trainingStep && ' ✓'}
            </div>
          ))}
        </div>

        {/* Current Step */}
        <div style={{ marginBottom: 'clamp(20px, 4vw, 28px)' }}>
          <div style={{
            fontSize: 'clamp(48px, 10vw, 64px)',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}>
            {currentTarget === 'Rock' && '✊'}
            {currentTarget === 'Paper' && '✋'}
            {currentTarget === 'Scissors' && '✌️'}
          </div>
          
          <h3 style={{
            margin: '0 0 clamp(6px, 1.5vw, 8px) 0',
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: '600'
          }}>
            {currentStep?.instruction}
          </h3>
          
          <p style={{
            margin: 0,
            opacity: 0.8,
            fontSize: 'clamp(12px, 2.5vw, 14px)'
          }}>
            Hold the gesture steady until captured
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          height: '12px',
          marginBottom: '16px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              background: isCapturing 
                ? `linear-gradient(90deg, #ffd700, #ff9800)`
                : 'linear-gradient(90deg, #00f5a0, #00d9f5)',
              height: '100%',
              width: `${isCapturing ? captureProgress : progressPercentage}%`,
              borderRadius: '12px',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 12px rgba(0, 245, 160, 0.5)'
            }}
          />
        </div>

        {/* Status */}
        <div style={{
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          {isCapturing ? (
            <div style={{ color: '#ffd700' }}>
              📸 Capturing gesture... {captureProgress}%
            </div>
          ) : (
            <div>
              <span style={{ opacity: 0.8 }}>
                Samples: {currentSamples} / {requiredSamples}
              </span>
              {currentGesture && currentGesture.gesture === currentTarget && (
                <div style={{ 
                  color: gestureQuality?.confidence > CONFIDENCE_THRESHOLDS.MEDIUM ? '#00f5a0' : '#ff9800',
                  marginTop: '8px'
                }}>
                  {gestureQuality?.confidence > CONFIDENCE_THRESHOLDS.MEDIUM 
                    ? '✓ Good gesture detected!' 
                    : '⚠️ Hold gesture more steadily'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Gesture Quality */}
        {currentGesture && gestureQuality && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '12px'
          }}>
            <div>Detected: {currentGesture.gesture}</div>
            <div>Confidence: {Math.round(gestureQuality.confidence * 100)}%</div>
            <div>Quality: {gestureQuality.confidenceLevel}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={resetTraining}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🔄 Reset
          </button>
          
          <button
            onClick={() => {
              if (trainingStep < trainingSteps.length - 1) {
                setTrainingStep(prev => prev + 1);
              } else {
                completeTraining();
              }
            }}
            disabled={currentSamples < requiredSamples}
            style={{
              padding: '12px 24px',
              background: currentSamples >= requiredSamples 
                ? 'linear-gradient(135deg, #00f5a0, #00d9f5)'
                : 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: currentSamples >= requiredSamples ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              opacity: currentSamples >= requiredSamples ? 1 : 0.5
            }}
          >
            {trainingStep < trainingSteps.length - 1 ? '➡️ Next' : '✅ Complete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestureTraining;
