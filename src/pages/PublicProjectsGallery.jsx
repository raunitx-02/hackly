import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Github, ExternalLink, Star, Code2, Users, Trophy } from 'lucide-react';
import { ORGANIZER_CONFIG } from '../data/advancedOrganizerConfig';

export default function PublicProjectsGallery() {
    const { id: eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubEvent = onSnapshot(doc(db, 'events', eventId), (snap) => {
            if (snap.exists() && snap.data().publicProjects) {
                setEvent({ id: snap.id, ...snap.data() });
            } else {
                setEvent(null); // Not public or not found
            }
        });

        const subQ = query(collection(db, 'submissions'), where('eventId', '==', eventId));
        const unsubSubs = onSnapshot(subQ, (snap) => {
            setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        return () => { unsubEvent(); unsubSubs(); };
    }, [eventId]);

    const filteredProjects = useMemo(() => {
        if (!searchQuery) return submissions;
        const q = searchQuery.toLowerCase();
        return submissions.filter(s =>
            s.projectName?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            (s.techStack || []).some(t => t.toLowerCase().includes(q))
        );
    }, [submissions, searchQuery]);

    if (loading) return (
        <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!event) return (
        <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100 }}>
                <div style={{ textAlign: 'center' }}>
                    <Star size={48} color="#64748B" style={{ margin: '0 auto 24px', opacity: 0.5 }} />
                    <h2 style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Gallery Not Available</h2>
                    <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 400 }}>This event's projects are not public, or the event does not exist.</p>
                    <Link to="/events" className="btn-gradient" style={{ marginTop: 24, display: 'inline-flex', textDecoration: 'none' }}>Back to Events</Link>
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ paddingTop: 88, flex: 1 }}>
                <div className="container" style={{ paddingBottom: 80 }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 800, margin: '0 auto 48px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 99, color: '#3B82F6', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
                            <Trophy size={14} /> {event.title} Projects
                        </div>
                        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Project Gallery</h1>
                        <p style={{ color: '#94A3B8', fontSize: 18, lineHeight: 1.6 }}>
                            Explore {submissions.length} amazing projects built by the community during this event.
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div style={{ marginBottom: 32, display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder={ORGANIZER_CONFIG.labels.searchProjects}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', background: '#1E293B', border: '1px solid #334155', borderRadius: 12,
                                    padding: '14px 16px 14px 44px', color: '#F8FAFC', fontSize: 15, outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {filteredProjects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, background: '#1E293B', borderRadius: 16, border: '1px solid #334155' }}>
                            <Code2 size={40} color="#334155" style={{ margin: '0 auto 16px' }} />
                            <p style={{ color: '#64748B', fontSize: 16 }}>No projects found matching your search.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                            {filteredProjects.map(proj => (
                                <div key={proj.id} style={{
                                    background: '#1E293B', border: '1px solid #334155', borderRadius: 16,
                                    padding: 24, display: 'flex', flexDirection: 'column'
                                }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 10 }}>{proj.projectName}</h3>
                                    <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 20, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {proj.description}
                                    </p>

                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                                        {(proj.techStack || []).slice(0, 5).map(t => (
                                            <span key={t} className="badge badge-blue" style={{ fontSize: 11, padding: '4px 10px' }}>{t}</span>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #334155' }}>
                                        {proj.githubUrl && (
                                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 13, minHeight: 40, textDecoration: 'none' }}>
                                                <Github size={14} /> GitHub
                                            </a>
                                        )}
                                        {proj.demoUrl && (
                                            <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 13, minHeight: 40, textDecoration: 'none' }}>
                                                <ExternalLink size={14} /> Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
