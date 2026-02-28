import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, userData, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
                <p style={{ color: var(--accent-magenta), fontWeight: 600 }}>Cargando portal...</p>
      </div >
    );
  }

if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
}

if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
}

return children;
};

export const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
