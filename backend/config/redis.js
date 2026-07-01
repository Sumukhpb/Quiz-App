// Redis client for leaderboard and caching
const redis = require('redis');

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = redis.createClient({ url });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connecting...'));
redisClient.on('ready', () => console.log('Redis ready'));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

module.exports = { redisClient, connectRedis, disconnectRedis };
