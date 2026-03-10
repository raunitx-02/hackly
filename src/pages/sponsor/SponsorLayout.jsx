import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Handshake, Target, BarChart2, LogOut, Loader2 } from 'lucide-react';

export default function SponsorLayout() {
    const { currentUser, userProfile, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <Loader2 size={40} color="#3B82F6" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
    );

    if (!currentUser || userProfile?.role !== 'sponsor') {
        navigate('/');
        return null;
    }

    const NAV_ITEMS = [
        { id: 'dashboard', label: 'Dashboard', path: '/sponsor', icon: Handshake },
        { id: 'intent', label: 'Intent Profile', path: '/sponsor/intent', icon: Target },
        { id: 'reports', label: 'Impact Reports', path: '/sponsor/reports', icon: BarChart2 },
    ];

    const isActive = (path) => {
        if (path === '/sponsor') return location.pathname === '/sponsor' || location.pathname === '/sponsor/';
        return location.pathname.startsWith(path);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A' }}>
            {/* Sidebar */}
            <div style={{ 
                width: 280, background: '#1E293B', borderRight: '1px solid #334155',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40 
            }}>
                <div style={{ padding: '32px 24px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Handshake size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.5px' }}>Hackly Sponsor</div>
                            <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, letterSpacing: 1 }}>STUDIO</div>
                        </div>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {NAV_ITEMS.map(item => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                                        background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
                                        color: active ? '#10B981' : '#94A3B8',
                                        borderRadius: 12, textDecoration: 'none', fontWeight: active ? 600 : 500,
                                        fontSize: 15, transition: 'all 0.2s',
                                        border: `1px solid ${active ? 'rgba(16,185,129,0.2)' : 'transparent'}`
                                    }}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div style={{ marginTop: 'auto', padding: 24, paddingBottom: 32, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>
                            {userProfile.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userProfile.name}</div>
                            <div style={{ color: '#64748B', fontSize: 12 }}>{userProfile.college || 'Sponsor'}</div>
                        </div>
                    </div>
                    
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
                        <LogOut size={16} /> Logout
                    </button>
                    <Link to="/" style={{ display: 'block', textAlign: 'center', color: '#64748B', fontSize: 12, textDecoration: 'none', marginTop: 16 }}>Back to main site</Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ marginLeft: 280, flex: 1, padding: '40px 60px', overflowY: 'auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
