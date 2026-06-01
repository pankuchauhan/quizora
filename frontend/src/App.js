import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ExamList from './components/ExamList';
import Exam from './components/Exam';
import Result from './components/Result';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import './index.css';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #11998e, #38ef7d)',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            },
          },
        }}
      />
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exam/:id" element={<Exam />} />
          <Route path="/result" element={<Result />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;