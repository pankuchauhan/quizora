import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import toast from 'react-hot-toast';

function FixName() {
  const navigate = useNavigate();

  const fixName = () => {
    // Get all users
    let users = JSON.parse(localStorage.getItem('quizora_users') || '[]');
    
    // Find and fix Panku's name
    let fixed = false;
    users = users.map(user => {
      if (user.email === 'pankuchauhan029@gmail.com') {
        user.name = 'Panku Chauhan';
        fixed = true;
      }
      return user;
    });
    
    if (fixed) {
      localStorage.setItem('quizora_users', JSON.stringify(users));
      
      // Fix current session
      let currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.email === 'pankuchauhan029@gmail.com') {
        currentUser.name = 'Panku Chauhan';
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      toast.success('✅ Name fixed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      toast.error('User not found. Please login first.');
      setTimeout(() => navigate('/'), 1500);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Row>
        <Col md={12}>
          <Card className="glass-card border-0 text-center p-5">
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔧</div>
            <h2 className="gradient-text mb-3">Fix Your Profile Name</h2>
            <p className="text-muted mb-4">
              Click the button below to fix your name from<br/>
              <strong>"Panku Chauhahn"</strong> to <strong>"Panku Chauhan"</strong>
            </p>
            <Button className="btn-premium px-5 py-3" onClick={fixName}>
              🔧 Fix My Name
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default FixName;