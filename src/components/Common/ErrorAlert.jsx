import React from 'react';
import { Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ErrorAlert = ({ error, onClose, variant = 'danger' }) => {
  if (!error) return null;

  return (
    <Alert
      variant={variant}
      className="position-relative mb-3 animate__animated animate__fadeIn"
      style={{ borderRadius: '10px' }}
    >
      <div className="d-flex align-items-center">
        <FaExclamationTriangle className="me-2" />
        <div className="flex-grow-1">
          <strong>Error!</strong> {error}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="btn-close position-absolute"
            style={{ top: '0.5rem', right: '0.5rem' }}
          />
        )}
      </div>
    </Alert>
  );
};

export default ErrorAlert;