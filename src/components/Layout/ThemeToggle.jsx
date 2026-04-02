import React from 'react';
import { Button } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline-secondary"
      onClick={toggleTheme}
      className="rounded-circle d-flex align-items-center justify-content-center"
      style={{ width: '38px', height: '38px', padding: 0 }}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {darkMode ? <FaSun size={18} className="text-warning" /> : <FaMoon size={18} />}
    </Button>
  );
};

export default ThemeToggle;