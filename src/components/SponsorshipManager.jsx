import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Users, FileText, CheckCircle, Circle, Target, Plus, Search, X, Handshake, Link as LinkIcon, Edit2 } from 'lucide-react';
import { SPONSOR_CONFIG } from '../data/sponsorConfig';

export default function SponsorshipManager({ event }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [view, setView] = useState('assets'); // assets, matchmaking, deliverables
    
    // Dialog state for adding an asset
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [newAsset, setNewAsset] = useState({ name: '', description: '', suggestedBenefits: '', price: '' });
    
    // Assigning a sponsor
    const [assigningAssetId, setAssigningAssetId] = useState(null);
    const [sponsorOptions, setSponsorOptions] = useState([]);
    const [selectedSponsorId, setSelectedSponsorId] = useState('');
    const [assigningSponsorName, setAssigningSponsorName] = useState('');
    const [sponsorIntents, setSponsorIntents] = useState({});

    useEffect(() => {
        const q = query(collection(db, 'eventSponsorships'), where('eventId', '==', event.id));
        const unsub = onSnapshot(q, (snap) => {
            setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        // Load potential sponsors for matchmaking
        const loadSponsors = async () => {
            try {
                const spQ = query(collection(db, 'users'), where('role', '==', 'sponsor'));
                const spSnap = await getDocs(spQ);
                const sponsors = spSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setSponsorOptions(sponsors);

                // Fetch their intents for matching
                const intentsSnap = await getDocs(collection(db, 'sponsorIntent'));
                const intentsMap = {};
                intentsSnap.forEach(d => { intentsMap[d.id] = d.data(); });
                setSponsorIntents(intentsMap);
            } catch(e) {
                console.error("Failed to load sponsors list", e);
            }
        };
        loadSponsors();

        return unsub;
    }, [event.id]);

    const handleCreateAsset = async (e) => {
        e.preventDefault();
        if (!newAsset.name) return toast.error("Asset name is required.");
        
        try {
            await addDoc(collection(db, 'eventSponsorships'), {
                eventId: event.id,
                eventName: event.name,
                assetName: newAsset.name,
                description: newAsset.description,
                suggestedBenefits: newAsset.suggestedBenefits,
                price: newAsset.price,
                status: 'available', // available, active
                sponsorId: null,
                sponsorName: null,
                deliverables: [],
                createdAt: new Date().toISOString()
            });
            toast.success("Spoinsorable asset created!");
            setNewAsset({ name: '', description: '', suggestedBenefits: '', price: '' });
            setShowAssetForm(false);
        } catch(err) {
            console.error(err);
            toast.error("Failed to create asset.");
        }
    };

    const handleAssignSponsor = async () => {
        if (!selectedSponsorId && !assigningSponsorName) return toast.error("Select or enter a sponsor.");
        
        try {
            let assignedName = assigningSponsorName;
            if (selectedSponsorId) {
                const s = sponsorOptions.find(o => o.id === selectedSponsorId);
                if (s) assignedName = s.name;
            }

            await updateDoc(doc(db, 'eventSponsorships', assigningAssetId), {
                status: 'active',
                sponsorId: selectedSponsorId || null, // null if custom text sponsor
                sponsorName: assignedName,
                // Automatically convert the suggested benefits block into checklist items
                deliverables: assets.find(a => a.id === assigningAssetId)?.suggestedBenefits
                    .split('\n')
                    .filter(l => l.trim())
                    .map(l => ({ type: l.trim(), isCompleted: false, notes: '' })) || []
            });
            toast.success("Sponsor successfully assigned to track!");
            setAssigningAssetId(null);
            setSelectedSponsorId('');
            setAssigningSponsorName('');
        } catch(err) {
            console.error(err);
            toast.error("Failed to assign sponsor.");
        }
    };

    const toggleDeliverable = async (assetId, index) => {
        const asset = assets.find(a => a.id === assetId);
        const newDels = [...(asset.deliverables || [])];
        newDels[index].isCompleted = !newDels[index].isCompleted;

        try {
            await updateDoc(doc(db, 'eventSponsorships', assetId), { deliverables: newDels });
        } catch(err) {
            toast.error("Failed to update checklist.");
        }
    };

    if (loading) return <div style={{ color: '#94A3B8' }}>Loading Sponsorships...</div>;

    return (
        <div>
            {/* Context Navigation */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #334155', paddingBottom: 16 }}>
                {[
                    { id: 'assets', label: 'Adoptable Tracks & Assets' },
                    { id: 'matching', label: 'Smart Matching Insights' },
                    { id: 'deliverables', label: 'Deliverables Tracker' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        style={{
                            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                            background: view === tab.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                            color: view === tab.id ? '#3B82F6' : '#94A3B8',
                            border: `1px solid ${view === tab.id ? 'rgba(59,130,246,0.2)' : 'transparent'}`
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* View: Assets Map */}
            {view === 'assets' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Sponsorable Assets</h3>
                        <button onClick={() => setShowAssetForm(!showAssetForm)} className="btn-gradient" style={{ padding: '8px 16px', fontSize: 14 }}>
                            {showAssetForm ? <><X size={16}/> Cancel</> : <><Plus size={16}/> New Track/Asset</>}
                        </button>
                    </div>

                    {showAssetForm && (
                        <form onSubmit={handleCreateAsset} style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid #334155', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label className="label">Asset Name (e.g. AI Track, Main Event Partner)</label>
                                    <input className="input" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="AI Track" required/>
                                </div>
                                <div>
                                    <label className="label">Target Value / Price (Config only)</label>
                                    <input className="input" value={newAsset.price} onChange={e => setNewAsset({...newAsset, price: e.target.value})} placeholder="₹50,000 / $500" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Description (What does this track involve?)</label>
                                <textarea className="input" style={{ minHeight: 80 }} value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})} placeholder="Sponsoring the main AI/ML problem statement..." />
                            </div>
                            <div>
                                <label className="label">Deliverables Checklist (One per line)</label>
                                <textarea className="input" style={{ minHeight: 100 }} value={newAsset.suggestedBenefits} onChange={e => setNewAsset({...newAsset, suggestedBenefits: e.target.value})} placeholder="Logo on main stage banner&#10;Access to top 10 AI projects&#10;5 min speaking slot" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn-gradient">Create Asset</button>
                            </div>
                        </form>
                    )}

                    {assets.length === 0 && !showAssetForm && (
                        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px dashed #475569', padding: 60, textAlign: 'center' }}>
                            <Handshake size={48} color="#64748B" style={{ margin: '0 auto 20px' }} />
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>No Assets Defined</h3>
                            <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
                                Create tracks, awards, or general sponsorships that companies can adopt.
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                        {assets.map(asset => (
                            <div key={asset.id} style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{asset.assetName}</h4>
                                    <span style={{ padding: '4px 10px', background: asset.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', color: asset.status === 'active' ? '#10B981' : '#94A3B8', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {asset.status}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16, flex: 1 }}>{asset.description}</p>
                                
                                {asset.status === 'available' ? (
                                    assigningAssetId === asset.id ? (
                                        <div style={{ marginTop: 16, padding: 16, background: '#0F172A', borderRadius: 12, border: '1px solid #334155' }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Assign Sponsor</div>
                                            <select className="input" style={{ marginBottom: 12 }} value={selectedSponsorId} onChange={e => setSelectedSponsorId(e.target.value)}>
                                                <option value="">Select Platform Sponsor...</option>
                                                {sponsorOptions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.college})</option>)}
                                            </select>
                                            <div style={{ textAlign: 'center', color: '#64748B', fontSize: 12, marginBottom: 12 }}>— OR —</div>
                                            <input className="input" placeholder="Manual sponsor name..." value={assigningSponsorName} onChange={e => setAssigningSponsorName(e.target.value)} style={{ marginBottom: 12 }} />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={handleAssignSponsor} className="btn-gradient" style={{ flex: 1, padding: '8px', fontSize: 13 }}>Confirm</button>
                                                <button onClick={() => setAssigningAssetId(null)} style={{ padding: '8px', fontSize: 13, background: 'transparent', border: '1px solid #334155', color: '#CBD5E1', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setAssigningAssetId(asset.id)} style={{ width: '100%', padding: '10px', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                                            Assign Sponsor Handle
                                        </button>
                                    )
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                                        <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600 }}>Adopted by {asset.sponsorName}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* View: Matchmaking */}
            {view === 'matching' && (
                <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target size={24} color="#60A5FA" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>Smart Match Analyzer</h3>
                            <p style={{ color: '#94A3B8', fontSize: 14, margin: '4px 0 0' }}>Internal tool: Ranks platform sponsors based on their Intent Profile vs Event Tags.</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 12, border: '1px dashed #475569', padding: 40, textAlign: 'center' }}>
                        <Search size={32} color="#64748B" style={{ margin: '0 auto 16px' }} />
                        <h4 style={{ color: '#E2E8F0', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Match Engine Analysis</h4>
                        <p style={{ color: '#94A3B8', fontSize: 14, maxWidth: 500, margin: '0 auto' }}>Ranking platform sponsors based on intent profile alignment with your event details.</p>
                        <SmartMatchResults sponsors={sponsorOptions} intents={sponsorIntents} event={event} />
                    </div>
                </div>
            )}

            {/* View: Deliverables */}
            {view === 'deliverables' && (
                <div>
                     <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Event Deliverables Tracker</h3>
                        <p style={{ color: '#94A3B8', fontSize: 14 }}>Check items off as you complete them. Sponsors see these updates live.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {assets.filter(a => a.status === 'active').length === 0 ? (
                            <div style={{ color: '#64748B', fontStyle: 'italic', padding: 20, background: '#1E293B', borderRadius: 12 }}>No active sponsor mappings yet. Assign a sponsor to a track first.</div>
                        ) : (
                            assets.filter(a => a.status === 'active').map(asset => (
                                <div key={asset.id} style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 20px', background: 'rgba(59,130,246,0.05)', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>{asset.sponsorName}</div>
                                            <div style={{ fontSize: 13, color: '#60A5FA' }}>Sponsoring: {asset.assetName}</div>
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#10B981' }}>
                                            {asset.deliverables?.filter(d => d.isCompleted).length || 0} / {asset.deliverables?.length || 0} Done
                                        </div>
                                    </div>
                                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {(!asset.deliverables || asset.deliverables.length === 0) ? (
                                            <div style={{ color: '#64748B', fontSize: 14 }}>No deliverables specified during creation.</div>
                                        ) : (
                                            asset.deliverables.map((d, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => toggleDeliverable(asset.id, idx)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0F172A', borderRadius: 8, border: `1px solid ${d.isCompleted ? '#10B981' : '#334155'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                                                >
                                                    {d.isCompleted ? <CheckCircle size={20} color="#10B981" /> : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #475569' }} />}
                                                    <span style={{ color: d.isCompleted ? '#94A3B8' : '#F8FAFC', textDecoration: d.isCompleted ? 'line-through' : 'none', fontWeight: d.isCompleted ? 500 : 600, fontSize: 14 }}>
                                                        {d.type}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Smart Match Scoring Logic
function SmartMatchResults({ sponsors, intents, event }) {
    if (sponsors.length === 0) return null;

    const scored = sponsors.map(s => {
        const intent = intents[s.id] || { themes: [], skills: [], audience: [], outcomes: [] };
        let score = 0;
        const matches = [];

        // 1. Theme Matching (Event Type / Title)
        const eventContext = `${event.title} ${event.type} ${event.tagline || ''}`.toLowerCase();
        intent.themes.forEach(t => {
            if (eventContext.includes(t.toLowerCase())) {
                score += 30;
                matches.push(t);
            }
        });

        // 2. Skill Matching (Problem Statements)
        const psContext = (event.problemStatements || []).map(p => typeof p === 'string' ? p : p.title + ' ' + p.description).join(' ').toLowerCase();
        intent.skills.forEach(sk => {
            if (psContext.includes(sk.toLowerCase())) {
                score += 25;
                matches.push(sk);
            }
        });

        // 3. Audience Matching
        if (event.college && intent.audience.some(a => event.college.toLowerCase().includes(a.toLowerCase()))) {
            score += 20;
            matches.push("Target Audience");
        }

        // Normalize score to 0-100
        const finalScore = Math.min(Math.max(score + Math.floor(Math.random() * 5), 10), 99);

        return { ...s, score: finalScore, matches };
    }).sort((a, b) => b.score - a.score);

    return (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {scored.slice(0, 5).map((sp) => (
                <div key={sp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#1E293B', borderRadius: 12, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'center', minWidth: 60 }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: sp.score > 70 ? '#10B981' : sp.score > 40 ? '#F59E0B' : '#64748B' }}>{sp.score}%</div>
                            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: 1 }}>MATCH</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>{sp.name}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>{sp.college}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                {sp.matches.slice(0, 3).map((m, idx) => (
                                    <span key={idx} style={{ fontSize: 10, background: 'rgba(59,130,246,0.1)', color: '#60A5FA', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => window.location.href=`mailto:${sp.email}?subject=Sponsorship%20Proposal:%20${event.title}`} className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }}>Contact</button>
                        <button className="btn-gradient" style={{ padding: '6px 12px', fontSize: 12 }}>Send Intent</button>
                    </div>
                </div>
            ))}
        </div>
    );
}
