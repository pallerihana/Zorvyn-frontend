import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [simulatedRole, setSimulatedRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('simulatedRole');
    if (savedRole) {
      setSimulatedRole(savedRole);
    }
  }, []);

  const switchRole = (role) => {
    setSimulatedRole(role);
    localStorage.setItem('simulatedRole', role);
  };

  const resetRole = () => {
    setSimulatedRole(null);
    localStorage.removeItem('simulatedRole');
  };

  // Actual role from database (real permissions)
  const isActualAdmin = user?.role === 'admin';
  
  // Simulated role for UI demonstration (only affects UI, not real permissions)
  const currentSimulatedRole = simulatedRole || user?.role || 'viewer';
  
  // For UI display only - shows what role we're simulating
  const isSimulatedAdmin = currentSimulatedRole === 'admin';
  
  // For backend permissions - ALWAYS use actual role
  const canEditTransactions = isActualAdmin; // Only real admins can edit/delete
  const canAddTransactions = true; // Both can add their own

  return (
    <RoleContext.Provider value={{
      // Real permissions (backend-enforced)
      isActualAdmin,
      canEditTransactions,
      canAddTransactions,
      
      // UI simulation (frontend-only)
      currentRole: currentSimulatedRole,
      isAdmin: isSimulatedAdmin,
      simulatedRole,
      switchRole,
      resetRole
    }}>
      {children}
    </RoleContext.Provider>
  );
};