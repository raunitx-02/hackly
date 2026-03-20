import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
    MapPin, Calendar, Users, Clock, Tag, ChevronDown,
    CheckCircle, ExternalLink, Trophy
} from 'lucide-react';

function TabButton({ label, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '16px 28px', background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#F8FAFC' : '#64748B', fontWeight: active ? 700 : 500,
            fontSize: 15, borderBottom: active ? '3px solid #3B82F6' : '3px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
            letterSpacing: '0.01em'
        }}>
            {label}
        </button>
    );
}

export default function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [sponsors, setSponsors] = useState([]);
    const [adoptedTracks, setAdoptedTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [openPS, setOpenPS] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubEvent = onSnapshot(doc(db, 'events', id), (snap) => {
            if (snap.exists()) setEvent({ id: snap.id, ...snap.data() });
            setLoading(false);
        });
        
        const q = query(collection(db, 'events', id, 'sponsors'));
        const unsubSponsors = onSnapshot(q, (snap) => {
            setSponsors(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.createdAt - a.createdAt));
        });

        const qSponsorships = query(collection(db, 'eventSponsorships'), where('eventId', '==', id));
        const unsubSponsorships = onSnapshot(qSponsorships, (snap) => {
            setAdoptedTracks(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(a => a.status === 'active'));
        });

        return () => {
            unsubEvent();
            unsubSponsors();
            unsubSponsorships();
        };
    }, [id]);

    const handleSponsorClick = async (sponsor) => {
        try {
            await updateDoc(doc(db, 'events', id, 'sponsors', sponsor.id), {
                clicks: (sponsor.clicks || 0) + 1
            });
        } catch (err) {
            console.error("Failed to track sponsor click:", err);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!event) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#F8FAFC', marginBottom: 8 }}>Event not found</h2>
                <button onClick={() => navigate('/events')} className="btn-gradient">Browse Events</button>
            </div>
        </div>
    );

    const TYPE_COLORS = {
        'Hackathon': '#3B82F6', 'Tech Fest': '#8B5CF6', 'Coding Contest': '#10B981', 'Workshop': '#F59E0B',
    };
    const typeColor = TYPE_COLORS[event.type] || '#3B82F6';

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 68 }}>
                {/* Hero Banner */}
                <div style={{
                    background: event.bannerUrl 
                        ? `linear-gradient(rgba(15,23,42,0.7), #0F172A), url(${event.bannerUrl})` 
                        : `linear-gradient(135deg, ${typeColor}30 0%, rgba(15,23,42,0.9) 60%, #0F172A 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderBottom: '1px solid #334155', 
                    padding: '80px 0 0',
                    position: 'relative', 
                    overflow: 'hidden',
                }}>
                    {!event.bannerUrl && (
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.06,
                            backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        }} />
                    )}
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ marginBottom: 40 }}>
                            <span style={{
                                display: 'inline-flex', padding: '6px 16px', borderRadius: 9999,
                                fontSize: 12, fontWeight: 700, marginBottom: 20,
                                background: `${typeColor}25`, color: typeColor, border: `1px solid ${typeColor}40`,
                                letterSpacing: '0.05em', textTransform: 'uppercase'
                            }}>{event.type}</span>
                            <h1 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 800, color: '#F8FAFC', marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                                {event.title}
                            </h1>
                            <p style={{ color: '#94A3B8', fontSize: 'clamp(16px, 2.5vw, 19px)', marginBottom: 32, maxWidth: 800, lineHeight: 1.6 }}>{event.tagline}</p>
                            
                            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MapPin size={18} color="#64748B" />
                                    <span style={{ color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>{event.college}, {event.city}</span>
                                </div>
                                {event.startDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Calendar size={18} color="#64748B" />
                                        <span style={{ color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>
                                            {new Date(event.startDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Tag size={18} color="#64748B" />
                                    <span style={{ color: '#94A3B8', fontSize: 15, fontWeight: 500 }}>{event.mode || 'Online'}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
                                <button onClick={() => navigate(`/events/${id}/register`)} className="btn-gradient" style={{ fontSize: 17, padding: '16px 40px', flex: '0 1 auto', minWidth: 200, justifyContent: 'center' }}>
                                    Register Now 🚀
                                </button>
                                {event.publicProjects && (
                                    <Link to={`/events/${id}/projects`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 40px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14, color: '#3B82F6', fontSize: 17, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', flex: '0 1 auto', justifyContent: 'center' }}>
                                        <ExternalLink size={20} /> View Gallery
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid #334155', overflowX: 'auto', gap: 8 }}>
                            {['overview', 'teams', 'submissions', 'leaderboard'].map(t => (
                                <TabButton key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="container" style={{ paddingTop: 48, paddingBottom: 100 }}>
                    {tab === 'overview' && (
                        <div className="overview-grid">
                            <style>{`
                                .overview-grid {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 40px;
                                }
                                @media (min-width: 1100px) {
                                    .overview-grid {
                                        display: grid;
                                        grid-template-columns: 1fr 360px;
                                        gap: 40px;
                                    }
                                }
                            `}</style>
                            
                            {/* Left Content */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                {event.description && (
                                    <div className="card-premium">
                                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#F8FAFC' }}>About This Event</h2>
                                        <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.description}</p>
                                    </div>
                                )}

                                {event.rules && (
                                    <div className="card-premium">
                                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#F8FAFC' }}>Rules & Regulations</h2>
                                        <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.rules}</p>
                                    </div>
                                )}

                                {/* Timeline */}
                                {event.startDate && (
                                    <div className="card-premium">
                                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 28, color: '#F8FAFC' }}>Event Timeline</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                            {[
                                                { label: 'Registration Opens', date: event.createdAt, done: true },
                                                { label: 'Registration Deadline', date: event.registrationDeadline, done: new Date() > new Date(event.registrationDeadline) },
                                                { label: 'Event Starts', date: event.startDate, done: new Date() > new Date(event.startDate) },
                                                { label: 'Event Ends', date: event.endDate, done: new Date() > new Date(event.endDate) },
                                            ].map((item, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
                                                    {i < 3 && <div style={{ position: 'absolute', left: 12, top: 32, bottom: -16, width: 2, background: item.done ? '#10B981' : '#334155', opacity: 0.3 }} />}
                                                    <div style={{
                                                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                                                        background: item.done ? 'rgba(16,185,129,0.2)' : 'rgba(51,65,85,0.5)',
                                                        border: `2px solid ${item.done ? '#10B981' : '#334155'}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        zIndex: 2
                                                    }}>
                                                        {item.done && <CheckCircle size={14} color="#10B981" />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: item.done ? '#F8FAFC' : '#64748B', marginBottom: 4 }}>{item.label}</div>
                                                        <div style={{ fontSize: 14, color: '#94A3B8' }}>
                                                            {item.date ? new Date(item.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Problem Statements */}
                                {event.problemStatements?.length > 0 && (
                                    <div className="card-premium">
                                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#F8FAFC' }}>Problem Statements</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {event.problemStatements.map((ps, i) => (
                                                <div key={i} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #334155' }}>
                                                    <button onClick={() => setOpenPS(openPS === i ? null : i)} style={{
                                                        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '18px 24px', background: openPS === i ? 'rgba(59,130,246,0.1)' : '#0F172A',
                                                        border: 'none', cursor: 'pointer',
                                                        color: '#F8FAFC', fontWeight: 600, fontSize: 16, textAlign: 'left',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <span style={{ color: '#3B82F6', fontWeight: 800 }}>{i + 1}.</span>
                                                            {ps.length > 50 ? ps.slice(0, 50) + '...' : ps}
                                                        </span>
                                                        <ChevronDown size={20} color="#64748B" style={{ transform: openPS === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                                    </button>
                                                    {openPS === i && (
                                                        <div style={{ padding: '20px 24px', background: 'rgba(59,130,246,0.05)', borderTop: '1px solid #334155' }}>
                                                            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.8 }}>{ps}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Content / Sidebar */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                {/* Prize Pool Podium - FIXING SPACING */}
                                {(event.prizes?.first || event.prizes?.second || event.prizes?.third) && (
                                    <div className="card-premium" style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                            <Trophy size={20} color="#F59E0B" /> Prize Pool
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 32, minHeight: 180 }}>
                                            {[
                                                { rank: '2nd', prize: event.prizes?.second, height: 90, color: '#94A3B8', medal: '🥈', medalSize: 24 },
                                                { rank: '1st', prize: event.prizes?.first, height: 130, color: '#F59E0B', medal: '🥇', medalSize: 32 },
                                                { rank: '3rd', prize: event.prizes?.third, height: 70, color: '#CD7F32', medal: '🥉', medalSize: 24 },
                                            ].map(p => p.prize && (
                                                <div key={p.rank} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <div style={{ fontSize: p.medalSize, marginBottom: 8 }}>{p.medal}</div>
                                                    <div style={{ fontWeight: 800, fontSize: 'clamp(12px, 3.5vw, 15px)', color: p.color, marginBottom: 16, whiteSpace: 'nowrap' }}>₹{Number(p.prize).toLocaleString()}</div>
                                                    <div style={{ 
                                                        background: `linear-gradient(180deg, ${p.color}30 0%, ${p.color}10 100%)`, 
                                                        borderRadius: '12px 12px 4px 4px', 
                                                        width: '100%',
                                                        height: p.height, 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        border: `1px solid ${p.color}40`,
                                                        boxShadow: `0 4px 12px ${p.color}10`
                                                    }}>
                                                        <span style={{ color: p.color, fontWeight: 800, fontSize: 13, opacity: 0.9 }}>{p.rank}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {event.prizes?.total && (
                                            <div style={{ padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: 14, border: '1px solid rgba(59,130,246,0.2)' }}>
                                                <div style={{ color: '#64748B', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Prize Pool</div>
                                                <div style={{ color: '#3B82F6', fontWeight: 800, fontSize: 22 }}>₹{Number(event.prizes.total).toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quick Info */}
                                <div className="card-premium">
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Event Details</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {[
                                            { icon: Users, label: 'Max Team Size', value: event.maxTeamSize },
                                            { icon: Users, label: 'Max Participants', value: event.maxParticipants },
                                            { icon: Calendar, label: 'Reg. Deadline', value: event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString('en-IN') : '—' },
                                            { icon: Clock, label: 'Duration', value: event.startDate && event.endDate ? Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)) + 'h' : '—' },
                                        ].map(item => (
                                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #334155' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <item.icon size={16} color="#64748B" />
                                                    <span style={{ color: '#94A3B8', fontSize: 14 }}>{item.label}</span>
                                                </div>
                                                <span style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 700 }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Judging Criteria */}
                                {event.judgingCriteria?.length > 0 && (
                                    <div className="card-premium">
                                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Judging Criteria</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {event.judgingCriteria.map(c => (
                                                <div key={c.name}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                                                        <span style={{ color: '#3B82F6', fontSize: 14, fontWeight: 800 }}>{c.weight}%</span>
                                                    </div>
                                                    <div style={{ height: 6, background: '#334155', borderRadius: 3, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${c.weight}%`, background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: 3 }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'teams' && (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div className="card-premium" style={{ maxWidth: 500, margin: '0 auto' }}>
                                <Users size={48} color="#334155" style={{ marginBottom: 20 }} />
                                <h2 style={{ color: '#F8FAFC', marginBottom: 12 }}>Team Management</h2>
                                <p style={{ color: '#94A3B8', marginBottom: 28 }}>View and manage all registered teams on the central Teams portal.</p>
                                <Link to={`/events/${id}/teams`} className="btn-gradient" style={{ textDecoration: 'none', padding: '14px 32px' }}>Go to Teams Portal →</Link>
                            </div>
                        </div>
                    )}

                    {/* Other tabs follow similar premium pattern */}
                    {['submissions', 'leaderboard'].includes(tab) && (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                           <div className="card-premium" style={{ maxWidth: 500, margin: '0 auto' }}>
                                <Trophy size={48} color="#F59E0B" style={{ marginBottom: 20 }} />
                                <h2 style={{ color: '#F8FAFC', marginBottom: 12 }}>{tab.charAt(0).toUpperCase() + tab.slice(1)} Portal</h2>
                                <p style={{ color: '#94A3B8', marginBottom: 28 }}>Access the official {tab} and live scores here.</p>
                                <Link to={`/events/${id}/${tab}`} className="btn-gradient" style={{ textDecoration: 'none', padding: '14px 32px' }}>View {tab.charAt(0).toUpperCase() + tab.slice(1)} →</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.3); }
            `}</style>
        </div>
    );
}
