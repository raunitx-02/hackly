import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap,
    Mail,
    Users,
    ChevronRight,
    Globe
} from 'lucide-react';
import { ABOUT_COPY } from '../data/aboutConfig';
import BookCallModal from '../components/BookCallModal';

export default function AboutPage() {
    const [isBookCallOpen, setIsBookCallOpen] = useState(false);

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', color: '#F8FAFC' }}>
            <div style={{ paddingTop: 80 }}>
                {/* ─── 1) MISSION & VISION ─── */}
                <section style={{ padding: '100px 0 80px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.05,
                        backgroundImage: `radial-gradient(#3B82F6 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }} />
                    <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 16px', borderRadius: 9999,
                            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                            marginBottom: 24,
                        }}>
                            <Zap size={14} color="#3B82F6" fill="#3B82F6" />
                            <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Our Mission
                            </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>
                            {ABOUT_COPY.mission.title}
                        </h1>
                        <div style={{ maxWidth: 720, margin: '0 auto 48px' }}>
                            {ABOUT_COPY.mission.paragraphs.map((p, i) => (
                                <p key={i} style={{ color: '#94A3B8', fontSize: 18, lineHeight: 1.8, marginBottom: 20 }}>{p}</p>
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 32 }}>
                                Our Focus
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                                {ABOUT_COPY.mission.focus.map((item, i) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div key={i} style={{ background: '#1E293B', padding: 32, borderRadius: 24, border: '1px solid #334155', textAlign: 'left', transition: 'transform 0.2s' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(59,130,246,0.2)' }}>
                                                <IconComponent size={22} color="#3B82F6" />
                                            </div>
                                            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{item.title}</h4>
                                            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6 }}>{item.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── 2) THE STORY BEHIND HACKLY ─── */}
                <section style={{ padding: '80px 0', background: 'rgba(30,41,59,0.3)', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24, letterSpacing: '-0.01em' }}>
                                    {ABOUT_COPY.story.title}
                                </h2>
                                {ABOUT_COPY.story.paragraphs.map((p, i) => (
                                    <p key={i} style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>{p}</p>
                                ))}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                                    borderRadius: 24, border: '1px solid #334155',
                                    padding: 40, position: 'relative', zIndex: 1,
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                                }}>
                                    <div style={{ fontSize: 44, fontWeight: 800, color: '#3B82F6', opacity: 0.2, position: 'absolute', top: 20, right: 30 }}>&ldquo;</div>
                                    <p style={{ fontSize: 18, fontStyle: 'italic', color: '#CBD5E1', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
                                        "Hackly was born out of real frustration in Indian campuses. We don't just build features; we build solutions to the chaos we lived through."
                                    </p>
                                </div>
                                <div style={{ position: 'absolute', inset: '-10px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: 28, opacity: 0.1, zIndex: 0 }} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── 3) BUILT BY A STUDENT FOUNDER ─── */}
                <section style={{ padding: '100px 0' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 60 }}>
                            <h2 style={{ fontSize: 36, fontWeight: 800 }}>{ABOUT_COPY.founder.title}</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 64, alignItems: 'start' }} className="founder-grid">
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 240, height: 240, borderRadius: '50%', margin: '0 auto 24px',
                                    background: 'linear-gradient(135deg, #3B82F620, #8B5CF620)',
                                    border: '4px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                    {ABOUT_COPY.founder.image ? (
                                        <img src={ABOUT_COPY.founder.image} alt={ABOUT_COPY.founder.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Users size={80} color="#3B82F6" opacity={0.5} />
                                    )}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.8))' }} />
                                </div>
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{ABOUT_COPY.founder.name}</h3>
                                <p style={{ color: '#3B82F6', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ABOUT_COPY.founder.tagline}</p>
                                <p style={{ color: '#64748B', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <Globe size={12} /> {ABOUT_COPY.founder.location}
                                </p>

                                <div style={{
                                    marginTop: 32, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                                    borderRadius: 20, border: '1px solid rgba(59,130,246,0.2)', padding: 24, textAlign: 'left'
                                }}>
                                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#F8FAFC' }}>{ABOUT_COPY.founder.collab.title}</h4>
                                    <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6, marginBottom: 20 }}>{ABOUT_COPY.founder.collab.text}</p>
                                    <a href={`mailto:${ABOUT_COPY.founder.email}`} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', width: '100%', textDecoration: 'none', fontSize: 14, padding: '10px' }}>
                                        <Mail size={16} /> Email the founder
                                    </a>
                                </div>
                            </div>

                            <div style={{ paddingTop: 20 }}>
                                <div style={{
                                    background: '#1E293B', borderRadius: 24, border: '1px solid #334155',
                                    padding: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}>
                                    <p style={{ color: '#CBD5E1', fontSize: 17, lineHeight: 1.8, marginBottom: 32 }}>
                                        {ABOUT_COPY.founder.bio}
                                    </p>

                                    <div style={{ borderTop: '1px solid #334155', paddingTop: 32 }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>
                                            Tech Stack Used
                                        </h4>
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            {ABOUT_COPY.founder.techStack.map(tech => (
                                                <div key={tech} style={{
                                                    background: '#0F172A', color: '#94A3B8', padding: '8px 16px',
                                                    borderRadius: 10, fontSize: 13, border: '1px solid #334155',
                                                    display: 'flex', alignItems: 'center', gap: 8
                                                }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
                                                    {tech}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── 4) WHAT WE'RE BUILDING NEXT ─── */}
                <section style={{ padding: '80px 0', background: 'rgba(30,41,59,0.3)', borderTop: '1px solid #334155' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 56 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 800 }}>{ABOUT_COPY.roadmap.title}</h2>
                            <p style={{ color: '#64748B', marginTop: 12 }}>A look at our product development cycle</p>
                        </div>

                        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 16 }}>
                            {ABOUT_COPY.roadmap.items.map((item, i) => (
                                <div key={item.id} style={{
                                    background: '#1E293B', padding: '24px 32px', borderRadius: 20,
                                    border: '1px solid #334155', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', gap: 24
                                }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 14, background: '#0F172A',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155'
                                        }}>
                                            <span style={{ fontSize: 18, color: '#3B82F6', fontWeight: 800 }}>0{i + 1}</span>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{item.title}</h4>
                                            <p style={{ color: '#94A3B8', fontSize: 14 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '4px 12px', borderRadius: 999, background: 'rgba(59,130,246,0.1)',
                                        border: '1px solid rgba(59,130,246,0.2)', color: '#3B82F6', fontSize: 11,
                                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        {item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── 5) CALL-TO-ACTION STRIP ─── */}
                <section style={{ padding: '100px 0' }}>
                    <div className="container">
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                            border: '1px solid rgba(59,130,246,0.3)', borderRadius: 24, padding: '64px 40px',
                            textAlign: 'center', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} />

                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, marginBottom: 16, maxWidth: 800, margin: '0 auto 16px' }}>
                                {ABOUT_COPY.cta.heading}
                            </h2>
                            <p style={{ color: '#94A3B8', fontSize: 17, marginBottom: 36, maxWidth: 640, margin: '0 auto 36px' }}>
                                {ABOUT_COPY.cta.subheading}
                            </p>
                            <button onClick={() => setIsBookCallOpen(true)} className="btn-gradient" style={{ fontSize: 16, padding: '14px 32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                {ABOUT_COPY.cta.buttonText} <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <BookCallModal isOpen={isBookCallOpen} onClose={() => setIsBookCallOpen(false)} source="about_page_bottom" />

            <style>{`
                @media (max-width: 900px) {
                    .founder-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                }
                @media (max-width: 768px) {
                    .container > div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
