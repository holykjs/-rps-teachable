import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center',
            color: 'white',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>😵</div>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '24px', 
              fontWeight: '700',
              color: '#ff6b6b'
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{ 
              margin: '0 0 24px 0', 
              opacity: 0.8, 
              lineHeight: 1.6,
              fontSize: '16px'
            }}>
              The application encountered an unexpected error. This might be due to:
            </p>
            <ul style={{ 
              textAlign: 'left', 
              margin: '0 0 24px 0', 
              opacity: 0.7,
              fontSize: '14px',
              lineHeight: 1.5
            }}>
              <li>Network connectivity issues</li>
              <li>Browser compatibility problems</li>
              <li>Temporary server issues</li>
            </ul>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(0, 245, 160, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 40px rgba(0, 245, 160, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 32px rgba(0, 245, 160, 0.3)';
                }}
              >
                🔄 Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
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
                🔃 Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '24px', 
                textAlign: 'left',
                background: 'rgba(255, 0, 0, 0.1)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 0, 0, 0.3)'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#ff6b6b' }}>
                  🐛 Developer Info
                </summary>
                <pre style={{ 
                  fontSize: '12px', 
                  overflow: 'auto', 
                  marginTop: '8px',
                  color: '#ffcccb'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
