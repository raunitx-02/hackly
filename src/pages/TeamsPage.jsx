import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, Plus, UserPlus, Crown } from 'lucide-react';

export default function TeamsPage() {
    const { id: eventId } = useParams();
    const { currentUser } = useAuth();
    const [teams, setTeams] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'teams'), where('eventId', '==', eventId));
        const unsub = onSnapshot(q, (snap) => {
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setTeams(all);
            const mine = all.find(t => currentUser && (t.leaderId === currentUser.uid || (t.members || []).includes(currentUser.uid)));
            setMyTeam(mine || null);
        });
        return unsub;
    }, [eventId, currentUser]);

    const createTeam = async () => {
        if (!newTeamName.trim()) { toast.error('Enter a team name'); return; }
        if (!currentUser) { toast.error('Please login'); return; }
        setCreating(true);
        try {
            await addDoc(collection(db, 'teams'), {
                eventId, teamName: newTeamName.trim(), leaderId: currentUser.uid,
                members: [currentUser.uid], isOpen: true, createdAt: new Date().toISOString(),
            });
            setNewTeamName('');
            toast.success('Team created! 🎉');
        } catch (err) { toast.error('Error: ' + err.message); }
        finally { setCreating(false); }
    };

    const joinTeam = async (team) => {
        if (!currentUser) { toast.error('Please login'); return; }
        if (myTeam) { toast.error('You already have a team'); return; }
        try {
            await updateDoc(doc(db, 'teams', team.id), {
                members: [...(team.members || []), currentUser.uid],
            });
            toast.success(`Joined ${team.teamName}!`);
        } catch (err) { toast.error('Error: ' + err.message); }
    };

    const openTeams = teams.filter(t => t.isOpen && t.id !== myTeam?.id);

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 88 }}>
                <div className="container" style={{ paddingBottom: 80 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Team Management</h1>
                    <p style={{ color: '#64748B', marginBottom: 36 }}>Create or join a team to participate in this event</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                        {/* Create Team */}
                        {!myTeam && (
                            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 20 }}>
                                    <Plus size={18} style={{ marginRight: 8 }} />Create Team
                                </h2>
                                <label className="label">Team Name</label>
                                <input className="input" placeholder="Team Thunderbolt" value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)} style={{ marginBottom: 16 }}
                                    onKeyDown={e => e.key === 'Enter' && createTeam()} />
                                <button onClick={createTeam} disabled={creating} className="btn-gradient" style={{ minHeight: 44 }}>
                                    {creating ? 'Creating...' : 'Create Team'}
                                </button>
                            </div>
                        )}

                        {/* My Team */}
                        {myTeam && (
                            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(59,130,246,0.4)', padding: 28 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                                    My Team: {myTeam.teamName}
                                </h2>
                                <p style={{ color: '#64748B', fontSize: 13, marginBottom: 20 }}>
                                    {myTeam.members?.length || 1} member{(myTeam.members?.length || 1) !== 1 ? 's' : ''}
                                </p>
                                {(myTeam.members || [myTeam.leaderId]).map((uid, i) => (
                                    <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white',
                                        }}>M{i + 1}</div>
                                        <div>
                                            <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600 }}>
                                                {uid === myTeam.leaderId ? '⭐ Leader' : `Member ${i + 1}`}
                                            </div>
                                            <div style={{ color: '#64748B', fontSize: 12 }}>{uid.slice(0, 12)}...</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Open Teams */}
                        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, gridColumn: myTeam ? '1 / -1' : 'auto' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 20 }}>
                                <Users size={18} style={{ marginRight: 8 }} />Open Teams ({openTeams.length})
                            </h2>
                            {openTeams.length === 0 ? (
                                <p style={{ color: '#64748B', textAlign: 'center', padding: '32px 0' }}>No open teams. Be the first to create one!</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {openTeams.map(team => (
                                        <div key={team.id} style={{
                                            background: '#0F172A', borderRadius: 10, border: '1px solid #334155',
                                            padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.3)',
                                                }}>
                                                    <Crown size={18} color="#3B82F6" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#F8FAFC' }}>{team.teamName}</div>
                                                    <div style={{ color: '#64748B', fontSize: 13 }}>{team.members?.length || 1} member{(team.members?.length || 1) !== 1 ? 's' : ''}</div>
                                                </div>
                                            </div>
                                            {!myTeam && (
                                                <button onClick={() => joinTeam(team)} className="btn-gradient" style={{ fontSize: 13, padding: '9px 18px', minHeight: 38 }}>
                                                    <UserPlus size={14} /> Join
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
