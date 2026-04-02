import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FaUser, FaUserShield } from 'react-icons/fa';
import { useRole } from '../../contexts/RoleContext';

const RoleToggle = () => {
  const { currentRole, switchRole } = useRole();

  return (
    <div className="d-flex align-items-center gap-2">
      
     
    </div>
  );
};

export default RoleToggle;