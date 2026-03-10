import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, collection, query, where, onSnapshot, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ORGANIZER_CONFIG } from '../data/advancedOrganizerConfig';
import toast from 'react-hot-toast';
import { Users, FileText, Download, Check, X, Shield, Settings, Eye, Megaphone, Handshake, Plus, Trash2, Link as LinkIcon, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateEngagementScore, getReliabilityTier } from '../lib/engagementHelpers';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, deleteDoc } from 'firebase/firestore';
import SponsorshipManager from '../components/SponsorshipManager';

// Reusable Tab Button
function TabButton({ label, active, onClick, icon: Icon }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#F8FAFC' : '#64748B', fontWeight: active ? 700 : 500,
            fontSize: 14, borderBottom: active ? '2px solid #3B82F6' : '2px solid transparent',
            transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}>
            {Icon && <Icon size={16} />}
            {label}
        </button>
    );
}

function ApplicationsTab({ event, hasFeature }) {
    const [registrations, setRegistrations] = useState([]);
    const [usersStats, setUsersStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'registrations'), where('eventId', '==', event.id));
        const unsub = onSnapshot(q, async (snap) => {
            const regs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRegistrations(regs);

            // Fetch reliability stats for these users
            const statsMap = {};
            const userIds = [...new Set(regs.map(r => r.userId).filter(Boolean))];

            for (const uid of userIds) {
                // To avoid re-fetching on every snapshot, we check if we already have it
                if (!usersStats[uid]) {
                    const uDoc = await getDoc(doc(db, 'users', uid));
                    if (uDoc.exists()) {
                        statsMap[uid] = uDoc.data().stats || {};
                    }
                }
            }

            if (Object.keys(statsMap).length > 0) {
                setUsersStats(prev => ({ ...prev, ...statsMap }));
            }
            setLoading(false);
        });
        return unsub;
    }, [event.id]);

    const updateStatus = async (regId, status) => {
        try {
            await updateDoc(doc(db, 'registrations', regId), { status });
            toast.success(`Application ${status}`);
        } catch (err) { toast.error('Failed to update: ' + err.message); }
    };

    const toggleCheckIn = async (regId, currentVal) => {
        try {
            await updateDoc(doc(db, 'registrations', regId), { isCheckedIn: !currentVal });
            toast.success(!currentVal ? 'Participant Checked-In!' : 'Check-In Removed');
        } catch (err) { toast.error('Check-in failed: ' + err.message); }
    };

    if (loading) return <div style={{ padding: 40, color: '#94A3B8' }}>Loading applications...</div>;

    if (event.registrationMode !== 'review') {
        return <div style={{ padding: 40, color: '#64748B' }}>Registration mode is set to "Open". All participants are automatically accepted.</div>;
    }

    return (
        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>User ID {hasFeature('reliability_badges') && "& Reliability"}</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Motivation</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Skills</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map(reg => {
                        const userStat = usersStats[reg.userId] || { eventsRegistered: 0, eventsCheckedIn: 0, projectsSubmitted: 0 };
                        const score = calculateEngagementScore(userStat);
                        const tier = getReliabilityTier(score, userStat.eventsRegistered);

                        return (
                            <tr key={reg.id} style={{ borderBottom: '1px solid #334155' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ color: '#F8FAFC', fontSize: 13, marginBottom: 6 }}>{reg.userId?.slice(0, 8)}</div>
                                    {hasFeature('reliability_badges') && (
                                        <div
                                            title={`Reg: ${userStat.eventsRegistered} | Checked-in: ${userStat.eventsCheckedIn} | Submitted: ${userStat.projectsSubmitted}`}
                                            style={{
                                                display: 'inline-block', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                                background: tier.bg, color: tier.color, border: `1px solid ${tier.color}30`, cursor: 'help'
                                            }}>
                                            {tier.label} ({score})
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 13, maxWidth: 200, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{reg.applicationData?.motivation || '—'}</td>
                                <td style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 13 }}>{reg.applicationData?.skills || '—'}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                                        background: reg.status === 'accepted' ? 'rgba(16,185,129,0.1)' : reg.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: reg.status === 'accepted' ? '#10B981' : reg.status === 'rejected' ? '#EF4444' : '#F59E0B'
                                    }}>{reg.status || 'pending'}</span>
                                    {reg.isCheckedIn && (
                                        <div style={{ marginTop: 8, fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Check size={12} /> Present
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <button onClick={() => updateStatus(reg.id, 'accepted')} title="Accept"
                                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', padding: 6, borderRadius: 6, cursor: 'pointer' }}>
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => updateStatus(reg.id, 'rejected')} title="Reject"
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: 6, borderRadius: 6, cursor: 'pointer' }}>
                                        <X size={16} />
                                    </button>
                                    <div style={{ width: 1, height: 24, background: '#334155', margin: '0 4px' }} />
                                    <button onClick={() => toggleCheckIn(reg.id, reg.isCheckedIn)}
                                        style={{
                                            background: reg.isCheckedIn ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                            border: `1px solid ${reg.isCheckedIn ? 'rgba(16,185,129,0.4)' : 'rgba(59,130,246,0.4)'}`,
                                            color: reg.isCheckedIn ? '#10B981' : '#3B82F6',
                                            padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                                        }}>
                                        {reg.isCheckedIn ? 'Checked-In' : 'Mark Check-In'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {registrations.length === 0 && <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No applications found.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function ReportsTab({ event }) {
    const downloadExcel = async () => {
        try {
            const snap = await getDocs(query(collection(db, 'registrations'), where('eventId', '==', event.id)));
            const data = snap.docs.map(d => ({ ID: d.id, Status: d.data().status, Registered: d.data().registeredAt }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Participants");
            XLSX.writeFile(wb, `${event.title}_Report.xlsx`);
            toast.success('Downloaded Excel Report');
        } catch (err) { toast.error('Failed: ' + err.message); }
    };

    const downloadPDF = async (type) => {
        try {
            const doc = new jsPDF('landscape');
            doc.setFillColor(15, 23, 42); // Dark slate
            doc.rect(0, 0, 297, 210, 'F');
            doc.setTextColor(248, 250, 252);
            doc.setFontSize(32);
            doc.text(event.title, 148, 50, { align: 'center' });

            doc.setFontSize(16);
            doc.setTextColor(148, 163, 184);
            doc.text(type === 'winner' ? 'Certificate of Excellence' : 'Certificate of Participation', 148, 70, { align: 'center' });

            doc.setFontSize(14);
            doc.text('This is proudly presented to', 148, 110, { align: 'center' });

            doc.setFontSize(28);
            doc.setTextColor(59, 130, 246);
            doc.text('[Participant Name]', 148, 130, { align: 'center' }); // Mock placeholder

            doc.setFontSize(14);
            doc.setTextColor(148, 163, 184);
            doc.text(`for their outstanding performance on ${new Date(event.startDate || Date.now()).toLocaleDateString()}`, 148, 150, { align: 'center' });

            doc.save(`${event.title}_${type}s.pdf`);
            toast.success(`Downloaded ${type} certificates!`);
        } catch (err) { toast.error('Failed generating PDF: ' + err.message); }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
                { label: 'Event Report (Excel)', desc: 'Detailed participant stats and data.', icon: FileText, act: downloadExcel },
                { label: 'Participation Certificates', desc: 'PDFs for all attendees.', icon: Download, act: () => downloadPDF('participation') },
                { label: 'Winner Certificates', desc: 'PDFs for top ranked teams.', icon: Download, act: () => downloadPDF('winner') },
            ].map(r => (
                <div key={r.label} style={{ background: '#1E293B', padding: 24, borderRadius: 16, border: '1px solid #334155' }}>
                    <r.icon size={32} color="#3B82F6" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{r.label}</h3>
                    <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20 }}>{r.desc}</p>
                    <button onClick={r.act} className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                        Download
                    </button>
                </div>
            ))}
        </div>
    );
}

function JudgesTab({ event }) {
    return (
        <div style={{ background: '#1E293B', padding: 32, borderRadius: 16, border: '1px solid #334155', textAlign: 'center' }}>
            <Shield size={40} color="#64748B" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#F8FAFC', fontSize: 16, marginBottom: 8 }}>Judge Management</h3>
            <p style={{ color: '#94A3B8', fontSize: 14 }}>To add or edit judges, please use the "Edit Event" form.</p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                {(event.judges || []).map(j => <span key={j} className="badge badge-blue">{j}</span>)}
            </div>
        </div>
    );
}

function CampusPulseTab({ event }) {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'eventFeedback'), where('eventId', '==', event.id));
        const unsub = onSnapshot(q, (snap) => {
            setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, [event.id]);

    if (loading) return <div style={{ padding: 40, color: '#94A3B8' }}>Loading Pulse Data...</div>;

    const total = feedback.length;
    if (total === 0) {
        return (
            <div style={{ background: '#1E293B', padding: 40, borderRadius: 16, border: '1px solid #334155', textAlign: 'center' }}>
                <Megaphone size={40} color="#64748B" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#F8FAFC', fontSize: 16, marginBottom: 8 }}>No Feedback Yet</h3>
                <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16 }}>Share your feedback link with students to get anonymous analytics.</p>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: 8, display: 'inline-block', border: '1px dashed #475569', color: '#3B82F6', fontSize: 13, userSelect: 'all' }}>
                    {window.location.origin}/events/{event.id}/feedback
                </div>
            </div>
        );
    }

    const avgSkill = (feedback.reduce((sum, f) => sum + f.skillConfidence, 0) / total).toFixed(1);
    const avgRating = (feedback.reduce((sum, f) => sum + f.organizerRating, 0) / total).toFixed(1);
    const wantMorePct = Math.round((feedback.filter(f => f.wantMoreEvents).length / total) * 100);

    return (
        <div>
            {/* Header info / Link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: 16, background: 'rgba(59,130,246,0.1)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                <div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Collect Anonymous Feedback</div>
                    <div style={{ color: '#94A3B8', fontSize: 13 }}>Share this link at the end of your event to gather insights.</div>
                </div>
                <div style={{ background: '#0F172A', padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', color: '#60A5FA', fontSize: 12, userSelect: 'all', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/events/${event.id}/feedback`); toast.success("Copied link!"); }}>
                    {window.location.origin}/events/{event.id}/feedback
                </div>
            </div>

            {/* Top Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#1E293B', padding: 20, borderRadius: 16, border: '1px solid rgba(16,185,129,0.4)' }}>
                    <div style={{ color: '#10B981', fontSize: 28, fontWeight: 800 }}>{avgSkill} <span style={{ fontSize: 14 }}>/ 5</span></div>
                    <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, marginTop: 4 }}>Skill Confidence</div>
                </div>
                <div style={{ background: '#1E293B', padding: 20, borderRadius: 16, border: '1px solid rgba(59,130,246,0.4)' }}>
                    <div style={{ color: '#3B82F6', fontSize: 28, fontWeight: 800 }}>{avgRating} <span style={{ fontSize: 14 }}>/ 5</span></div>
                    <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, marginTop: 4 }}>Overall Rating</div>
                </div>
                <div style={{ background: '#1E293B', padding: 20, borderRadius: 16, border: '1px solid rgba(139,92,246,0.4)' }}>
                    <div style={{ color: '#8B5CF6', fontSize: 28, fontWeight: 800 }}>{wantMorePct}%</div>
                    <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, marginTop: 4 }}>Want More Events</div>
                </div>
                <div style={{ background: '#1E293B', padding: 20, borderRadius: 16, border: '1px solid rgba(245,158,11,0.4)' }}>
                    <div style={{ color: '#F59E0B', fontSize: 28, fontWeight: 800 }}>{total}</div>
                    <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600, marginTop: 4 }}>Total Responses</div>
                </div>
            </div>

            {/* Comments List */}
            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Open Comments</h3>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {feedback.filter(f => f.openComment && f.openComment.trim() !== '').length === 0 ? (
                        <div style={{ color: '#64748B', fontSize: 14 }}>No written comments yet.</div>
                    ) : (
                        feedback.filter(f => f.openComment && f.openComment.trim() !== '').map((f, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, border: '1px solid #334155' }}>
                                <div style={{ color: '#F8FAFC', fontSize: 14, lineHeight: 1.6 }}>"{f.openComment}"</div>
                                <div style={{ color: '#64748B', fontSize: 11, marginTop: 8 }}>
                                    Rating: {f.organizerRating}/5 · Confidence: {f.skillConfidence}/5
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function OrganizerEventDashboard() {
    const { id } = useParams();
    const { currentUser, hasFeature } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('applications');

    useEffect(() => {
        if (!currentUser) return;
        const unsub = onSnapshot(doc(db, 'events', id), (snap) => {
            if (snap.exists() && snap.data().organizerId === currentUser.uid) {
                setEvent({ id: snap.id, ...snap.data() });
            } else {
                toast.error('Unauthorized access');
                navigate('/dashboard');
            }
            setLoading(false);
        });
        return unsub;
    }, [id, currentUser, navigate]);

    if (loading) return <DashboardLayout><div style={{ padding: 60, color: '#94A3B8' }}>Loading Dashboard...</div></DashboardLayout>;
    if (!event) return <DashboardLayout><div style={{ padding: 60, color: '#EF4444' }}>Event not found.</div></DashboardLayout>;

    const TABS = [
        { id: 'applications', label: ORGANIZER_CONFIG.labels.applications, icon: Users },
        { id: 'reports', label: ORGANIZER_CONFIG.labels.reports, icon: FileText },
        { id: 'judges', label: ORGANIZER_CONFIG.labels.judges, icon: Shield },
        { id: 'sponsors', label: 'Sponsors', icon: Handshake },
    ];

    if (hasFeature('campus_pulse')) {
        TABS.push({ id: 'pulse', label: 'Campus Pulse', icon: Megaphone });
    }

    return (
        <DashboardLayout>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>{event.title} - Admin Dashboard</h1>
                    <p style={{ color: '#64748B', fontSize: 14 }}>Manage applications, generate certificates, and oversee judging.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => window.open(`/events/${event.id}`, '_blank')} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
                        <Eye size={16} /> View Event Page
                    </button>
                    <button onClick={() => navigate(`/events/create?edit=${event.id}`)} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>
                        <Settings size={16} /> Edit Settings
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: 24, overflowX: 'auto' }}>
                {TABS.map(t => (
                    <TabButton key={t.id} label={t.label} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} />
                ))}
            </div>

            {/* Content */}
            {tab === 'applications' && <ApplicationsTab event={event} hasFeature={hasFeature} />}
            {tab === 'reports' && <ReportsTab event={event} />}
            {tab === 'judges' && <JudgesTab event={event} />}
            {tab === 'pulse' && <CampusPulseTab event={event} />}
            {tab === 'sponsors' && <SponsorshipManager event={event} />}

        </DashboardLayout>
    );
}
