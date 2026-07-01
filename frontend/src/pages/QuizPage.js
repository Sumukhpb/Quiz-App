import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function QuizPage({ user }) {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [attempt, setAttempt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (submitted) return;
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }))
      };
      const res = await axios.post(`/attempts/${attempt.attemptId}/submit`, payload);
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  }, [answers, attempt, submitted]);

 
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/quizzes/${quizId}`);
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions || []);
        const start = await axios.post('/attempts/start', { quizId });
        setAttempt(start.data);
        setTimeLeft(start.data.durationMinutes * 60);
      } catch (e) {
        navigate('/dashboard');
      }
    })();
  }, [quizId, navigate]);

  
  useEffect(() => {
    if (timeLeft == null || submitted) return;
    if (timeLeft <= 0) {
      onSubmit(); 
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, submitted, onSubmit]);

  const prettyTime = useMemo(() => {
    if (timeLeft == null) return '';
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [timeLeft]);

  function setAnswer(qId, index) {
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  }

  if (!quiz) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{quiz.title}</h2>
        <div style={{ padding: '6px 10px', background: '#111827', color: 'white', borderRadius: 6 }}>Time left: {prettyTime}</div>
      </div>
      <p style={{ color: '#4b5563' }}>{quiz.description}</p>

      {!submitted ? (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
          {questions.map((q, idx) => (
            <div key={q._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{idx + 1}. {q.text}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {q.options.map((opt, i) => (
                  <label key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="radio"
                      name={`q-${q._id}`}
                      checked={answers[q._id] === i}
                      onChange={() => setAnswer(q._id, i)}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 14px', borderRadius: 6, width: 160 }}>
            Submit
          </button>
        </form>
      ) : (
        <div style={{ marginTop: 16 }}>
          <h3>Result</h3>
          {result ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                <p style={{ margin: '0 0 8px' }}>Score: {result.score} / {result.totalQuestions}</p>
                <p style={{ margin: 0 }}>Time used: {Math.round(result.durationSeconds / 60)} minutes</p>
              </div>

              {result.review && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#f8fafc' }}>
                  <h4 style={{ marginTop: 0 }}>✨ AI Review</h4>
                  <p style={{ marginTop: 0 }}>{result.review.summary}</p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div>
                      <strong>Strengths</strong>
                      <ul style={{ margin: '6px 0 0 18px' }}>
                        {(result.review.strengths || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong>Focus areas</strong>
                      <ul style={{ margin: '6px 0 0 18px' }}>
                        {(result.review.focusAreas || []).map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <Link to={`/leaderboard/${quiz._id}`}>View Leaderboard</Link>
            </div>
          ) : (
            <p>Submitted.</p>
          )}
        </div>
      )}
    </div>
  );
}
