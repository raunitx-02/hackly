import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, CheckCircle2, XCircle, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        async function fetchEvents() {
            try {
                const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                toast.error("Failed to load events");
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const updateStatus = async (event, newStatus, reason = '') => {
        try {
            await updateDoc(doc(db, 'events', event.id), {
                status: newStatus,
                moderatedAt: serverTimestamp(),
                moderatedBy: currentUser.uid,
                rejectionReason: reason || null
            });

            // Log the action
            await addDoc(collection(db, 'moderationLog'), {
                type: 'event',
                entityId: event.id,
                entityName: event.title,
                action: newStatus === 'approved' ? 'admin_approved' : (newStatus === 'rejected' ? 'admin_rejected' : 'admin_removed'),
                reason: reason || (newStatus === 'approved' ? 'Content verified' : 'Policy violation'),
                userId: event.organizerId || null,
                performedBy: currentUser.uid,
                createdAt: serverTimestamp()
            });

            setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: newStatus } : e));
            toast.success(`Event ${newStatus}`);
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const filtered = events.filter(e =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Event Moderation</h1>
                <p style={{ color: '#94A3B8' }}>Review, approve, and manage all events on the platform.</p>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search events by title or institution..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', background: '#1E293B', border: '1px solid #334155',
                            borderRadius: 12, padding: '12px 16px 12px 44px', color: '#F8FAFC', fontSize: 14
                        }}
                    />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', background: '#1E293B', border: '1px solid #334155', borderRadius: 12, color: '#94A3B8', cursor: 'pointer' }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Events List */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Event Details</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Institution</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Moderation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(event => (
                            <tr key={event.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{event.title}</div>
                                    <div style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>{event.category || 'General'} • {event.type || 'Hackathon'}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#94A3B8', fontSize: 14 }}>{event.college || 'Universal'}</div>
                                    <div style={{ color: '#64748B', fontSize: 12 }}>ID: {event.id.substring(0, 8)}...</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                        background:
                                            event.status === 'approved' ? 'rgba(16,185,129,0.1)' :
                                                event.status === 'rejected' ? 'rgba(239,68,68,0.1)' :
                                                    event.status === 'removed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.1)',
                                        color:
                                            event.status === 'approved' ? '#10B981' :
                                                event.status === 'rejected' ? '#EF4444' :
                                                    event.status === 'removed' ? '#EF4444' : '#F59E0B'
                                    }}>
                                        {event.status || 'Pending'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button
                                            onClick={() => window.open(`/events/${event.id}`, '_blank')}
                                            title="View Event"
                                            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {event.status !== 'approved' && (
                                            <button
                                                onClick={() => updateStatus(event, 'approved')}
                                                title="Approve"
                                                style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }}
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}

                                        {event.status !== 'rejected' && event.status !== 'removed' && (
                                            <button
                                                onClick={() => {
                                                    const reason = prompt("Reason for rejection?");
                                                    if (reason !== null) updateStatus(event, 'rejected', reason);
                                                }}
                                                title="Reject"
                                                style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer' }}
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}

                                        {event.status !== 'removed' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm("Force hide/delete this event for policy violation?")) {
                                                        updateStatus(event, 'removed', 'Forced removal by Admin');
                                                    }
                                                }}
                                                title="Force Remove"
                                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
