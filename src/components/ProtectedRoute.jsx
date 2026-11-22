// ProtectedRoute – redirects to /login if user is not signed in.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <Loader />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}
