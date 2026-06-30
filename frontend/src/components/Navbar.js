import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const barStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#1f2937',
    color: 'white',
    flexWrap: 'wrap'
  };

  const brandStyle = { fontWeight: 700, fontSize: 18 };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 8px'
  };

  const buttonStyle = {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer'
  };

  return (
    <nav style={barStyle}>
      <div style={brandStyle}>
        <Link to="/" style={{ ...linkStyle, fontWeight: 800 }}>QuizApp</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            {user?.role === 'admin' ? <Link to="/admin" style={linkStyle}>Admin</Link> : null}
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
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}