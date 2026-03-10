import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    MapPin, Calendar, Trophy, Users, Clock, Tag, ChevronDown, X,
    Award, CheckCircle, ExternalLink, Star, BarChart3,
} from 'lucide-react';
import { ORGANIZER_CONFIG } from '../data/advancedOrganizerConfig';

function TabButton({ label, active, onClick }) {
    return (
        <button onClick={onClick} style={{
            padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#F8FAFC' : '#64748B', fontWeight: active ? 700 : 400,
            fontSize: 15, borderBottom: active ? '2px solid #3B82F6' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}>
            {label}
        </button>
    );
}

function RegisterModal({ event, onClose }) {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState('create');
    const [teamName, setTeamName] = useState('');
    const [appData, setAppData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!currentUser) { toast.error('Please login first'); navigate('/auth'); return; }

        const isReview = event.registrationMode === 'review';
        if (isReview && (!appData.motivation || !appData.skills)) {
            toast.error('Please fill in motivation and skills.');
            return;
        }

        setSubmitting(true);
        try {
            const regRef = await addDoc(collection(db, 'registrations'), {
                eventId: event.id, userId: currentUser.uid,
                registeredAt: new Date().toISOString(),
                status: isReview ? 'pending' : 'accepted',
                applicationData: isReview ? appData : null,
            });
            if (mode === 'create' && teamName) {
                await addDoc(collection(db, 'teams'), {
                    eventId: event.id, teamName: teamName.trim(),
                    leaderId: currentUser.uid, members: [currentUser.uid],
                    isOpen: true, createdAt: new Date().toISOString(),
                    status: isReview ? 'pending' : 'accepted',
                    applicationData: isReview ? appData : null,
                });
            }
            toast.success('Registered successfully! 🎉');
            onClose();
        } catch (err) {
            toast.error('Registration failed: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}>
            <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid #334155', padding: 32, width: '100%', maxWidth: 460 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC' }}>Register for {event.title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {['create', 'join'].map(m => (
                        <button key={m} onClick={() => setMode(m)} style={{
                            flex: 1, padding: '10px', borderRadius: 8, border: '1px solid',
                            cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                            background: mode === m ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : '#0F172A',
                            borderColor: mode === m ? 'transparent' : '#334155',
                            color: mode === m ? 'white' : '#94A3B8',
                        }}>
                            {m === 'create' ? '🆕 Create Team' : '🤝 Join a Team'}
                        </button>
                    ))}
                </div>

                {mode === 'create' ? (
                    <div>
                        <label className="label">Team Name</label>
                        <input className="input" placeholder="Team Thunderbolt" value={teamName}
                            onChange={e => setTeamName(e.target.value)} style={{ marginBottom: 20 }} />
                    </div>
                ) : (
                    <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>
                        You'll be registered solo. Visit the Teams page to join an open team.
                    </p>
                )}

                {event.registrationMode === 'review' && (
                    <div style={{ marginBottom: 24, borderTop: '1px solid #334155', paddingTop: 20 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>Application Details</h4>
                        {ORGANIZER_CONFIG.applicationFields.map(f => (
                            <div key={f.id} style={{ marginBottom: 16 }}>
                                <label className="label">{f.label} {f.id !== 'pastProjects' && '*'}</label>
                                {f.type === 'textarea' ? (
                                    <textarea className="input" rows={3} value={appData[f.id] || ''}
                                        onChange={e => setAppData({ ...appData, [f.id]: e.target.value })} />
                                ) : (
                                    <input className="input" value={appData[f.id] || ''}
                                        onChange={e => setAppData({ ...appData, [f.id]: e.target.value })} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={handleRegister} disabled={submitting} className="btn-gradient"
                    style={{ width: '100%', justifyContent: 'center', minHeight: 44, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Registering...' : 'Confirm Registration'}
                </button>
            </div>
        </div>
    );
}

export default function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [sponsors, setSponsors] = useState([]);
    const [adoptedTracks, setAdoptedTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [showRegModal, setShowRegModal] = useState(false);
    const [openPS, setOpenPS] = useState(null);
    const { currentUser } = useAuth();
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
                clicks: sponsor.clicks + 1
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
                    background: `linear-gradient(135deg, ${typeColor}30 0%, rgba(15,23,42,0.9) 60%, #0F172A 100%)`,
                    borderBottom: '1px solid #334155', padding: '60px 0 0',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.06,
                        backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }} />
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ marginBottom: 20 }}>
                            <span style={{
                                display: 'inline-flex', padding: '5px 14px', borderRadius: 9999,
                                fontSize: 12, fontWeight: 700, marginBottom: 16,
                                background: `${typeColor}25`, color: typeColor, border: `1px solid ${typeColor}40`,
                            }}>{event.type}</span>
                            <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#F8FAFC', marginBottom: 8, lineHeight: 1.2 }}>
                                {event.title}
                            </h1>
                            <p style={{ color: '#94A3B8', fontSize: 17, marginBottom: 20 }}>{event.tagline}</p>
                            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <MapPin size={14} color="#64748B" />
                                    <span style={{ color: '#94A3B8', fontSize: 14 }}>{event.college}, {event.city}</span>
                                </div>
                                {event.startDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <Calendar size={14} color="#64748B" />
                                        <span style={{ color: '#94A3B8', fontSize: 14 }}>
                                            {new Date(event.startDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                    <Tag size={14} color="#64748B" />
                                    <span style={{ color: '#94A3B8', fontSize: 14 }}>{event.mode || 'Online'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                                <button onClick={() => setShowRegModal(true)} className="btn-gradient" style={{ fontSize: 16, padding: '13px 28px' }}>
                                    Register Now 🚀
                                </button>
                                {event.publicProjects && (
                                    <Link to={`/events/${eventId}/projects`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, color: '#3B82F6', fontSize: 16, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
                                        <ExternalLink size={18} /> View Project Gallery
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #334155', overflowX: 'auto' }}>
                            {['overview', 'teams', 'submissions', 'leaderboard'].map(t => (
                                <TabButton key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
                    {tab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
                            {/* Left */}
                            <div>
                                {event.description && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, marginBottom: 20 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>About This Event</h2>
                                        <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.description}</p>
                                    </div>
                                )}

                                {/* Timeline */}
                                {event.startDate && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, marginBottom: 20 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Timeline</h2>
                                        {[
                                            { label: 'Registration Opens', date: event.createdAt, done: true },
                                            { label: 'Registration Deadline', date: event.registrationDeadline, done: new Date() > new Date(event.registrationDeadline) },
                                            { label: 'Event Starts', date: event.startDate, done: new Date() > new Date(event.startDate) },
                                            { label: 'Event Ends', date: event.endDate, done: new Date() > new Date(event.endDate) },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                                                    background: item.done ? 'rgba(16,185,129,0.15)' : 'rgba(51,65,85,0.5)',
                                                    border: `2px solid ${item.done ? '#10B981' : '#334155'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {item.done && <CheckCircle size={13} color="#10B981" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: item.done ? '#F8FAFC' : '#64748B' }}>{item.label}</div>
                                                    <div style={{ fontSize: 12, color: '#64748B' }}>
                                                        {item.date ? new Date(item.date).toLocaleString('en-IN') : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Problem Statements */}
                                {event.problemStatements?.length > 0 && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, marginBottom: 20 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Problem Statements</h2>
                                        {event.problemStatements.map((ps, i) => (
                                            <div key={i} style={{ marginBottom: 10 }}>
                                                <button onClick={() => setOpenPS(openPS === i ? null : i)} style={{
                                                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '14px 16px', background: openPS === i ? 'rgba(59,130,246,0.08)' : '#0F172A',
                                                    border: `1px solid ${openPS === i ? 'rgba(59,130,246,0.3)' : '#334155'}`,
                                                    borderRadius: openPS === i ? '10px 10px 0 0' : 10, cursor: 'pointer',
                                                    color: '#F8FAFC', fontWeight: 600, fontSize: 14, textAlign: 'left',
                                                }}>
                                                    PS {i + 1} — {ps.length > 60 ? ps.slice(0, 60) + '...' : ps}
                                                    <ChevronDown size={16} color="#64748B" style={{ transform: openPS === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                                </button>
                                                {openPS === i && (
                                                    <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.2)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                                                        <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7 }}>{ps}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Adopted Tracks / Assets */}
                                {adoptedTracks?.length > 0 && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, marginBottom: 20 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Sponsored Tracks</h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                            {adoptedTracks.map(track => (
                                                <div key={track.id} style={{ padding: 20, background: '#0F172A', borderRadius: 12, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
                                                    <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 16 }}>{track.assetName}</div>
                                                    <div style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                                                        Powered by {track.sponsorName || 'Sponsors'}
                                                    </div>
                                                    {track.description && (
                                                        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{track.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sponsors Section */}
                                {sponsors.length > 0 && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, marginBottom: 20 }}>
                                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Event Sponsors</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                            {['Title', 'Gold', 'Silver', 'Bronze'].map(tierName => {
                                                const tierSponsors = sponsors.filter(s => s.tier === tierName);
                                                if (tierSponsors.length === 0) return null;
                                                
                                                // Dynamic sizing based on tier
                                                const tierStyles = {
                                                    'Title': { gridTemplateColumns: '1fr', imgHeight: 80, badgeColor: '#F59E0B' },
                                                    'Gold': { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', imgHeight: 60, badgeColor: '#FCD34D' },
                                                    'Silver': { gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', imgHeight: 48, badgeColor: '#94A3B8' },
                                                    'Bronze': { gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', imgHeight: 40, badgeColor: '#B45309' },
                                                };
                                                const style = tierStyles[tierName];

                                                return (
                                                    <div key={tierName}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 12 }}>
                                                            <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, #334155)' }} />
                                                            <span style={{ color: style.badgeColor, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{tierName} SPONSORS</span>
                                                            <div style={{ height: 1, flex: 1, background: 'linear-gradient(270deg, transparent, #334155)' }} />
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: style.gridTemplateColumns, gap: 16, justifyContent: 'center' }}>
                                                            {tierSponsors.map(sponsor => (
                                                                <a 
                                                                    key={sponsor.id} 
                                                                    href={sponsor.link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    onClick={() => handleSponsorClick(sponsor)}
                                                                    style={{ 
                                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                                                        background: '#0F172A', padding: 20, borderRadius: 12, border: '1px solid #334155', 
                                                                        textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' 
                                                                    }}
                                                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = style.badgeColor; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'none'; }}
                                                                >
                                                                    <img src={sponsor.logoUrl} alt={sponsor.name} style={{ height: style.imgHeight, width: '100%', objectFit: 'contain', filter: 'grayscale(20%)', transition: 'all 0.2s', mixBlendMode: 'luminosity' }} 
                                                                        onMouseOver={e => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.mixBlendMode = 'normal'; }}
                                                                        onMouseOut={e => { e.currentTarget.style.filter = 'grayscale(20%)'; e.currentTarget.style.mixBlendMode = 'luminosity'; }}
                                                                    />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Sidebar */}
                            <div>
                                {/* Prize Podium */}
                                {(event.prizes?.first || event.prizes?.second || event.prizes?.third) && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24, marginBottom: 16 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🏆 Prize Pool</h3>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                                            {[
                                                { rank: '2nd', prize: event.prizes?.second, height: 70, color: '#94A3B8', medal: '🥈' },
                                                { rank: '1st', prize: event.prizes?.first, height: 100, color: '#F59E0B', medal: '🥇' },
                                                { rank: '3rd', prize: event.prizes?.third, height: 55, color: '#CD7F32', medal: '🥉' },
                                            ].map(p => p.prize && (
                                                <div key={p.rank} style={{ textAlign: 'center', flex: 1 }}>
                                                    <div style={{ fontSize: 20 }}>{p.medal}</div>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: p.color, margin: '4px 0' }}>₹{Number(p.prize).toLocaleString()}</div>
                                                    <div style={{ background: `${p.color}20`, borderRadius: 6, height: p.height, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${p.color}40` }}>
                                                        <span style={{ color: p.color, fontWeight: 700, fontSize: 12 }}>{p.rank}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {event.prizes?.total && (
                                            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(59,130,246,0.08)', borderRadius: 8 }}>
                                                <span style={{ color: '#64748B', fontSize: 12 }}>Total Prize Pool: </span>
                                                <span style={{ color: '#3B82F6', fontWeight: 700 }}>₹{Number(event.prizes.total).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quick Info */}
                                <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24, marginBottom: 16 }}>
                                    {[
                                        { icon: Users, label: 'Max Team Size', value: event.maxTeamSize },
                                        { icon: Users, label: 'Max Participants', value: event.maxParticipants },
                                        { icon: Calendar, label: 'Registration Deadline', value: event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString('en-IN') : '—' },
                                        { icon: Clock, label: 'Duration', value: event.startDate && event.endDate ? Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)) + 'h' : '—' },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <item.icon size={14} color="#64748B" />
                                                <span style={{ color: '#64748B', fontSize: 13 }}>{item.label}</span>
                                            </div>
                                            <span style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600 }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Judging Criteria */}
                                {event.judgingCriteria?.length > 0 && (
                                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Judging Criteria</h3>
                                        {event.judgingCriteria.map(c => (
                                            <div key={c.name} style={{ marginBottom: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <span style={{ color: '#94A3B8', fontSize: 13 }}>{c.name}</span>
                                                    <span style={{ color: '#3B82F6', fontSize: 13, fontWeight: 700 }}>{c.weight}%</span>
                                                </div>
                                                <div style={{ height: 4, background: '#334155', borderRadius: 2 }}>
                                                    <div style={{ height: '100%', width: `${c.weight}%`, background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: 2 }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'teams' && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Users size={40} color="#334155" style={{ marginBottom: 16 }} />
                            <p style={{ color: '#94A3B8', marginBottom: 20 }}>View teams on the Teams page</p>
                            <a href={`/events/${id}/teams`} className="btn-gradient" style={{ textDecoration: 'none' }}>Go to Teams →</a>
                        </div>
                    )}

                    {tab === 'submissions' && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <a href={`/events/${id}/submissions`} className="btn-gradient" style={{ textDecoration: 'none' }}>Go to Submissions →</a>
                        </div>
                    )}

                    {tab === 'leaderboard' && (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <a href={`/events/${id}/leaderboard`} className="btn-gradient" style={{ textDecoration: 'none' }}>View Leaderboard →</a>
                        </div>
                    )}
                </div>
            </div>

            {showRegModal && <RegisterModal event={event} onClose={() => setShowRegModal(false)} />}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
