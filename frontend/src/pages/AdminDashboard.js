import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard({ user }) {
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
        setMsg('Unable to load quizzes right now.');
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
      setCreateForm({ title: '', description: '', durationMinutes: 10 });
      setMsg('Quiz created. You can add questions below.');
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
      setMsg(e.response?.data?.message || 'Failed to upload questions. Ensure the JSON is valid.');
    }
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.name}. Manage quizzes and upload questions from here.</p>

      <div style={{ marginTop: 20, marginBottom: 24 }}>
        <h3>Create Quiz</h3>
        <form onSubmit={createQuiz} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
          <input placeholder="Title" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
          <input placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
          <input type="number" placeholder="Duration (minutes)" value={createForm.durationMinutes} onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })} />
          <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6 }}>Create Quiz</button>
        </form>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>Bulk Upload Questions</h3>
        <div style={{ marginBottom: 8 }}>
          <label>
            Target Quiz:
            <select value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="">Select quiz</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>{q.title}</option>
              ))}
            </select>
          </label>
        </div>
        <form onSubmit={uploadQuestions} style={{ display: 'grid', gap: 8, maxWidth: 800 }}>
          <textarea rows={8} placeholder='[{"text":"Q1","options":["A","B"],"correctOptionIndex":0}]' value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} />
          <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6 }}>Upload Questions</button>
        </form>
      </div>

      {msg ? <p style={{ color: '#065f46' }}>{msg}</p> : null}

      <div>
        <h3>All Quizzes</h3>
        {loading ? <p>Loading quizzes...</p> : quizzes.length === 0 ? <p>No quizzes created yet.</p> : null}
        {quizzes.map((quiz) => (
          <div key={quiz._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <h4 style={{ margin: '0 0 6px' }}>{quiz.title}</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>{quiz.description || 'No description provided.'}</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280' }}>Duration: {quiz.durationMinutes} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}
