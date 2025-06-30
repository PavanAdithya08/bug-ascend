import express from 'express';
import { createServer, getContext, getServerPort } from '@devvit/server';
import { getRedis } from '@devvit/redis';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, { status: string; message?: string; postId?: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = getContext();

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      res.json({
        status: 'success',
        postId: postId,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      const message =
        error instanceof Error ? error.message : 'Unknown error during initialization';
      res.status(500).json({ status: 'error', message });
    }
  }
);

router.post<{ postId: string }, { status: string; message?: string }, { score: number }>(
  '/api/score',
  async (req, res): Promise<void> => {
    const { score, distance } = req.body;
    const { postId, userId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }
    if (!userId) {
      res.status(400).json({ status: 'error', message: 'Must be logged in' });
      return;
    }
    if (typeof score !== 'number' || score < 0 || typeof distance !== 'number' || distance < 0) {
      res.status(400).json({ status: 'error', message: 'Valid score and distance are required' });
      return;
    }

    try {
      // Handle personal best
      const personalBestKey = `user_pb:${postId}:${userId}`;
      const currentPersonalBestStr = await redis.get(personalBestKey);
      
      let shouldUpdatePersonalBest = true;
      if (currentPersonalBestStr) {
        const currentPersonalBest = JSON.parse(currentPersonalBestStr);
        // Only update if new score is higher, or score is equal but distance is higher
        shouldUpdatePersonalBest = score > currentPersonalBest.score || 
                                 (score === currentPersonalBest.score && distance > currentPersonalBest.distance);
      }
      
      if (shouldUpdatePersonalBest) {
        await redis.set(personalBestKey, JSON.stringify({ score, distance }));
      }
      
      // Handle global leaderboard using sorted set
      const globalLeaderboardKey = `global_leaderboard:${postId}`;
      const memberData = JSON.stringify({ userId, score, distance });
      
      // Add to sorted set (score is the sort value)
      await redis.zadd(globalLeaderboardKey, { score: score, member: memberData });
      
      // Keep only top 100 entries to prevent unlimited growth
      const totalEntries = await redis.zcard(globalLeaderboardKey);
      if (totalEntries > 100) {
        await redis.zremrangebyrank(globalLeaderboardKey, 0, totalEntries - 101);
      }
      
      res.json({ status: 'success' });
    } catch (error) {
      console.error(`API Score Error for post ${postId}:`, error);
      res.status(500).json({ status: 'error', message: 'Failed to save score' });
    }
  }
);

router.get<{ postId: string }, { 
  status: string; 
  message?: string; 
  personalBest?: { score: number; distance: number };
  globalTopScores?: Array<{ userId: string; score: number; distance: number }>;
}>(
  '/api/highscore',
  async (_req, res): Promise<void> => {
    const { postId, userId } = getContext();
    const redis = getRedis();

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }
    if (!userId) {
      res.status(400).json({ status: 'error', message: 'Must be logged in' });
      return;
    }

    try {
      // Get personal best
      const personalBestKey = `user_pb:${postId}:${userId}`;
      const personalBestStr = await redis.get(personalBestKey);
      const personalBest = personalBestStr ? 
        JSON.parse(personalBestStr) : 
        { score: 0, distance: 0 };
      
      // Get global top scores
      const globalLeaderboardKey = `global_leaderboard:${postId}`;
      const topEntries = await redis.zrevrange(globalLeaderboardKey, 0, 2, { withScores: true });
      
      const globalTopScores = topEntries.map(entry => {
        try {
          return JSON.parse(entry.member);
        } catch (e) {
          // Fallback for malformed entries
          return { userId: 'unknown', score: entry.score, distance: 0 };
        }
      });
      
      res.json({ 
        status: 'success', 
        personalBest,
        globalTopScores
      });
    } catch (error) {
      console.error(`API High Score Error for post ${postId}:`, error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch high scores' });
    }
  }
);

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));
