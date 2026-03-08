import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Github, ExternalLink, FileText, X, Plus } from 'lucide-react';

export default function SubmissionsPage() {
    const { id: eventId } = useParams();
    const { currentUser } = useAuth();
    const [submission, setSubmission] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [event, setEvent] = useState(null);
    const [form, setForm] = useState({
        projectName: '', description: '', techStack: '', githubUrl: '', demoUrl: '', pptUrl: '',
        problemStatementId: '',
    });
    const [techInput, setTechInput] = useState('');
    const [techTags, setTechTags] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        // Fetch team
        const tq = query(collection(db, 'teams'), where('eventId', '==', eventId));
        onSnapshot(tq, (snap) => {
            const mine = snap.docs.map(d => ({ id: d.id, ...d.data() })).find(t => (t.members || []).includes(currentUser.uid) || t.leaderId === currentUser.uid);
            setMyTeam(mine || null);
        });
        // Fetch existing submission
        const sq = query(collection(db, 'submissions'), where('eventId', '==', eventId));
        onSnapshot(sq, (snap) => {
            const found = snap.docs.map(d => ({ id: d.id, ...d.data() })).find(s => s.userId === currentUser.uid || (myTeam && s.teamId === myTeam?.id));
            setSubmission(found || null);
        });
    }, [eventId, currentUser, myTeam]);

    const addTag = () => {
        const t = techInput.trim();
        if (t && !techTags.includes(t)) setTechTags([...techTags, t]);
        setTechInput('');
    };

    const handleSubmit = async () => {
        if (!form.projectName) { toast.error('Project name is required'); return; }
        setSubmitting(true);
        try {
            const data = {
                eventId, teamId: myTeam?.id || '', userId: currentUser.uid,
                projectName: form.projectName, description: form.description,
                techStack: techTags, githubUrl: form.githubUrl, demoUrl: form.demoUrl,
                pptUrl: form.pptUrl, problemStatementId: form.problemStatementId,
                submittedAt: new Date().toISOString(),
            };
            if (submission && submission.id) {
                await updateDoc(doc(db, 'submissions', submission.id), data);
                toast.success('Submission updated!');
            } else {
                await addDoc(collection(db, 'submissions'), data);
                toast.success('Project submitted! 🚀');
            }
            setEditing(false);
        } catch (err) { toast.error('Error: ' + err.message); }
        finally { setSubmitting(false); }
    };

    const showForm = !submission || editing;

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 88 }}>
                <div className="container" style={{ maxWidth: 720, paddingBottom: 80 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Submission Portal</h1>
                    <p style={{ color: '#64748B', marginBottom: 36 }}>Submit your project for this event</p>

                    {/* Already submitted */}
                    {submission && !editing && (
                        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(16,185,129,0.4)', padding: 28, marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div className="badge badge-green" style={{ marginBottom: 10 }}>✅ Submitted</div>
                                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC' }}>{submission.projectName}</h2>
                                </div>
                                <button onClick={() => setEditing(true)} className="btn-outline" style={{ fontSize: 13, padding: '8px 16px' }}>
                                    Edit
                                </button>
                            </div>
                            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{submission.description}</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                {(submission.techStack || []).map(t => (
                                    <span key={t} className="badge badge-blue">{t}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                {submission.githubUrl && <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 13, padding: '8px 16px', textDecoration: 'none' }}><Github size={14} /> GitHub</a>}
                                {submission.demoUrl && <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 13, padding: '8px 16px', textDecoration: 'none' }}><ExternalLink size={14} /> Demo</a>}
                            </div>
                        </div>
                    )}

                    {/* Submission Form */}
                    {showForm && (
                        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 24 }}>
                                {editing ? 'Edit Submission' : 'Submit Your Project'}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div>
                                    <label className="label">Project Name *</label>
                                    <input className="input" placeholder="Awesome Project" value={form.projectName}
                                        onChange={e => setForm({ ...form, projectName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Description</label>
                                    <textarea className="input" rows={4} placeholder="What does your project do?" value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
                                </div>
                                <div>
                                    <label className="label">Tech Stack</label>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                        {techTags.map(t => (
                                            <span key={t} className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {t}
                                                <button onClick={() => setTechTags(techTags.filter(x => x !== t))}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', padding: 0, lineHeight: 1 }}>
                                                    <X size={11} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input className="input" placeholder="React, Firebase, Node..." value={techInput}
                                            onChange={e => setTechInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addTag()} style={{ flex: 1 }} />
                                        <button onClick={addTag} className="btn-gradient" style={{ padding: '0 16px', minHeight: 44 }}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="label">GitHub URL</label>
                                        <input className="input" placeholder="https://github.com/..." value={form.githubUrl}
                                            onChange={e => setForm({ ...form, githubUrl: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Demo URL</label>
                                        <input className="input" placeholder="https://your-demo.vercel.app" value={form.demoUrl}
                                            onChange={e => setForm({ ...form, demoUrl: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">PPT / Presentation URL</label>
                                    <input className="input" placeholder="Google Slides, Drive link..." value={form.pptUrl}
                                        onChange={e => setForm({ ...form, pptUrl: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {editing && (
                                        <button onClick={() => setEditing(false)} className="btn-outline" style={{ minHeight: 44 }}>Cancel</button>
                                    )}
                                    <button onClick={handleSubmit} disabled={submitting} className="btn-gradient" style={{ flex: 1, justifyContent: 'center', minHeight: 44 }}>
                                        {submitting ? 'Submitting...' : editing ? 'Update Submission' : '🚀 Submit Project'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
