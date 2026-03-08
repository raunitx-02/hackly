import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    Building2, CalendarDays, Users, ShieldAlert,
    ArrowUpRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        totalInstitutions: 0,
        totalEvents: 0,
        pendingEvents: 0,
        blacklistedUsers: 0
    });
    const [latestEvents, setLatestEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOverview() {
            try {
                // In a real app, these counts might be cached or come from a specific stats doc
                // For now, we'll fetch them (limited for performance)
                const instSnap = await getDocs(collection(db, 'users'));
                // Note: This is an over-simplification. We should filter by role.
                const insts = instSnap.docs.filter(d => d.data().role === 'organizer').length;

                const eventsSnap = await getDocs(collection(db, 'events'));
                const pendingSnap = await getDocs(query(collection(db, 'events'), where('status', '==', 'pending_review')));

                const usersSnap = await getDocs(collection(db, 'users'));
                const blacklisted = usersSnap.docs.filter(d => d.data().isBlacklisted).length;

                setStats({
                    totalInstitutions: insts,
                    totalEvents: eventsSnap.size,
                    pendingEvents: pendingSnap.size,
                    blacklistedUsers: blacklisted
                });

                // Latest 5 events
                const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(5));
                const latestSnap = await getDocs(q);
                setLatestEvents(latestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchOverview();
    }, []);

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div style={{
            background: '#1E293B',
            padding: 24,
            borderRadius: 16,
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: 20
        }}>
            <div style={{
                width: 54, height: 54,
                background: `${color}15`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color
            }}>
                <Icon size={28} />
            </div>
            <div>
                <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{label}</div>
                <div style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 700 }}>{value}</div>
            </div>
        </div>
    );

    if (loading) return <div style={{ color: '#94A3B8' }}>Loading overview...</div>;

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Admin Overview</h1>
                <p style={{ color: '#94A3B8' }}>Welcome back. Here's what's happening across the platform.</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 24,
                marginBottom: 40
            }}>
                <StatCard icon={Building2} label="Total Institutions" value={stats.totalInstitutions} color="#3B82F6" />
                <StatCard icon={CalendarDays} label="Total Events" value={stats.totalEvents} color="#8B5CF6" />
                <StatCard icon={AlertCircle} label="Pending Review" value={stats.pendingEvents} color="#F59E0B" />
                <StatCard icon={ShieldAlert} label="Blacklisted Users" value={stats.blacklistedUsers} color="#EF4444" />
            </div>

            {/* Recent Events Table */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Latest Events</h2>
                    <button style={{ color: '#3B82F6', background: 'none', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        View all <ArrowUpRight size={16} />
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Event Title</th>
                                <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Institution</th>
                                <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Date Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestEvents.map(event => (
                                <tr key={event.id} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '16px 24px', color: '#F8FAFC', fontWeight: 600 }}>{event.title}</td>
                                    <td style={{ padding: '16px 24px', color: '#94A3B8' }}>{event.college || 'Universal'}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: 99,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: event.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: event.status === 'approved' ? '#10B981' : '#F59E0B'
                                        }}>
                                            {event.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748B', fontSize: 14 }}>
                                        {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {latestEvents.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>No events found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
