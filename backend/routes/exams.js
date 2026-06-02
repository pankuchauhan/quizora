const express = require('express');
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all active exams
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single exam
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create exam
router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const exam = new Exam({ ...req.body, createdBy: req.userId });
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update exam
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete exam
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;