import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { Users, Phone, Mail, Building, Target, Plus, Calendar, Save, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SponsorCRMPage() {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // View state
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [interactions, setInteractions] = useState([]);
    
    // New interaction form
    const [newInteraction, setNewInteraction] = useState({ type: 'email', date: new Date().toISOString().split('T')[0], notes: '' });
    const [savingInteraction, setSavingInteraction] = useState(false);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                // 1. Get all sponsor users
                const q = query(collection(db, 'users'), where('role', '==', 'sponsor'));
                const snap = await getDocs(q);
                
                const sponsorData = await Promise.all(snap.docs.map(async (d) => {
                    const userData = d.data();
                    
                    // 2. Fetch their intent profiles to get tags/industries
                    let intentTags = [];
                    try {
                        const intentSnap = await getDoc(doc(db, 'sponsorIntent', d.id));
                        if(intentSnap.exists()) {
                            const intent = intentSnap.data();
                            intentTags = [...(intent.themes || []), ...(intent.audience || [])];
                        }
                    } catch(e) {}

                    return { id: d.id, ...userData, intentTags };
                }));

                setSponsors(sponsorData);
            } catch(e) {
                console.error("CRM Error", e);
                toast.error("Failed to load CRM data");
            } finally {
                setLoading(false);
            }
        };

        fetchSponsors();
    }, []);

    const loadInteractions = async (sponsorId) => {
        try {
            const docSnap = await getDoc(doc(db, 'sponsorCRM', sponsorId));
            if (docSnap.exists() && docSnap.data().interactions) {
                // sort newest first
                setInteractions(docSnap.data().interactions.sort((a,b) => new Date(b.date) - new Date(a.date)));
            } else {
                setInteractions([]);
            }
        } catch(e) {
            console.error(e);
            setInteractions([]);
        }
    };

    const handleSelectSponsor = (sponsor) => {
        setSelectedSponsor(sponsor);
        loadInteractions(sponsor.id);
        setNewInteraction({ type: 'email', date: new Date().toISOString().split('T')[0], notes: '' });
    };

    const handleLogInteraction = async (e) => {
        e.preventDefault();
        if (!newInteraction.notes) return toast.error("Notes required");

        setSavingInteraction(true);
        try {
            const updatedInteractions = [
                { id: Date.now().toString(), ...newInteraction, timestamp: Date.now() },
                ...interactions
            ];

            await setDoc(doc(db, 'sponsorCRM', selectedSponsor.id), {
                sponsorId: selectedSponsor.id,
                interactions: updatedInteractions,
                lastContacted: newInteraction.date
            }, { merge: true });

            setInteractions(updatedInteractions);
            setNewInteraction({ type: 'email', date: new Date().toISOString().split('T')[0], notes: '' });
            toast.success("Interaction logged!");
        } catch(err) {
            console.error(err);
            toast.error("Failed to save interaction");
        } finally {
            setSavingInteraction(false);
        }
    };

    if (loading) return <div style={{ padding: 40, color: '#94A3B8' }}>Loading Sponsor CRM...</div>;

    const ICONS = {
        'email': <Mail size={16} color="#60A5FA" />,
        'call': <Phone size={16} color="#10B981" />,
        'meeting': <Briefcase size={16} color="#8B5CF6" />
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
            
            {/* Left Col: Master List */}
            <div style={{ width: 340, background: '#1E293B', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 24, borderBottom: '1px solid #334155' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', margin: 0 }}>Sponsors CRM</h2>
                    <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>{sponsors.length} Contacts in Registry</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {sponsors.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No sponsors have registered on the platform yet.</div>
                    ) : (
                        sponsors.map(sp => (
                            <div 
                                key={sp.id} 
                                onClick={() => handleSelectSponsor(sp)}
                                style={{ 
                                    padding: '16px 24px', borderBottom: '1px solid #334155', cursor: 'pointer',
                                    background: selectedSponsor?.id === sp.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                                    transition: 'background 0.2s',
                                    borderLeft: selectedSponsor?.id === sp.id ? '3px solid #3B82F6' : '3px solid transparent'
                                }}
                            >
                                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: 15, marginBottom: 4 }}>{sp.name || 'Unnamed'}</div>
                                <div style={{ color: '#94A3B8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <Building size={12} /> {sp.college || 'No Company Name'}
                                </div>
                                
                                {sp.intentTags.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {sp.intentTags.slice(0, 2).map((tag, i) => (
                                            <span key={i} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', borderRadius: 4, fontSize: 10, border: '1px solid #475569' }}>
                                                {tag}
                                            </span>
                                        ))}
                                        {sp.intentTags.length > 2 && <span style={{ color: '#64748B', fontSize: 10 }}>+{sp.intentTags.length - 2}</span>}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Col: Detail View */}
            <div style={{ flex: 1, background: '#0F172A', overflowY: 'auto', padding: 40 }}>
                {!selectedSponsor ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                        <Users size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <h3 style={{ fontSize: 18, color: '#94A3B8', fontWeight: 600 }}>Select a Sponsor Contact</h3>
                        <p style={{ fontSize: 14 }}>View profiles, intent tags, and log your team's interactions.</p>
                    </div>
                ) : (
                    <div style={{ maxWidth: 800 }}>
                        <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                                    {selectedSponsor.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', margin: 0 }}>{selectedSponsor.name || 'Unnamed Contact'}</h1>
                                    <div style={{ color: '#60A5FA', fontSize: 15, fontWeight: 600 }}>{selectedSponsor.college || 'No Company listed'}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
                                <div>
                                    <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
                                    <div style={{ color: '#E2E8F0', fontSize: 14 }}>{selectedSponsor.email}</div>
                                </div>
                                {selectedSponsor.phone && (
                                    <div>
                                        <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                                        <div style={{ color: '#E2E8F0', fontSize: 14 }}>{selectedSponsor.phone}</div>
                                    </div>
                                )}
                            </div>

                            {selectedSponsor.intentTags.length > 0 && (
                                <div style={{ marginTop: 24 }}>
                                    <div style={{ color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Target size={14} /> Full Intent Profile Tags
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {selectedSponsor.intentTags.map((tag, i) => (
                                            <span key={i} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', borderRadius: 99, fontSize: 13, border: '1px solid #475569' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactions Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
                            
                            {/* History */}
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>Interaction History</h3>
                                {interactions.length === 0 ? (
                                    <div style={{ padding: 24, background: '#1E293B', borderRadius: 12, border: '1px dashed #475569', color: '#94A3B8', fontSize: 14, fontStyle: 'italic' }}>
                                        No interactions logged yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {interactions.map(int => (
                                            <div key={int.id} style={{ padding: 16, background: '#1E293B', borderRadius: 12, border: '1px solid #334155' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                                                        {ICONS[int.type]} {int.type}
                                                    </div>
                                                    <div style={{ color: '#64748B', fontSize: 12 }}>
                                                        <Calendar size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                                                        {int.date}
                                                    </div>
                                                </div>
                                                <p style={{ margin: 0, color: '#CBD5E1', fontSize: 14, lineHeight: 1.6 }}>{int.notes}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Log Form */}
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Plus size={18} color="#3B82F6" /> Log New Touchpoint
                                </h3>
                                <form onSubmit={handleLogInteraction} style={{ background: '#1E293B', padding: 20, borderRadius: 12, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>TYPE</label>
                                            <select className="input" value={newInteraction.type} onChange={e => setNewInteraction({...newInteraction, type: e.target.value})} style={{ padding: '8px 12px' }}>
                                                <option value="email">Email Sent</option>
                                                <option value="call">Phone Call</option>
                                                <option value="meeting">Meeting (Video/In-person)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>DATE</label>
                                            <input type="date" className="input" value={newInteraction.date} onChange={e => setNewInteraction({...newInteraction, date: e.target.value})} max={new Date().toISOString().split('T')[0]} style={{ padding: '8px 12px' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>NOTES</label>
                                        <textarea className="input" value={newInteraction.notes} onChange={e => setNewInteraction({...newInteraction, notes: e.target.value})} placeholder="Met regarding AI track sponsorship..." style={{ minHeight: 100 }} required />
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <button type="submit" disabled={savingInteraction} className="btn-gradient" style={{ padding: '8px 16px', fontSize: 13 }}>
                                            <Save size={16} /> Save Interaction
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
