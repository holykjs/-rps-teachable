import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const AnimatedBackground = ({ className = '', style = {} }) => {
  const canvasRef = useRef();
  const p5InstanceRef = useRef();

  useEffect(() => {
    // Ensure we have a valid container
    if (!canvasRef.current) return;

    // p5.js sketch function
    const sketch = (p) => {
      // Variables
      const deg = (a) => Math.PI / 180 * a;
      const rand = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));
      
      let opt = {
        particles: (typeof window !== 'undefined' && window.innerWidth > 1000) ? 1000 : 500,
        noiseScale: 0.009,
        angle: Math.PI / 180 * -90,
        h1: rand(0, 360),
        h2: rand(0, 360),
        s1: rand(20, 90),
        s2: rand(20, 90),
        l1: rand(30, 80),
        l2: rand(30, 80),
        strokeWeight: 1.2,
        tail: 82,
      };
      
      let particles = [];
      let time = 0;

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
          this.hueSemen = Math.random();
          this.hue = this.hueSemen > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
          this.sat = this.hueSemen > 0.5 ? opt.s1 : opt.s2;
          this.light = this.hueSemen > 0.5 ? opt.l1 : opt.l2;
          this.maxSpeed = this.hueSemen > 0.5 ? 3 : 2;
        }

        randomize() {
          this.hueSemen = Math.random();
          this.hue = this.hueSemen > 0.5 ? 20 + opt.h1 : 20 + opt.h2;
          this.sat = this.hueSemen > 0.5 ? opt.s1 : opt.s2;
          this.light = this.hueSemen > 0.5 ? opt.l1 : opt.l2;
          this.maxSpeed = this.hueSemen > 0.5 ? 3 : 2;
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
          const angle = (p.noise(this.x * opt.noiseScale, this.y * opt.noiseScale, time * opt.noiseScale)) * Math.PI * 0.5 + opt.angle;

          this.ax += Math.cos(angle);
          this.ay += Math.sin(angle);
        }

        updatePrev() {
          this.lx = this.x;
          this.ly = this.y;
        }

        edges() {
          if (this.x < 0) {
            this.x = p.width;
            this.updatePrev();
          }
          if (this.x > p.width) {
            this.x = 0;
            this.updatePrev();
          }
          if (this.y < 0) {
            this.y = p.height;
            this.updatePrev();
          }
          if (this.y > p.height) {
            this.y = 0;
            this.updatePrev();
          }
        }

        render() {
          p.stroke(`hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0.5)`);
          p.line(this.x, this.y, this.lx, this.ly);
          this.updatePrev();
        }
      }

      // p5.js setup function
      p.setup = () => {
        try {
          const width = window.innerWidth || 800;
          const height = window.innerHeight || 600;
          const canvas = p.createCanvas(width, height);
          canvas.parent(canvasRef.current);
          
          // Initialize particles
          for (let i = 0; i < opt.particles; i++) {
            particles.push(new Particle(Math.random() * p.width, Math.random() * p.height));
          }
          
          p.strokeWeight(opt.strokeWeight);
          
          // Click event to randomize colors and flow
          canvas.mousePressed(() => {
            try {
              opt.h1 = rand(0, 360);
              opt.h2 = rand(0, 360);
              opt.s1 = rand(20, 90);
              opt.s2 = rand(20, 90);
              opt.l1 = rand(30, 80);
              opt.l2 = rand(30, 80);
              opt.angle += deg(rand(-60, 60));
              
              for (let particle of particles) {
                particle.randomize();
              }
            } catch (error) {
              console.error('Error in mouse click handler:', error);
            }
          });
        } catch (error) {
          console.error('Error setting up animated background:', error);
        }
      };

      // p5.js draw function
      p.draw = () => {
        try {
          time++;
          p.background(0, 100 - opt.tail);

          for (let particle of particles) {
            particle.update();
            particle.render();
          }
        } catch (error) {
          console.error('Error in draw function:', error);
        }
      };

      // Handle window resize
      p.windowResized = () => {
        try {
          const width = window.innerWidth || 800;
          const height = window.innerHeight || 600;
          p.resizeCanvas(width, height);
          
          // Adjust particle count based on new window size
          const newParticleCount = width > 1000 ? 1000 : 500;
          if (newParticleCount > particles.length) {
            // Add more particles
            for (let i = particles.length; i < newParticleCount; i++) {
              particles.push(new Particle(Math.random() * p.width, Math.random() * p.height));
            }
          } else if (newParticleCount < particles.length) {
            // Remove excess particles
            particles = particles.slice(0, newParticleCount);
          }
          opt.particles = newParticleCount;
        } catch (error) {
          console.error('Error in window resize:', error);
        }
      };
    };

    // Create p5 instance
    if (canvasRef.current && !p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch);
    }

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
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

export default AnimatedBackground;
