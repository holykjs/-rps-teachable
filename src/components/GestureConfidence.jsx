import React from 'react';
import { CONFIDENCE_THRESHOLDS } from '../utils/gestureRecognition';

const GestureConfidence = ({ gesture, quality, compact = false }) => {
  if (!gesture && !quality) return null;

  const confidence = gesture?.confidence || quality?.confidence || 0;
  const confidenceLevel = quality?.confidenceLevel || getConfidenceLevel(confidence);
  const recommendation = quality?.recommendation || '';
  const isStable = quality?.stability || false;

  const getConfidenceColor = (conf) => {
    if (conf >= CONFIDENCE_THRESHOLDS.EXCELLENT) return '#00f5a0';
    if (conf >= CONFIDENCE_THRESHOLDS.HIGH) return '#00d9f5';
    if (conf >= CONFIDENCE_THRESHOLDS.MEDIUM) return '#ffd700';
    if (conf >= CONFIDENCE_THRESHOLDS.LOW) return '#ff9800';
    return '#f44336';
  };

  const getConfidenceLevel = (conf) => {
    if (conf >= CONFIDENCE_THRESHOLDS.EXCELLENT) return 'Excellent';
    if (conf >= CONFIDENCE_THRESHOLDS.HIGH) return 'High';
    if (conf >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'Medium';
    if (conf >= CONFIDENCE_THRESHOLDS.LOW) return 'Low';
    return 'Very Low';
  };

  const confidenceColor = getConfidenceColor(confidence);
  const confidencePercentage = Math.round(confidence * 100);

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        fontSize: '12px',
        color: 'white'
      }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: confidenceColor,
            boxShadow: `0 0 8px ${confidenceColor}50`
          }}
        />
        <span>{confidencePercentage}%</span>
        {isStable && <span style={{ color: '#00f5a0' }}>✓</span>}
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '16px',
      color: 'white',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      border: `2px solid ${confidenceColor}30`,
      boxShadow: `0 8px 32px ${confidenceColor}20`
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: confidenceColor
        }}>
          Gesture Confidence
        </h4>
        {isStable && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: '#00f5a0'
          }}>
            <span>✓</span>
            <span>Stable</span>
          </div>
        )}
      </div>

      {/* Confidence Bar */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        height: '8px',
        marginBottom: '8px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            background: `linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}80)`,
            height: '100%',
            width: `${confidencePercentage}%`,
            borderRadius: '8px',
            transition: 'width 0.3s ease',
            boxShadow: `0 0 8px ${confidenceColor}50`
          }}
        />
      </div>

      {/* Confidence Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        marginBottom: '8px'
      }}>
        <span style={{ color: confidenceColor, fontWeight: '600' }}>
          {confidenceLevel}
        </span>
        <span style={{ opacity: 0.8 }}>
          {confidencePercentage}%
        </span>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div style={{
          fontSize: '11px',
          opacity: 0.8,
          fontStyle: 'italic',
          marginTop: '8px',
          padding: '6px 8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          borderLeft: `3px solid ${confidenceColor}`
        }}>
          💡 {recommendation}
        </div>
      )}

      {/* Quality Indicators */}
      {quality && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '8px',
          fontSize: '10px'
        }}>
          {quality.consistency !== undefined && (
            <div style={{
              padding: '2px 6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px'
            }}>
              Consistency: {Math.round(quality.consistency * 100)}%
            </div>
          )}
          {quality.stabilityFrames > 0 && (
            <div style={{
              padding: '2px 6px',
              background: 'rgba(0, 245, 160, 0.2)',
              borderRadius: '4px',
              color: '#00f5a0'
            }}>
              Stable: {quality.stabilityFrames}f
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GestureConfidence;
