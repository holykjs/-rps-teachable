import React, { useState, useEffect } from 'react';

const Toast = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 4000, 
  onClose,
  action = null 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    const baseStyle = {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '2px solid',
      borderRadius: '16px'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          borderColor: 'rgba(0, 245, 160, 0.5)',
          background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.2), rgba(0, 217, 245, 0.1))'
        };
      case 'error':
        return {
          ...baseStyle,
          borderColor: 'rgba(255, 107, 107, 0.5)',
          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 87, 34, 0.1))'
        };
      case 'warning':
        return {
          ...baseStyle,
          borderColor: 'rgba(255, 193, 7, 0.5)',
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.1))'
        };
      default:
        return {
          ...baseStyle,
          borderColor: 'rgba(102, 126, 234, 0.5)',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.1))'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
        opacity: isExiting ? 0 : 1,
        transition: 'all 0.3s ease',
        ...getTypeStyles(),
        padding: '16px 20px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '18px', flexShrink: 0 }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: action ? '8px' : '0' }}>
            {message}
          </div>
          
          {action && (
            <button
              onClick={action.onClick}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: 'white',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: 0.7,
            padding: '0',
            marginLeft: '8px',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = 1;
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = 0.7;
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, options.duration || 4000);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 80}px`,
            right: '20px',
            zIndex: 10000
          }}
        >
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return {
    addToast,
    removeToast,
    ToastContainer,
    success: (message, options) => addToast(message, 'success', options),
    error: (message, options) => addToast(message, 'error', options),
    warning: (message, options) => addToast(message, 'warning', options),
    info: (message, options) => addToast(message, 'info', options)
  };
};

export default Toast;
