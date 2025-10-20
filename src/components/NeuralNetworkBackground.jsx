import React, { useRef, useEffect } from 'react';

const NeuralNetworkBackground = ({ className = '', style = {}, gestureData = null }) => {
  const canvasRef = useRef();
  const animationRef = useRef();
  const nodesRef = useRef([]);
  const connectionsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    // Configuration
    const config = {
      nodeCount: Math.min(80, Math.floor(window.innerWidth / 25)),
      maxConnections: 3,
      connectionDistance: 150,
      nodeSpeed: 0.3,
      pulseSpeed: 0.05,
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        glow: '#4facfe'
      },
      gesture: {
        pulseIntensity: 0,
        lastGestureTime: 0,
        gestureDecay: 0.95
      }
    };

    // Node class representing neural network neurons
    class NetworkNode {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.originalX = this.x;
        this.originalY = this.y;
        this.vx = (Math.random() - 0.5) * config.nodeSpeed;
        this.vy = (Math.random() - 0.5) * config.nodeSpeed;
        this.radius = Math.random() * 3 + 2;
        this.baseRadius = this.radius;
        this.pulse = Math.random() * Math.PI * 2;
        this.connections = [];
        this.activity = 0;
        this.type = Math.random() > 0.7 ? 'special' : 'normal'; // 30% special nodes
        this.hue = this.type === 'special' ? 280 : 220 + Math.random() * 40;
      }

      update() {
        // Gentle floating movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
          this.vx *= -1;
        }
        if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
          this.vy *= -1;
        }

        // Keep within bounds
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

        // Pulse animation
        this.pulse += config.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.pulse) * 0.5;

        // Activity decay
        this.activity *= 0.98;

        // Gesture response
        if (config.gesture.pulseIntensity > 0) {
          this.activity = Math.max(this.activity, config.gesture.pulseIntensity * Math.random());
        }
      }

      render() {
        const alpha = 0.6 + this.activity * 0.4;
        const glowRadius = this.radius + this.activity * 8;

        // Glow effect
        if (this.activity > 0.1) {
          const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
          gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${alpha * 0.8})`);
          gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, 50%, ${alpha * 0.4})`);
          gradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main node
        const nodeGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        nodeGradient.addColorStop(0, `hsla(${this.hue}, 70%, 70%, ${alpha})`);
        nodeGradient.addColorStop(1, `hsla(${this.hue}, 70%, 50%, ${alpha * 0.7})`);
        
        ctx.fillStyle = nodeGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Special node indicator
        if (this.type === 'special') {
          ctx.strokeStyle = `hsla(${this.hue}, 80%, 80%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
      }
    }

    // Connection class for neural pathways
    class NetworkConnection {
      constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB;
        this.strength = Math.random() * 0.5 + 0.3;
        this.pulse = Math.random() * Math.PI * 2;
        this.activity = 0;
        this.direction = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.pulse += config.pulseSpeed * this.direction;
        
        // Activity based on connected nodes
        this.activity = (this.nodeA.activity + this.nodeB.activity) * 0.5;
        
        // Random activation
        if (Math.random() < 0.002) {
          this.activity = Math.max(this.activity, Math.random() * 0.5);
          this.nodeA.activity = Math.max(this.nodeA.activity, this.activity);
          this.nodeB.activity = Math.max(this.nodeB.activity, this.activity);
        }
      }

      render() {
        const distance = this.nodeA.distanceTo(this.nodeB);
        if (distance > config.connectionDistance) return;

        const alpha = (this.strength * (1 - distance / config.connectionDistance)) * (0.3 + this.activity);
        
        // Animated pulse along connection
        const pulsePos = (Math.sin(this.pulse) + 1) * 0.5;
        const pulseX = this.nodeA.x + (this.nodeB.x - this.nodeA.x) * pulsePos;
        const pulseY = this.nodeA.y + (this.nodeB.y - this.nodeA.y) * pulsePos;

        // Connection line
        const gradient = ctx.createLinearGradient(this.nodeA.x, this.nodeA.y, this.nodeB.x, this.nodeB.y);
        gradient.addColorStop(0, `hsla(200, 70%, 60%, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `hsla(220, 70%, 70%, ${alpha})`);
        gradient.addColorStop(1, `hsla(240, 70%, 60%, ${alpha * 0.6})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + this.activity * 2;
        ctx.beginPath();
        ctx.moveTo(this.nodeA.x, this.nodeA.y);
        ctx.lineTo(this.nodeB.x, this.nodeB.y);
        ctx.stroke();

        // Pulse dot
        if (this.activity > 0.2) {
          ctx.fillStyle = `hsla(180, 80%, 80%, ${alpha * 2})`;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2 + this.activity * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Initialize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize network
    const initNetwork = () => {
      nodesRef.current = [];
      connectionsRef.current = [];

      // Create nodes
      for (let i = 0; i < config.nodeCount; i++) {
        nodesRef.current.push(new NetworkNode());
      }

      // Create connections
      for (let i = 0; i < nodesRef.current.length; i++) {
        const node = nodesRef.current[i];
        let connectionCount = 0;

        for (let j = i + 1; j < nodesRef.current.length && connectionCount < config.maxConnections; j++) {
          const other = nodesRef.current[j];
          const distance = node.distanceTo(other);

          if (distance < config.connectionDistance && Math.random() < 0.3) {
            connectionsRef.current.push(new NetworkConnection(node, other));
            connectionCount++;
          }
        }
      }
    };

    // Handle gesture data
    const processGestureData = () => {
      if (gestureData && gestureData.gesture) {
        const now = Date.now();
        if (now - config.gesture.lastGestureTime > 100) { // Throttle gesture responses
          config.gesture.pulseIntensity = Math.min(1, (gestureData.confidence || 0.5) * 1.5);
          config.gesture.lastGestureTime = now;

          // Activate random nodes based on gesture
          const activationCount = Math.floor(config.nodeCount * 0.2);
          for (let i = 0; i < activationCount; i++) {
            const randomNode = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
            randomNode.activity = Math.max(randomNode.activity, config.gesture.pulseIntensity);
          }
        }
      }

      // Decay gesture pulse
      config.gesture.pulseIntensity *= config.gesture.gestureDecay;
    };

    // Animation loop
    const animate = () => {
      time++;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Process gesture input
      processGestureData();

      // Update and render connections first (behind nodes)
      for (let connection of connectionsRef.current) {
        connection.update();
        connection.render();
      }

      // Update and render nodes
      for (let node of nodesRef.current) {
        node.update();
        node.render();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Click handler for interaction
    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Find nearest node and activate it
      let nearestNode = null;
      let nearestDistance = Infinity;

      for (let node of nodesRef.current) {
        const distance = Math.sqrt((node.x - clickX) ** 2 + (node.y - clickY) ** 2);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestNode = node;
        }
      }

      if (nearestNode && nearestDistance < 100) {
        nearestNode.activity = 1;
        
        // Propagate activation to connected nodes
        for (let connection of connectionsRef.current) {
          if (connection.nodeA === nearestNode || connection.nodeB === nearestNode) {
            connection.activity = 0.8;
            const otherNode = connection.nodeA === nearestNode ? connection.nodeB : connection.nodeA;
            otherNode.activity = Math.max(otherNode.activity, 0.6);
          }
        }
      }
    };

    // Window resize handler
    const handleResize = () => {
      resizeCanvas();
      config.nodeCount = Math.min(80, Math.floor(window.innerWidth / 25));
      initNetwork();
    };

    // Setup
    resizeCanvas();
    initNetwork();
    animate();

    // Event listeners
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [gestureData]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        ...style
      }}
    />
  );
};

export default NeuralNetworkBackground;
