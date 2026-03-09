import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, ChevronDown, CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    pending: { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Pending', icon: Clock },
    accepted: { bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'Accepted', icon: CheckCircle },
    rejected: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Rejected', icon: XCircle }
};

export default function AdminCampusPartnersPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Detail view state
    const [selectedPartner, setSelectedPartner] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'campusPartners'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPartners(list);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching campus partners:', error);
            toast.error('Failed to load campus partners');
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'campusPartners', id), { status: newStatus });
            toast.success(`Applicant marked as ${newStatus}`);
            if (selectedPartner && selectedPartner.id === id) {
                setSelectedPartner({ ...selectedPartner, status: newStatus });
            }
        } catch (error) {
            console.error('Status update failed', error);
            toast.error('Failed to update status');
        }
    };

    const filteredPartners = partners.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.02em' }}>Campus Partners</h1>
                    <p style={{ color: '#94A3B8', fontSize: 15 }}>Review and manage ambassador applications across colleges.</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or college..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input"
                        style={{ paddingLeft: 44 }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="input"
                        style={{ paddingRight: 40, appearance: 'none', minWidth: 160 }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown size={16} color="#64748B" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #334155', background: 'rgba(15,23,42,0.3)' }}>
                                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>APPLICANT</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>COLLEGE / LOCATION</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>ROLE</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>STATUS</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px 24px', textAlign: 'center', color: '#64748B' }}>Loading applicants...</td>
                                </tr>
                            ) : filteredPartners.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px 24px', textAlign: 'center', color: '#64748B' }}>No applicants found.</td>
                                </tr>
                            ) : (
                                filteredPartners.map(p => {
                                    const StatusIcon = STATUS_COLORS[p.status]?.icon || Clock;
                                    return (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                                                <div style={{ color: '#64748B', fontSize: 13 }}>{p.email}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ color: '#E2E8F0', fontSize: 14, marginBottom: 4 }}>{p.college}</div>
                                                <div style={{ color: '#64748B', fontSize: 13 }}>{p.cityState}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#CBD5E1', fontSize: 14 }}>
                                                {p.role}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    background: STATUS_COLORS[p.status]?.bg || STATUS_COLORS.pending.bg,
                                                    color: STATUS_COLORS[p.status]?.color || STATUS_COLORS.pending.color,
                                                    padding: '4px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600
                                                }}>
                                                    <StatusIcon size={14} />
                                                    {STATUS_COLORS[p.status]?.label || 'Pending'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setSelectedPartner(p)}
                                                    style={{
                                                        background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)',
                                                        padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                                        display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                                >
                                                    <Eye size={16} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Detail Sidebar / Modal */}
            {selectedPartner && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
                    <div style={{
                        width: '100%', maxWidth: 500, background: '#1E293B', height: '100%',
                        borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column',
                        animation: 'slideInRight 0.3s ease-out', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>Application Details</h2>
                            <button onClick={() => setSelectedPartner(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: 32, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Header Info */}
                            <div>
                                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>{selectedPartner.name}</h3>
                                <p style={{ color: '#94A3B8', fontSize: 15, display: 'flex', gap: 12 }}>
                                    <span>{selectedPartner.email}</span>
                                    <span>•</span>
                                    <span>{selectedPartner.phone}</span>
                                </p>
                            </div>

                            {/* Status controls */}
                            <div style={{ background: 'rgba(15,23,42,0.4)', padding: 20, borderRadius: 12, border: '1px solid #334155' }}>
                                <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</div>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {['pending', 'accepted', 'rejected'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleUpdateStatus(selectedPartner.id, s)}
                                            style={{
                                                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                                                background: selectedPartner.status === s ? STATUS_COLORS[s].bg : 'transparent',
                                                color: selectedPartner.status === s ? STATUS_COLORS[s].color : '#64748B',
                                                border: `1px solid ${selectedPartner.status === s ? STATUS_COLORS[s].color : '#334155'}`,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Application Fields */}
                            {[
                                { label: 'College / Institute', value: selectedPartner.college },
                                { label: 'Location', value: selectedPartner.cityState },
                                { label: 'Year & Course', value: selectedPartner.yearCourse },
                                { label: 'Campus Role', value: selectedPartner.role },
                                { label: 'Club Affiliation', value: selectedPartner.clubAffiliation || 'None provided' },
                            ].map((f, i) => (
                                <div key={i} style={{ borderBottom: '1px solid #334155', paddingBottom: 16 }}>
                                    <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{f.label}</div>
                                    <div style={{ color: '#E2E8F0', fontSize: 15, fontWeight: 500 }}>{f.value}</div>
                                </div>
                            ))}

                            <div style={{ background: 'rgba(59,130,246,0.05)', padding: 20, borderRadius: 12, border: '1px solid rgba(59,130,246,0.1)' }}>
                                <div style={{ fontSize: 13, color: '#60A5FA', fontWeight: 600, marginBottom: 12 }}>PROMOTION PLAN</div>
                                <p style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {selectedPartner.promotionPlan}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
        </div>
    );
}
