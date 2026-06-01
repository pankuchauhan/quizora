import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { login } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('⚠️ Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success(`✨ Welcome back, ${response.data.user.name}!`);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card style={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div style={{ fontSize: '64px' }}>📝</div>
                  <h1 style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h1>
                  <p className="text-muted">Login to continue your learning journey</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                    {loading ? '🔄 Logging in...' : '✨ Login to Quizora'}
                  </Button>
                </Form>

                <p className="text-center mt-4 text-muted">
                  New to Quizora? <Link to="/register" style={{ color: '#6c5ce7', fontWeight: 'bold' }}>Create Account</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;