import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShieldAlert, Clock, Filter, User, CalendarDays, AlertCircle } from 'lucide-react';

export default function AdminModerationPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchLogs() {
            try {
                let q = query(collection(db, 'moderationLog'), orderBy('createdAt', 'desc'), limit(50));
                if (filter !== 'all') {
                    q = query(collection(db, 'moderationLog'), where('type', '==', filter), orderBy('createdAt', 'desc'), limit(50));
                }
                const snap = await getDocs(q);
                setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [filter]);

    const getActionColor = (action) => {
        if (action.includes('approved')) return '#10B981';
        if (action.includes('rejected') || action.includes('blacklisted') || action.includes('blocked')) return '#EF4444';
        return '#F59E0B';
    };

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Moderation Log</h1>
                <p style={{ color: '#94A3B8' }}>Audit trail of all administrative and automated moderation actions.</p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {['all', 'event', 'user'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '10px 20px', borderRadius: 12, border: '1px solid #334155',
                            background: filter === f ? 'rgba(59,130,246,0.1)' : '#1E293B',
                            color: filter === f ? '#60A5FA' : '#94A3B8',
                            fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {f} Logs
                    </button>
                ))}
            </div>

            {/* Logs Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {logs.map(log => (
                    <div key={log.id} style={{
                        background: '#1E293B', padding: '20px 24px', borderRadius: 16, border: '1px solid #334155',
                        display: 'flex', alignItems: 'flex-start', gap: 20
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: `${getActionColor(log.action)}15`,
                            color: getActionColor(log.action),
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            {log.type === 'event' ? <CalendarDays size={20} /> : <User size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 16 }}>
                                    {log.entityName} <span style={{ color: '#64748B', fontWeight: 400, fontSize: 14 }}>({log.action.replace('admin_', '').replace('_', ' ')})</span>
                                </div>
                                <div style={{ color: '#64748B', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={14} /> {log.createdAt ? new Date(log.createdAt.toDate()).toLocaleString() : 'Just now'}
                                </div>
                            </div>
                            <p style={{ color: '#94A3B8', fontSize: 14, margin: '8px 0' }}>{log.reason}</p>
                            <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ShieldAlert size={12} /> Performed by: {log.performedBy === 'system' ? 'Automated System' : `Admin (${log.performedBy.substring(0, 6)})`}
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && logs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                        <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <p>No moderation logs found for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
