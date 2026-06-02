const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/quizora_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' },
  occupation: { type: String, default: 'Student' },
  bio: { type: String, default: 'Quiz enthusiast!' },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema, 'users');

// Exam Schema
const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  totalQuestions: Number,
  difficulty: String,
  status: { type: String, default: 'active' }
});
const Exam = mongoose.model('Exam', examSchema, 'exams');

// Question Schema
const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  text: String,
  options: [String],
  correct: Number
});
const Question = mongoose.model('Question', questionSchema, 'questions');

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
const Result = mongoose.model('Result', resultSchema, 'results');

// ============ INITIALIZE DEFAULT DATA ============
async function initData() {
  // Delete existing users to avoid conflicts
  await User.deleteMany({});
  
  // Create default admin
  const admin = new User({
    name: 'Panku Chauhan',
    email: 'pankuchauhan029@gmail.com',
    password: 'panku@2003',
    role: 'admin',
    occupation: 'Administrator',
    bio: 'System Administrator'
  });
  await admin.save();
  console.log('✅ Default Admin Created');

  // Create default exams
  const examCount = await Exam.countDocuments();
  if (examCount === 0) {
    const exams = await Exam.insertMany([
      { title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'React Professional', description: 'Deep dive into React hooks', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
      { title: 'Node.js Backend', description: 'Build scalable backend', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'Python Programming', description: 'Learn Python basics', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
    ]);
    console.log('✅ Default Exams Created');

    // Create questions
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
    
    const token = jwt.sign({ userId: user._id, role: user.role }, 'quizora_secret', { expiresIn: '7d' });
    
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
    
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id, role: user.role }, 'quizora_secret', { expiresIn: '7d' });
    
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
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, 'quizora_secret');
    const user = await User.findById(decoded.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update profile - FIXED
app.put('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, 'quizora_secret');
    const { name, occupation, bio, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (occupation) updateData.occupation = occupation;
    if (bio) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      user: { 
        name: user.name, 
        email: user.email, 
        occupation: user.occupation, 
        bio: user.bio,
        phone: user.phone
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change password - FIXED
app.put('/api/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, 'quizora_secret');
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message });
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
  res.json(exam);
});

// Get questions
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

// Get user results
app.get('/api/results/my-results', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'quizora_secret');
    const user = await User.findById(decoded.userId);
    const results = await Result.find({ userEmail: user.email });
    res.json(results);
  } catch (error) {
    res.json([]);
  }
});

// Get leaderboard
app.get('/api/results/leaderboard', async (req, res) => {
  const leaderboard = await Result.aggregate([
    {
      $group: {
        _id: '$userEmail',
        userName: { $first: '$userName' },
        avgScore: { $avg: '$score' },
        totalExams: { $sum: 1 },
        bestScore: { $max: '$score' }
      }
    },
    {
      $project: {
        _id: 1,
        userName: 1,
        avgScore: { $round: ['$avgScore', 0] },
        totalExams: 1,
        bestScore: { $round: ['$bestScore', 0] }
      }
    },
    { $sort: { avgScore: -1 } }
  ]);
  res.json(leaderboard);
});

// Admin APIs
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

app.get('/api/admin/stats', async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalExams = await Exam.countDocuments();
  const totalResults = await Result.countDocuments();
  res.json({ totalUsers, totalExams, totalResults });
});

const PORT = 5000;
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('🚀 QUIZORA BACKEND (FIXED)');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  
  await initData();
  
  console.log('\n👑 ADMIN LOGIN:');
  console.log('   Email: pankuchauhan029@gmail.com');
  console.log('   Password: panku@2003');
  console.log('='.repeat(50));
});