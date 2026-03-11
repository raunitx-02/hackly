import { useAuth } from '../contexts/AuthContext';

export default function Footer() {
    const { currentUser, userProfile } = useAuth();
    const role = userProfile?.role?.toLowerCase();
    const isOrganizerOrGuest = !currentUser || role === 'organizer';
    
    const location = useLocation();
    // Hide footer on dashboard and settings routes
    const isDashboard =
        location.pathname.startsWith('/dashboard') ||
        location.pathname === '/settings' ||
        location.pathname === '/events/create';
    if (isDashboard) return null;

    return (
        <footer style={{ borderTop: '1px solid #334155', padding: '60px 0 32px', background: '#0F172A' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 48 }}>
                    {/* Brand */}
                    <div>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <img src="/logo.png" alt="Hackly" style={{ height: 32, width: 'auto' }} />
                        </Link>
                        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
                            The complete platform for Indian colleges to run world-class hackathons and tech fests. hackly.online
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                            {[
                                { Icon: Twitter, href: 'https://twitter.com' },
                                { Icon: Linkedin, href: 'https://linkedin.com' },
                                { Icon: Github, href: 'https://github.com' },
                                { Icon: Mail, href: 'mailto:hello@hackly.online' },
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} target="_blank" rel="noreferrer" style={{
                                    width: 36, height: 36, borderRadius: 8, background: '#1E293B',
                                    border: '1px solid #334155', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: '#94A3B8', textDecoration: 'none',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#3B82F6'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94A3B8'; }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {[
                        {
                            title: 'Product', links: [
                                { label: 'Features', to: '/#features' },
                                ...(isOrganizerOrGuest ? [{ label: 'Pricing', to: '/pricing' }] : []),
                                { label: 'Browse Events', to: '/events' },
                                { label: 'Changelog', to: '/changelog' },
                            ]
                        },
                        {
                            title: 'Company', links: [
                                { label: 'About Us', to: '/about' },
                                { label: 'Blog', to: '/blog' },
                                { label: 'Careers', to: '/careers' },
                                { label: 'Contact', to: '/contact' },
                                { label: 'Campus Partner Program', to: '/#campus-partners' },
                            ]
                        },
                        {
                            title: 'Legal', links: [
                                { label: 'Privacy Policy', to: '/privacy' },
                                { label: 'Terms of Service', to: '/terms' },
                                { label: 'Cookie Policy', to: '/cookies' },
                                { label: 'GDPR', to: '/gdpr' },
                            ]
                        },
                    ].map(col => (
                        <div key={col.title}>
                            <h4 style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 13, marginBottom: 16, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                {col.title}
                            </h4>
                            {col.links.map(link => (
                                <Link key={link.label} to={link.to} style={{
                                    display: 'block', color: '#64748B', textDecoration: 'none',
                                    fontSize: 14, marginBottom: 10, transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid #334155', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <p style={{ color: '#64748B', fontSize: 13 }}>© 2026 Hackly. Made with ❤️ for Indian colleges.</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Code2 size={14} color="#64748B" />
                        <span style={{ color: '#64748B', fontSize: 13 }}>Built in India 🇮🇳</span>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    footer .container > div:first-child {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
                @media (max-width: 480px) {
                    footer .container > div:first-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </footer>
    );
}
