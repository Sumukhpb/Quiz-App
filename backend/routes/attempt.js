const express = require('express');
const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/role');
const { redisClient } = require('../config/redis');
const { summarizeAttempt } = require('../utils/ai');

const router = express.Router();

// students start quiz
router.post('/start', auth, allowRoles('student', 'admin'), async (req, res) => {
  try {
    const { quizId } = req.body || {};
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const totalQuestions = await Question.countDocuments({ quiz: quizId });

    const attempt = await Attempt.create({
      user: req.user.id,
      quiz: quizId,
      startedAt: new Date(),
      totalQuestions
    });

    res.status(201).json({
      attemptId: attempt._id,
      startedAt: attempt.startedAt,
      durationMinutes: quiz.durationMinutes
    });
  } catch (err) {
    console.error('Start attempt error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//submit answers and score
router.post('/:attemptId/submit', auth, allowRoles('student', 'admin'), async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'answers array is required' });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your attempt' });
    }
    if (attempt.submittedAt) {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    const quiz = await Quiz.findById(attempt.quiz).lean();
    const allowedSeconds = quiz.durationMinutes * 60;

    const questionIds = answers.map(a => a.questionId);
    const questionDocs = await Question.find({ _id: { $in: questionIds } }).lean();
    const idToQuestion = new Map(questionDocs.map(q => [q._id.toString(), q]));

    let score = 0;
    const evaluated = answers.map((a) => {
      const q = idToQuestion.get(a.questionId);
      if (!q) {
        return { question: a.questionId, selectedIndex: a.selectedIndex, isCorrect: false };
      }
      const isCorrect = Number(a.selectedIndex) === Number(q.correctOptionIndex);
      if (isCorrect) score += 1;
      return { question: a.questionId, selectedIndex: a.selectedIndex, isCorrect };
    });

    const submittedAt = new Date();
    const durationSeconds = Math.floor((submittedAt - attempt.startedAt) / 1000);
    if (durationSeconds > allowedSeconds + 5) {
      score = 0; 
    }

    attempt.submittedAt = submittedAt;
    attempt.durationSeconds = durationSeconds;
    attempt.score = score;
    attempt.answers = evaluated;
    await attempt.save();

    // Update leaderboard in Redis when available
    try {
      const leaderboardKey = `leaderboard:${attempt.quiz.toString()}`;
      if (redisClient.isOpen) {
        await redisClient.zAdd(leaderboardKey, [{ score, value: attempt.user.toString() }]);
      }
    } catch (redisErr) {
      console.warn('Leaderboard update skipped:', redisErr.message);
    }

    const questionDocsForReview = await Question.find({ quiz: attempt.quiz }).sort({ createdAt: 1 }).lean();
    const review = await summarizeAttempt({
      quizTitle: quiz.title,
      questions: questionDocsForReview.map((q) => ({
        ...q,
        options: q.options.map((option) => ({ text: option.text }))
      })),
      answers: evaluated,
      score,
      totalQuestions: attempt.totalQuestions
    });

    res.json({
      attemptId: attempt._id,
      score,
      totalQuestions: attempt.totalQuestions,
      durationSeconds,
      submittedAt,
      review
    });
  } catch (err) {
    console.error('Submit attempt error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//leaderboard - top 10 students
router.get('/leaderboard/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const leaderboardKey = `leaderboard:${quizId}`;
   
    const membersRaw = await redisClient.sendCommand([
        'ZREVRANGE',
        leaderboardKey,
        '0',
        '9',
        'WITHSCORES'
    ]);

    const members = [];
    for (let i = 0; i < membersRaw.length; i += 2) {
    members.push({
        value: membersRaw[i],
        score: parseInt(membersRaw[i + 1], 10)
    });
    }


    const userIds = members.map(m => m.value);
    const users = await User.find({ _id: { $in: userIds } }).select('_id name').lean();
    const idToUser = new Map(users.map(u => [u._id.toString(), u.name]));

    const top = members.map((m, idx) => ({
      rank: idx + 1,
      userId: m.value,
      name: idToUser.get(m.value) || 'Unknown',
      score: m.score
    }));

    res.json({ quizId, top });
  } catch (err) {
    console.error('Leaderboard error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
