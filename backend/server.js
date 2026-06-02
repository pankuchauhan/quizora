const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DIRECT CONNECTION STRING (Already added - No env variable needed)
const MONGODB_URI = 'mongodb+srv://quizora:Panku2910@cluster0.vba3ltt.mongodb.net/quizora_db?retryWrites=true&w=majority';

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// ============ SCHEMAS ============

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  occupation: { type: String, default: 'Student' },
  bio: { type: String, default: 'Quiz enthusiast!' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema, 'users');

// Exam Schema
const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, default: 30 },
  totalQuestions: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['Beginner', 'Medium', 'Advanced'], default: 'Medium' },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema, 'exams');

// Question Schema
const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true }
});

const Question = mongoose.model('Question', questionSchema, 'questions');

// Result Schema
const resultSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  examId: { type: String, required: true },
  examTitle: { type: String },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema, 'results');

// ============ INITIALIZE DEFAULT DATA ============
async function initData() {
  // Create default admin if not exists
  const adminExists = await User.findOne({ email: 'pankuchauhan029@gmail.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('panku@2003', 10);
    const admin = new User({
      name: 'Panku Chauhan',
      email: 'pankuchauhan029@gmail.com',
      password: hashedPassword,
      role: 'admin',
      occupation: 'Administrator',
      bio: 'System Administrator'
    });
    await admin.save();
    console.log('✅ Default Admin Created');
  }

  // Create default exams if not exists
  const examCount = await Exam.countDocuments();
  if (examCount === 0) {
    const defaultExams = [
      { title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'React Professional', description: 'Deep dive into React hooks', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
      { title: 'Node.js Backend', description: 'Build scalable backend', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'Python Programming', description: 'Learn Python basics', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
    ];
    await Exam.insertMany(defaultExams);
    console.log('✅ Default Exams Created');
  }
}

// ============ API ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, occupation, bio } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'student';
    
    const user = new User({ name, email, password, role, occupation, bio });
    await user.save();
    
    const token = jwt.sign({ userId: user._id, role: user.role }, 'quizora_secret', { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id, role: user.role }, 'quizora_secret', { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, 'quizora_secret');
    const user = await User.findById(decoded.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get all exams
app.get('/api/exams', async (req, res) => {
  const exams = await Exam.find({ status: 'active' });
  res.json(exams);
});

// Get exam by ID
app.get('/api/exams/:id', async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
});

// Get questions by exam ID
app.get('/api/questions/exam/:examId', async (req, res) => {
  const questions = await Question.find({ examId: req.params.examId });
  res.json(questions);
});

// Submit result
app.post('/api/results', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get('/api/results/leaderboard', async (req, res) => {
  const leaderboard = await Result.aggregate([
    { $group: {
        _id: '$userEmail',
        userName: { $first: '$userName' },
        avgScore: { $avg: '$score' },
        totalExams: { $sum: 1 },
        bestScore: { $max: '$score' }
      }
    },
    { $sort: { avgScore: -1 } }
  ]);
  res.json(leaderboard);
});

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Admin: Get stats
app.get('/api/admin/stats', async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalExams = await Exam.countDocuments();
  const totalResults = await Result.countDocuments();
  res.json({ totalUsers, totalExams, totalResults });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('🚀 QUIZORA BACKEND RUNNING');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🍃 MongoDB: Connected to Atlas`);
  console.log('='.repeat(50));
  
  await initData();
  
  console.log('\n👑 ADMIN LOGIN:');
  console.log('   Email: pankuchauhan029@gmail.com');
  console.log('   Password: panku@2003');
  console.log('='.repeat(50));
});