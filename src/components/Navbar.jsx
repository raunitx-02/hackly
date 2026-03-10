import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Menu, X, ChevronDown, LogOut, User, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close dropdown on route change
    useEffect(() => { setDropOpen(false); setMenuOpen(false); }, [location.pathname]);

    // Hide Navbar on auth page and on dashboard pages when logged in
    const isAuth = location.pathname === '/auth';
    const isDashboard =
        location.pathname.startsWith('/dashboard') ||
        location.pathname === '/settings' ||
        location.pathname === '/events/create';

    if (isDashboard && currentUser) return null;

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/');
        } catch {
            toast.error('Failed to log out');
        }
    };

    const navLinks = [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Events', href: '/events' },
    ];

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
            background: scrolled ? 'rgba(15,23,42,0.95)' : 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${scrolled ? '#334155' : 'rgba(51,65,85,0.4)'}`,
            transition: 'all 0.3s ease',
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Hackly" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
                </Link>

                {/* Desktop Nav Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
                    {navLinks.map(link => (
                        <a key={link.label} href={link.href} className="nav-link">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {currentUser ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setDropOpen(!dropOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'rgba(30,41,59,0.9)', border: '1px solid #334155',
                                    borderRadius: 9999, padding: '7px 14px', cursor: 'pointer',
                                    color: '#F8FAFC', fontSize: 14, fontWeight: 600, transition: 'border-color 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
                            >
                                <div style={{
                                    width: 26, height: 26, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                                }}>
                                    {(userProfile?.name || currentUser.email || '?')[0].toUpperCase()}
                                </div>
                                <span>{userProfile?.name?.split(' ')[0] || 'User'}</span>
                                <ChevronDown size={14} style={{ color: '#64748B' }} />
                            </button>

                            {dropOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setDropOpen(false)} />
                                    <div style={{
                                        position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                                        background: '#1E293B', border: '1px solid #334155', borderRadius: 12,
                                        padding: 6, minWidth: 176, zIndex: 100,
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    }}>
                                        {[
                                            { label: 'Dashboard', icon: User, to: '/dashboard' },
                                            { label: 'Settings', icon: Settings, to: '/settings' },
                                            ...(userProfile?.role === 'admin' ? [{ label: 'Admin Panel', icon: ShieldCheck, to: '/admin' }] : []),
                                        ].map(item => (
                                            <Link key={item.label} to={item.to} onClick={() => setDropOpen(false)} style={{
                                                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                                                color: '#CBD5E1', textDecoration: 'none', borderRadius: 8,
                                                fontSize: 14, fontWeight: 500, transition: 'background 0.15s',
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <item.icon size={14} color={item.label === 'Admin Panel' ? '#EF4444' : '#64748B'} /> {item.label}
                                            </Link>
                                        ))}
                                        <div style={{ height: 1, background: '#334155', margin: '4px 0' }} />
                                        <button onClick={handleLogout} style={{
                                            display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
                                            color: '#F87171', background: 'none', border: 'none', cursor: 'pointer',
                                            borderRadius: 8, fontSize: 14, fontWeight: 500, width: '100%',
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link to="/auth" className="btn-outline hide-on-mobile" style={{ padding: '8px 18px', fontSize: 14 }}>
                                Login
                            </Link>
                            <Link to="/auth?mode=signup" className="btn-gradient" style={{ padding: '8px 18px', fontSize: 14 }}>
                                Get Started
                            </Link>
                        </div>
                    )}

                    {/* Hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="hamburger"
                        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 6 }}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div style={{
                    background: 'rgba(15,23,42,0.98)', borderTop: '1px solid #334155',
                    padding: '12px 20px 20px',
                }}>
                    {navLinks.map(link => (
                        <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
                            display: 'block', color: '#94A3B8', textDecoration: 'none', fontSize: 16,
                            padding: '12px 0', borderBottom: '1px solid #1E293B',
                        }}>
                            {link.label}
                        </a>
                    ))}
                    {!currentUser && (
                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Link to="/auth" className="btn-outline" style={{ textAlign: 'center', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/auth?mode=signup" className="btn-gradient" style={{ textAlign: 'center', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Get Started</Link>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
        </nav>
    );
}
