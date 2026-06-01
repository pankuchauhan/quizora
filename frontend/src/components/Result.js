import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import toast from 'react-hot-toast';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const resultData = location.state || JSON.parse(localStorage.getItem('lastResult') || '{}');
  const { score, total, correct } = resultData;

  useEffect(() => {
    if (!score && !total) {
      toast.error('No result found');
      navigate('/exams');
    }
  }, [score, total, navigate]);

  const getMessage = () => {
    if (score >= 90) return { text: '🎉 Excellent! You\'re a genius! 🎉', color: '#27ae60', emoji: '🏆' };
    if (score >= 70) return { text: '🎉 Great job! You passed! 🎉', color: '#3498db', emoji: '⭐' };
    if (score >= 50) return { text: '👍 Good effort! Keep practicing! 👍', color: '#f39c12', emoji: '📚' };
    return { text: '📚 Keep learning! Try again! 📚', color: '#e74c3c', emoji: '💪' };
  };

  const message = getMessage();
  const percentage = Math.round(score || 0);
  const correctAnswers = correct || 0;
  const totalQuestions = total || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 text-center" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="p-5">
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>{message.emoji}</div>
                <h1 className="display-4 fw-bold mb-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quiz Results</h1>
                
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto my-4" style={{ width: '180px', height: '180px', background: `conic-gradient(#6c5ce7 0% ${percentage}%, #e0e0e0 ${percentage}% 100%)`, borderRadius: '50%' }}>
                  <div className="rounded-circle bg-white d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
                    <span className="display-1 fw-bold" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{percentage}%</span>
                  </div>
                </div>

                <div className="text-start bg-light rounded-3 p-4 my-4">
                  <div className="d-flex justify-content-between mb-3">
                    <span>✅ Correct Answers:</span>
                    <span className="fw-bold text-success">{correctAnswers}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>❌ Incorrect Answers:</span>
                    <span className="fw-bold text-danger">{incorrectAnswers}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>📊 Total Questions:</span>
                    <span className="fw-bold">{totalQuestions}</span>
                  </div>
                </div>

                <p className="fs-5 fw-bold mb-4" style={{ color: message.color }}>{message.text}</p>

                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button className="btn-premium px-4 py-2" onClick={() => navigate('/exams')}>Take Another Quiz</Button>
                  <Button variant="outline-primary" className="rounded-pill px-4 py-2" style={{ borderColor: '#6c5ce7', color: '#6c5ce7' }} onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Result;