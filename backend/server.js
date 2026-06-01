const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Error:', err));

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

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Exam Schema
const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  totalQuestions: Number,
  difficulty: String,
  status: { type: String, default: 'active' }
});
const Exam = mongoose.model('Exam', examSchema);

// Question Schema
const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  text: String,
  options: [String],
  correct: Number
});
const Question = mongoose.model('Question', questionSchema);

// Result Schema
const resultSchema = new mongoose.Schema({
  userEmail: String,
  userName: String,
  examId: String,
  examTitle: String,
  score: Number,
  correctAnswers: Number,
  totalQuestions: Number,
  date: { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', resultSchema);

// ============ INITIALIZE DEFAULT DATA ============
async function initData() {
  // Create default admin
  const adminExists = await User.findOne({ email: 'pankuchauhan029@gmail.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('panku@2003', 10);
    await User.create({
      name: 'Panku Chauhan',
      email: 'pankuchauhan029@gmail.com',
      password: hashedPassword,
      role: 'admin',
      occupation: 'Administrator',
      bio: 'System Administrator'
    });
    console.log('✅ Default Admin Created');
  }

  // Create default exams
  const examCount = await Exam.countDocuments();
  if (examCount === 0) {
    const exams = await Exam.insertMany([
      { title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals including ES6+, promises', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'React Professional', description: 'Deep dive into React hooks, context API, state management', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
      { title: 'Node.js Backend', description: 'Build scalable backend applications with Node.js', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'Python Programming', description: 'Learn Python basics to advanced concepts', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
    ]);
    console.log('✅ Default Exams Created');

    // Create questions for each exam
    const questions = [];
    const questionData = {
      'JavaScript Mastery': [
        { text: 'What is React?', options: ['JavaScript Library', 'Programming Language', 'Database', 'Framework'], correct: 0 },
        { text: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax', 'JS Extension', 'XML'], correct: 0 },
        { text: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1 },
        { text: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correct: 2 },
        { text: 'Which company developed React?', options: ['Google', 'Facebook', 'Twitter', 'Microsoft'], correct: 1 }
      ],
      'React Professional': [
        { text: 'What is a React Hook?', options: ['Function', 'Class', 'Component', 'API'], correct: 0 },
        { text: 'Which hook is used for state?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correct: 1 },
        { text: 'What is the purpose of useEffect?', options: ['State management', 'Side effects', 'Routing', 'Styling'], correct: 1 },
        { text: 'What is Context API used for?', options: ['State sharing', 'Styling', 'Routing', 'API calls'], correct: 0 },
        { text: 'Which company created React?', options: ['Google', 'Facebook', 'Twitter', 'Microsoft'], correct: 1 }
      ],
      'Node.js Backend': [
        { text: 'What is Node.js?', options: ['JavaScript Runtime', 'Database', 'Framework', 'Language'], correct: 0 },
        { text: 'What is Express.js?', options: ['Framework', 'Database', 'Runtime', 'Compiler'], correct: 0 },
        { text: 'Which database is commonly used with Node.js?', options: ['MongoDB', 'MySQL', 'PostgreSQL', 'All of above'], correct: 3 },
        { text: 'What is npm?', options: ['Package Manager', 'Framework', 'Database', 'Language'], correct: 0 },
        { text: 'What does REST stand for?', options: ['Representational State Transfer', 'Response Transfer', 'Request State', 'None'], correct: 0 }
      ],
      'Python Programming': [
        { text: 'What is Python?', options: ['Programming Language', 'Database', 'Framework', 'OS'], correct: 0 },
        { text: 'What is pip?', options: ['Package Manager', 'Framework', 'IDE', 'Database'], correct: 0 },
        { text: 'Which symbol is used for comments in Python?', options: ['//', '#', '/*', '--'], correct: 1 },
        { text: 'What is Django?', options: ['Web Framework', 'Database', 'Language', 'OS'], correct: 0 },
        { text: 'What is the output of print(2**3)?', options: ['6', '8', '9', '5'], correct: 1 }
      ]
    };

    for (const exam of exams) {
      const examQuestions = questionData[exam.title];
      for (const q of examQuestions) {
        questions.push({
          examId: exam._id,
          text: q.text,
          options: q.options,
          correct: q.correct
        });
      }
    }
    await Question.insertMany(questions);
    console.log('✅ Default Questions Created');
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
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
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
    
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get all exams
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find({ status: 'active' });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get exam by ID
app.get('/api/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get questions by exam ID
app.get('/api/questions/exam/:examId', async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  try {
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalResults = await Result.countDocuments();
    res.json({ totalUsers, totalExams, totalResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('🚀 QUIZORA PROFESSIONAL BACKEND');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🍃 Database: MongoDB (${process.env.MONGODB_URI})`);
  console.log('='.repeat(50));
  
  await initData();
  
  console.log('\n👑 ADMIN LOGIN:');
  console.log('   Email: pankuchauhan029@gmail.com');
  console.log('   Password: panku@2003');
  console.log('\n📝 STUDENT: Register with any email');
  console.log('='.repeat(50));
});