import { CheckCircle, Zap } from 'lucide-react';

const UPDATES = [
    {
        version: 'v1.2.0', date: 'March 8, 2026', badge: 'Latest',
        changes: [
            { type: 'new', text: 'Site rebranded to Hackly (hackly.online)' },
            { type: 'new', text: 'Feature detail pages for all 6 core features' },
            { type: 'new', text: 'About, Blog, Careers, Contact pages launched' },
            { type: 'new', text: 'Privacy, Terms, Cookie, and GDPR policy pages' },
            { type: 'improved', text: 'Navbar animation unified across all interactive elements' },
            { type: 'fixed', text: 'Duplicate Navbar removed from all pages' },
        ],
    },
    {
        version: 'v1.1.0', date: 'March 2, 2026', badge: null,
        changes: [
            { type: 'new', text: 'Live Leaderboard with Firestore real-time updates' },
            { type: 'new', text: 'Judge Panel with weighted rubric scoring' },
            { type: 'new', text: 'Multi-judge score aggregation and ranking' },
            { type: 'improved', text: 'Dashboard sidebar navigation revamped' },
            { type: 'fixed', text: 'Mobile menu now closes on route change' },
        ],
    },
    {
        version: 'v1.0.0', date: 'February 18, 2026', badge: null,
        changes: [
            { type: 'new', text: 'Event Creation wizard (4-step flow)' },
            { type: 'new', text: 'Team Management — create, join, browse open teams' },
            { type: 'new', text: 'Submission Portal — GitHub, demo, PPT, tech stack' },
            { type: 'new', text: 'Firebase Authentication (Email/Password + Google)' },
            { type: 'new', text: 'Role-based access: Organizer, Participant, Judge' },
            { type: 'new', text: 'Firestore security rules for all collections' },
        ],
    },
];

const TYPE_COLORS = { new: '#10B981', improved: '#3B82F6', fixed: '#F59E0B' };
const TYPE_LABELS = { new: 'NEW', improved: 'IMPROVED', fixed: 'FIXED' };

export default function ChangelogPage() {
    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                <section style={{ padding: '72px 0 56px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.06))', borderBottom: '1px solid #334155', textAlign: 'center' }}>
                    <div className="container">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 20 }}>
                            <img src="/favicon.png" alt="" style={{ height: 16, width: 16 }} />
                            <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>Product Updates</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, marginBottom: 16 }}>
                            <span style={{ background: 'linear-gradient(135deg,#10B981,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Changelog</span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                            Every improvement, fix, and new feature — documented transparently.
                        </p>
                    </div>
                </section>

                <section style={{ padding: '72px 0 96px' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        {UPDATES.map((update, i) => (
                            <div key={update.version} style={{ display: 'flex', gap: 28, marginBottom: i < UPDATES.length - 1 ? 48 : 0 }}>
                                {/* Timeline */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0, paddingTop: 4 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', flexShrink: 0 }} />
                                    {i < UPDATES.length - 1 && <div style={{ width: 2, flex: 1, background: '#334155', marginTop: 8 }} />}
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1, background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>{update.version}</span>
                                        {update.badge && (
                                            <span style={{ padding: '3px 10px', borderRadius: 9999, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 11, fontWeight: 700 }}>{update.badge}</span>
                                        )}
                                        <span style={{ color: '#64748B', fontSize: 13, marginLeft: 'auto' }}>{update.date}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                                        {update.changes.map((change, j) => (
                                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                <span style={{ padding: '2px 8px', borderRadius: 6, background: `${TYPE_COLORS[change.type]}20`, color: TYPE_COLORS[change.type], fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                                                    {TYPE_LABELS[change.type]}
                                                </span>
                                                <span style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.6 }}>{change.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
