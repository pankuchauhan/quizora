const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

let users = [];
let results = [];

// Default Admin
users.push({
  id: '1',
  name: 'Panku Chauhan',
  email: 'pankuchauhan029@gmail.com',
  password: 'panku@2003',
  role: 'admin'
});

// Default Exams
const exams = [
  { id: '1', title: 'JavaScript Mastery', description: 'Master JavaScript fundamentals', duration: 30, totalQuestions: 5, difficulty: 'Medium' },
  { id: '2', title: 'React Professional', description: 'Deep dive into React hooks', duration: 45, totalQuestions: 5, difficulty: 'Advanced' },
  { id: '3', title: 'Node.js Backend', description: 'Build scalable backend', duration: 40, totalQuestions: 5, difficulty: 'Medium' },
  { id: '4', title: 'Python Programming', description: 'Learn Python basics', duration: 35, totalQuestions: 5, difficulty: 'Beginner' }
];

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  const newUser = {
    id: crypto.randomBytes(8).toString('hex'),
    name,
    email,
    password,
    role: users.length === 0 ? 'admin' : 'student'
  };
  users.push(newUser);
  
  res.json({ success: true, token: 'mock-token', user: newUser });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ success: true, token: 'mock-token', user });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  res.json(users[0]);
});

// Get exams
app.get('/api/exams', (req, res) => {
  res.json(exams);
});

// Get exam by ID
app.get('/api/exams/:id', (req, res) => {
  const exam = exams.find(e => e.id === req.params.id);
  res.json(exam);
});

// Get questions
app.get('/api/questions/exam/:examId', (req, res) => {
  const questions = [
    { id: 1, text: 'What is React?', options: ['Library', 'Framework', 'Language', 'Database'], correct: 0 },
    { id: 2, text: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax', 'JS Extension', 'XML'], correct: 0 },
    { id: 3, text: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1 },
    { id: 4, text: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correct: 2 },
    { id: 5, text: 'Which company developed React?', options: ['Google', 'Facebook', 'Twitter', 'Microsoft'], correct: 1 }
  ];
  res.json(questions);
});

// Submit result
app.post('/api/results', (req, res) => {
  results.push(req.body);
  res.json({ success: true });
});

// Get user results
app.get('/api/results/my-results', (req, res) => {
  res.json([]);
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
  console.log('✅ Server running on port 5000');
  console.log('Admin: pankuchauhan029@gmail.com / panku@2003');
});