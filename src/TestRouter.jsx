import React from 'react';
import { useLocation } from 'react-router-dom';

const TestRouter = () => {
  const location = useLocation();
  
  return (
    <div className="container mt-5">
      <div className="alert alert-success">
        <h4>React Router is working!</h4>
        <p>Current path: {location.pathname}</p>
      </div>
    </div>
  );
};

export default TestRouter;