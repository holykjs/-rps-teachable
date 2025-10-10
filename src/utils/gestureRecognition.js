/**
 * Advanced Gesture Recognition Utilities
 * Provides enhanced gesture detection, smoothing, and confidence scoring
 */

// Gesture confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  MINIMUM: 0.3,      // Minimum to consider a gesture
  LOW: 0.5,          // Low confidence threshold
  MEDIUM: 0.7,       // Medium confidence threshold
  HIGH: 0.85,        // High confidence threshold
  EXCELLENT: 0.95    // Excellent confidence threshold
};

// Gesture smoothing parameters
export const SMOOTHING_CONFIG = {
  HISTORY_SIZE: 8,           // Number of recent predictions to consider
  CONSENSUS_THRESHOLD: 0.6,  // Percentage agreement needed for consensus
  STABILITY_FRAMES: 3,       // Frames needed for stable gesture
  CONFIDENCE_DECAY: 0.95     // Confidence decay factor over time
};

/**
 * Advanced gesture extraction with multiple classification methods
 */
export class AdvancedGestureRecognizer {
  constructor() {
    this.gestureHistory = [];
    this.confidenceHistory = [];
    this.lastStableGesture = null;
    this.stableFrameCount = 0;
    this.gestureStartTime = null;
    this.gestureStats = {
      rock: { count: 0, avgConfidence: 0 },
      paper: { count: 0, avgConfidence: 0 },
      scissors: { count: 0, avgConfidence: 0 }
    };
  }

  /**
   * Extract gesture from Teachable Machine predictions
   */
  extractGesture(predictions) {
    if (!predictions || predictions.length === 0) {
      return null;
    }

    // Sort predictions by probability
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
    const topPrediction = sorted[0];
    
    // Map class names to gestures
    const className = topPrediction.className.toLowerCase();
    let gesture = null;
    
    if (className.includes('rock') || className.includes('fist')) {
      gesture = 'Rock';
    } else if (className.includes('paper') || className.includes('palm')) {
      gesture = 'Paper';
    } else if (className.includes('scissors') || className.includes('peace')) {
      gesture = 'Scissors';
    }

    if (!gesture) return null;

    return {
      gesture,
      confidence: topPrediction.probability,
      rawPredictions: predictions,
      timestamp: Date.now()
    };
  }

  /**
   * Advanced gesture smoothing with temporal consistency
   */
  smoothGesture(newGesture) {
    if (!newGesture) {
      // Decay confidence over time when no gesture detected
      this.decayConfidence();
      return this.getStableGesture();
    }

    // Add to history
    this.addToHistory(newGesture);
    
    // Calculate temporal smoothing
    const smoothedGesture = this.calculateTemporalSmoothing();
    
    // Update stability tracking
    this.updateStability(smoothedGesture);
    
    // Update statistics
    this.updateStats(newGesture);
    
    return smoothedGesture;
  }

  /**
   * Add gesture to history with timestamp
   */
  addToHistory(gesture) {
    this.gestureHistory.push({
      ...gesture,
      timestamp: Date.now()
    });

    // Keep only recent history
    if (this.gestureHistory.length > SMOOTHING_CONFIG.HISTORY_SIZE) {
      this.gestureHistory.shift();
    }
  }

  /**
   * Calculate temporal smoothing using weighted average
   */
  calculateTemporalSmoothing() {
    if (this.gestureHistory.length === 0) return null;

    // Group by gesture type
    const gestureGroups = {
      Rock: [],
      Paper: [],
      Scissors: []
    };

    // Recent gestures have higher weight
    this.gestureHistory.forEach((g, index) => {
      const weight = (index + 1) / this.gestureHistory.length;
      const weightedConfidence = g.confidence * weight;
      
      if (gestureGroups[g.gesture]) {
        gestureGroups[g.gesture].push({
          ...g,
          weightedConfidence
        });
      }
    });

    // Find gesture with highest weighted confidence
    let bestGesture = null;
    let bestScore = 0;

    Object.entries(gestureGroups).forEach(([gesture, instances]) => {
      if (instances.length === 0) return;

      // Calculate average weighted confidence
      const totalWeightedConfidence = instances.reduce((sum, g) => sum + g.weightedConfidence, 0);
      const avgConfidence = totalWeightedConfidence / instances.length;
      
      // Bonus for consistency (more instances)
      const consistencyBonus = Math.min(instances.length / SMOOTHING_CONFIG.HISTORY_SIZE, 1) * 0.1;
      const finalScore = avgConfidence + consistencyBonus;

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestGesture = {
          gesture,
          confidence: avgConfidence,
          consistency: instances.length / this.gestureHistory.length,
          instances: instances.length,
          timestamp: Date.now()
        };
      }
    });

    return bestGesture;
  }

  /**
   * Update gesture stability tracking
   */
  updateStability(gesture) {
    if (!gesture) {
      this.stableFrameCount = 0;
      return;
    }

    if (this.lastStableGesture && 
        this.lastStableGesture.gesture === gesture.gesture &&
        gesture.confidence > CONFIDENCE_THRESHOLDS.MEDIUM) {
      this.stableFrameCount++;
    } else {
      this.stableFrameCount = 1;
      this.lastStableGesture = gesture;
    }
  }

  /**
   * Get stable gesture only if it meets stability requirements
   */
  getStableGesture() {
    if (this.stableFrameCount >= SMOOTHING_CONFIG.STABILITY_FRAMES &&
        this.lastStableGesture &&
        this.lastStableGesture.confidence > CONFIDENCE_THRESHOLDS.LOW) {
      return {
        ...this.lastStableGesture,
        isStable: true,
        stabilityFrames: this.stableFrameCount
      };
    }
    return null;
  }

  /**
   * Decay confidence over time when no gesture is detected
   */
  decayConfidence() {
    if (this.lastStableGesture) {
      this.lastStableGesture.confidence *= SMOOTHING_CONFIG.CONFIDENCE_DECAY;
      
      if (this.lastStableGesture.confidence < CONFIDENCE_THRESHOLDS.MINIMUM) {
        this.lastStableGesture = null;
        this.stableFrameCount = 0;
      }
    }
  }

  /**
   * Update gesture statistics
   */
  updateStats(gesture) {
    const gestureKey = gesture.gesture.toLowerCase();
    if (this.gestureStats[gestureKey]) {
      const stats = this.gestureStats[gestureKey];
      stats.count++;
      stats.avgConfidence = (stats.avgConfidence * (stats.count - 1) + gesture.confidence) / stats.count;
    }
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(confidence) {
    if (confidence >= CONFIDENCE_THRESHOLDS.EXCELLENT) return 'Excellent';
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'High';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'Medium';
    if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return 'Low';
    return 'Very Low';
  }

  /**
   * Get gesture quality metrics
   */
  getGestureQuality(gesture) {
    if (!gesture) return null;

    return {
      confidence: gesture.confidence,
      confidenceLevel: this.getConfidenceLevel(gesture.confidence),
      consistency: gesture.consistency || 0,
      stability: gesture.isStable || false,
      stabilityFrames: gesture.stabilityFrames || 0,
      recommendation: this.getRecommendation(gesture)
    };
  }

  /**
   * Get improvement recommendations
   */
  getRecommendation(gesture) {
    if (!gesture) return "Show your hand clearly to the camera";
    
    if (gesture.confidence < CONFIDENCE_THRESHOLDS.LOW) {
      return "Hold your gesture more clearly and steadily";
    }
    
    if (gesture.confidence < CONFIDENCE_THRESHOLDS.MEDIUM) {
      return "Good! Try to hold the gesture a bit more steady";
    }
    
    if (gesture.confidence < CONFIDENCE_THRESHOLDS.HIGH) {
      return "Great gesture! Very clear recognition";
    }
    
    return "Perfect gesture recognition!";
  }

  /**
   * Reset recognition state
   */
  reset() {
    this.gestureHistory = [];
    this.confidenceHistory = [];
    this.lastStableGesture = null;
    this.stableFrameCount = 0;
    this.gestureStartTime = null;
  }

  /**
   * Get comprehensive gesture analytics
   */
  getAnalytics() {
    return {
      totalGestures: Object.values(this.gestureStats).reduce((sum, stat) => sum + stat.count, 0),
      gestureBreakdown: { ...this.gestureStats },
      averageConfidence: this.calculateOverallAverageConfidence(),
      historySize: this.gestureHistory.length,
      currentStability: this.stableFrameCount
    };
  }

  /**
   * Calculate overall average confidence
   */
  calculateOverallAverageConfidence() {
    const stats = Object.values(this.gestureStats);
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    if (totalCount === 0) return 0;
    
    const weightedSum = stats.reduce((sum, stat) => 
      sum + (stat.avgConfidence * stat.count), 0);
    
    return weightedSum / totalCount;
  }
}

/**
 * Hand landmark analysis utilities
 */
export class HandLandmarkAnalyzer {
  constructor() {
    this.landmarkHistory = [];
  }

  /**
   * Analyze hand landmarks for gesture classification
   */
  analyzeHandLandmarks(landmarks) {
    if (!landmarks || landmarks.length !== 21) return null;

    // Key landmark indices (MediaPipe format)
    const LANDMARKS = {
      WRIST: 0,
      THUMB_TIP: 4,
      INDEX_TIP: 8,
      MIDDLE_TIP: 12,
      RING_TIP: 16,
      PINKY_TIP: 20,
      INDEX_PIP: 6,
      MIDDLE_PIP: 10,
      RING_PIP: 14,
      PINKY_PIP: 18
    };

    // Calculate finger states
    const fingerStates = this.calculateFingerStates(landmarks, LANDMARKS);
    
    // Classify gesture based on finger states
    const gestureFromLandmarks = this.classifyGestureFromFingers(fingerStates);
    
    return {
      fingerStates,
      gestureFromLandmarks,
      landmarks,
      confidence: this.calculateLandmarkConfidence(fingerStates)
    };
  }

  /**
   * Calculate finger extension states
   */
  calculateFingerStates(landmarks, LANDMARKS) {
    const states = {
      thumb: this.isFingerExtended(landmarks, LANDMARKS.THUMB_TIP, LANDMARKS.WRIST),
      index: this.isFingerExtended(landmarks, LANDMARKS.INDEX_TIP, LANDMARKS.INDEX_PIP),
      middle: this.isFingerExtended(landmarks, LANDMARKS.MIDDLE_TIP, LANDMARKS.MIDDLE_PIP),
      ring: this.isFingerExtended(landmarks, LANDMARKS.RING_TIP, LANDMARKS.RING_PIP),
      pinky: this.isFingerExtended(landmarks, LANDMARKS.PINKY_TIP, LANDMARKS.PINKY_PIP)
    };

    return states;
  }

  /**
   * Check if finger is extended
   */
  isFingerExtended(landmarks, tipIndex, pipIndex) {
    const tip = landmarks[tipIndex];
    const pip = landmarks[pipIndex];
    
    // Simple distance-based check (can be improved with angle calculation)
    const distance = Math.sqrt(
      Math.pow(tip[0] - pip[0], 2) + 
      Math.pow(tip[1] - pip[1], 2)
    );
    
    return distance > 0.05; // Threshold for extended finger
  }

  /**
   * Classify gesture based on finger states
   */
  classifyGestureFromFingers(fingerStates) {
    const { thumb, index, middle, ring, pinky } = fingerStates;
    
    // Rock: All fingers closed
    if (!thumb && !index && !middle && !ring && !pinky) {
      return { gesture: 'Rock', confidence: 0.9 };
    }
    
    // Paper: All fingers extended
    if (thumb && index && middle && ring && pinky) {
      return { gesture: 'Paper', confidence: 0.9 };
    }
    
    // Scissors: Index and middle extended, others closed
    if (!thumb && index && middle && !ring && !pinky) {
      return { gesture: 'Scissors', confidence: 0.9 };
    }
    
    // Partial matches with lower confidence
    if (index && middle && !ring && !pinky) {
      return { gesture: 'Scissors', confidence: 0.7 };
    }
    
    if (index && middle && ring && pinky) {
      return { gesture: 'Paper', confidence: 0.7 };
    }
    
    return null;
  }

  /**
   * Calculate confidence based on landmark clarity
   */
  calculateLandmarkConfidence(fingerStates) {
    // Simple confidence based on clear finger states
    const clearStates = Object.values(fingerStates).filter(state => 
      state === true || state === false
    ).length;
    
    return clearStates / 5; // 5 fingers
  }
}

// Export singleton instances
export const gestureRecognizer = new AdvancedGestureRecognizer();
export const landmarkAnalyzer = new HandLandmarkAnalyzer();
