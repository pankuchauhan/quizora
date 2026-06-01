import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Tab, Nav, Alert, Modal, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    occupation: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      navigate('/');
      return;
    }
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || 'No bio added yet',
        occupation: userData.occupation || 'Not specified',
        phone: userData.phone || 'Not specified'
      });
      
      // Load avatar
      const savedAvatar = localStorage.getItem(`avatar_${userData.email}`);
      if (savedAvatar) {
        setAvatarPreview(savedAvatar);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put('/auth/profile', {
        name: profileData.name,
        occupation: profileData.occupation,
        bio: profileData.bio
      });
      
      if (response.data.success) {
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.name = profileData.name;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        toast.success('Profile updated successfully!');
        setEditMode(false);
        loadUserProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password changed successfully! Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatarPreview(base64String);
        localStorage.setItem(`avatar_${user.email}`, base64String);
        toast.success('Avatar updated successfully!');
        setShowAvatarModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    localStorage.removeItem(`avatar_${user.email}`);
    setAvatarPreview(null);
    toast.success('Avatar removed successfully');
    setShowAvatarModal(false);
  };

  const getInitials = () => {
    if (profileData.name && profileData.name.length > 0) {
      return profileData.name.charAt(0).toUpperCase();
    }
    return 'U';
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
        <Row>
          <Col lg={4} className="mb-4">
            <Card className="border-0 text-center" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="p-4">
                <div className="position-relative d-inline-block mx-auto mb-3">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #6c5ce7',
                        padding: '3px'
                      }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                      style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {getInitials()}
                    </div>
                  )}
                  <Button
                    variant="light"
                    size="sm"
                    className="rounded-circle position-absolute"
                    style={{ bottom: '5px', right: '5px' }}
                    onClick={() => setShowAvatarModal(true)}
                  >
                    📷
                  </Button>
                </div>
                
                <h3 className="mt-3">{profileData.name || 'User'}</h3>
                <p className="text-muted">{profileData.email || 'No email'}</p>
                <p className="text-muted small">{profileData.occupation}</p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.95)' }}>
              <Card.Body className="p-4">
                <Tab.Container defaultActiveKey="profile">
                  <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                      <Nav.Link eventKey="profile" className="fw-bold">Profile Information</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="password" className="fw-bold">Change Password</Nav.Link>
                    </Nav.Item>
                  </Nav>

                  <Tab.Content>
                    <Tab.Pane eventKey="profile">
                      {!editMode ? (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4>Personal Information</h4>
                            <Button variant="outline-primary" onClick={() => setEditMode(true)}>✏️ Edit Profile</Button>
                          </div>
                          
                          <Row>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="text-muted">Full Name</label>
                                <p className="fw-bold fs-5">{profileData.name || 'Not specified'}</p>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="text-muted">Email Address</label>
                                <p className="fw-bold fs-5">{profileData.email || 'Not specified'}</p>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="text-muted">Occupation</label>
                                <p className="fw-bold">{profileData.occupation || 'Not specified'}</p>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="mb-3">
                                <label className="text-muted">Phone Number</label>
                                <p className="fw-bold">{profileData.phone || 'Not specified'}</p>
                              </div>
                            </Col>
                            <Col md={12}>
                              <div className="mb-3">
                                <label className="text-muted">Bio</label>
                                <p>{profileData.bio || 'No bio added yet'}</p>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ) : (
                        <div>
                          <h4 className="mb-4">Edit Profile</h4>
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>Full Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                className="rounded-pill"
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Email (Cannot be changed)</Form.Label>
                              <Form.Control
                                type="email"
                                value={profileData.email}
                                disabled
                                className="rounded-pill bg-light"
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Occupation</Form.Label>
                              <Form.Control
                                type="text"
                                value={profileData.occupation}
                                onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                                placeholder="e.g., Student, Developer, Teacher"
                                className="rounded-pill"
                              />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Bio</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={profileData.bio}
                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                placeholder="Tell us about yourself"
                              />
                            </Form.Group>
                            
                            <div className="d-flex gap-2">
                              <Button className="btn-premium" onClick={handleProfileUpdate}>Save Changes</Button>
                              <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
                            </div>
                          </Form>
                        </div>
                      )}
                    </Tab.Pane>

                    <Tab.Pane eventKey="password">
                      <h4 className="mb-4">Change Password</h4>
                      <Alert variant="info">
                        <small>Password must be at least 6 characters long.</small>
                      </Alert>
                      
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            placeholder="Enter current password"
                            className="rounded-pill"
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            placeholder="Enter new password (min 6 characters)"
                            className="rounded-pill"
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            placeholder="Confirm new password"
                            className="rounded-pill"
                          />
                        </Form.Group>
                        
                        <Button className="btn-premium" onClick={handlePasswordChange}>Change Password</Button>
                      </Form>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Avatar Modal */}
        <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Profile Picture</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-3">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '15px'
                  }}
                />
              ) : (
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: '150px',
                    height: '150px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    fontSize: '60px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  {getInitials()}
                </div>
              )}
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Choose Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <Form.Text className="text-muted">
                Max file size: 2MB. Supported formats: JPG, PNG, GIF
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-center">
              <Button variant="outline-danger" onClick={removeAvatar}>Remove Avatar</Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Profile;