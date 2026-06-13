const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// ============ DATA STORAGE ============
let users = [];
let results = [];

// ============ ONLY ONE ADMIN (Hardcoded) ============
const ADMIN_EMAIL = 'pankuchauhan029@gmail.com';
const ADMIN_PASSWORD = 'panku@2003';
const ADMIN_NAME = 'Panku Chauhan';

// ============ EXAMS ============
const exams = [
  { id: '1', title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
  { id: '2', title: 'React Professional', description: 'Deep dive into React hooks', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
  { id: '3', title: 'Node.js Backend', description: 'Build scalable backend', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
  { id: '4', title: 'Python Programming', description: 'Learn Python basics', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
];

// ============ QUESTIONS ============
const questions = {
  '1': [
    { id: 1, text: 'What is React?', options: ['Library', 'Framework', 'Language', 'Database'], correct: 0 },
    { id: 2, text: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax', 'JS Extension', 'XML'], correct: 0 },
    { id: 3, text: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1 },
    { id: 4, text: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correct: 2 },
    { id: 5, text: 'Which company developed React?', options: ['Google', 'Facebook', 'Twitter', 'Microsoft'], correct: 1 }
  ],
  '2': [
    { id: 1, text: 'What is a React Hook?', options: ['Function', 'Class', 'Component', 'API'], correct: 0 },
    { id: 2, text: 'Which hook is used for state?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correct: 1 },
    { id: 3, text: 'What is purpose of useEffect?', options: ['State management', 'Side effects', 'Routing', 'Styling'], correct: 1 },
    { id: 4, text: 'What is Context API used for?', options: ['State sharing', 'Styling', 'Routing', 'API calls'], correct: 0 },
    { id: 5, text: 'Which company created React?', options: ['Google', 'Facebook', 'Twitter', 'Microsoft'], correct: 1 }
  ],
  '3': [
    { id: 1, text: 'What is Node.js?', options: ['JavaScript Runtime', 'Database', 'Framework', 'Language'], correct: 0 },
    { id: 2, text: 'What is Express.js?', options: ['Framework', 'Database', 'Runtime', 'Compiler'], correct: 0 },
    { id: 3, text: 'Which database with Node.js?', options: ['MongoDB', 'MySQL', 'PostgreSQL', 'All'], correct: 3 },
    { id: 4, text: 'What is npm?', options: ['Package Manager', 'Framework', 'Database', 'Language'], correct: 0 },
    { id: 5, text: 'What does REST stand for?', options: ['Representational State Transfer', 'Response Transfer', 'Request State', 'None'], correct: 0 }
  ],
  '4': [
    { id: 1, text: 'What is Python?', options: ['Programming Language', 'Database', 'Framework', 'OS'], correct: 0 },
    { id: 2, text: 'What is pip?', options: ['Package Manager', 'Framework', 'IDE', 'Database'], correct: 0 },
    { id: 3, text: 'Comments in Python?', options: ['//', '#', '/*', '--'], correct: 1 },
    { id: 4, text: 'What is Django?', options: ['Web Framework', 'Database', 'Language', 'OS'], correct: 0 },
    { id: 5, text: 'print(2**3) output?', options: ['6', '8', '9', '5'], correct: 1 }
  ]
};

// ============ API ROUTES ============

// Register - Only students can register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, occupation, bio } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Check if trying to register with admin email
  if (email === ADMIN_EMAIL) {
    return res.status(400).json({ error: 'This email is reserved for admin. Please use different email.' });
  }
  
  const newUser = {
    id: crypto.randomBytes(8).toString('hex'),
    name,
    email,
    password,
    role: 'student',
    occupation: occupation || 'Student',
    bio: bio || 'Quiz enthusiast!'
  };
  users.push(newUser);
  
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, token, user: newUser });
});

// Login - Check for admin first, then students
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Check for specific admin first
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminUser = {
      id: 'admin_001',
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin'
    };
    const token = crypto.randomBytes(32).toString('hex');
    return res.json({ success: true, token, user: adminUser });
  }
  
  // Check for regular students
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, token, user });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  // Return first user or admin
  const adminUser = { id: 'admin_001', name: ADMIN_NAME, email: ADMIN_EMAIL, role: 'admin' };
  res.json(adminUser);
});

// Get all exams
app.get('/api/exams', (req, res) => {
  res.json(exams);
});

// Get single exam
app.get('/api/exams/:id', (req, res) => {
  const exam = exams.find(e => e.id === req.params.id);
  res.json(exam);
});

// Get questions by exam
app.get('/api/questions/exam/:examId', (req, res) => {
  const examQuestions = questions[req.params.examId] || questions['1'];
  res.json(examQuestions);
});

// Submit result
app.post('/api/results', (req, res) => {
  results.push(req.body);
  console.log('✅ Result saved:', req.body.userName, req.body.score);
  res.json({ success: true });
});

// Get leaderboard
app.get('/api/results/leaderboard', (req, res) => {
  const leaderboard = users.map(user => {
    const userResults = results.filter(r => r.userEmail === user.email);
    const avgScore = userResults.length > 0 ? userResults.reduce((s, r) => s + r.score, 0) / userResults.length : 0;
    return {
      _id: user.email,
      userName: user.name,
      avgScore: Math.round(avgScore),
      totalExams: userResults.length,
      bestScore: userResults.length > 0 ? Math.max(...userResults.map(r => r.score)) : 0
    };
  }).filter(u => u.totalExams > 0);
  res.json(leaderboard);
});

// Admin - Get all users
app.get('/api/admin/users', (req, res) => {
  res.json(users);
});

// Admin - Get stats
app.get('/api/admin/stats', (req, res) => {
  res.json({ 
    totalUsers: users.length, 
    totalExams: exams.length, 
    totalResults: results.length 
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 QUIZORA BACKEND RUNNING');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('👑 ADMIN LOGIN (ONLY ONE):');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('='.repeat(50));
  console.log('📝 STUDENT LOGIN:');
  console.log('   Register with any email (except admin email)');
  console.log('='.repeat(50));
});