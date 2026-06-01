import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api, { getCurrentUser, getExams } from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    availableExams: 0,
    completedExams: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/');
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      // Get current user
      const userRes = await getCurrentUser();
      setUser(userRes.data);

      // Get user results
      const resultsRes = await api.get('/results/my-results');
      const results = resultsRes.data;
      
      // Get available exams
      const examsRes = await getExams();
      const availableExams = examsRes.data.length;

      if (results.length > 0) {
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        setStats({
          availableExams,
          completedExams: results.length,
          averageScore: Math.round(avgScore)
        });
      } else {
        setStats({
          availableExams,
          completedExams: 0,
          averageScore: 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 18) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '30px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container className="fade-in-up">
        <Card className="border-0 mb-4 overflow-hidden" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
          <Card.Body className="p-5">
            <Row className="align-items-center">
              <Col md={8}>
                <Badge bg="warning" className="mb-3 px-3 py-2 rounded-pill">🎯 Welcome to Quizora</Badge>
                <h1 className="display-4 fw-bold mb-3">
                  {getGreeting()}, <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name}!</span>
                </h1>
                <p className="lead text-muted mb-4">Ready to test your knowledge and level up your skills today?</p>
                <Button className="btn-premium" size="lg" onClick={() => navigate('/exams')}>🚀 Start Learning Now</Button>
              </Col>
              <Col md={4} className="text-center"><div style={{ fontSize: '80px' }}>📚</div></Col>
            </Row>
          </Card.Body>
        </Card>

        <Row className="mb-4 g-4">
          <Col md={4}>
            <Card className="border-0 h-100" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
                <h3 className="mb-2">Available Exams</h3>
                <p className="display-3 fw-bold mb-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.availableExams}</p>
                <Button variant="outline-primary" className="rounded-pill" onClick={() => navigate('/exams')}>Start Quiz →</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 h-100" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>✅</div>
                <h3 className="mb-2">Exams Completed</h3>
                <p className="display-3 fw-bold mb-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.completedExams}</p>
                <Button variant="outline-primary" className="rounded-pill">View Results →</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 h-100" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="text-center p-4">
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
                <h3 className="mb-2">Average Score</h3>
                <p className="display-3 fw-bold mb-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.averageScore}%</p>
                <Button variant="outline-primary" className="rounded-pill">View Details →</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
          <Card.Body className="p-4">
            <h4 className="mb-4 fw-bold">🕒 Recent Activity</h4>
            {stats.completedExams > 0 ? (
              <div className="d-flex align-items-center p-3 bg-light rounded-3">
                <div className="me-3" style={{ fontSize: '32px' }}>🎯</div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">You have completed {stats.completedExams} exam(s)</h6>
                  <p className="text-muted mb-0 small">Average Score: {stats.averageScore}%</p>
                </div>
                <Button variant="primary" size="sm" className="rounded-pill">View Details</Button>
              </div>
            ) : (
              <div className="text-center p-5">
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📖</div>
                <h5>No exams completed yet</h5>
                <p className="text-muted">Start your first quiz to see your progress here!</p>
                <Button className="btn-premium" onClick={() => navigate('/exams')}>Start Your First Quiz</Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Dashboard;