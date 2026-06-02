import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminProtectedRoute({ allowedRoles, children }) {
  const { adminToken, adminUser } = useAdminAuth();
  console.log("adminToken:", adminToken);
  console.log("adminUser:", adminUser);
  console.log("allowedRoles:", allowedRoles);

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedRoles.includes(adminUser?.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  console.log("PASSED");

  return children;
}