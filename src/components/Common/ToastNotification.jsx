import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const ToastNotification = ({ show, onClose, message, type = 'success' }) => {
  const variants = {
    success: { bg: 'success', icon: <FaCheckCircle size={20} /> },
    error: { bg: 'danger', icon: <FaTimesCircle size={20} /> },
    info: { bg: 'info', icon: <FaInfoCircle size={20} /> },
    warning: { bg: 'warning', icon: <FaExclamationCircle size={20} /> }
  };

  const variant = variants[type] || variants.success;

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast show={show} onClose={onClose} delay={3000} autohide>
        <Toast.Header className={`bg-${variant.bg} text-white`}>
          <strong className="me-auto">{variant.icon} {type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;