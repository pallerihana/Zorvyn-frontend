import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const { register, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (name === 'name') setNameError('');
    if (name === 'email') setEmailError('');
    if (name === 'password' || name === 'confirmPassword') setPasswordError('');
  };

  const validateForm = () => {
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    } else if (formData.name.length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      isValid = false;
    } else if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setPasswordError('Password must contain at least one letter and one number');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLocalLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    setLocalLoading(false);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Row className="w-100 justify-content-center">
        <Col lg={6} md={8} sm={10} xs={11}>
          <Card className="border-0 shadow-xl rounded-4 overflow-hidden">
            {/* Header */}
            <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)' }}>
              <h3 className="text-white mb-1 fw-bold">Create Account</h3>
              <p className="text-white-50 mb-0">Join Finance Dashboard today</p>
            </div>
            
            <Card.Body className="p-4 p-md-5">
              {/* Back to Login Link */}
              <div className="mb-4">
                <Link to="/login" className="text-decoration-none">
                  <FaArrowLeft className="me-1" size={12} />
                  Back to Login
                </Link>
              </div>
              
              {/* Error Alerts */}
              {(error || passwordError || emailError || nameError) && (
                <Alert variant="danger" className="mb-4 rounded-3 border-0">
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <strong>Registration Failed</strong>
                      <p className="mb-0 small">{error || passwordError || emailError || nameError}</p>
                    </div>
                  </div>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {/* Full Name Field */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2">
                    <FaUser className="me-2 text-muted" />
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="py-2 rounded-3"
                    size="lg"
                    isInvalid={!!nameError}
                  />
                  <Form.Control.Feedback type="invalid">
                    {nameError}
                  </Form.Control.Feedback>
                </Form.Group>
                
                {/* Email Field */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2">
                    <FaEnvelope className="me-2 text-muted" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="py-2 rounded-3"
                    size="lg"
                    isInvalid={!!emailError}
                  />
                  <Form.Control.Feedback type="invalid">
                    {emailError}
                  </Form.Control.Feedback>
                </Form.Group>
                
                {/* Password Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2">
                    <FaLock className="me-2 text-muted" />
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="py-2 rounded-3"
                      size="lg"
                      isInvalid={!!passwordError}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-3"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters with letters and numbers
                  </Form.Text>
                </Form.Group>
                
                {/* Confirm Password Field */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2">
                    <FaLock className="me-2 text-muted" />
                    Confirm Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="py-2 rounded-3"
                      size="lg"
                      isInvalid={!!passwordError}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="rounded-3"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                  {passwordError && (
                    <Form.Text className="text-danger">
                      {passwordError}
                    </Form.Text>
                  )}
                </Form.Group>
                
                {/* Role Selection */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2">Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="py-2 rounded-3"
                    size="lg"
                  >
                    <option value="viewer">👁️ Viewer (Read-only access)</option>
                    <option value="admin">👑 Admin (Full access)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Admin users can add, edit, and delete all transactions
                  </Form.Text>
                </Form.Group>
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 mb-3 rounded-3 py-2 fw-semibold"
                  disabled={localLoading}
                  style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)', border: 'none' }}
                >
                  {localLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="me-2" />
                      Sign Up
                    </>
                  )}
                </Button>
                
                {/* Login Link */}
                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Sign In
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Footer */}
      <div className="position-fixed bottom-0 start-0 end-0 text-center p-3">
        <small className="text-white-50">
          © 2024 Finance Dashboard. All rights reserved.
        </small>
      </div>
    </Container>
  );
};

export default Register;