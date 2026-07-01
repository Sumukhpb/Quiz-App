import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    flexWrap: 'wrap',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
    gap: 16
  };

  const brandStyle = {
    fontWeight: 800,
    fontSize: 22,
    letterSpacing: -0.5
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: 8,
    transition: 'all 0.2s ease',
    display: 'inline-block',
    fontWeight: 500
  };

  const navContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  };

  const userBadgeStyle = {
    padding: '6px 12px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <nav style={barStyle}>
      <style>{`
        a:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
      `}</style>

      <div style={brandStyle}>
        <Link to="/" style={{ ...linkStyle, padding: 0, fontWeight: 800 }}>
          🧠 QuizApp
        </Link>
      </div>

      <div style={navContainerStyle}>
        {user ? (
          <>
            <div style={userBadgeStyle}>
              {user.role === 'admin' ? '🎓 Admin' : '👤 Student'}
            </div>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            {user?.role === 'admin' ? (
              <Link to="/admin" style={linkStyle}>📊 Admin</Link>
            ) : null}
            <button
              style={buttonStyle}
              onClick={() => {
                onLogout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Sign In</Link>
            <Link
              to="/register"
              style={{
                ...linkStyle,
                background: 'rgba(255, 255, 255, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              Create Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}