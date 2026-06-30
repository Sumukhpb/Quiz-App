import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import QuizCard from '../components/QuizCard';

export default function Dashboard({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ title: '', description: '', durationMinutes: 10 });
  const [bulkJson, setBulkJson] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/quizzes');
        setQuizzes(res.data || []);
      } catch (e) {
        //currently empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createQuiz(e) {
    e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post('/quizzes', createForm);
      setQuizzes((prev) => [res.data, ...prev]);
      setSelectedQuizId(res.data._id);
      setMsg('Quiz created. Now upload questions JSON.');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to create quiz');
    }
  }

  async function uploadQuestions(e) {
    e.preventDefault();
    setMsg('');
    try {
      const data = JSON.parse(bulkJson);
      await axios.post(`/quizzes/${selectedQuizId}/questions/bulk`, data);
      setMsg('Questions uploaded successfully');
      setBulkJson('');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to upload questions (ensure valid JSON)');
    }
  }

  return (
    <div>
      <h2>Welcome, {user.name} ({user.role})</h2>

      {user.role === 'admin' && (
        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <Link to="/admin" style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '8px 12px', borderRadius: 6, textDecoration: 'none' }}>
            Go to Admin Dashboard
          </Link>
        </div>
      )}

      <h3>Available Quizzes</h3>
      {loading ? <p>Loading...</p> : quizzes.length === 0 ? <p>No quizzes yet.</p> : null}
      <div>
        {quizzes.map((q) => <QuizCard key={q._id} quiz={q} />)}
      </div>
    </div>
  );
}