import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Button, ProgressBar, Badge, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import axios from 'axios';

function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/');
      return;
    }
    loadExamAndQuestions();
  }, [id]);

  const loadExamAndQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch exam details
      const examRes = await axios.get(`http://localhost:5000/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExam(examRes.data);
      setTimeLeft(examRes.data.duration * 60);

      // Fetch questions
      const questionsRes = await axios.get(`http://localhost:5000/api/questions/exam/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(questionsRes.data);
    } catch (error) {
      console.error('Error loading exam:', error);
      toast.error('Failed to load exam');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            toast.error('Time is up! Submitting...');
            setTimeout(() => submitExam(), 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, questions]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const submitExam = async () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.correct) correctCount++;
    });
    const percentage = (correctCount / questions.length) * 100;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const resultData = {
      userEmail: user.email,
      userName: user.name,
      examId: id,
      examTitle: exam?.title,
      score: percentage,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      answers: answers,
      date: new Date().toISOString()
    };
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/results', resultData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Score: ${Math.round(percentage)}%`);
      navigate('/result', { state: { score: percentage, total: questions.length, correct: correctCount } });
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <Container className="text-center" style={{ minHeight: '60vh', padding: '50px' }}>
        <h3>No questions available for this exam</h3>
        <Button className="btn-premium mt-3" onClick={() => navigate('/exams')}>Back to Exams</Button>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', padding: '30px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Badge bg="primary" className="p-3 fs-6 rounded-pill me-2">{exam.title}</Badge>
              <Badge bg="info" className="p-3 fs-6 rounded-pill">Question {currentQuestion + 1} of {questions.length}</Badge>
            </div>
            <div className="bg-white rounded-pill px-4 py-2 shadow-sm">
              <span className="fw-bold text-danger">⏱️ {formatTime(timeLeft)}</span>
            </div>
          </div>
          <ProgressBar now={progress} className="rounded-pill" style={{ height: '10px' }} />
        </div>

        <Card className="border-0 shadow-lg" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
          <Card.Body className="p-5">
            <h2 className="mb-4 fw-bold">{currentQ.text}</h2>
            {currentQ.options.map((opt, idx) => (
              <div key={idx} className="p-3 mb-3 rounded-3" onClick={() => handleAnswer(currentQ._id, idx)} style={{
                border: answers[currentQ._id] === idx ? '2px solid #6c5ce7' : '2px solid #e0e0e0',
                background: answers[currentQ._id] === idx ? 'rgba(108,92,231,0.1)' : 'white',
                cursor: 'pointer', borderRadius: '12px'
              }}>
                <div className="d-flex align-items-center">
                  <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${answers[currentQ._id] === idx ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '30px', height: '30px' }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="fs-5">{opt}</span>
                  {answers[currentQ._id] === idx && <div className="text-primary ms-auto fs-4">✓</div>}
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between mt-4">
              <Button variant="outline-primary" className="rounded-pill px-4" onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0}>← Previous</Button>
              {currentQuestion === questions.length - 1 ? (
                <Button className="btn-premium px-5" onClick={submitExam}>Submit Quiz ✓</Button>
              ) : (
                <Button className="btn-premium px-5" onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}>Next →</Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Exam;