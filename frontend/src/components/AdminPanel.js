import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Nav, Tab, Alert, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examForm, setExamForm] = useState({ title: '', description: '', duration: 30, difficulty: 'Medium', status: 'active' });
  const [questionForm, setQuestionForm] = useState({ text: '', options: ['', '', '', ''], correct: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      navigate('/');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Admin access only');
      navigate('/dashboard');
      return;
    }
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersRes = await api.get('/admin/users');
      const examsRes = await api.get('/exams');
      setUsers(usersRes.data);
      setExams(examsRes.data);
      
      if (selectedExam) {
        const questionsRes = await api.get(`/questions/exam/${selectedExam._id}`);
        setQuestions(questionsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async () => {
    if (!examForm.title || !examForm.description) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const response = await api.post('/exams', examForm);
      toast.success('Exam added successfully');
      setShowExamModal(false);
      setExamForm({ title: '', description: '', duration: 30, difficulty: 'Medium', status: 'active' });
      loadData();
    } catch (error) {
      toast.error('Failed to add exam');
    }
  };

  const handleDeleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await api.delete(`/exams/${id}`);
        toast.success('Exam deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete exam');
      }
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    
    if (!questionForm.text || questionForm.options.some(opt => !opt)) {
      toast.error('Please fill all question fields');
      return;
    }
    
    try {
      await api.post('/questions', {
        examId: selectedExam._id,
        text: questionForm.text,
        options: questionForm.options,
        correct: questionForm.correct
      });
      
      toast.success('Question added successfully');
      setShowQuestionModal(false);
      setQuestionForm({ text: '', options: ['', '', '', ''], correct: 0 });
      loadData();
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/questions/${id}`);
        toast.success('Question deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
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
        <div className="text-center mb-5">
          <div style={{ fontSize: '64px' }}>👑</div>
          <h1 className="display-4 fw-bold text-white mb-3">Admin Panel</h1>
          <p className="lead text-white-50">Manage users, exams, and questions</p>
        </div>

        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Row>
            <Col md={3} className="mb-4">
              <Card style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                <Card.Body className="p-3">
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item><Nav.Link eventKey="dashboard">📊 Dashboard</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="exams">📚 Exams Management</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="questions">❓ Questions Management</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link eventKey="users">👥 Users</Nav.Link></Nav.Item>
                  </Nav>
                </Card.Body>
              </Card>
            </Col>

            <Col md={9}>
              <Tab.Content>
                <Tab.Pane eventKey="dashboard">
                  <Card style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                      <h3>Dashboard</h3>
                      <Row className="mt-4">
                        <Col md={4}><Card><Card.Body className="text-center"><h2>{users.length}</h2><p>Users</p></Card.Body></Card></Col>
                        <Col md={4}><Card><Card.Body className="text-center"><h2>{exams.length}</h2><p>Exams</p></Card.Body></Card></Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                <Tab.Pane eventKey="exams">
                  <Card style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between mb-4">
                        <h3>Exams</h3>
                        <Button className="btn-premium" onClick={() => setShowExamModal(true)}>+ Add Exam</Button>
                      </div>
                      <Table responsive striped hover>
                        <thead><tr><th>Title</th><th>Description</th><th>Duration</th><th>Difficulty</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                          {exams.map((exam) => (
                            <tr key={exam._id}>
                              <td>{exam.title}</td>
                              <td>{exam.description?.substring(0, 50)}...</td>
                              <td>{exam.duration} min</td>
                              <td><Badge bg="info">{exam.difficulty}</Badge></td>
                              <td><Badge bg={exam.status === 'active' ? 'success' : 'secondary'}>{exam.status}</Badge></td>
                              <td><Button variant="danger" size="sm" onClick={() => handleDeleteExam(exam._id)}>Delete</Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                <Tab.Pane eventKey="questions">
                  <Card style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between mb-4">
                        <h3>Questions</h3>
                        <div className="d-flex gap-2">
                          <Form.Select value={selectedExam?._id || ''} onChange={(e) => {
                            const exam = exams.find(ex => ex._id === e.target.value);
                            setSelectedExam(exam);
                            if (exam) loadData();
                          }} style={{ width: '200px' }}>
                            <option value="">Select Exam</option>
                            {exams.map(exam => <option key={exam._id} value={exam._id}>{exam.title}</option>)}
                          </Form.Select>
                          <Button className="btn-premium" onClick={() => setShowQuestionModal(true)} disabled={!selectedExam}>+ Add Question</Button>
                        </div>
                      </div>
                      
                      {selectedExam ? (
                        questions.length > 0 ? questions.map((q, idx) => (
                          <Card key={q._id} className="mb-3">
                            <Card.Body>
                              <div className="d-flex justify-content-between">
                                <div><strong>Q{idx + 1}.</strong> {q.text}</div>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteQuestion(q._id)}>Delete</Button>
                              </div>
                            </Card.Body>
                          </Card>
                        )) : <Alert variant="info">No questions yet. Add some!</Alert>
                      ) : <Alert variant="warning">Select an exam first</Alert>}
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                <Tab.Pane eventKey="users">
                  <Card style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                      <h3>Users</h3>
                      <Table responsive striped hover>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td><Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>{user.role}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>

        {/* Add Exam Modal */}
        <Modal show={showExamModal} onHide={() => setShowExamModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Add New Exam</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3"><Form.Label>Title *</Form.Label><Form.Control type="text" value={examForm.title} onChange={(e) => setExamForm({...examForm, title: e.target.value})} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Description *</Form.Label><Form.Control as="textarea" rows={3} value={examForm.description} onChange={(e) => setExamForm({...examForm, description: e.target.value})} /></Form.Group>
              <Row>
                <Col md={6}><Form.Group><Form.Label>Duration (min)</Form.Label><Form.Control type="number" value={examForm.duration} onChange={(e) => setExamForm({...examForm, duration: parseInt(e.target.value)})} /></Form.Group></Col>
                <Col md={6}><Form.Group><Form.Label>Difficulty</Form.Label><Form.Select value={examForm.difficulty} onChange={(e) => setExamForm({...examForm, difficulty: e.target.value})}><option>Beginner</option><option>Medium</option><option>Advanced</option></Form.Select></Form.Group></Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowExamModal(false)}>Cancel</Button><Button className="btn-premium" onClick={handleAddExam}>Add Exam</Button></Modal.Footer>
        </Modal>

        {/* Add Question Modal */}
        <Modal show={showQuestionModal} onHide={() => setShowQuestionModal(false)} centered size="lg">
          <Modal.Header closeButton><Modal.Title>Add Question to {selectedExam?.title}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3"><Form.Label>Question Text *</Form.Label><Form.Control as="textarea" rows={2} value={questionForm.text} onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})} /></Form.Group>
              {questionForm.options.map((opt, idx) => (
                <Form.Group key={idx} className="mb-3">
                  <Form.Label>Option {String.fromCharCode(65 + idx)} *</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control type="text" value={opt} onChange={(e) => {
                      const newOptions = [...questionForm.options];
                      newOptions[idx] = e.target.value;
                      setQuestionForm({...questionForm, options: newOptions});
                    }} />
                    <Button variant={questionForm.correct === idx ? 'success' : 'outline-secondary'} onClick={() => setQuestionForm({...questionForm, correct: idx})}>
                      {questionForm.correct === idx ? '✓ Correct' : 'Set Correct'}
                    </Button>
                  </div>
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowQuestionModal(false)}>Cancel</Button><Button className="btn-premium" onClick={handleAddQuestion}>Add Question</Button></Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default AdminPanel;