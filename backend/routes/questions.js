const express = require('express');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');
const router = express.Router();

// Get questions for an exam
router.get('/exam/:examId', auth, async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add question
router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const question = new Question(req.body);
    await question.save();
    
    const questionCount = await Question.countDocuments({ examId: req.body.examId });
    await Exam.findByIdAndUpdate(req.body.examId, { totalQuestions: questionCount });
    
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update question
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const question = await Question.findById(req.params.id);
    const examId = question.examId;
    
    await Question.findByIdAndDelete(req.params.id);
    
    const questionCount = await Question.countDocuments({ examId });
    await Exam.findByIdAndUpdate(examId, { totalQuestions: questionCount });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;