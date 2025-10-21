import React from 'react';

const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  // Disabled: Hide all error displays
  return null;
  
  if (!error) return null;

  const isStringError = typeof error === 'string';
  const errorMessage = isStringError ? error : error.message;
  const errorDetails = isStringError ? null : error.details;
  const canRetry = isStringError ? true : error.canRetry;
  const actionLabel = isStringError ? 'Try Again' : (error.actionLabel || 'Try Again');
  const isCameraError = isStringError ? false : error.isCameraError;
  const isNetworkError = isStringError ? false : error.isNetworkError;

  const getErrorIcon = () => {
    if (isCameraError) return '📷';
    if (isNetworkError) return '🌐';
    return '⚠️';
  };

  const getErrorColor = () => {
    if (isCameraError) return '#ff9800';
    if (isNetworkError) return '#2196f3';
    return '#f44336';
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9998,
        animation: 'fadeIn 0.2s ease-out'
      }} onClick={onDismiss} />
      
      {/* Floating error popup */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(244, 67, 54, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(244, 67, 54, 0.3)',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        color: 'white',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 10px 40px rgba(244, 67, 54, 0.2)',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out'
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ 
          fontSize: '32px', 
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}>
          {getErrorIcon()}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: '700',
            color: getErrorColor()
          }}>
            {isCameraError ? 'Camera Error' : isNetworkError ? 'Network Error' : 'Error'}
          </h3>
          
          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: '14px', 
            lineHeight: 1.5,
            opacity: 0.9
          }}>
            {errorMessage}
          </p>
          
          {errorDetails && process.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginBottom: '16px',
              fontSize: '12px',
              opacity: 0.7
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Technical Details
              </summary>
              <pre style={{ 
                marginTop: '8px', 
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {errorDetails}
              </pre>
            </details>
          )}
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {canRetry && onRetry && (
              <button
                onClick={onRetry}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(0, 245, 160, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 245, 160, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(0, 245, 160, 0.3)';
                }}
              >
                🔄 {actionLabel}
              </button>
            )}
            
            {isCameraError && (
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔃 Refresh Page
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                ✕ Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { 
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to { 
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }
    `}</style>
    </>
  );
};

export default ErrorDisplay;
