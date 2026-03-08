import { useState } from 'react';
import { ArrowRight, Briefcase, Heart, Globe, Coffee, ChevronDown, CheckCircle, Mail } from 'lucide-react';
import { CAREERS_ROLES } from '../data/careersConfig';

const PERKS = [
    { icon: Briefcase, label: 'Real setup from day one', desc: 'Own entire modules of the product.' },
    { icon: Globe, label: 'Work directly with founder', desc: 'Close mentorship & direct impact.' },
    { icon: Coffee, label: 'Remote & flexible', desc: 'Work from anywhere in India on your schedule.' },
    { icon: Heart, label: 'Early team ESOPs', desc: 'Rewards and equity for top performers.' },
];

const TEAMS = ['All', 'Engineering', 'Product', 'Growth', 'Customer'];

export default function CareersPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [expandedRole, setExpandedRole] = useState(null);

    const filteredRoles = CAREERS_ROLES.filter(r =>
        activeFilter === 'All' ? true : r.team === activeFilter
    );

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', color: '#F8FAFC' }}>
            <div style={{ paddingTop: 80 }}>
                {/* Hero Section */}
                <section style={{ padding: '80px 0 60px', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.06))', borderBottom: '1px solid #334155', textAlign: 'center' }}>
                    <div className="container">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 24 }}>
                            <span style={{ color: '#60A5FA', fontSize: 13, fontWeight: 600 }}>Join the founding team</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>
                            Build the future of <br />
                            <span style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                campus hackathons in India
                            </span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
                            Join a small, fast team shipping tools for schools, coaching institutes, and colleges to run world-class tech events.
                        </p>
                        <a href="#open-roles" className="btn-gradient" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: 16 }}>
                            View open roles
                        </a>
                    </div>
                </section>

                {/* Why Work With Us */}
                <section style={{ padding: '80px 0 60px' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>Why work with us?</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                            {PERKS.map(p => (
                                <div key={p.label} style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: '32px 24px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        <p.icon size={26} color="#3B82F6" />
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{p.label}</div>
                                    <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.5 }}>{p.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Roles */}
                <section id="open-roles" style={{ padding: '40px 0 80px' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Open Roles</h2>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
                            {TEAMS.map(team => (
                                <button
                                    key={team}
                                    onClick={() => { setActiveFilter(team); setExpandedRole(null); }}
                                    style={{
                                        padding: '8px 20px', borderRadius: 9999, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                        background: activeFilter === team ? '#3B82F6' : '#1E293B',
                                        color: activeFilter === team ? '#FFF' : '#94A3B8',
                                        border: `1px solid ${activeFilter === team ? '#3B82F6' : '#334155'}`,
                                    }}
                                >
                                    {team}
                                </button>
                            ))}
                        </div>

                        {/* Roles List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 64 }}>
                            {filteredRoles.map(role => {
                                const isExpanded = expandedRole === role.id;
                                return (
                                    <div key={role.id} style={{
                                        background: '#1E293B', borderRadius: 16, border: `1px solid ${isExpanded ? '#3B82F6' : '#334155'}`,
                                        overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
                                        boxShadow: isExpanded ? '0 12px 32px rgba(0,0,0,0.3)' : 'none'
                                    }}>
                                        {/* Card Header (Clickable) */}
                                        <div
                                            onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                                            style={{ padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', flexWrap: 'wrap', gap: 20 }}
                                        >
                                            <div style={{ flex: 1, minWidth: 280 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontSize: 22, fontWeight: 700, color: isExpanded ? '#3B82F6' : '#F8FAFC', transition: 'color 0.2s' }}>{role.title}</h3>
                                                    <span style={{ padding: '4px 12px', borderRadius: 9999, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>{role.team}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: 16, color: '#64748B', fontSize: 14, marginBottom: 12, fontWeight: 500, flexWrap: 'wrap' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={16} /> {role.type}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={16} /> {role.location}</span>
                                                </div>
                                                <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{role.shortDesc}</p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, alignSelf: 'center' }}>
                                                {!isExpanded && (
                                                    <span className="btn-outline" style={{ pointerEvents: 'none', padding: '8px 20px', fontSize: 14 }}>View details</span>
                                                )}
                                                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: '#64748B' }}>
                                                    <ChevronDown size={24} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details Panel */}
                                        {isExpanded && (
                                            <div style={{ padding: '0 32px 32px', borderTop: '1px solid #334155', marginTop: 8, animation: 'slideDown 0.3s ease-out' }}>
                                                <div style={{ marginTop: 32 }}>
                                                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#F8FAFC' }}>About the role</h4>
                                                    <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>{role.aboutRole}</p>

                                                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#F8FAFC' }}>Key responsibilities</h4>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                                                        {role.responsibilities.map((req, i) => (
                                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, color: '#CBD5E1', fontSize: 15, lineHeight: 1.6 }}>
                                                                <div style={{ marginTop: 4, color: '#3B82F6' }}>•</div>
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#F8FAFC' }}>Requirements</h4>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                                                        {role.requirements.map((req, i) => (
                                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, color: '#CBD5E1', fontSize: 15, lineHeight: 1.6 }}>
                                                                <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 4 }} />
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#F8FAFC' }}>What you'll get</h4>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px' }}>
                                                        {role.perks.map((req, i) => (
                                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, color: '#CBD5E1', fontSize: 15, lineHeight: 1.6 }}>
                                                                <div style={{ marginTop: 4, color: '#8B5CF6' }}>•</div>
                                                                <span>{req}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    <div style={{ padding: '24px', background: 'rgba(59,130,246,0.1)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Ready to build with us?</div>
                                                            <div style={{ color: '#94A3B8', fontSize: 14 }}>Send us an email with your resume and a quick intro.</div>
                                                        </div>
                                                        <a href={role.ctaLink} className="btn-gradient" style={{ textDecoration: 'none', padding: '12px 28px', fontSize: 15, whiteSpace: 'nowrap' }}>
                                                            {role.ctaText}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredRoles.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#1E293B', borderRadius: 16, border: '1px solid #334155' }}>
                                    No open roles found for this department matching our current criteria.
                                </div>
                            )}
                        </div>

                        {/* General CTA Footer */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', borderRadius: 20, border: '1px solid rgba(59,130,246,0.2)', padding: '48px 32px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Mail size={32} color="#3B82F6" />
                            </div>
                            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Didn't find your perfect role?</h3>
                            <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
                                We are always looking for passionate builders. If you want to help solve India's campus tech problems, drop us a line anyway!
                            </p>
                            <a href="mailto:hello@hackly.online?subject=Open Application: Let's build Hackly" className="btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', padding: '12px 32px', fontSize: 15 }}>
                                Email us at hello@hackly.online
                            </a>
                        </div>
                    </div>
                </section>
            </div>
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
