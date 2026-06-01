import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { register } from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('⚠️ Please fill all required fields');
      return;
    }

    if (name.length < 3) {
      toast.error('👤 Name must be at least 3 characters');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('📧 Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('🔒 Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('❌ Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await register({ 
        name, 
        email, 
        password, 
        occupation: occupation || 'Student',
        bio: bio || 'Quiz enthusiast!'
      });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success('🎉 Account created successfully!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card style={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{ fontSize: '64px' }}>📝</div>
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Join Quizora</h1>
                  <p className="text-muted">Start your learning journey today</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Occupation (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Student, Developer, Teacher"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Bio (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password *</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password *</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '50px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      color: 'white'
                    }}
                  >
                    {loading ? '🔄 Creating Account...' : '✨ Create Account'}
                  </Button>
                </Form>

                <p className="text-center mt-4 text-muted">
                  Already have an account? <Link to="/" style={{ color: '#6c5ce7', fontWeight: 'bold' }}>Login here</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;