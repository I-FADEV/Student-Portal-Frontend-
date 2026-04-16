import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminProtectedRoute({ allowedRoles, children }) {
  const { adminToken, adminUser } = useAdminAuth();

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedRoles.includes(adminUser?.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}