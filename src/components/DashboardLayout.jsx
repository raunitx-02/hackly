import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Zap, LayoutDashboard, CalendarDays, PlusCircle, Users, BarChart3,
    Settings, Trophy, FileText, Menu, X, LogOut, Star, CheckSquare,
    Home, Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ORGANIZER_NAV = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CalendarDays, label: 'My Events', path: '/dashboard/events' },
    { icon: PlusCircle, label: 'Create Event', path: '/events/create' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const PARTICIPANT_NAV = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Browse Events', path: '/events' },
    { icon: CalendarDays, label: 'My Registrations', path: '/dashboard/registrations' },
    { icon: Users, label: 'My Teams', path: '/dashboard/teams' },
    { icon: FileText, label: 'Submissions', path: '/dashboard/submissions' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const JUDGE_NAV = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Star, label: 'Assigned Events', path: '/dashboard/assigned' },
    { icon: CheckSquare, label: 'Pending Reviews', path: '/dashboard/pending' },
    { icon: Trophy, label: 'Completed', path: '/dashboard/completed' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const SPONSOR_NAV = [
    { icon: LayoutDashboard, label: 'Sponsor Portal', path: '/sponsor' },
    { icon: Star, label: 'Matchmaking', path: '/sponsor/intent' },
    { icon: BarChart3, label: 'Impact Reports', path: '/sponsor/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

function getNavItems(role) {
    if (role === 'organizer') return ORGANIZER_NAV;
    if (role === 'judge') return JUDGE_NAV;
    if (role === 'sponsor') return SPONSOR_NAV;
    return PARTICIPANT_NAV;
}

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = getNavItems(userProfile?.role);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/');
        } catch {
            toast.error('Failed to log out');
        }
    };

    const Sidebar = ({ mobile = false }) => (
        <div style={{
            width: mobile ? '100%' : 260, background: '#1E293B',
            borderRight: mobile ? 'none' : '1px solid #334155',
            display: 'flex', flexDirection: 'column', height: mobile ? 'auto' : '100vh',
            position: mobile ? 'relative' : 'fixed', top: 0, left: 0,
            zIndex: mobile ? 'auto' : 50,
        }}>
            {/* Logo */}
            {!mobile && (
                <div style={{
                    padding: '20px', borderBottom: '1px solid #334155',
                    display: 'flex', alignItems: 'center',
                }}>
                    <img src="/logo.png" alt="Hackly" style={{ height: 32, width: 'auto' }} />
                </div>
            )}

            {/* User info */}
            {!mobile && (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                            {(userProfile?.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                            <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
                                {userProfile?.name || 'User'}
                            </div>
                            <div style={{
                                color: '#94A3B8', fontSize: 11, fontWeight: 600,
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>
                                {userProfile?.role || 'member'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto', display: mobile ? 'flex' : 'block', justifyContent: mobile ? 'space-around' : 'unset' }}>
                {navItems.map(item => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: mobile ? '12px 8px' : '11px 14px',
                                borderRadius: 10, textDecoration: 'none',
                                marginBottom: mobile ? 0 : 2,
                                flexDirection: mobile ? 'column' : 'row',
                                color: active ? '#F8FAFC' : '#94A3B8',
                                background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                                borderLeft: active && !mobile ? '3px solid #3B82F6' : mobile ? 'none' : '3px solid transparent',
                                fontWeight: active ? 600 : 400,
                                fontSize: mobile ? 11 : 14,
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#F8FAFC'; } }}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
                        >
                            <item.icon size={mobile ? 20 : 17} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout (desktop only) */}
            {!mobile && (
                <div style={{ padding: '12px', borderTop: '1px solid #334155' }}>
                    <Link to="/" style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        color: '#94A3B8', textDecoration: 'none', borderRadius: 8, fontSize: 14,
                        marginBottom: 4,
                    }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <Home size={16} /> Home
                    </Link>
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                        color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer',
                        borderRadius: 8, fontSize: 14, fontWeight: 500, width: '100%',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A' }}>
            {/* Desktop Sidebar */}
            <div style={{ width: 260, flexShrink: 0 }} className="desktop-sidebar">
                <Sidebar />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99,
                }} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <div style={{
                    position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, zIndex: 100,
                    background: '#1E293B', borderRight: '1px solid #334155',
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease',
                }}>
                    <Sidebar />
                </div>
            )}

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Mobile Topbar */}
                <div className="mobile-topbar" style={{
                    display: 'none', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px', borderBottom: '1px solid #334155', background: '#1E293B',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="Hackly" style={{ height: 24, width: 'auto' }} />
                    </div>
                    <button onClick={() => setSidebarOpen(true)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4,
                    }}>
                        <Menu size={22} />
                    </button>
                </div>

                {/* Page content */}
                <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <div className="mobile-bottom-nav" style={{
                    display: 'none', borderTop: '1px solid #334155',
                    background: '#1E293B', paddingBottom: 'env(safe-area-inset-bottom)',
                }}>
                    <Sidebar mobile />
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottom-nav { display: block !important; }
          main { padding: 20px !important; }
        }
      `}</style>
        </div>
    );
}
