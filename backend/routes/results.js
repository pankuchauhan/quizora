const express = require('express');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const router = express.Router();

// Submit exam result
router.post('/', auth, async (req, res) => {
  try {
    const { examId, score, correctAnswers, totalQuestions, answers } = req.body;
    
    const result = new Result({ userId: req.userId, examId, score, correctAnswers, totalQuestions, answers });
    await result.save();
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's results
router.get('/my-results', auth, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.userId }).populate('examId', 'title').sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await Result.aggregate([
      { $group: { _id: '$userId', averageScore: { $avg: '$score' }, totalExams: { $sum: 1 }, bestScore: { $max: '$score' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', occupation: '$user.occupation', averageScore: { $round: ['$averageScore', 0] }, totalExams: 1, bestScore: { $round: ['$bestScore', 0] } } },
      { $sort: { averageScore: -1 } }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;