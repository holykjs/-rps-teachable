// Simple analytics utility for tracking game events
class GameAnalytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  track(eventName, properties = {}) {
    const event = {
      sessionId: this.sessionId,
      eventName,
      properties,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.events.push(event);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', event);
    }

    // Send to analytics service in production
    if (import.meta.env.PROD && import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      this.sendEvent(event);
    }
  }

  async sendEvent(event) {
    try {
      await fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Game-specific tracking methods
  trackGameStart(mode) {
    this.track('game_start', { mode });
  }

  trackGameEnd(mode, winner, duration, rounds) {
    this.track('game_end', { mode, winner, duration, rounds });
  }

  trackGestureRecognition(gesture, confidence, success) {
    this.track('gesture_recognition', { gesture, confidence, success });
  }

  trackMultiplayerConnection(success, latency) {
    this.track('multiplayer_connection', { success, latency });
  }

  trackWebRTCConnection(success, connectionTime) {
    this.track('webrtc_connection', { success, connectionTime });
  }

  trackError(error, context) {
    this.track('error', { 
      message: error.message, 
      stack: error.stack, 
      context 
    });
  }

  // Get session summary
  getSessionSummary() {
    const duration = Date.now() - this.startTime;
    const eventCounts = this.events.reduce((acc, event) => {
      acc[event.eventName] = (acc[event.eventName] || 0) + 1;
      return acc;
    }, {});

    return {
      sessionId: this.sessionId,
      duration,
      eventCounts,
      totalEvents: this.events.length
    };
  }
}

// Create singleton instance
export const analytics = new GameAnalytics();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    trackGameStart: analytics.trackGameStart.bind(analytics),
    trackGameEnd: analytics.trackGameEnd.bind(analytics),
    trackGestureRecognition: analytics.trackGestureRecognition.bind(analytics),
    trackMultiplayerConnection: analytics.trackMultiplayerConnection.bind(analytics),
    trackWebRTCConnection: analytics.trackWebRTCConnection.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    getSessionSummary: analytics.getSessionSummary.bind(analytics)
  };
};
