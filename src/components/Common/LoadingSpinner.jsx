import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'md', variant = 'primary', text = 'Loading...' }) => {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <Spinner
        animation="border"
        variant={variant}
        style={{ width: sizeMap[size], height: sizeMap[size] }}
        role="status"
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;