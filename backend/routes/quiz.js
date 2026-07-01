const express = require('express');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/role');
const { generateQuestions } = require('../utils/ai');

const router = express.Router();

//create a quiz (admin only)
router.post('/', auth, allowRoles('admin'), async (req, res) => {
  try {
    const { title, description, durationMinutes } = req.body || {};
    if (!title || !durationMinutes) {
      return res.status(400).json({ message: 'Title and durationMinutes are required' });
    }
    const quiz = await Quiz.create({
      title,
      description: description || '',
      durationMinutes,
      createdBy: req.user.id
    });
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Create quiz error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/:quizId/questions/bulk', auth, allowRoles('admin'), async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = Array.isArray(req.body) ? req.body : [];
    if (!questions.length) {
      return res.status(400).json({ message: 'Provide an array of questions' });
    }
    for (const q of questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ message: 'Each question requires text and at least 2 options' });
      }
      if (typeof q.correctOptionIndex !== 'number' || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        return res.status(400).json({ message: 'Invalid correctOptionIndex' });
      }
    }
    const docs = questions.map((q) => ({
      quiz: quizId,
      text: q.text,
      options: q.options.map((option) => (typeof option === 'string' ? { text: option } : option)),
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || ''
    }));
    const created = await Question.insertMany(docs);
    res.status(201).json({ inserted: created.length });
  } catch (err) {
    console.error('Bulk questions error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:quizId/questions/ai-generate', auth, allowRoles('admin'), async (req, res) => {
  try {
    const { quizId } = req.params;
    const { topic, count, difficulty } = req.body || {};

    if (!topic) {
      return res.status(400).json({ message: 'A topic is required to generate AI questions.' });
    }

    const generated = await generateQuestions({ topic, count, difficulty });
    const docs = generated.map((q) => ({
      quiz: quizId,
      text: q.text,
      options: q.options.map((option) => (typeof option === 'string' ? { text: option } : option)),
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || ''
    }));

    const created = await Question.insertMany(docs);
    res.status(201).json({ inserted: created.length, questions: generated });
  } catch (err) {
    console.error('AI generate questions error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
    res.json(quizzes);
  } catch (err) {
    console.error('List quizzes error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await Question.find({ quiz: quizId }).sort({ createdAt: 1 }).lean();

    let sanitizedQuestions = questions;
    if (req.user.role === 'student') {
      sanitizedQuestions = questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options
      }));
    }

    res.json({
      quiz,
      questions: sanitizedQuestions
    });
  } catch (err) {
    console.error('Get quiz error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
