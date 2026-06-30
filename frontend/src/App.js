import React, { useState, useMemo} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import QuizPage from './pages/QuizPage';
import Leaderboard from './pages/Leaderboard';

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return { token, user: user ? JSON.parse(user) : null };
  });

  const containerStyle = useMemo(
    () => ({
      maxWidth: 960,
      margin: '0 auto',
      padding: '16px'
    }),
    []
  );

  const setSession = (user, token) => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setAuth({ user, token });
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAuth({ user: null, token: null });
    }
  };

  return (
    <Router>
      <Navbar user={auth.user} onLogout={() => setSession(null, null)} />
      <div style={containerStyle}>
        <Routes>
          <Route path="/" element={<Navigate to={auth.user ? '/dashboard' : '/login'} />} />
          <Route path="/login" element={<Login setSession={setSession} />} />
          <Route path="/register" element={<Register setSession={setSession} />} />
          <Route path="/dashboard" element={auth.user ? <Dashboard user={auth.user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={auth.user?.role === 'admin' ? <AdminDashboard user={auth.user} /> : <Navigate to="/dashboard" />} />
          <Route path="/quiz/:quizId" element={auth.user ? <QuizPage user={auth.user} /> : <Navigate to="/login" />} />
          <Route path="/leaderboard/:quizId" element={auth.user ? <Leaderboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;