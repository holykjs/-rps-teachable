import React from 'react';

const RoundResultOverlay = ({ 
  roundResult, 
  humanMove, 
  computerMove, 
  getEmoji, 
  getComputerImage 
}) => {
  if (!roundResult) return null;

  const getRoundResultText = () => {
    if (roundResult === "human") return "🎉 You Win This Round!";
    if (roundResult === "computer") return "🤖 Computer Wins Round!";
    return "🤝 It's a Tie!";
  };

  return (
    <div style={{ 
      position: "fixed",
      top: "60%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: "32px 40px",
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))",
      backdropFilter: "blur(30px)",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      color: "white",
      borderRadius: "24px",
      textAlign: "center",
      zIndex: 15,
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
      animation: "resultSlideIn 0.5s ease-out",
      minWidth: "clamp(280px, 40vw, 400px)"
    }}>
      <div style={{ 
        fontSize: "clamp(18px, 3vw, 24px)", 
        fontWeight: "800", 
        marginBottom: "20px",
        letterSpacing: "0.5px",
        textTransform: "uppercase"
      }}>
        {getRoundResultText()}
      </div>
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        gap: "clamp(20px, 4vw, 32px)", 
        fontSize: "clamp(32px, 6vw, 48px)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div>{getEmoji(humanMove)}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>You</div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.6 }}>vs</div>
        <div style={{ textAlign: "center" }}>
          {computerMove && getComputerImage(computerMove) ? (
            <img 
              src={getComputerImage(computerMove)}
              alt={computerMove}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            />
          ) : (
            <div>{getEmoji(computerMove)}</div>
          )}
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Computer</div>
        </div>
      </div>
    </div>
  );
};

export default RoundResultOverlay;
