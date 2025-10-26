import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Spinner size="w-16 h-16" />
      </div>
    );
  }

  if (!user) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child routes
  return <Outlet />;
}