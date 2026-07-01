import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({ title: '', description: '', durationMinutes: 10 });
  const [bulkJson, setBulkJson] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(4);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/quizzes');
        setQuizzes(res.data || []);
      } catch (e) {
        setMsg('Unable to load quizzes right now.');
        setMsgType('error');
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
      setMsg('✓ Quiz created successfully! Add questions now.');
      setMsgType('success');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to create quiz');
      setMsgType('error');
    }
  }

  async function uploadQuestions(e) {
    e.preventDefault();
    setMsg('');
    try {
      const data = JSON.parse(bulkJson);
      await axios.post(`/quizzes/${selectedQuizId}/questions/bulk`, data);
      setMsg(`✓ Successfully uploaded ${data.length} question(s)!`);
      setMsgType('success');
      setBulkJson('');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to upload questions. Ensure the JSON is valid.');
      setMsgType('error');
    }
  }

  async function generateAiQuestions(e) {
    e.preventDefault();
    setMsg('');
    try {
      const response = await axios.post(`/quizzes/${selectedQuizId}/questions/ai-generate`, {
        topic: aiTopic,
        count: Number(aiCount),
        difficulty: aiDifficulty
      });
      setMsg(`✓ Generated ${response.data.inserted} AI question(s)!`);
      setMsgType('success');
      setAiTopic('');
      setAiCount(4);
      setAiDifficulty('medium');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to generate questions with AI.');
      setMsgType('error');
    }
  }

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '32px 24px',
    borderRadius: 12,
    marginBottom: 32,
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)'
  };

  const tabStyle = {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: 0
  };

  const tabButtonStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    background: 'none',
    fontSize: 16,
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#667eea' : '#6b7280',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #667eea' : 'none',
    marginBottom: '-2px',
    transition: 'all 0.2s ease'
  });

  const cardStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    marginBottom: 24
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: 16,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    fontFamily: 'inherit',
    transition: 'border 0.2s ease, box-shadow 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontWeight: 600,
    color: '#1f2937',
    fontSize: 14
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      },
      secondary: {
        background: '#f3f4f6',
        color: '#1f2937'
      }
    };
    return {
      width: '100%',
      padding: '12px 16px',
      borderRadius: 8,
      border: 'none',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: 14,
      transition: 'all 0.2s ease',
      ...variants[variant]
    };
  };

  const alertStyle = (type) => ({
    padding: '14px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
    background: type === 'success' ? '#d1fae5' : '#fee2e2',
    color: type === 'success' ? '#065f46' : '#991b1b',
    border: `1px solid ${type === 'success' ? '#a7f3d0' : '#fecaca'}`,
    animation: 'slideIn 0.3s ease'
  });

  const quizCardStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      `}</style>

      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 8px' }}>✨ Quiz Management</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Welcome, {user.name}. Create and manage quizzes effortlessly.</p>
      </div>

      {msg && <div style={alertStyle(msgType)}>{msg}</div>}

      <div style={tabStyle}>
        <button
          style={tabButtonStyle(activeTab === 'create')}
          onClick={() => setActiveTab('create')}
        >
          📝 Create Quiz
        </button>
        <button
          style={tabButtonStyle(activeTab === 'upload')}
          onClick={() => setActiveTab('upload')}
        >
          ⬆️ Upload Questions
        </button>
        <button
          style={tabButtonStyle(activeTab === 'ai')}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI Generator
        </button>
        <button
          style={tabButtonStyle(activeTab === 'all')}
          onClick={() => setActiveTab('all')}
        >
          📋 All Quizzes
        </button>
      </div>

      {activeTab === 'create' && (
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 24px', color: '#1f2937' }}>Create New Quiz</h2>
          <form onSubmit={createQuiz}>
            <label style={labelStyle}>Quiz Title</label>
            <input
              style={inputStyle}
              placeholder="e.g., Python Basics"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />

            <label style={labelStyle}>Description</label>
            <input
              style={inputStyle}
              placeholder="Brief description of what the quiz covers..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />

            <label style={labelStyle}>Duration (minutes)</label>
            <input
              style={inputStyle}
              type="number"
              min="1"
              max="240"
              placeholder="10"
              value={createForm.durationMinutes}
              onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })}
              required
            />

            <button type="submit" style={buttonStyle('primary')}>
              ✨ Create Quiz
            </button>
          </form>
        </div>
      )}

      {activeTab === 'upload' && (
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 24px', color: '#1f2937' }}>Upload Questions</h2>
          
          <label style={labelStyle}>Select Target Quiz</label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            style={{
              ...inputStyle,
              appearance: 'none',
              paddingRight: 30,
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '20px'
            }}
            required
          >
            <option value="">Select a quiz...</option>
            {quizzes.map((q) => (
              <option key={q._id} value={q._id}>{q.title}</option>
            ))}
          </select>

          <label style={labelStyle}>Questions JSON</label>
          <textarea
            rows={10}
            placeholder='[{"text":"What is 2+2?","options":["3","4","5"],"correctOptionIndex":1}]'
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            style={{
              ...inputStyle,
              fontFamily: 'monospace',
              fontSize: 12,
              resize: 'vertical'
            }}
            required
          />

          <button
            type="button"
            onClick={uploadQuestions}
            style={buttonStyle('primary')}
            disabled={!selectedQuizId || !bulkJson}
          >
            ⬆️ Upload Questions
          </button>
        </div>
      )}

      {activeTab === 'ai' && (
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 24px', color: '#1f2937' }}>AI Question Generator</h2>
          <p style={{ marginTop: 0, color: '#6b7280' }}>
            Describe a topic and let the app propose quiz questions for the selected quiz.
          </p>

          <label style={labelStyle}>Select Target Quiz</label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            style={{
              ...inputStyle,
              appearance: 'none',
              paddingRight: 30,
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '20px'
            }}
            required
          >
            <option value="">Select a quiz...</option>
            {quizzes.map((q) => (
              <option key={q._id} value={q._id}>{q.title}</option>
            ))}
          </select>

          <label style={labelStyle}>Topic</label>
          <input
            style={inputStyle}
            placeholder="e.g. JavaScript closures"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            required
          />

          <label style={labelStyle}>Number of questions</label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            max="8"
            value={aiCount}
            onChange={(e) => setAiCount(Number(e.target.value))}
          />

          <label style={labelStyle}>Difficulty</label>
          <select
            style={inputStyle}
            value={aiDifficulty}
            onChange={(e) => setAiDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button type="button" onClick={generateAiQuestions} style={buttonStyle('primary')} disabled={!selectedQuizId || !aiTopic}>
            🤖 Generate Questions
          </button>
        </div>
      )}

      {activeTab === 'all' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 8px', color: '#1f2937' }}>All Quizzes</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
              {loading ? 'Loading...' : `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} created`}
            </p>
          </div>

          {loading ? (
            <div style={cardStyle}>
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading quizzes...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div style={cardStyle}>
              <p style={{ textAlign: 'center', color: '#6b7280' }}>📚 No quizzes created yet. Start by creating your first quiz!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {quizzes.map((quiz) => (
                <div key={quiz._id} style={quizCardStyle} onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px', color: '#1f2937', fontSize: 16 }}>
                        📋 {quiz.title}
                      </h4>
                      <p style={{ margin: '4px 0', color: '#6b7280', fontSize: 13 }}>
                        {quiz.description || 'No description provided.'}
                      </p>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#667eea',
                      whiteSpace: 'nowrap',
                      marginLeft: 12
                    }}>
                      ⏱️ {quiz.durationMinutes} min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
