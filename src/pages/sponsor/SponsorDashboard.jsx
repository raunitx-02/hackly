import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Handshake, Users, TrendingUp, Building, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SponsorDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [sponsorships, setSponsorships] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Aggregated Metrics
    const [stats, setStats] = useState({ activeEvents: 0, totalReached: 0, completedDeliverables: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                // Fetch eventSponsorships linked to this sponsor
                const q = query(collection(db, 'eventSponsorships'), where('sponsorId', '==', currentUser.uid));
                const snap = await getDocs(q);
                
                let activeCount = 0;
                let deliverablesCount = 0;
                const sponData = snap.docs.map(doc => {
                    const data = doc.data();
                    if (data.status === 'active' || data.status === 'confirmed') activeCount++;
                    
                    const completedDels = (data.deliverables || []).filter(d => d.isCompleted).length;
                    deliverablesCount += completedDels;
                    
                    return { id: doc.id, ...data, completedDels, totalDels: (data.deliverables || []).length };
                });

                setSponsorships(sponData);
                setStats({
                    activeEvents: activeCount,
                    totalReached: activeCount * 450, // mock data for now, would aggregate event participant limits
                    completedDeliverables: deliverablesCount
                });

            } catch(err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    if (loading) return <div style={{ color: '#94A3B8' }}>Loading Dashboard...</div>;

    return (
        <div>
            <div style={{ marginBottom: 40 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
                    Welcome back, {userProfile?.name}
                </h1>
                <p style={{ color: '#94A3B8', fontSize: 15 }}>
                    Here's a snapshot of your campus outreach and active hackathon sponsorships.
                </p>
            </div>

            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
                <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/favicon.png" alt="" style={{ height: 24, width: 24 }} />
                        </div>
                        <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Active Events</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC' }}>{stats.activeEvents}</div>
                </div>

                <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20}/></div>
                        <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Est. Students Reached</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC' }}>{stats.totalReached.toLocaleString()}+</div>
                </div>

                <div style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20}/></div>
                        <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Deliverables Completed</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC' }}>{stats.completedDeliverables}</div>
                </div>
            </div>

            {/* Active Sponsorships List */}
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 20 }}>Your Adopted Tracks & Sponsorships</h2>
            
            {sponsorships.length === 0 ? (
                <div style={{ background: '#1E293B', borderRadius: 16, border: '1px dashed #475569', padding: 60, textAlign: 'center' }}>
                    <Building size={48} color="#64748B" style={{ margin: '0 auto 20px' }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>No Active Campaigns</h3>
                    <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
                        You haven't adopted any tracks or sponsored events yet. Configure your match profile to get actionable opportunities.
                    </p>
                    <Link to="/sponsor/intent" className="btn-gradient" style={{ display: 'inline-flex', padding: '12px 24px', textDecoration: 'none' }}>
                        Setup Intent Profile <ArrowRight size={16} style={{ marginLeft: 8 }}/>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {sponsorships.map(sp => (
                        <div key={sp.id} style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{sp.eventName || 'Unknown Event'}</h3>
                                    <span style={{ padding: '4px 10px', background: sp.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', color: sp.status === 'active' ? '#10B981' : '#94A3B8', borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {sp.status || 'Pending'}
                                    </span>
                                </div>
                                <div style={{ color: '#64748B', fontSize: 14 }}>
                                    Adopted Asset: <strong style={{ color: '#CBD5E1' }}>{sp.assetName}</strong>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                                <div>
                                    <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Deliverables</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 100, height: 6, background: '#0F172A', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{ width: `${sp.totalDels > 0 ? (sp.completedDels/sp.totalDels)*100 : 0}%`, height: '100%', background: '#3B82F6', borderRadius: 99 }} />
                                        </div>
                                        <span style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 600 }}>{sp.completedDels}/{sp.totalDels}</span>
                                    </div>
                                </div>
                                
                                <Link to="/sponsor/reports" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: '#F8FAFC', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
