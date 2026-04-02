import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaExchangeAlt,
  FaChartLine,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaLightbulb
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/transactions', icon: <FaExchangeAlt />, label: 'Transactions' },
    { path: '/analytics', icon: <FaChartLine />, label: 'Analytics' }
  ];

  const quickStats = [
    { icon: <FaWallet />, label: 'Balance', value: '$12,345', color: 'primary' },
    { icon: <FaArrowUp />, label: 'Income', value: '$8,234', color: 'success' },
    { icon: <FaArrowDown />, label: 'Expenses', value: '$4,111', color: 'danger' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="d-none d-md-block position-fixed start-0 top-0 vh-100 bg-dark text-white" style={{ width: '260px', zIndex: 1000 }}>
        <div className="p-4">
          <h4 className="mb-4">
            <FaChartLine className="me-2" />
            Finance Dashboard
          </h4>
          
          <Nav className="flex-column mb-4">
            {navItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={NavLink}
                to={item.path}
                className="text-white mb-2"
                style={{ borderRadius: '10px' }}
                activeClassName="active"
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <hr className="bg-secondary" />

          <div className="mt-4">
            <h6 className="text-white-50 mb-3">Quick Stats</h6>
            {quickStats.map((stat, idx) => (
              <div key={idx} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-white-50">
                    {stat.icon} {stat.label}
                  </span>
                  <span className={`text-${stat.color}`}>{stat.value}</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${stat.color}`}
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <hr className="bg-secondary" />

          <div className="mt-4">
            <div className="bg-primary bg-opacity-25 rounded p-3">
              <FaLightbulb className="mb-2 text-warning" size={24} />
              <h6 className="text-white">Pro Tip</h6>
              <small className="text-white-50">
                Track your expenses daily to stay on budget!
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`d-md-none position-fixed top-0 start-0 h-100 bg-dark text-white shadow-lg transition-all ${
          isOpen ? 'translate-x-0' : 'translate-x-n100'
        }`}
        style={{
          width: '280px',
          zIndex: 1041,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">
              <FaChartLine className="me-2" />
              Finance
            </h4>
            <button
              className="btn btn-link text-white"
              onClick={onClose}
              style={{ fontSize: '1.5rem' }}
            >
              ×
            </button>
          </div>
          
          <Nav className="flex-column mb-4">
            {navItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={NavLink}
                to={item.path}
                className="text-white mb-2"
                style={{ borderRadius: '10px' }}
                onClick={onClose}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <hr className="bg-secondary" />

          <div className="mt-4">
            <h6 className="text-white-50 mb-3">Quick Stats</h6>
            {quickStats.map((stat, idx) => (
              <div key={idx} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-white-50">
                    {stat.icon} {stat.label}
                  </span>
                  <span className={`text-${stat.color}`}>{stat.value}</span>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${stat.color}`}
                    style={{ width: '65%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;