import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ role, component }) => {
  const { user, isAuthenticated, initializing } = useSelector((state) => state.auth);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!role.includes(user.role)) {
    // Role mismatch → redirect to their correct dashboard
    return <Navigate to={user.role === "organizer" ? "/dashboard" : "/home"} replace />;
  }

  return component;
};

export default ProtectedRoutes;
