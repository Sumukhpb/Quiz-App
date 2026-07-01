import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ setSession }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSetupToken, setAdminSetupToken] = useState(process.env.REACT_APP_ADMIN_SETUP_TOKEN || 'quiz-admin-setup');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
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

  const toggleContainerStyle = {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    padding: 4,
    background: '#f3f4f6',
    borderRadius: 10
  };

  const toggleButtonStyle = (isActive) => ({
    flex: 1,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

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

  const toggleButtonIconStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 8px',
    color: '#667eea',
    transition: 'color 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#374151',
    fontSize: 14
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
    marginTop: 8,
    marginBottom: 16
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

  const helperTextStyle = {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -16,
    marginBottom: 16,
    fontStyle: 'italic'
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
      const endpoint = isAdmin ? '/auth/create-admin' : '/auth/register';
      const payload = isAdmin ? { name, email, password, adminSetupToken } : { name, email, password };
      const res = await axios.post(endpoint, payload);
      setSession(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
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
        <h2 style={titleStyle}>Create Account</h2>
        <p style={subtitleStyle}>Join us and start taking quizzes</p>
      </div>

      {err && <div style={errorStyle}>❌ {err}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 12px', color: '#374151', fontWeight: 600, fontSize: 14 }}>Account Type</p>
          <div style={toggleContainerStyle}>
            <button
              type="button"
              style={toggleButtonStyle(!isAdmin)}
              onClick={() => setIsAdmin(false)}
            >
              👤 Student
            </button>
            <button
              type="button"
              style={toggleButtonStyle(isAdmin)}
              onClick={() => setIsAdmin(true)}
            >
              🎓 Admin
            </button>
          </div>
        </div>

        <div style={inputContainerStyle}>
          <label style={labelStyle}>👤 Full Name</label>
          <div style={inputWrapperStyle}>
            <span style={iconStyle}>👤</span>
            <input
              style={inputStyle}
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

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
              style={toggleButtonIconStyle}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {isAdmin && (
          <div style={inputContainerStyle}>
            <label style={labelStyle}>🔐 Admin Setup Token</label>
            <div style={inputWrapperStyle}>
              <span style={iconStyle}>🔑</span>
              <input
                style={inputStyle}
                type={showToken ? 'text' : 'password'}
                placeholder="Enter admin token"
                value={adminSetupToken}
                onChange={(e) => setAdminSetupToken(e.target.value)}
                required
              />
              <button
                type="button"
                style={toggleButtonIconStyle}
                onClick={() => setShowToken(!showToken)}
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p style={helperTextStyle}>
              💡 Contact your system administrator for the setup token.
            </p>
          </div>
        )}

        <button
          style={buttonStyle}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : '✨ Create Account'}
        </button>
      </form>

      <div style={footerStyle}>
        Already have an account?{' '}
        <Link to="/login" style={linkStyle}>Sign in</Link>
      </div>
    </div>
  );
}