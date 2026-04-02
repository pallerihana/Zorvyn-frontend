import React from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { FaUserCircle, FaSignOutAlt, FaChartLine, FaTachometerAlt, FaExchangeAlt, FaChartPie } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import RoleToggle from './RoleToggle';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
          <FaChartLine className="me-2" />
          <span className="fw-bold">Finance Dashboard</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" className={isActive('/dashboard') ? 'active fw-bold' : ''}>
              <FaTachometerAlt className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/transactions" className={isActive('/transactions') ? 'active fw-bold' : ''}>
              <FaExchangeAlt className="me-1" /> Transactions
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics" className={isActive('/analytics') ? 'active fw-bold' : ''}>
              <FaChartPie className="me-1" /> Analytics
            </Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-2">
            <ThemeToggle />
            <RoleToggle />
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-user">
                <FaUserCircle className="me-2" />
                {user?.name?.split(' ')[0] || user?.name || 'User'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item disabled>
                  <small className="text-muted">{user?.email}</small>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;