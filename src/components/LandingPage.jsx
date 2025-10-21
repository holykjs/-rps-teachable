import React, { useState } from "react";

const LandingPage = ({ onStartGame }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");

  const handlePlayClick = () => {
    setShowNicknameModal(true);
  };

  const handleEnterGame = () => {
    if (nickname.trim()) {
      onStartGame(nickname.trim());
      setShowNicknameModal(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && nickname.trim()) {
      handleEnterGame();
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(135deg, #0a1628 0%, #1a1f3a 25%, #2d1b4e 50%, #1a1f3a 75%, #0a1628 100%)",
      overflowY: "auto",
      overflowX: "hidden",
      zIndex: 100002
    }}>
      {/* Header Badge */}
      <div style={{
        textAlign: "center",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        background: "rgba(10, 22, 40, 0.95)",
        backdropFilter: "blur(10px)",
        zIndex: 10,
        borderBottom: "1px solid rgba(0, 229, 255, 0.2)"
      }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "rgba(0, 229, 255, 0.1)",
          border: "1px solid rgba(0, 229, 255, 0.3)",
          borderRadius: 20,
          color: "#00e5ff",
          fontSize: 14,
          fontWeight: 600
        }}>
          ⚡ Powered by Machine Learning
        </span>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center"
      }}>
        <h1 style={{
          margin: "0 0 24px",
          fontSize: "clamp(32px, 8vw, 72px)",
          fontWeight: 900,
          background: "linear-gradient(135deg, #00e5ff 0%, #b794f6 50%, #f472b6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          MozBackgroundClip: "text",
          MozTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1.2
        }}>
          Beat the AI at Rock Paper Scissors
        </h1>

        <p style={{
          margin: "0 0 48px",
          fontSize: "clamp(16px, 3vw, 20px)",
          color: "rgba(255,255,255,0.7)",
          maxWidth: 600,
          lineHeight: 1.6
        }}>
          Challenge our advanced machine learning algorithm that learns your patterns and adapts in real-time. Can you outsmart the AI?
        </p>

        <div style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 60
        }}>
          <button
            onClick={handlePlayClick}
            onMouseEnter={() => setHoveredBtn('play')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: "16px 32px",
              borderRadius: 12,
              border: "none",
              background: hoveredBtn === 'play'
                ? "linear-gradient(135deg, #00e5ff, #b794f6)"
                : "linear-gradient(135deg, #00d4e5, #a78bfa)",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: hoveredBtn === 'play' ? "translateY(-2px)" : "translateY(0)",
              boxShadow: hoveredBtn === 'play'
                ? "0 8px 24px rgba(0, 229, 255, 0.4)"
                : "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            ⚡ Play Now
          </button>
          
          <button
            onMouseEnter={() => setHoveredBtn('learn')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={() => document.getElementById('why-section').scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: "16px 32px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.3)",
              background: hoveredBtn === 'learn' ? "rgba(255,255,255,0.1)" : "transparent",
              color: "#fff",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
          maxWidth: 800,
          width: "100%"
        }}>
          {[
            { value: "10,000+", label: "Games Played" },
            { value: "95%", label: "AI Accuracy" },
            { value: "Real-time", label: "Learning" }
          ].map((stat, i) => (
            <div key={i} style={{
              padding: 24,
              background: "rgba(0, 229, 255, 0.05)",
              border: "1px solid rgba(0, 229, 255, 0.2)",
              borderRadius: 16,
              backdropFilter: "blur(10px)"
            }}>
              <div style={{
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 900,
                background: i === 1 ? "linear-gradient(135deg, #b794f6, #f472b6)" : "linear-gradient(135deg, #00e5ff, #00d4e5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 8
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.6)"
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Play Section */}
      <section id="why-section" style={{
        minHeight: "100vh",
        padding: "80px 20px",
        background: "linear-gradient(180deg, #0a1628 0%, #1a1f3a 100%)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: 16
          }}>
            Why Play Our AI Game?
          </h2>
          <p style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 60,
            maxWidth: 700,
            margin: "0 auto 60px"
          }}>
            Experience the perfect blend of classic gameplay and cutting-edge machine learning technology
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 32
          }}>
            {[
              { icon: "🧠", title: "Adaptive AI", desc: "Our neural network learns from every move you make, constantly evolving its strategy to stay ahead." },
              { icon: "⚡", title: "Real-time Response", desc: "Lightning-fast predictions and gameplay with zero lag. The AI thinks faster than you can blink." },
              { icon: "📊", title: "Pattern Recognition", desc: "Advanced algorithms detect your behavioral patterns and adapt strategies dynamically." },
              { icon: "✨", title: "Beautiful Interface", desc: "Stunning visuals and smooth animations make every game a delightful experience." }
            ].map((feature, i) => (
              <div key={i} style={{
                padding: 32,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0, 229, 255, 0.2)",
                borderRadius: 20,
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.2)";
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 20px",
                  background: "linear-gradient(135deg, #00e5ff, #b794f6)",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{
        minHeight: "100vh",
        padding: "80px 20px",
        background: "linear-gradient(180deg, #1a1f3a 0%, #0a1628 100%)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: 16
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 80
          }}>
            Behind the scenes of our intelligent game engine
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 48,
            position: "relative"
          }}>
            {[
              { num: "1", icon: "🎯", title: "Make Your Move", desc: "Choose rock, paper, or scissors. The AI analyzes your choice in milliseconds." },
              { num: "2", icon: "🤖", title: "AI Predicts & Responds", desc: "Our neural network processes your pattern history and makes its counter-move." },
              { num: "3", icon: "🧠", title: "Learning Loop", desc: "The AI adapts and learns from each round, becoming smarter with every game you play." }
            ].map((step, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{
                  width: 80,
                  height: 80,
                  margin: "0 auto 24px",
                  background: "linear-gradient(135deg, #00e5ff, #b794f6)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(0, 229, 255, 0.3)"
                }}>
                  {step.num}
                </div>
                <div style={{
                  fontSize: 48,
                  marginBottom: 16
                }}>
                  {step.icon}
                </div>
                <h3 style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        minHeight: "80vh",
        padding: "80px 20px",
        background: "linear-gradient(135deg, #0a4a5c 0%, #1a1f3a 50%, #5b21b6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          background: "rgba(183, 148, 246, 0.2)",
          border: "1px solid rgba(183, 148, 246, 0.4)",
          borderRadius: 20,
          color: "#b794f6",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 32
        }}>
          ✨ Free to Play
        </div>

        <h2 style={{
          fontSize: "clamp(32px, 7vw, 64px)",
          fontWeight: 900,
          color: "#fff",
          marginBottom: 24,
          lineHeight: 1.2
        }}>
          Ready <span style={{
            background: "linear-gradient(135deg, #00e5ff, #b794f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>to Challenge the AI?</span>
        </h2>

        <p style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 48,
          maxWidth: 600
        }}>
          Test your skills against our machine learning algorithm. Will you find the pattern, or will the AI outsmart you?
        </p>

        <button
          onClick={handlePlayClick}
          onMouseEnter={() => setHoveredBtn('cta')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            padding: "20px 48px",
            borderRadius: 16,
            border: "none",
            background: hoveredBtn === 'cta'
              ? "linear-gradient(135deg, #00e5ff, #b794f6)"
              : "linear-gradient(135deg, #00d4e5, #a78bfa)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredBtn === 'cta' ? "translateY(-4px) scale(1.05)" : "translateY(0) scale(1)",
            boxShadow: hoveredBtn === 'cta'
              ? "0 12px 32px rgba(0, 229, 255, 0.5)"
              : "0 8px 24px rgba(0,0,0,0.3)",
            display: "inline-flex",
            alignItems: "center",
            gap: 12
          }}
        >
          🎮 Start Playing Now
        </button>

        <p style={{
          marginTop: 24,
          fontSize: 14,
          color: "rgba(255,255,255,0.5)"
        }}>
          No signup required • Instant play • 100% free
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px 20px",
        textAlign: "center",
        background: "#0a1628",
        borderTop: "1px solid rgba(0, 229, 255, 0.2)"
      }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          color: "rgba(255,255,255,0.5)"
        }}>
          © 2025 RPS ML Game. Powered by advanced machine learning.
        </p>
      </footer>

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100003,
          animation: "fadeIn 0.3s ease-out"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1f3a 0%, #0a1628 100%)",
            border: "2px solid rgba(0, 229, 255, 0.3)",
            borderRadius: 24,
            padding: "40px",
            maxWidth: "90%",
            width: "400px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "slideUp 0.3s ease-out"
          }}>
            <h2 style={{
              margin: "0 0 24px",
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg, #00e5ff, #b794f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              MozBackgroundClip: "text",
              MozTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              textAlign: "center"
            }}>
              Enter Nickname
            </h2>

            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your nickname..."
              maxLength={20}
              autoFocus
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: 12,
                border: "1px solid rgba(0, 229, 255, 0.3)",
                background: "rgba(0,0,0,0.3)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 500,
                outline: "none",
                marginBottom: 24,
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
            />

            <div style={{
              display: "flex",
              gap: 12,
              justifyContent: "center"
            }}>
              <button
                onClick={() => setShowNicknameModal(false)}
                onMouseEnter={() => setHoveredBtn('cancel')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: hoveredBtn === 'cancel' ? "rgba(255,255,255,0.1)" : "transparent",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleEnterGame}
                onMouseEnter={() => setHoveredBtn('enter')}
                onMouseLeave={() => setHoveredBtn(null)}
                disabled={!nickname.trim()}
                style={{
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "none",
                  background: nickname.trim()
                    ? hoveredBtn === 'enter'
                      ? "linear-gradient(135deg, #00e5ff, #b794f6)"
                      : "linear-gradient(135deg, #00d4e5, #a78bfa)"
                    : "rgba(0, 229, 255, 0.2)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: nickname.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  opacity: nickname.trim() ? 1 : 0.5,
                  boxShadow: hoveredBtn === 'enter' && nickname.trim()
                    ? "0 6px 20px rgba(0, 229, 255, 0.4)"
                    : "none"
                }}
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        * {
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #0a1628;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #00e5ff, #b794f6);
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #00e5ff, #b794f6);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
