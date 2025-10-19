import React from 'react';

class AIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for debugging
    console.error('AI Component Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '12px',
          background: 'rgba(255, 107, 107, 0.1)',
          color: '#fff',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '16px' }}>
            🤖 AI System Error
          </h3>
          <p style={{ marginBottom: '16px', opacity: 0.9 }}>
            The AI gesture recognition system encountered an error. This might be due to:
          </p>
          <ul style={{ 
            textAlign: 'left', 
            marginBottom: '20px', 
            paddingLeft: '20px',
            opacity: 0.8 
          }}>
            <li>Network connectivity issues</li>
            <li>Camera permission problems</li>
            <li>AI model loading failure</li>
            <li>Browser compatibility issues</li>
          </ul>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Retry AI System
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Reload Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              background: 'rgba(0,0,0,0.2)',
              padding: '12px',
              borderRadius: '6px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                🔍 Debug Information
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto',
                marginTop: '8px',
                color: '#fca5a5'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AIErrorBoundary;
