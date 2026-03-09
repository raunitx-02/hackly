import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { CalendarDays, Users, Zap, DollarSign, Eye, Edit, Trash2, Plus, TrendingUp, Clock, Shield, ShieldCheck } from 'lucide-react';
import { calculateEngagementScore, getReliabilityTier } from '../lib/engagementHelpers';

// ── Shared UI ────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
    return (
        <div style={{
            background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s',
        }}
            onMouseEnter={e => e.currentTarget.style.borderColor = color}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
        >
            <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', lineHeight: 1.2 }}>{value}</div>
                <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>{label}</div>
                {sub && <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        draft: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: 'Draft' },
        published: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: 'Published' },
        active: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Active' },
        ended: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Ended' },
    };
    const s = styles[status] || styles.draft;
    return (
        <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
}

// ── Organizer Dashboard ──────────────────────────────────────────
function OrganizerDashboard() {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ total: 0, registrations: 0, active: 0, prize: 0 });

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'events'), where('organizerId', '==', currentUser.uid));
        const unsub = onSnapshot(q, (snap) => {
            const evs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setEvents(evs);
            const active = evs.filter(e => e.status === 'active').length;
            const prize = evs.reduce((sum, e) => sum + (Number(e.prizes?.total) || 0), 0);
            setStats({ total: evs.length, registrations: 0, active, prize });
        });
        return unsub;
    }, [currentUser]);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Organizer Dashboard</h1>
                    <p style={{ color: '#64748B', fontSize: 15 }}>Manage your events and track performance</p>
                </div>
                <Link to="/events/create" className="btn-gradient" style={{ textDecoration: 'none', fontSize: 14, padding: '11px 20px' }}>
                    <Plus size={16} /> New Event
                </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <StatCard label="Total Events" value={stats.total} icon={CalendarDays} color="#3B82F6" />
                <StatCard label="Registrations" value={stats.registrations} icon={Users} color="#8B5CF6" sub="across all events" />
                <StatCard label="Active Events" value={stats.active} icon={Zap} color="#10B981" />
                <StatCard label="Total Prize Pool" value={stats.prize ? `₹${stats.prize.toLocaleString()}` : '₹0'} icon={DollarSign} color="#F59E0B" />
            </div>

            {/* Events Table */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>My Events</h2>
                    <TrendingUp size={18} color="#64748B" />
                </div>
                {events.length === 0 ? (
                    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <CalendarDays size={40} color="#334155" style={{ marginBottom: 16 }} />
                        <p style={{ color: '#64748B', marginBottom: 16 }}>No events yet. Create your first event!</p>
                        <Link to="/events/create" className="btn-gradient" style={{ textDecoration: 'none', fontSize: 14 }}>
                            <Plus size={16} /> Create Event
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155' }}>
                                    {['Event', 'Type', 'Date', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id} style={{ borderBottom: '1px solid #334155' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: 14 }}>{ev.title}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{ev.college}</div>
                                        </td>
                                        <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 13 }}>{ev.type}</td>
                                        <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 13, whiteSpace: 'nowrap' }}>
                                            {ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <StatusBadge status={ev.status} />
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Link to={`/events/${ev.id}`} style={{ padding: '6px', color: '#64748B', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', transition: 'color 0.15s', textDecoration: 'none' }}
                                                    title="View"
                                                    onMouseEnter={e => e.currentTarget.style.color = '#3B82F6'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                                                >
                                                    <Eye size={15} />
                                                </Link>
                                                <Link to={`/dashboard/events/${ev.id}/admin`} style={{ padding: '6px', color: '#64748B', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', transition: 'color 0.15s', textDecoration: 'none' }}
                                                    title="Admin Dashboard"
                                                    onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                                                >
                                                    <Shield size={15} />
                                                </Link>
                                                <Link to={`/events/create?edit=${ev.id}`} style={{ padding: '6px', color: '#64748B', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', transition: 'color 0.15s', textDecoration: 'none' }}
                                                    title="Edit"
                                                    onMouseEnter={e => e.currentTarget.style.color = '#F59E0B'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                                                >
                                                    <Edit size={15} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Participant Dashboard ────────────────────────────────────────
function ParticipantDashboard() {
    const { currentUser } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [browseEvents, setBrowseEvents] = useState([]);
    const [userStats, setUserStats] = useState({ eventsRegistered: 0, eventsCheckedIn: 0, projectsSubmitted: 0 });

    useEffect(() => {
        if (!currentUser) return;

        // Listen to User Stats
        const userUnsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists() && docSnap.data().stats) {
                setUserStats(docSnap.data().stats);
            }
        });

        const q = query(collection(db, 'registrations'), where('userId', '==', currentUser.uid));
        const unsub = onSnapshot(q, (snap) => {
            setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const eq = query(collection(db, 'events'), where('status', '==', 'published'));
        const evqUnsub = onSnapshot(eq, (snap) => {
            setBrowseEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 3));
        });

        return () => { unsub(); userUnsub(); evqUnsub(); };
    }, [currentUser]);

    const score = calculateEngagementScore(userStats);
    const tier = getReliabilityTier(score, userStats.eventsRegistered);

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Participant Dashboard</h1>
                <p style={{ color: '#64748B', fontSize: 15 }}>Track your registrations, teams, and submissions</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <StatCard label="Registered Events" value={userStats.eventsRegistered || 0} icon={CalendarDays} color="#3B82F6" />
                <StatCard label="Events Attended" value={userStats.eventsCheckedIn || 0} icon={Users} color="#8B5CF6" />
                <StatCard label="Projects Submitted" value={userStats.projectsSubmitted || 0} icon={Zap} color="#10B981" />

                {/* Reliability Score Card */}
                <div style={{
                    background: '#1E293B', border: `1px solid ${tier.color}40`, borderRadius: 16, padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: tier.bg, borderRadius: '50%', filter: 'blur(30px)', transform: 'translate(20%, -20%)' }} />
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0, zIndex: 1,
                        background: tier.bg, border: `1px solid ${tier.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShieldCheck size={22} color={tier.color} />
                    </div>
                    <div style={{ zIndex: 1 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {score}
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: tier.bg, color: tier.color, border: `1px solid ${tier.color}30` }}>
                                {tier.label}
                            </span>
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>Anti-Ghosting Score</div>
                        <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>{tier.label === 'New User' ? 'Sign up for events!' : 'Keep showing up!'}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* My Registrations */}
                <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #334155' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>My Registrations</h2>
                    </div>
                    {registrations.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 14 }}>No registrations yet</p>
                            <Link to="/events" className="btn-gradient" style={{ textDecoration: 'none', fontSize: 13, padding: '9px 18px' }}>
                                Browse Events
                            </Link>
                        </div>
                    ) : (
                        <div style={{ padding: '12px' }}>
                            {registrations.map(r => (
                                <div key={r.id} style={{ padding: '12px', borderRadius: 8, marginBottom: 8, background: '#0F172A', border: '1px solid #334155' }}>
                                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14 }}>{r.eventId}</div>
                                    <div style={{ color: '#64748B', fontSize: 12 }}>Registered {new Date(r.registeredAt).toLocaleDateString('en-IN')}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommended Events */}
                <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Discover Events</h2>
                        <Link to="/events" style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                    </div>
                    {browseEvents.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ color: '#64748B', fontSize: 14 }}>No events available right now</p>
                        </div>
                    ) : (
                        <div style={{ padding: '12px' }}>
                            {browseEvents.map(ev => (
                                <Link key={ev.id} to={`/events/${ev.id}`} style={{ display: 'block', padding: '12px', borderRadius: 8, marginBottom: 8, background: '#0F172A', border: '1px solid #334155', textDecoration: 'none', transition: 'border-color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
                                >
                                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ev.title}</div>
                                    <div style={{ color: '#64748B', fontSize: 12 }}>{ev.college} · {ev.city}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Judge Dashboard ──────────────────────────────────────────────
function JudgeDashboard() {
    const { currentUser } = useAuth();
    const [assignedEvents, setAssignedEvents] = useState([]);

    useEffect(() => {
        if (!currentUser) return;
        // Fetch events where judge email is in judges array
        const q = query(collection(db, 'events'));
        const unsub = onSnapshot(q, (snap) => {
            const evs = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(ev => (ev.judges || []).includes(currentUser.email));
            setAssignedEvents(evs);
        });
        return unsub;
    }, [currentUser]);

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Judge Dashboard</h1>
                <p style={{ color: '#64748B', fontSize: 15 }}>Review and score project submissions</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <StatCard label="Assigned Events" value={assignedEvents.length} icon={CalendarDays} color="#3B82F6" />
                <StatCard label="Pending Reviews" value={0} icon={Clock} color="#F59E0B" />
                <StatCard label="Completed" value={0} icon={Zap} color="#10B981" />
                <StatCard label="Total Scored" value={0} icon={TrendingUp} color="#8B5CF6" />
            </div>

            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid #334155' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Assigned Events</h2>
                </div>
                {assignedEvents.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Clock size={40} color="#334155" style={{ marginBottom: 16 }} />
                        <p style={{ color: '#64748B', fontSize: 14 }}>No events assigned yet. Organizers will add you by email.</p>
                    </div>
                ) : (
                    <div style={{ padding: '12px' }}>
                        {assignedEvents.map(ev => (
                            <div key={ev.id} style={{
                                padding: '16px', borderRadius: 10, marginBottom: 8,
                                background: '#0F172A', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{ev.title}</div>
                                    <div style={{ color: '#64748B', fontSize: 13 }}>{ev.college} · {ev.city}</div>
                                </div>
                                <Link to={`/events/${ev.id}/judge`} className="btn-gradient" style={{ fontSize: 13, padding: '9px 18px', textDecoration: 'none' }}>
                                    Judge Panel
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Dashboard Page ──────────────────────────────────────────
export default function DashboardPage() {
    const { userProfile } = useAuth();

    const content = userProfile?.role === 'organizer' ? <OrganizerDashboard />
        : userProfile?.role === 'judge' ? <JudgeDashboard />
            : <ParticipantDashboard />;

    return <DashboardLayout>{content}</DashboardLayout>;
}
