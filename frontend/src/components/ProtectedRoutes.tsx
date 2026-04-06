import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoutes() {
  const { firebaseUser, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && firebaseUser ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}

export default ProtectedRoutes;
