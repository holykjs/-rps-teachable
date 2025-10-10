import React from 'react';

const CountdownOverlay = ({ countdown }) => {
  if (!countdown) return null;

  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "clamp(100px, 15vw, 140px)",
      height: "clamp(100px, 15vw, 140px)",
      background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "clamp(48px, 8vw, 80px)",
      fontWeight: "900",
      color: "white",
      zIndex: 1000,
      boxShadow: "0 20px 60px rgba(255, 154, 158, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
      animation: "modernPulse 1s infinite",
      backdropFilter: "blur(20px)",
      textShadow: "0 2px 10px rgba(0,0,0,0.3)"
    }}>
      {countdown}
    </div>
  );
};

export default CountdownOverlay;
