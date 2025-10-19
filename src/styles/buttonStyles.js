// Enhanced button styles with better visual feedback

export const buttonStyles = {
  primary: {
    base: {
      padding: '16px 32px',
      borderRadius: '16px',
      border: 'none',
      fontWeight: '700',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff'
    },
    hover: {
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
    },
    active: {
      transform: 'translateY(0) scale(0.98)',
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
    }
  },

  secondary: {
    base: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    hover: {
      background: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      transform: 'translateY(-1px)',
    }
  },

  success: {
    base: {
      padding: '16px 32px',
      borderRadius: '16px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
    },
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
    }
  },

  danger: {
    base: {
      padding: '16px 32px',
      borderRadius: '16px',
      border: 'none',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
    },
    hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(239, 68, 68, 0.4)',
    }
  },

  floating: {
    base: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      fontSize: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
      zIndex: 1000,
    },
    hover: {
      transform: 'scale(1.1) rotate(5deg)',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
    }
  }
};

// Utility function to apply button styles
export const applyButtonStyle = (type = 'primary', state = 'base') => {
  const style = buttonStyles[type];
  if (!style) return buttonStyles.primary.base;
  
  return {
    ...style.base,
    ...(state !== 'base' && style[state] ? style[state] : {})
  };
};

// Enhanced button component
export const EnhancedButton = ({ 
  children, 
  type = 'primary', 
  onClick, 
  disabled = false,
  loading = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const getButtonStyle = () => {
    if (disabled) return applyButtonStyle(type, 'disabled');
    if (isPressed) return applyButtonStyle(type, 'active');
    if (isHovered) return applyButtonStyle(type, 'hover');
    return applyButtonStyle(type, 'base');
  };

  return (
    <button
      style={getButtonStyle()}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading...
        </div>
      ) : children}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
