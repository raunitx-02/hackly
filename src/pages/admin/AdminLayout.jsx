import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    Zap, LayoutDashboard, Building2, CalendarDays, Users, ShieldAlert,
    Settings, LogOut, Home, Menu, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_NAV = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Building2, label: 'Institutions', path: '/admin/institutions' },
    { icon: CalendarDays, label: 'Events', path: '/admin/events' },
    { icon: Users, label: 'Users & Blacklist', path: '/admin/users' },
    { icon: ShieldAlert, label: 'Moderation Log', path: '/admin/moderation' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/');
        } catch {
            toast.error('Failed to log out');
        }
    };

    const SidebarContent = ({ mobile = false }) => (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#1E293B',
        }}>
            {/* Admin Header */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
            }}>
                <ShieldCheck size={28} color="#EF4444" />
                <span style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>Hackly</span>
                <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    Admin
                </div>
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
                {ADMIN_NAV.map(item => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 14px',
                                borderRadius: 10, textDecoration: 'none',
                                marginBottom: 4,
                                color: active ? '#F8FAFC' : '#94A3B8',
                                background: active ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                fontWeight: active ? 600 : 400,
                                fontSize: 14,
                                transition: 'all 0.15s ease',
                                borderLeft: active ? '3px solid #EF4444' : '3px solid transparent',
                            }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#F8FAFC'; } }}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
                <Link to="/" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    color: '#94A3B8', textDecoration: 'none', borderRadius: 8, fontSize: 14,
                    marginBottom: 4,
                }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F8FAFC'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <Home size={16} /> Public Site
                </Link>
                <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer',
                    borderRadius: 8, fontSize: 14, fontWeight: 500, width: '100%',
                    textAlign: 'left'
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A' }}>
            {/* Desktop Sidebar */}
            <aside style={{
                width: 260,
                flexShrink: 0,
                position: 'fixed',
                height: '100vh',
                borderRight: '1px solid #334155',
                display: 'none', // Overridden by media query
            }} className="desktop-sidebar">
                <SidebarContent />
            </aside>

            {/* Mobile Topbar */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 64,
                background: '#1E293B', borderBottom: '1px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', zIndex: 100,
            }} className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldCheck size={24} color="#EF4444" />
                    <span style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#EF4444',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>Admin</span>
                </div>
                <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside style={{
                position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
                zIndex: 201, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease',
            }}>
                <SidebarContent mobile />
                <button
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'absolute', top: 20, right: -40, background: 'none', border: 'none', color: 'white' }}
                >
                    <X size={24} />
                </button>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: 260, // Overridden by media query
                padding: '40px',
                minWidth: 0,
            }} className="admin-main">
                <Outlet />
            </main>

            <style>{`
                @media (min-width: 769px) {
                    .desktop-sidebar { display: block !important; }
                    .mobile-header { display: none !important; }
                }
                @media (max-width: 768px) {
                    .admin-main { margin-left: 0 !important; padding: 100px 20px 40px !important; }
                }
            `}</style>
        </div>
    );
}
