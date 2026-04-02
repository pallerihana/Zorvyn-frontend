import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }
    
    setLocalLoading(true);
    const result = await login({ email, password });
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      navigate('/dashboard', { replace: true });
    }
    
    setLocalLoading(false);
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Row className="w-100 justify-content-center">
        <Col lg={5} md={7} sm={9} xs={11}>
          <Card className="border-0 shadow-xl rounded-4 overflow-hidden">
            {/* Header */}
            <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3a56d4 100%)' }}>
              <h3 className="text-white mb-1 fw-bold">Welcome Back</h3>
              <p className="text-white-50 mb-0">Sign in to your account</p>
            </div>
            
            <Card.Body className="p-4 p-md-5">
              {/* Error Alert */}
              {error && (
                <Alert variant="danger" className="mb-4 rounded-3 border-0">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <strong>Login Failed!</strong>
                      <p className="mb-0 small">{error}</p>
                    </div>
                  </div>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-2">
                    <FaEnvelope className="me-2 text-muted" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="py-2 rounded-3"
                    size="lg"
                  />
                </Form.Group>
                
                {/* Password Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold mb-2">
                    <FaLock className="me-2 text-muted" />
                    Password
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="py-2 rounded-3"
                      size="lg"
                    />
                    <Button
                      variant="link"
                      size="sm"
                      className="position-absolute end-0 top-50 translate-middle-y me-2 text-decoration-none"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 10 }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </Form.Group>
                
                {/* Remember Me & Forgot Password */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="text-muted"
                  />
                  <Button variant="link" className="text-decoration-none p-0" size="sm">
                    Forgot Password?
                  </Button>
                </div>
                
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="me-2" />
                      Sign In
                    </>
                  )}
                </Button>
                
                {/* Sign Up Link */}
                <div className="text-center">
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/register" className="text-decoration-none fw-semibold">
                    <FaUserPlus className="me-1" size={12} />
                    Sign Up
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

export default Login;