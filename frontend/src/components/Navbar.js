import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../services/api';

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [location]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsLoggedIn(true);
      
      // Try to get fresh user data from API
      try {
        const response = await getCurrentUser();
        const userData = response.data;
        
        // Clean the name - remove any line breaks or extra spaces
        const cleanName = userData.name ? userData.name.replace(/\s+/g, ' ').trim() : '';
        setUserName(cleanName);
        setIsAdmin(userData.role === 'admin');
        
        // Update localStorage with clean data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.name !== cleanName || currentUser.role !== userData.role) {
          const updatedUser = { ...currentUser, name: cleanName, role: userData.role };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        // Fallback to localStorage if API fails
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const cleanName = user.name ? user.name.replace(/\s+/g, ' ').trim() : '';
        setUserName(cleanName);
        setIsAdmin(user.role === 'admin');
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
      setIsAdmin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
    toast.success('👋 Logged out successfully!');
    navigate('/');
  };

  // Get first letter for avatar
  const getAvatarLetter = () => {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Navbar 
      expand="lg" 
      className="sticky-top"
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: '12px 0'
      }}
    >
      <Container>
        <Navbar.Brand 
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 10px rgba(102,126,234,0.3)'
              }}
            >
              <span style={{ fontSize: '20px' }}>📝</span>
            </div>
            <span 
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}
            >
              Quizora
            </span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            {isLoggedIn && (
              <>
                <Nav.Link 
                  onClick={() => navigate('/dashboard')}
                  className={`mx-2 px-3 ${location.pathname === '/dashboard' ? 'active-nav' : ''}`}
                  style={{
                    fontWeight: '500',
                    color: location.pathname === '/dashboard' ? '#6c5ce7' : '#555',
                    borderRadius: '10px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                >
                  📊 Dashboard
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate('/exams')}
                  className={`mx-2 px-3 ${location.pathname === '/exams' ? 'active-nav' : ''}`}
                  style={{
                    fontWeight: '500',
                    color: location.pathname === '/exams' ? '#6c5ce7' : '#555',
                    borderRadius: '10px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                >
                  📚 Exams
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate('/leaderboard')}
                  className={`mx-2 px-3 ${location.pathname === '/leaderboard' ? 'active-nav' : ''}`}
                  style={{
                    fontWeight: '500',
                    color: location.pathname === '/leaderboard' ? '#6c5ce7' : '#555',
                    borderRadius: '10px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                >
                  🏆 Leaderboard
                </Nav.Link>
                {isAdmin && (
                  <Nav.Link 
                    onClick={() => navigate('/admin')}
                    className={`mx-2 px-3 ${location.pathname === '/admin' ? 'active-nav' : ''}`}
                    style={{
                      fontWeight: '500',
                      color: location.pathname === '/admin' ? '#6c5ce7' : '#555',
                      borderRadius: '10px',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                  >
                    👑 Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <div>
            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3">
                <div className="dropdown">
                  <div 
                    className="d-flex align-items-center gap-2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '38px',
                        height: '38px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      {getAvatarLetter()}
                    </div>
                    <span className="d-none d-md-block" style={{ color: '#333', fontWeight: '500' }}>
                      {userName}
                    </span>
                  </div>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
                    <li>
                      <button 
                        className="dropdown-item py-2" 
                        onClick={() => navigate('/profile')}
                        style={{ color: '#6c5ce7' }}
                      >
                        👤 My Profile
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  className="rounded-pill px-4"
                  onClick={() => navigate('/')}
                  style={{
                    borderColor: '#6c5ce7',
                    color: '#6c5ce7',
                    fontWeight: '500'
                  }}
                >
                  Login
                </Button>
                <Button
                  className="rounded-pill px-4"
                  onClick={() => navigate('/register')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: '500',
                    boxShadow: '0 4px 10px rgba(102,126,234,0.3)'
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;