import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = () => {
  const { isLoggedIn, user, loading } = useAuth();

  // Wait for auth check to finish
  if (loading) return null;

  // Only allow if logged in and user is admin
  if (!isLoggedIn || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;