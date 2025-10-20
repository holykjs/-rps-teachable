import React, { useState } from 'react';

const GestureCalibration = ({ onClose, predictions, currentGesture }) => {
  const [step, setStep] = useState(0);
  const [calibrationData, setCalibrationData] = useState({
    rock: [],
    paper: [],
    scissors: []
  });

  const gestures = ['rock', 'paper', 'scissors'];
  const currentGestureType = gestures[step];

  const getGestureEmoji = (gesture) => {
    switch (gesture) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
      default: return '❓';
    }
  };

  const getGestureInstructions = (gesture) => {
    switch (gesture) {
      case 'rock': return 'Make a tight fist with knuckles facing the camera';
      case 'paper': return 'Show flat palm with fingers spread wide';
      case 'scissors': return 'Extend only index and middle finger in V-shape';
      default: return '';
    }
  };

  const captureGesture = () => {
    if (predictions && predictions.length > 0) {
      const newData = { ...calibrationData };
      newData[currentGestureType].push({
        predictions: [...predictions],
        timestamp: Date.now()
      });
      setCalibrationData(newData);

      if (newData[currentGestureType].length >= 5) {
        if (step < 2) {
          setStep(step + 1);
        } else {
          // Calibration complete
          analyzeCalibration(newData);
        }
      }
    }
  };

  const analyzeCalibration = (data) => {
    const analysis = {};
    
    Object.keys(data).forEach(gesture => {
      const samples = data[gesture];
      const avgConfidence = samples.reduce((sum, sample) => {
        const gestureClass = sample.predictions.find(p => 
          p.className.toLowerCase() === gesture
        );
        return sum + (gestureClass ? gestureClass.probability : 0);
      }, 0) / samples.length;
      
      analysis[gesture] = {
        avgConfidence: avgConfidence,
        samples: samples.length,
        quality: avgConfidence > 0.7 ? 'Good' : avgConfidence > 0.5 ? 'Fair' : 'Poor'
      };
    });

    setCalibrationData({ ...calibrationData, analysis });
  };

  const getCurrentSampleCount = () => {
    return calibrationData[currentGestureType]?.length || 0;
  };

  if (calibrationData.analysis) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
            📊 Calibration Results
          </h2>
          
          {Object.entries(calibrationData.analysis).map(([gesture, data]) => (
            <div key={gesture} style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{getGestureEmoji(gesture)}</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{gesture}</span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: data.quality === 'Good' ? '#10b981' : 
                             data.quality === 'Fair' ? '#f59e0b' : '#ef4444'
                }}>
                  {data.quality}
                </span>
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Average Confidence: {(data.avgConfidence * 100).toFixed(1)}%
              </div>
            </div>
          ))}

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <h3>💡 Recommendations:</h3>
            <ul style={{ textAlign: 'left', paddingLeft: '20px', fontSize: '14px' }}>
              {Object.entries(calibrationData.analysis).map(([gesture, data]) => {
                if (data.quality === 'Poor') {
                  return (
                    <li key={gesture}>
                      <strong>{gesture}:</strong> Try better lighting and clearer hand position
                    </li>
                  );
                }
                return null;
              })}
              <li>Consider training a custom model for better accuracy</li>
              <li>Ensure consistent lighting and hand distance</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '15px',
              marginTop: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        color: 'white',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          🎯 Gesture Calibration
        </h2>
        
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>
          {getGestureEmoji(currentGestureType)}
        </div>
        
        <h3 style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
          {currentGestureType}
        </h3>
        
        <p style={{ marginBottom: '20px', opacity: 0.8, fontSize: '14px' }}>
          {getGestureInstructions(currentGestureType)}
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>
            Sample {getCurrentSampleCount() + 1} of 5
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(getCurrentSampleCount() / 5) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f5a0, #00d9f5)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <button
          onClick={captureGesture}
          disabled={!predictions || predictions.length === 0}
          style={{
            padding: '15px 30px',
            background: predictions && predictions.length > 0 
              ? 'linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)'
              : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: predictions && predictions.length > 0 ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          📸 Capture Sample
        </button>

        <button
          onClick={onClose}
          style={{
            padding: '15px 30px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GestureCalibration;
