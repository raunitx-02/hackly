import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requiredRole = null, blockBlacklisted = true }) {
    const { currentUser, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 48, height: 48, border: '3px solid #334155',
                        borderTop: '3px solid #3B82F6', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
                    }} />
                    <p style={{ color: '#94A3B8' }}>Loading...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Blacklist check
    if (blockBlacklisted && userProfile?.isBlacklisted) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A', padding: 20 }}>
                <div style={{ textAlign: 'center', maxWidth: 400, background: '#1E293B', padding: 32, borderRadius: 16, border: '1px solid #EF4444' }}>
                    <h2 style={{ color: '#F8FAFC', marginBottom: 16 }}>Access Restricted</h2>
                    <p style={{ color: '#94A3B8', marginBottom: 24 }}>
                        Your account has been restricted due to repeated violations of our content policy.
                        Please contact support if you think this is a mistake.
                    </p>
                    <button onClick={() => window.location.href = 'mailto:support@hackly.in'} className="btn-outline" style={{ border: '1px solid #334155' }}>
                        Contact Support
                    </button>
                </div>
            </div>
        );
    }

    // Role check
    if (requiredRole && userProfile?.role !== requiredRole) {
        // If they are admin trying to access participant dashboard, or vice versa, redirect to their home
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
