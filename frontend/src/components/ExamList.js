import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import axios from 'axios';

function ExamList() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/');
      return;
    }
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Exams from API:', response.data);
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Beginner') return '#27ae60';
    if (difficulty === 'Medium') return '#f39c12';
    return '#e74c3c';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div style={{ minHeight: '100vh', padding: '50px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Container>
          <h2 className="text-white">No Exams Available</h2>
          <p className="text-white-50">Please check back later.</p>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '30px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">🎯 Available Quizzes</h1>
          <p className="lead text-white-50">Choose a quiz and test your knowledge</p>
        </div>

        <Row className="g-4">
          {exams.map((exam) => (
            <Col md={6} lg={4} key={exam._id || exam.id}>
              <Card className="border-0 h-100" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ fontSize: '48px' }}>📋</div>
                    <Badge style={{ backgroundColor: getDifficultyColor(exam.difficulty) }} className="rounded-pill px-3 py-2">
                      {exam.difficulty}
                    </Badge>
                  </div>
                  <Card.Title className="h4 mb-3 fw-bold">{exam.title}</Card.Title>
                  <Card.Text className="text-muted mb-4" style={{ fontSize: '14px' }}>
                    {exam.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between mb-4">
                    <div><small className="text-muted">Duration</small><br/><strong>⏱️ {exam.duration} mins</strong></div>
                    <div><small className="text-muted">Questions</small><br/><strong>📝 {exam.totalQuestions}</strong></div>
                  </div>
                  <Button 
                    className="w-100 py-2 rounded-pill fw-bold"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}
                    onClick={() => navigate(`/exam/${exam._id || exam.id}`)}
                  >
                    Start Quiz →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default ExamList;