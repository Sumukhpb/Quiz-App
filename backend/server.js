const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { redisClient, connectRedis } = require('./config/redis');

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const attemptRoutes = require('./routes/attempt');

dotenv.config();

const app = express();

app.use(cors());                      
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));                


app.get('/health', (req, res) => {
  res.json({ ok: true, redis: redisClient.isOpen, env: 'ok' });
});


app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);

const port = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // try {
  //   await connectRedis();
  // } catch (err) {
  //   console.warn('Redis not available, continuing without leaderboard sync:', err.message);
  // }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
