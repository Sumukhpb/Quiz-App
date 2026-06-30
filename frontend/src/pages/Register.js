import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Register({ setSession }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSetupToken, setAdminSetupToken] = useState(process.env.REACT_APP_ADMIN_SETUP_TOKEN || 'quiz-admin-setup');
  const [isAdmin, setIsAdmin] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const form = { maxWidth: 420, margin: '24px auto' };
  const input = { width: '100%', padding: '10px', marginBottom: 12, borderRadius: 6, border: '1px solid #e5e7eb' };
  const btn = { width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' };
  const error = { color: '#dc2626', marginBottom: 12 };

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    try {
      const endpoint = isAdmin ? '/auth/create-admin' : '/auth/register';
      const payload = isAdmin ? { name, email, password, adminSetupToken } : { name, email, password };
      const res = await axios.post(endpoint, payload);
      setSession(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <form style={form} onSubmit={onSubmit}>
      <h2>Register</h2>
      {err ? <div style={error}>{err}</div> : null}
      <label style={{ marginBottom: 12 }}>
        <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
        {' '}Register as admin
      </label>
      {isAdmin ? <input style={input} placeholder="Admin setup token" value={adminSetupToken} onChange={(e) => setAdminSetupToken(e.target.value)} /> : null}
      <input style={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input style={input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input style={input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button style={btn} type="submit">Create Account</button>
      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}