import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Github, ExternalLink, X, Star, Check, Filter, EyeOff } from 'lucide-react';
import { ORGANIZER_CONFIG } from '../data/advancedOrganizerConfig';

function ScoreDrawer({ submission, event, onClose, onScored }) {
    const { currentUser } = useAuth();
    const criteria = event?.judgingCriteria || [];
    const [scores, setScores] = useState(() => Object.fromEntries(criteria.map(c => [c.name, 5])));
    const [submitting, setSubmitting] = useState(false);

    const totalScore = criteria.reduce((sum, c) => {
        return sum + (scores[c.name] || 5) * (c.weight / 100);
    }, 0);

    const handleSubmit = async () => {
        if (!currentUser) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'scores'), {
                eventId: event.id, submissionId: submission.id,
                judgeId: currentUser.uid, criteriaScores: scores,
                totalScore: Math.round(totalScore * 10) / 10,
                scoredAt: new Date().toISOString(),
            });
            toast.success('Score submitted! ✅');
            onScored(submission.id);
            onClose();
        } catch (err) { toast.error('Failed: ' + err.message); }
        finally { setSubmitting(false); }
    };

    return (
        <>
            {/* Overlay */}
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998 }} onClick={onClose} />
            {/* Drawer */}
            <div style={{
                position: 'fixed', right: 0, top: 0, bottom: 0, width: 420,
                background: '#1E293B', borderLeft: '1px solid #334155',
                zIndex: 999, display: 'flex', flexDirection: 'column',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
                overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Score Project</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Project info */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', flexShrink: 0 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{submission.projectName}</h4>
                    <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{submission.description}</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {submission.githubUrl && (
                            <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="btn-outline"
                                style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none' }}>
                                <Github size={13} /> GitHub
                            </a>
                        )}
                        {submission.demoUrl && (
                            <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="btn-outline"
                                style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none' }}>
                                <ExternalLink size={13} /> Demo
                            </a>
                        )}
                    </div>
                </div>

                {/* Scoring */}
                <div style={{ padding: '20px 24px', flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Scoring Rubric
                    </h4>

                    {criteria.map(c => (
                        <div key={c.name} style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <div>
                                    <span style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                                    <span style={{ color: '#64748B', fontSize: 12, marginLeft: 8 }}>({c.weight}% weight)</span>
                                </div>
                                <span style={{
                                    fontSize: 18, fontWeight: 800, color: '#3B82F6',
                                    minWidth: 30, textAlign: 'right',
                                }}>{scores[c.name] || 5}</span>
                            </div>
                            <input
                                type="range" min={1} max={10} step={1}
                                value={scores[c.name] || 5}
                                onChange={e => setScores({ ...scores, [c.name]: Number(e.target.value) })}
                                style={{ width: '100%', accentColor: '#3B82F6', height: 4 }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                <span style={{ color: '#64748B', fontSize: 11 }}>1 — Weak</span>
                                <span style={{ color: '#64748B', fontSize: 11 }}>10 — Excellent</span>
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div style={{
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'center',
                    }}>
                        <div style={{ color: '#94A3B8', fontSize: 13, marginBottom: 4 }}>Weighted Total Score</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: '#3B82F6' }}>{totalScore.toFixed(1)}</div>
                        <div style={{ color: '#64748B', fontSize: 12 }}>out of 10.0</div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #334155', flexShrink: 0 }}>
                    <button onClick={handleSubmit} disabled={submitting} className="btn-gradient"
                        style={{ width: '100%', justifyContent: 'center', minHeight: 48, fontSize: 15 }}>
                        {submitting ? 'Submitting...' : <><Check size={17} /> Submit Score</>}
                    </button>
                </div>
            </div>
        </>
    );
}

export default function JudgePage() {
    const { id: eventId } = useParams();
    const { currentUser } = useAuth();
    const [event, setEvent] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [scoredIds, setScoredIds] = useState(new Set());
    const [activeSubmission, setActiveSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const filteredSubmissions = submissions.filter(sub => {
        const scored = scoredIds.has(sub.id);
        if (filter === 'To be scored') return !scored;
        if (filter === 'Scored') return scored;
        if (filter === 'In progress') return false; // Not implemented
        return true;
    });

    useEffect(() => {
        onSnapshot(doc(db, 'events', eventId), (snap) => {
            if (snap.exists()) setEvent({ id: snap.id, ...snap.data() });
        });
        const subQ = query(collection(db, 'submissions'), where('eventId', '==', eventId));
        onSnapshot(subQ, (snap) => {
            setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        // fetch already scored
        if (currentUser) {
            const scoreQ = query(collection(db, 'scores'), where('eventId', '==', eventId), where('judgeId', '==', currentUser.uid));
            onSnapshot(scoreQ, (snap) => {
                setScoredIds(new Set(snap.docs.map(d => d.data().submissionId)));
            });
        }
    }, [eventId, currentUser]);

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 88 }}>
                <div className="container" style={{ paddingBottom: 80 }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Judge Panel</h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>
                            {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} · {scoredIds.size} scored
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
                        {ORGANIZER_CONFIG.judgingFilters.map(f => (
                            <button key={f} onClick={() => setFilter(f)} style={{
                                padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, border: '1px solid',
                                background: filter === f ? 'rgba(59,130,246,0.1)' : '#1E293B',
                                color: filter === f ? '#3B82F6' : '#94A3B8',
                                borderColor: filter === f ? 'rgba(59,130,246,0.5)' : '#334155',
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                            }}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                        </div>
                    ) : submissions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', background: '#1E293B', borderRadius: 16, border: '1px solid #334155' }}>
                            <img src="/favicon.png" alt="" style={{ height: 40, width: 40, margin: '0 auto 16px', opacity: 0.5 }} />
                            <p style={{ color: '#64748B', fontSize: 16 }}>No submissions yet for this event.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                            {filteredSubmissions.map(sub => {
                                const scored = scoredIds.has(sub.id);
                                const isAnon = event?.anonymousJudging;
                                return (
                                    <div key={sub.id} style={{
                                        background: '#1E293B', border: `1px solid ${scored ? 'rgba(16,185,129,0.4)' : '#334155'}`,
                                        borderRadius: 16, padding: 24, position: 'relative',
                                        transition: 'border-color 0.2s',
                                    }}>
                                        {scored && (
                                            <div className="badge badge-green" style={{ position: 'absolute', top: 16, right: 16 }}>
                                                <Check size={11} /> Scored
                                            </div>
                                        )}
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 6, paddingRight: scored ? 80 : 0 }}>
                                            {sub.projectName}
                                        </h3>
                                        <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {sub.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                                            {(sub.techStack || []).slice(0, 4).map(t => (
                                                <span key={t} className="badge badge-blue" style={{ fontSize: 11 }}>{t}</span>
                                            ))}
                                            {isAnon && <span className="badge badge-gray" style={{ fontSize: 11, background: '#334155', color: '#F8FAFC', border: 'none' }}><EyeOff size={11} style={{ marginRight: 4 }} /> Anonymous</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {!isAnon && sub.githubUrl && (
                                                <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 12, padding: '7px 12px', textDecoration: 'none' }}>
                                                    <Github size={13} />
                                                </a>
                                            )}
                                            {!isAnon && sub.demoUrl && (
                                                <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: 12, padding: '7px 12px', textDecoration: 'none' }}>
                                                    <ExternalLink size={13} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setActiveSubmission(sub)}
                                                disabled={scored}
                                                className="btn-gradient"
                                                style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '8px 14px', opacity: scored ? 0.5 : 1, cursor: scored ? 'not-allowed' : 'pointer', minHeight: 38 }}
                                            >
                                                <Star size={13} /> {scored ? 'Already Scored' : 'Score Project'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {activeSubmission && (
                <ScoreDrawer
                    submission={activeSubmission}
                    event={event}
                    onClose={() => setActiveSubmission(null)}
                    onScored={(id) => setScoredIds(prev => new Set([...prev, id]))}
                />
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
