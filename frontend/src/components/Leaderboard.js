import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/');
      return;
    }
    loadLeaderboard();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/results/leaderboard');
      console.log('Leaderboard data:', response.data);
      setLeaderboardData(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <span style={{ fontSize: '28px' }}>🏆</span>;
    if (rank === 2) return <span style={{ fontSize: '28px' }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: '28px' }}>🥉</span>;
    return <Badge bg="secondary" className="rounded-pill">#{rank}</Badge>;
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#27ae60';
    if (score >= 50) return '#f39c12';
    return '#e74c3c';
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
      <Container>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">🏆 Leaderboard</h1>
          <p className="lead text-white-50">Top performers across all quizzes</p>
        </div>

        {leaderboardData.length === 0 ? (
          <Card className="text-center p-5" style={{ borderRadius: '24px' }}>
            <h4>No rankings yet!</h4>
            <p>Take a quiz to appear on the leaderboard</p>
            <Button className="btn-premium" onClick={() => navigate('/exams')}>Start First Quiz</Button>
          </Card>
        ) : (
          <Card style={{ borderRadius: '24px', border: 'none', background: 'rgba(255,255,255,0.95)' }}>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table className="mb-0">
                  <thead style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                    <tr>
                      <th className="text-center" style={{ width: '80px' }}>Rank</th>
                      <th>Student</th>
                      <th className="text-center">Exams</th>
                      <th className="text-center">Avg Score</th>
                      <th className="text-center">Best Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((user, index) => {
                      const rank = index + 1;
                      const isCurrentUser = user._id === currentUser?.email;
                      return (
                        <tr key={user._id} style={{ 
                          background: isCurrentUser ? 'rgba(108,92,231,0.1)' : 'white',
                          fontWeight: isCurrentUser ? 'bold' : 'normal'
                        }}>
                          <td className="text-center align-middle">{getRankIcon(rank)}</td>
                          <td className="align-middle">
                            {user.userName}
                            {isCurrentUser && <Badge bg="primary" className="ms-2">You</Badge>}
                            <br />
                            <small className="text-muted">Student</small>
                          </td>
                          <td className="text-center align-middle">
                            <Badge bg="info" className="rounded-pill">{user.totalExams || 0}</Badge>
                          </td>
                          <td className="text-center align-middle">
                            <span className="fw-bold fs-5" style={{ color: getScoreColor(user.avgScore || 0) }}>
                              {Math.round(user.avgScore || 0)}%
                            </span>
                          </td>
                          <td className="text-center align-middle">
                            ⭐ {Math.round(user.bestScore || 0)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
}

export default Leaderboard;