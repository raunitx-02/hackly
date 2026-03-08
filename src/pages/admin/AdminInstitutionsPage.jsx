import { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, Filter, MoreVertical, ExternalLink, ShieldOff, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInstitutionsPage() {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchInstitutions() {
            try {
                // Fetch users where role is organizer
                const q = query(collection(db, 'users'));
                const snap = await getDocs(q);
                const list = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(u => u.role === 'organizer');
                setInstitutions(list);
            } catch (error) {
                toast.error("Failed to load institutions");
            } finally {
                setLoading(false);
            }
        }
        fetchInstitutions();
    }, []);

    const toggleSuspension = async (inst) => {
        try {
            const newStatus = !inst.isSuspended;
            await updateDoc(doc(db, 'users', inst.id), {
                isSuspended: newStatus,
                suspendedAt: newStatus ? new Date().toISOString() : null
            });
            setInstitutions(prev => prev.map(i => i.id === inst.id ? { ...i, isSuspended: newStatus } : i));
            toast.success(newStatus ? 'Institution suspended' : 'Institution unsuspended');
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const filtered = institutions.filter(i =>
        i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.college?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Institutions</h1>
                    <p style={{ color: '#94A3B8' }}>Manage schools, colleges, and coaching centers on the platform.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or institution..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', background: '#1E293B', border: '1px solid #334155',
                            borderRadius: 12, padding: '12px 16px 12px 44px', color: '#F8FAFC', fontSize: 14
                        }}
                    />
                </div>
                <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', background: '#1E293B', border: '1px solid #334155', color: '#94A3B8' }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Table */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Institution Name</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Contact Person</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(inst => (
                            <tr key={inst.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{inst.college || inst.name}</div>
                                    <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{inst.city || 'Location not set'}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#94A3B8', fontSize: 14 }}>{inst.name}</div>
                                    <div style={{ color: '#64748B', fontSize: 12 }}>{inst.email}</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                        background: inst.isSuspended ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                        color: inst.isSuspended ? '#EF4444' : '#10B981'
                                    }}>
                                        {inst.isSuspended ? 'Suspended' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            onClick={() => toggleSuspension(inst)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: inst.isSuspended ? '#10B981' : '#EF4444',
                                                title: inst.isSuspended ? 'Unsuspend' : 'Suspend'
                                            }}
                                        >
                                            {inst.isSuspended ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
                                        </button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                            <ExternalLink size={18} />
                                        </button>
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

const ShieldCheck = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
