import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { Search, MapPin, Calendar, Trophy, Users, Filter, ChevronRight } from 'lucide-react';

const FILTERS = ['All', 'Hackathon', 'Tech Fest', 'Coding Contest', 'Workshop', 'Online', 'Offline', 'Open'];
const TYPE_COLORS = {
    'Hackathon': '#3B82F6', 'Tech Fest': '#8B5CF6', 'Coding Contest': '#10B981',
    'Workshop': '#F59E0B', 'Online': '#06B6D4', 'Offline': '#EF4444',
};

function EventCard({ event }) {
    const typeColor = TYPE_COLORS[event.type] || '#3B82F6';
    const spotsLeft = event.maxParticipants ? event.maxParticipants - (event.registered || 0) : null;

    return (
        <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
                background: '#1E293B', border: '1px solid #334155', borderRadius: 16,
                overflow: 'hidden', transition: 'all 0.2s ease', cursor: 'pointer',
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 0 24px rgba(59,130,246,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                {/* Banner */}
                <div style={{
                    height: 110, background: `linear-gradient(135deg, ${typeColor}40, ${typeColor}20)`,
                    borderBottom: `1px solid ${typeColor}30`, position: 'relative', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: `${typeColor}60`, letterSpacing: '-0.04em', userSelect: 'none' }}>
                        {(event.title || '?')[0]}
                    </div>
                    <div style={{
                        position: 'absolute', top: 12, left: 12, padding: '4px 10px',
                        borderRadius: 9999, fontSize: 11, fontWeight: 700,
                        background: `${typeColor}25`, color: typeColor, border: `1px solid ${typeColor}40`,
                    }}>
                        {event.type}
                    </div>
                    {event.mode && (
                        <div style={{
                            position: 'absolute', top: 12, right: 12, padding: '4px 10px',
                            borderRadius: 9999, fontSize: 11, fontWeight: 600,
                            background: 'rgba(0,0,0,0.4)', color: '#94A3B8',
                        }}>
                            {event.mode}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '16px 18px' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 6, lineHeight: 1.3 }}>
                        {event.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <MapPin size={12} color="#64748B" />
                        <span style={{ color: '#64748B', fontSize: 12 }}>{event.college} · {event.city}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                        {event.startDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Calendar size={12} color="#94A3B8" />
                                <span style={{ color: '#94A3B8', fontSize: 12 }}>
                                    {new Date(event.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}
                        {event.prizes?.first && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Trophy size={12} color="#F59E0B" />
                                <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 600 }}>₹{Number(event.prizes.first).toLocaleString()}</span>
                            </div>
                        )}
                        {event.maxTeamSize && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Users size={12} color="#94A3B8" />
                                <span style={{ color: '#94A3B8', fontSize: 12 }}>Max {event.maxTeamSize}/team</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {spotsLeft !== null && (
                            <span style={{ fontSize: 12, color: spotsLeft < 50 ? '#EF4444' : '#64748B' }}>
                                {spotsLeft} spots left
                            </span>
                        )}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: '#3B82F6', fontSize: 13, fontWeight: 600, marginLeft: 'auto',
                        }}>
                            View Details <ChevronRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'events'), where('status', 'in', ['published', 'active']));
        const unsub = onSnapshot(q, (snap) => {
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    const filtered = events.filter(ev => {
        const matchSearch = !search || ev.title?.toLowerCase().includes(search.toLowerCase()) ||
            ev.college?.toLowerCase().includes(search.toLowerCase()) ||
            ev.city?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === 'All' || ev.type === activeFilter || ev.mode === activeFilter ||
            (activeFilter === 'Open' && ev.status === 'published');
        return matchSearch && matchFilter;
    });

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 88 }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
                    borderBottom: '1px solid #334155', padding: '48px 0',
                }}>
                    <div className="container">
                        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                            Browse <span className="gradient-text">Events</span>
                        </h1>
                        <p style={{ color: '#64748B', fontSize: 16, marginBottom: 28 }}>
                            Discover hackathons, tech fests, and coding contests from colleges across India
                        </p>

                        {/* Search */}
                        <div style={{ position: 'relative', maxWidth: 560, marginBottom: 20 }}>
                            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                            <input
                                className="input"
                                placeholder="Search events, colleges, cities..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 48, fontSize: 15 }}
                            />
                        </div>

                        {/* Filter Pills */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Filter size={15} color="#64748B" />
                            {FILTERS.map(f => (
                                <button key={f} onClick={() => setActiveFilter(f)} style={{
                                    padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', border: '1px solid', transition: 'all 0.15s',
                                    background: activeFilter === f ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'rgba(30,41,59,0.8)',
                                    borderColor: activeFilter === f ? 'transparent' : '#334155',
                                    color: activeFilter === f ? 'white' : '#94A3B8',
                                }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                <div className="container" style={{ paddingTop: 36, paddingBottom: 64 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                            <p style={{ color: '#64748B' }}>Loading events...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <Search size={48} color="#334155" style={{ marginBottom: 16 }} />
                            <h3 style={{ color: '#94A3B8', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No events found</h3>
                            <p style={{ color: '#64748B' }}>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>
                                Showing {filtered.length} event{filtered.length !== 1 ? 's' : ''}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                                {filtered.map(ev => <EventCard key={ev.id} event={ev} />)}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
