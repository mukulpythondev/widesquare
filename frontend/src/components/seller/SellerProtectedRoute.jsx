import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SellerProtectedRoute = () => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return null;

  if (!isLoggedIn || user?.role !== "seller") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default SellerProtectedRoute;