import React, { useRef, useEffect } from 'react';

const SimpleAnimatedBackground = ({ className = '', style = {} }) => {
  const canvasRef = useRef();
  const animationRef = useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let time = 0;

    // Configuration
    const config = {
      particleCount: window.innerWidth > 1000 ? 800 : 400,
      noiseScale: 0.009,
      angle: -Math.PI / 2,
      colors: {
        h1: Math.floor(Math.random() * 360),
        h2: Math.floor(Math.random() * 360),
        s1: Math.floor(20 + Math.random() * 70),
        s2: Math.floor(20 + Math.random() * 70),
        l1: Math.floor(30 + Math.random() * 50),
        l2: Math.floor(30 + Math.random() * 50)
      },
      strokeWeight: 1.2,
      tail: 82
    };

    // Simple noise function (simplified Perlin noise)
    const noise = (x, y, z = 0) => {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      
      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);
      
      const u = fade(x);
      const v = fade(y);
      const w = fade(z);
      
      const A = p[X] + Y;
      const AA = p[A] + Z;
      const AB = p[A + 1] + Z;
      const B = p[X + 1] + Y;
      const BA = p[B] + Z;
      const BB = p[B + 1] + Z;
      
      return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                                     grad(p[BA], x - 1, y, z)),
                             lerp(u, grad(p[AB], x, y - 1, z),
                                     grad(p[BB], x - 1, y - 1, z))),
                     lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                                     grad(p[BA + 1], x - 1, y, z - 1)),
                             lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                                     grad(p[BB + 1], x - 1, y - 1, z - 1))));
    };

    // Helper functions for noise
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (hash, x, y, z) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    // Permutation table for noise
    const p = new Array(512);
    const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lx = x;
        this.ly = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.hueSeed = Math.random();
        this.updateColors();
        this.maxSpeed = this.hueSeed > 0.5 ? 3 : 2;
      }

      updateColors() {
        this.hue = this.hueSeed > 0.5 ? 20 + config.colors.h1 : 20 + config.colors.h2;
        this.sat = this.hueSeed > 0.5 ? config.colors.s1 : config.colors.s2;
        this.light = this.hueSeed > 0.5 ? config.colors.l1 : config.colors.l2;
      }

      update() {
        this.follow();
        
        this.vx += this.ax;
        this.vy += this.ay;
        
        const magnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const angle = Math.atan2(this.vy, this.vx);
        const limitedMagnitude = Math.min(this.maxSpeed, magnitude);
        this.vx = Math.cos(angle) * limitedMagnitude;
        this.vy = Math.sin(angle) * limitedMagnitude;
        
        this.x += this.vx;
        this.y += this.vy;
        this.ax = 0;
        this.ay = 0;
        
        this.edges();
      }

      follow() {
        const angle = noise(this.x * config.noiseScale, this.y * config.noiseScale, time * config.noiseScale) * Math.PI * 0.5 + config.angle;
        this.ax += Math.cos(angle);
        this.ay += Math.sin(angle);
      }

      updatePrev() {
        this.lx = this.x;
        this.ly = this.y;
      }

      edges() {
        if (this.x < 0) {
          this.x = canvas.width;
          this.updatePrev();
        }
        if (this.x > canvas.width) {
          this.x = 0;
          this.updatePrev();
        }
        if (this.y < 0) {
          this.y = canvas.height;
          this.updatePrev();
        }
        if (this.y > canvas.height) {
          this.y = 0;
          this.updatePrev();
        }
      }

      render() {
        ctx.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0.5)`;
        ctx.lineWidth = config.strokeWeight;
        ctx.beginPath();
        ctx.moveTo(this.lx, this.ly);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        this.updatePrev();
      }
    }

    // Initialize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < config.particleCount; i++) {
        particlesRef.current.push(new Particle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }
    };

    // Animation loop
    const animate = () => {
      time++;
      
      // Background with trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${(100 - config.tail) / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and render particles
      for (let particle of particlesRef.current) {
        particle.update();
        particle.render();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Click handler to randomize colors
    const handleClick = () => {
      config.colors.h1 = Math.floor(Math.random() * 360);
      config.colors.h2 = Math.floor(Math.random() * 360);
      config.colors.s1 = Math.floor(20 + Math.random() * 70);
      config.colors.s2 = Math.floor(20 + Math.random() * 70);
      config.colors.l1 = Math.floor(30 + Math.random() * 50);
      config.colors.l2 = Math.floor(30 + Math.random() * 50);
      config.angle += (Math.random() - 0.5) * Math.PI / 3;
      
      for (let particle of particlesRef.current) {
        particle.updateColors();
      }
    };

    // Window resize handler
    const handleResize = () => {
      resizeCanvas();
      const newParticleCount = window.innerWidth > 1000 ? 800 : 400;
      if (newParticleCount !== config.particleCount) {
        config.particleCount = newParticleCount;
        initParticles();
      }
    };

    // Setup
    resizeCanvas();
    initParticles();
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
  }, []);

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
        background: 'black',
        ...style
      }}
    />
  );
};

export default SimpleAnimatedBackground;
