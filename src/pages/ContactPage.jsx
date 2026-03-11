import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Mail, Clock, MessageSquare, Phone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function ContactPage() {
    const { currentUser, userProfile } = useAuth();
    const role = userProfile?.role?.toLowerCase();
    const isOrganizerOrGuest = !currentUser || role === 'organizer';

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) { toast.error('Please fill in all required fields'); return; }
        setSending(true);
        await new Promise(r => setTimeout(r, 1200));
        toast.success('Message sent! We\'ll get back to you within 24 hours. 📬');
        setForm({ name: '', email: '', subject: '', message: '' });
        setSending(false);
    };

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                {/* Header */}
                <section style={{ padding: '72px 0 56px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid #334155', textAlign: 'center' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, marginBottom: 16 }}>
                            Get in <span style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Touch</span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                            Have a question, partnership inquiry, or just want to say hello? We'd love to hear from you.
                        </p>
                    </div>
                </section>

                <section style={{ padding: '72px 0 96px' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start', flexWrap: 'wrap' }}>
                            {/* Info */}
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32, color: '#F8FAFC' }}>Contact Information</h2>
                                {[
                                    { icon: Mail, label: 'Email', value: 'hello@hackly.online', sub: 'We reply within 24 hours' },
                                    { icon: Clock, label: 'Support Hours', value: '9 AM – 7 PM IST', sub: 'Monday to Saturday' },
                                    { icon: MapPin, label: 'HQ', value: 'India 🇮🇳', sub: 'Fully remote team' },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', gap: 16, marginBottom: 28, alignItems: 'flex-start' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(59,130,246,0.2)' }}>
                                            <item.icon size={20} color="#3B82F6" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                                            <div style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 600 }}>{item.value}</div>
                                            <div style={{ color: '#64748B', fontSize: 13 }}>{item.sub}</div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24, marginTop: 8 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>Quick Links</h3>
                                    {[
                                        { label: 'Browse Events', to: '/events' },
                                        ...(isOrganizerOrGuest ? [{ label: 'View Pricing', to: '/pricing' }] : []),
                                        { label: 'Open Roles', to: '/careers' },
                                        { label: 'Privacy Policy', to: '/privacy' },
                                    ].map(l => (
                                        <Link key={l.label} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', textDecoration: 'none', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#3B82F6'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                                        >
                                            <ArrowRight size={13} /> {l.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid #334155', padding: 36 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 28 }}>Send us a message</h2>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                                        <div>
                                            <label className="label">Name *</label>
                                            <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="label">Email *</label>
                                            <input className="input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label className="label">Subject</label>
                                        <input className="input" placeholder="Partnership / Support / General" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                                    </div>
                                    <div style={{ marginBottom: 24 }}>
                                        <label className="label">Message *</label>
                                        <textarea className="input" rows={6} placeholder="Tell us what's on your mind..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: 'vertical' }} />
                                    </div>
                                    <button type="submit" className="btn-gradient" disabled={sending} style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 16 }}>
                                        {sending ? 'Sending...' : <><MessageSquare size={16} /> Send Message</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
