import { useState, useEffect, useRef } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    gestureLatency: 0,
    webrtcLatency: 0
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const gestureStartTime = useRef(null);

  // FPS Monitoring
  useEffect(() => {
    let animationId;
    
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 0
        }));
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Gesture Recognition Latency
  const startGestureTimer = () => {
    gestureStartTime.current = performance.now();
  };

  const endGestureTimer = () => {
    if (gestureStartTime.current) {
      const latency = performance.now() - gestureStartTime.current;
      setMetrics(prev => ({
        ...prev,
        gestureLatency: Math.round(latency)
      }));
      gestureStartTime.current = null;
    }
  };

  // WebRTC Connection Latency
  const measureWebRTCLatency = (startTime) => {
    const latency = performance.now() - startTime;
    setMetrics(prev => ({
      ...prev,
      webrtcLatency: Math.round(latency)
    }));
  };

  // Performance Warnings
  const getPerformanceWarnings = () => {
    const warnings = [];
    
    if (metrics.fps < 30) {
      warnings.push('Low FPS detected. Consider reducing video quality.');
    }
    
    if (metrics.memoryUsage > 100) {
      warnings.push('High memory usage. Consider refreshing the page.');
    }
    
    if (metrics.gestureLatency > 200) {
      warnings.push('High gesture recognition latency. Check camera performance.');
    }
    
    if (metrics.webrtcLatency > 1000) {
      warnings.push('Poor network connection. Video quality may be affected.');
    }
    
    return warnings;
  };

  return {
    metrics,
    startGestureTimer,
    endGestureTimer,
    measureWebRTCLatency,
    getPerformanceWarnings
  };
};
