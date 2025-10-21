import React, { useEffect, useState } from 'react';

const MobileOptimizations = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [isLandscapeWarning, setIsLandscapeWarning] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    // Handle orientation changes
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
      
      // Show warning for landscape on mobile
      if (isMobile && newOrientation === 'landscape') {
        setIsLandscapeWarning(true);
        setTimeout(() => setIsLandscapeWarning(false), 3000);
      }
    };

    checkMobile();
    handleOrientationChange();

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile]);

  // Prevent zoom on double tap
  useEffect(() => {
    if (isMobile) {
      let lastTouchEnd = 0;
      const preventZoom = (e) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };

      document.addEventListener('touchend', preventZoom, { passive: false });
      
      return () => {
        document.removeEventListener('touchend', preventZoom);
      };
    }
  }, [isMobile]);

  return (
    <div className={`mobile-optimized ${isMobile ? 'is-mobile' : 'is-desktop'} ${orientation}`}>
      {/* Landscape Warning for Mobile */}
      {isLandscapeWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h2>Please Rotate Your Device</h2>
            <p>For the best experience, please use portrait mode</p>
          </div>
        </div>
      )}

      {children}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-optimized.is-mobile {
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-optimized.is-mobile button {
          min-height: 44px;
          min-width: 44px;
        }

        .mobile-optimized.is-mobile .player-content {
          padding: 8px;
        }

        .mobile-optimized.landscape .game-container {
          flex-direction: row;
        }

        .mobile-optimized.portrait .game-container {
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .mobile-optimized .gesture-preview {
            font-size: 12px;
          }
          
          .mobile-optimized .game-controls {
            bottom: 10px;
            padding: 8px;
          }
          
          .mobile-optimized .webcam-feed video {
            max-height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileOptimizations;
