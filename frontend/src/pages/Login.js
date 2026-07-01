import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ setSession }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formContainerStyle = {
    maxWidth: 480,
    margin: '40px auto',
    padding: '40px 32px',
    background: 'white',
    borderRadius: 16,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f0f0f0'
  };

  const headerStyle = {
    marginBottom: 32,
    textAlign: 'center'
  };

  const titleStyle = {
    margin: '0 0 8px',
    color: '#1f2937',
    fontSize: 28,
    fontWeight: 700
  };

  const subtitleStyle = {
    margin: 0,
    color: '#6b7280',
    fontSize: 14
  };

  const inputContainerStyle = {
    marginBottom: 20,
    position: 'relative'
  };

  const inputWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 12,
    height: 44,
    background: '#f9fafb',
    transition: 'all 0.2s ease'
  };

  const inputStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: 14,
    fontFamily: 'inherit',
    padding: '8px 12px',
    outline: 'none',
    color: '#1f2937'
  };

  const iconStyle = {
    fontSize: 18,
    marginRight: 8,
    color: '#9ca3af'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 10,
    fontWeight: 600,
    color: '#374151',
    fontSize: 14
  };

  const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 8px',
    color: '#667eea',
    transition: 'color 0.2s ease'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 15,
    transition: 'all 0.2s ease',
    marginBottom: 16,
    marginTop: 8
  };

  const errorStyle = {
    padding: '12px 16px',
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 14,
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    animation: 'slideIn 0.3s ease'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#6b7280'
  };

  const linkStyle = {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.2s ease'
  };

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      setSession(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div style={formContainerStyle}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          outline: none;
        }
        input:focus-within ~ * {
          color: #667eea;
        }
        [style*="display: flex"][style*="align-items: center"]:has(input:focus) {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          background: #f5f3ff !important;
        }
        button:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div style={headerStyle}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Sign in to your account to continue</p>
      </div>

      {err && <div style={errorStyle}>❌ {err}</div>}

      <form onSubmit={onSubmit}>
        <div style={inputContainerStyle}>
          <label style={labelStyle}>📧 Email Address</label>
          <div style={inputWrapperStyle}>
            <span style={iconStyle}>✉️</span>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={inputContainerStyle}>
          <label style={labelStyle}>🔒 Password</label>
          <div style={inputWrapperStyle}>
            <span style={iconStyle}>🔐</span>
            <input
              style={inputStyle}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              style={toggleButtonStyle}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button
          style={buttonStyle}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : '🚀 Sign In'}
        </button>
      </form>

      <div style={footerStyle}>
        Don't have an account?{' '}
        <Link to="/register" style={linkStyle}>Create one</Link>
      </div>
    </div>
  );
}