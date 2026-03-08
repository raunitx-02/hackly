import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, collection, query, where, onSnapshot, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ORGANIZER_CONFIG } from '../data/advancedOrganizerConfig';
import toast from 'react-hot-toast';
import { Users, FileText, Download, Check, X, Shield, Settings, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

function ApplicationsTab({ event }) {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'registrations'), where('eventId', '==', event.id));
        const unsub = onSnapshot(q, (snap) => {
            setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

    if (loading) return <div style={{ padding: 40, color: '#94A3B8' }}>Loading applications...</div>;

    if (event.registrationMode !== 'review') {
        return <div style={{ padding: 40, color: '#64748B' }}>Registration mode is set to "Open". All participants are automatically accepted.</div>;
    }

    return (
        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>User/Team ID</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Motivation</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Skills</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map(reg => (
                        <tr key={reg.id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '16px 24px', color: '#F8FAFC', fontSize: 13 }}>{reg.userId?.slice(0, 8)}</td>
                            <td style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 13, maxWidth: 200, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{reg.applicationData?.motivation || '—'}</td>
                            <td style={{ padding: '16px 24px', color: '#94A3B8', fontSize: 13 }}>{reg.applicationData?.skills || '—'}</td>
                            <td style={{ padding: '16px 24px' }}>
                                <span style={{
                                    padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                                    background: reg.status === 'accepted' ? 'rgba(16,185,129,0.1)' : reg.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                    color: reg.status === 'accepted' ? '#10B981' : reg.status === 'rejected' ? '#EF4444' : '#F59E0B'
                                }}>{reg.status || 'pending'}</span>
                            </td>
                            <td style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
                                <button onClick={() => updateStatus(reg.id, 'accepted')} title="Accept"
                                    style={{ background: 'rgba(16,185,129,0.1)', border: 'none', color: '#10B981', padding: 6, borderRadius: 6, cursor: 'pointer' }}>
                                    <Check size={16} />
                                </button>
                                <button onClick={() => updateStatus(reg.id, 'rejected')} title="Reject"
                                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', padding: 6, borderRadius: 6, cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
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

export default function OrganizerEventDashboard() {
    const { id } = useParams();
    const { currentUser } = useAuth();
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
    ];

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
            {tab === 'applications' && <ApplicationsTab event={event} />}
            {tab === 'reports' && <ReportsTab event={event} />}
            {tab === 'judges' && <JudgesTab event={event} />}

        </DashboardLayout>
    );
}
