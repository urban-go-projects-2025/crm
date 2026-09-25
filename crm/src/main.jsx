import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRM Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2>Application Rendering Notice</h2>
          <p style={{ color: '#EF4444' }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', background: '#1E293B', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 16 }}
          >
            Reload CRM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
