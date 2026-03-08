import { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, ShieldAlert, ShieldCheck, UserX, UserCheck, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const snap = await getDocs(collection(db, 'users'));
                setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const toggleBlacklist = async (user) => {
        try {
            const newStatus = !user.isBlacklisted;
            await updateDoc(doc(db, 'users', user.id), {
                isBlacklisted: newStatus,
                blacklistedAt: newStatus ? serverTimestamp() : null
            });

            // Log action
            await addDoc(collection(db, 'moderationLog'), {
                type: 'user',
                entityId: user.id,
                entityName: user.name || user.email,
                action: newStatus ? 'admin_blacklisted' : 'admin_unblacklisted',
                reason: newStatus ? 'Manual administrative blacklist' : 'Review approved',
                performedBy: currentUser.uid,
                createdAt: serverTimestamp()
            });

            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlacklisted: newStatus } : u));
            toast.success(newStatus ? 'User blacklisted' : 'User unblacklisted');
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Users & Blacklist</h1>
                <p style={{ color: '#94A3B8' }}>Manage user accounts and restriction status.</p>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', background: '#1E293B', border: '1px solid #334155',
                            borderRadius: 12, padding: '12px 16px 12px 44px', color: '#F8FAFC', fontSize: 14
                        }}
                    />
                </div>
            </div>

            {/* Users List */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>User Profile</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: user.isBlacklisted ? '#EF4444' : 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 700
                                        }}>
                                            {(user.name || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{user.name || 'Anonymous'}</div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        color: '#94A3B8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        {user.role || 'Participant'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                        background: user.isBlacklisted ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                                        color: user.isBlacklisted ? '#EF4444' : '#10B981'
                                    }}>
                                        {user.isBlacklisted ? 'Blacklisted' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            onClick={() => toggleBlacklist(user)}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: user.isBlacklisted ? '#10B981' : '#EF4444'
                                            }}
                                            title={user.isBlacklisted ? 'Remove Blacklist' : 'Blacklist'}
                                        >
                                            {user.isBlacklisted ? <UserCheck size={18} /> : <UserX size={18} />}
                                        </button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                            <Eye size={18} />
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
