import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AgentProtectedRoute = () => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return null;

  if (!isLoggedIn || user?.role !== "agent") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AgentProtectedRoute;