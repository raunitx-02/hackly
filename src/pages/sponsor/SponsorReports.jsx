import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { BarChart2, Download, CheckCircle, Circle, MapPin, Users, Award } from 'lucide-react';

export default function SponsorReports() {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            if (!currentUser) return;
            try {
                // Fetch the sponsorships to act as reports
                const q = query(collection(db, 'eventSponsorships'), where('sponsorId', '==', currentUser.uid));
                const snap = await getDocs(q);
                
                const reportData = await Promise.all(snap.docs.map(async (d) => {
                    const data = d.data();
                    
                    // Fetch event details to augment report
                    let eventData = { participantCount: 0, topCampuses: [] };
                    if (data.eventId) {
                        try {
                            const eSnap = await getDoc(doc(db, 'events', data.eventId));
                            if (eSnap.exists()) {
                                eventData = eSnap.data();
                            }
                        } catch(e) {}
                    }

                    return {
                        id: d.id,
                        ...data,
                        // Mock augmented data since we might not have real relations built yet
                        totalParticipants: eventData.participantCount || Math.floor(Math.random() * 500 + 100),
                        topCampuses: eventData.topCampuses || ['IIT Madras', 'VIT Vellore', 'SRM Chennai'],
                        projectsInTrack: Math.floor(Math.random() * 50 + 10),
                        optInLeads: Math.floor(Math.random() * 100 + 20)
                    };
                }));

                setReports(reportData);
            } catch(err) {
                console.error("Reports error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [currentUser]);

    const handleDownloadPDF = () => {
        // In a full implementation, you'd use jsPDF and html2canvas here.
        alert("Downloading PDF... (Mock action)");
    };

    if (loading) return <div style={{ color: '#94A3B8' }}>Loading Reports...</div>;

    if (reports.length === 0) {
        return (
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px dashed #475569', padding: 60, textAlign: 'center' }}>
                <BarChart2 size={48} color="#64748B" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>No Impact Reports Yet</h3>
                <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                    Reports will appear here once your sponsored events are completed or active.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Impact Reports</h1>
                    <p style={{ color: '#94A3B8', fontSize: 15 }}>Detailed metrics and deliverables tracking for your adopted tracks.</p>
                </div>
                <button onClick={handleDownloadPDF} className="btn-gradient" style={{ padding: '10px 20px', fontSize: 14 }}>
                    <Download size={16} /> Export All (PDF)
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {reports.map(report => {
                    const isExpanded = expandedId === report.id;
                    const deliverables = report.deliverables || [];
                    const dCompleted = deliverables.filter(d => d.isCompleted).length;
                    const dTotal = deliverables.length;

                    return (
                        <div key={report.id} style={{ background: '#1E293B', borderRadius: 16, border: `1px solid ${isExpanded ? '#3B82F6' : '#334155'}`, overflow: 'hidden', transition: 'all 0.2s' }}>
                            {/* Header row - click to expand */}
                            <div 
                                onClick={() => setExpandedId(isExpanded ? null : report.id)}
                                style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'rgba(59,130,246,0.05)' : 'transparent' }}
                            >
                                <div>
                                    <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>EVENT</div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{report.eventName || 'Unnamed Event'}</h3>
                                    <div style={{ color: '#60A5FA', fontSize: 14, marginTop: 4 }}>Track: {report.assetName}</div>
                                </div>

                                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC' }}>{report.totalParticipants}</div>
                                        <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Students</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC' }}>{report.projectsInTrack}</div>
                                        <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Projects</div>
                                    </div>
                                    {dTotal > 0 && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: dCompleted === dTotal ? '#10B981' : '#F59E0B' }}>
                                                {dCompleted}/{dTotal} Deliverables
                                            </div>
                                            <div style={{ width: 120, height: 6, background: '#0F172A', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                                                <div style={{ width: `${(dCompleted/dTotal)*100}%`, height: '100%', background: dCompleted === dTotal ? '#10B981' : '#F59E0B', borderRadius: 99 }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div style={{ padding: '0 24px 32px 24px', borderTop: '1px solid #334155', background: 'rgba(15,23,42,0.4)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, marginTop: 24 }}>
                                        
                                        {/* Left col: Deliverables Checklist */}
                                        <div>
                                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <CheckCircle size={18} color="#3B82F6" /> Deliverables Tracker
                                            </h4>
                                            {deliverables.length === 0 ? (
                                                <div style={{ color: '#64748B', fontSize: 14, fontStyle: 'italic' }}>No deliverables specified for this track.</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {deliverables.map((d, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: '#1E293B', borderRadius: 12, border: '1px solid #334155' }}>
                                                            <div style={{ marginTop: 2 }}>
                                                                {d.isCompleted ? <CheckCircle size={18} color="#10B981" /> : <Circle size={18} color="#64748B" />}
                                                            </div>
                                                            <div>
                                                                <div style={{ color: d.isCompleted ? '#F8FAFC' : '#CBD5E1', fontSize: 14, fontWeight: 600, textDecoration: d.isCompleted ? 'line-through' : 'none', opacity: d.isCompleted ? 0.7 : 1 }}>
                                                                    {d.type}
                                                                </div>
                                                                {d.notes && <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>{d.notes}</div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right col: Insights */}
                                        <div>
                                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Award size={18} color="#8B5CF6" /> Track Insights
                                            </h4>
                                            
                                            <div style={{ background: '#1E293B', borderRadius: 12, border: '1px solid #334155', padding: 20, marginBottom: 16 }}>
                                                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>OPT-IN HIRING LEADS</div>
                                                <div style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC' }}>{report.optInLeads} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>students</span></div>
                                                <button style={{ marginTop: 12, background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                                    Request CSV from Organizer
                                                </button>
                                            </div>

                                            <div style={{ background: '#1E293B', borderRadius: 12, border: '1px solid #334155', padding: 20 }}>
                                                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <MapPin size={14} /> TOP CAMPUSES
                                                </div>
                                                <ul style={{ margin: 0, paddingLeft: 20, color: '#CBD5E1', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {report.topCampuses.map((c, i) => <li key={i}>{c}</li>)}
                                                </ul>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
