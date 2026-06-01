const express = require('express');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const totalUsers = await User.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalResults = await Result.countDocuments();
    const avgScore = await Result.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }]);
    
    res.json({ totalUsers, totalExams, totalResults, averageScore: avgScore[0]?.avg?.toFixed(0) || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;