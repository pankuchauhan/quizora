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

// ============ SCHEMAS ============

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  occupation: { type: String, default: 'Student' },
  bio: { type: String, default: 'Quiz enthusiast!' },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
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
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema, 'exams');

// Question Schema
const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correct: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
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
  answers: { type: Object, default: {} },
  date: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', resultSchema, 'results');

// ============ INITIALIZE DEFAULT DATA ============
async function initData() {
  // Create default admin if not exists
  const adminExists = await User.findOne({ email: 'pankuchauhan029@gmail.com' });
  if (!adminExists) {
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
  }

  // Create default exams if not exists
  const examCount = await Exam.countDocuments();
  if (examCount === 0) {
    const defaultExams = [
      { title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals including ES6+, promises', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'React Professional', description: 'Deep dive into React hooks, context API, state management', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
      { title: 'Node.js Backend', description: 'Build scalable backend applications with Node.js', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
      { title: 'Python Programming', description: 'Learn Python basics to advanced concepts', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
    ];
    
    const exams = await Exam.insertMany(defaultExams);
    console.log('✅ Default Exams Created');

    // Create default questions
    const defaultQuestions = [];
    const questionBank = {
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
      const examQuestions = questionBank[exam.title];
      if (examQuestions) {
        for (const q of examQuestions) {
          defaultQuestions.push({
            examId: exam._id,
            text: q.text,
            options: q.options,
            correct: q.correct
          });
        }
      }
    }
    
    if (defaultQuestions.length > 0) {
      await Question.insertMany(defaultQuestions);
      console.log('✅ Default Questions Created');
    }
  }
}

// ============ API ROUTES ============

// Auth Routes
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
    
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.put('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, 'quizora_secret');
    const { name, occupation, bio, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (occupation) updateData.occupation = occupation;
    if (bio) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    
    const user = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true }).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const decoded = jwt.verify(token, 'quizora_secret');
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(decoded.userId);
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exam Routes
app.get('/api/exams', async (req, res) => {
  const exams = await Exam.find({ status: 'active' });
  res.json(exams);
});

app.get('/api/exams/:id', async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
});

app.post('/api/exams', async (req, res) => {
  try {
    const { title, description, duration, difficulty, status } = req.body;
    const exam = new Exam({ title, description, duration, totalQuestions: 0, difficulty, status: status || 'active' });
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/exams/:id', async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ examId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Question Routes
app.get('/api/questions/exam/:examId', async (req, res) => {
  const questions = await Question.find({ examId: req.params.examId });
  res.json(questions);
});

app.post('/api/questions', async (req, res) => {
  try {
    const { examId, text, options, correct } = req.body;
    const question = new Question({ examId, text, options, correct });
    await question.save();
    
    // Update exam total questions count
    const questionCount = await Question.countDocuments({ examId });
    await Exam.findByIdAndUpdate(examId, { totalQuestions: questionCount });
    
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
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

// Result Routes
app.post('/api/results', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Admin Routes
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.email === 'pankuchauhan029@gmail.com') {
      return res.status(400).json({ error: 'Cannot delete main admin' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ userEmail: user?.email });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalExams = await Exam.countDocuments();
  const totalResults = await Result.countDocuments();
  const results = await Result.find();
  const avgScore = results.length > 0 ? results.reduce((s, r) => s + r.score, 0) / results.length : 0;
  res.json({ totalUsers, totalExams, totalResults, averageScore: Math.round(avgScore) });
});

// Start server
const PORT = 5000;
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log('🚀 QUIZORA BACKEND SERVER');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🍃 Database: MongoDB (quizora_db)`);
  console.log('='.repeat(50));
  
  await initData();
  
  console.log('\n👑 ADMIN LOGIN:');
  console.log('   Email: pankuchauhan029@gmail.com');
  console.log('   Password: panku@2003');
  console.log('\n📝 STUDENT: Register with any email');
  console.log('='.repeat(50));
});