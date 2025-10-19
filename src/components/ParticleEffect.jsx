import React, { useEffect, useState } from 'react';

const ParticleEffect = ({ trigger, type = 'win' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = [];
      const particleCount = type === 'win' ? 50 : 20;
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 8 + 4,
          color: getParticleColor(type),
          emoji: getParticleEmoji(type),
          delay: Math.random() * 2,
          duration: 3 + Math.random() * 2
        });
      }
      
      setParticles(newParticles);
      
      // Clear particles after animation
      setTimeout(() => {
        setParticles([]);
      }, 5000);
    }
  }, [trigger, type]);

  const getParticleColor = (type) => {
    const colors = {
      win: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
      round: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      gesture: ['#00f5a0', '#00d9f5', '#ff8a80']
    };
    const colorSet = colors[type] || colors.round;
    return colorSet[Math.floor(Math.random() * colorSet.length)];
  };

  const getParticleEmoji = (type) => {
    const emojis = {
      win: ['🎉', '🏆', '⭐', '✨', '🎊', '🥳'],
      round: ['✊', '✋', '✌️', '💫'],
      gesture: ['👍', '💪', '🔥', '⚡']
    };
    const emojiSet = emojis[type] || emojis.round;
    return emojiSet[Math.floor(Math.random() * emojiSet.length)];
  };

  if (particles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            fontSize: `${particle.size}px`,
            color: particle.color,
            animation: `
              particleFloat ${particle.duration}s ease-out ${particle.delay}s forwards,
              particleFade ${particle.duration}s ease-out ${particle.delay}s forwards
            `,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {Math.random() > 0.5 ? particle.emoji : '✨'}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes particleFloat {
          0% {
            transform: translate(-50%, -50%) translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-200px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes particleFade {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ParticleEffect;
