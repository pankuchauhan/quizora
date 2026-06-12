const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage
let users = [];
let results = [];

// Default Admin
users.push({
  id: '1',
  name: 'Admin',
  email: 'admin@quizora.com',
  password: 'admin123',
  role: 'admin'
});

// Default Exams
const exams = [
  { id: '1', title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
  { id: '2', title: 'React Professional', description: 'Deep dive into React hooks', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
  { id: '3', title: 'Node.js Backend', description: 'Build scalable backend', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
  { id: '4', title: 'Python Programming', description: 'Learn Python basics', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
];

// Questions
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
    { id: 3, text: 'What is the purpose of useEffect?', options: ['State management', 'Side effects', 'Routing', 'Styling'], correct: 1 },
    { id: 4, text: 'What is Context API used for?', options: ['State sharing', 'Styling', 'Routing', 'API calls'], correct: 0 },
    { id: 5, text: 'Which company created React?', options: ['Google', 'Facebook', 'Twitter', 'Microsoft'], correct: 1 }
  ],
  '3': [
    { id: 1, text: 'What is Node.js?', options: ['JavaScript Runtime', 'Database', 'Framework', 'Language'], correct: 0 },
    { id: 2, text: 'What is Express.js?', options: ['Framework', 'Database', 'Runtime', 'Compiler'], correct: 0 },
    { id: 3, text: 'Which database is commonly used with Node.js?', options: ['MongoDB', 'MySQL', 'PostgreSQL', 'All of above'], correct: 3 },
    { id: 4, text: 'What is npm?', options: ['Package Manager', 'Framework', 'Database', 'Language'], correct: 0 },
    { id: 5, text: 'What does REST stand for?', options: ['Representational State Transfer', 'Response Transfer', 'Request State', 'None'], correct: 0 }
  ],
  '4': [
    { id: 1, text: 'What is Python?', options: ['Programming Language', 'Database', 'Framework', 'OS'], correct: 0 },
    { id: 2, text: 'What is pip?', options: ['Package Manager', 'Framework', 'IDE', 'Database'], correct: 0 },
    { id: 3, text: 'Which symbol is used for comments in Python?', options: ['//', '#', '/*', '--'], correct: 1 },
    { id: 4, text: 'What is Django?', options: ['Web Framework', 'Database', 'Language', 'OS'], correct: 0 },
    { id: 5, text: 'What is the output of print(2**3)?', options: ['6', '8', '9', '5'], correct: 1 }
  ]
};

// ============ API ROUTES ============

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, occupation, bio } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  const newUser = {
    id: crypto.randomBytes(8).toString('hex'),
    name,
    email,
    password,
    role: users.length === 0 ? 'admin' : 'student',
    occupation: occupation || 'Student',
    bio: bio || 'Quiz enthusiast!'
  };
  users.push(newUser);
  
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, token, user: newUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, token, user });
});

// ✅ GOOGLE LOGIN/REGISTER (Added)
app.post('/api/auth/google', (req, res) => {
  const { email, name, picture } = req.body;
  
  console.log('Google login attempt:', email, name);
  
  let user = users.find(u => u.email === email);
  
  if (!user) {
    const newUser = {
      id: crypto.randomBytes(8).toString('hex'),
      name: name || email.split('@')[0],
      email: email,
      avatar: picture || null,
      password: crypto.randomBytes(16).toString('hex'),
      role: users.length === 0 ? 'admin' : 'student',
      occupation: 'Student',
      bio: 'Joined with Google'
    };
    users.push(newUser);
    user = newUser;
    console.log('✅ New user created via Google:', email);
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  res.json({ 
    success: true, 
    token, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    } 
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  res.json(users[0]);
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
  console.log('Result saved:', req.body.userName, req.body.score);
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

// Admin users
app.get('/api/admin/users', (req, res) => {
  res.json(users);
});

// Admin stats
app.get('/api/admin/stats', (req, res) => {
  res.json({ totalUsers: users.length, totalExams: exams.length, totalResults: results.length });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 QUIZORA BACKEND RUNNING');
  console.log('='.repeat(50));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('👑 ADMIN LOGIN:');
  console.log('   Email: admin@quizora.com');
  console.log('   Password: admin123');
  console.log('='.repeat(50));
});