import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Send, Star, Megaphone, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CampusPulseFeedback() {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [form, setForm] = useState({
        skillConfidence: 0,
        wantMoreEvents: null, // true/false
        organizerRating: 0,
        openComment: ''
    });

    useEffect(() => {
        // Load event details to ensure it's valid and to show the title
        const fetchEventAndCheckStatus = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'events', eventId));
                if (!docSnap.exists()) {
                    toast.error('Event not found.');
                    navigate('/');
                    return;
                }
                setEvent({ id: docSnap.id, ...docSnap.data() });

                // If logged in, check if already submitted
                if (currentUser) {
                    const q = query(collection(db, 'eventFeedback'), where('eventId', '==', eventId), where('userId', '==', currentUser.uid));
                    const feedbackSnap = await getDocs(q);
                    if (!feedbackSnap.empty) {
                        setSubmitted(true);
                    }
                }
            } catch (error) {
                console.error("Error loading event:", error);
                toast.error("Could not load feedback form");
            } finally {
                setLoading(false);
            }
        };
        fetchEventAndCheckStatus();
    }, [eventId, navigate, currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.skillConfidence === 0 || form.organizerRating === 0 || form.wantMoreEvents === null) {
            toast.error("Please answer all the required rating questions.");
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'eventFeedback'), {
                eventId,
                userId: currentUser ? currentUser.uid : null, // Anonymous if not logged in
                skillConfidence: form.skillConfidence,
                wantMoreEvents: form.wantMoreEvents === 'true',
                organizerRating: form.organizerRating,
                openComment: form.openComment.trim(),
                createdAt: serverTimestamp()
            });
            setSubmitted(true);
            toast.success("Thank you for your feedback! 🚀");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit feedback. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#64748B' }}>Loading Campus Pulse...</div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#1E293B', borderRadius: 24, border: '1px solid #334155', padding: 48, textAlign: 'center', maxWidth: 460, width: '100%' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle size={32} color="#10B981" />
                        </div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', marginBottom: 16 }}>Feedback Received</h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
                            Thank you for helping us improve campus events. Your voice makes a difference!
                        </p>
                        <button onClick={() => navigate('/')} className="btn-gradient" style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 16 }}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <div style={{ flex: 1, paddingTop: 100, paddingBottom: 60, display: 'flex', justifyContent: 'center', paddingLeft: 20, paddingRight: 20 }}>
                <div style={{ maxWidth: 600, width: '100%' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 99, color: '#A78BFA', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                            <Megaphone size={16} /> Campus Pulse (Anonymous)
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 12 }}>
                            How was <span style={{ color: '#3B82F6' }}>{event?.title}</span>?
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 16 }}>Your honest feedback helps organizers build better student hackathons.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ background: '#1E293B', borderRadius: 24, border: '1px solid #334155', padding: '40px 32px' }}>

                        {/* 1. Skill Confidence */}
                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 12 }}>
                                1. Did this event increase your confidence in building real projects? <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setForm({ ...form, skillConfidence: num })}
                                        style={{
                                            flex: 1, height: 48, borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                            background: form.skillConfidence === num ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                                            color: form.skillConfidence === num ? '#FFF' : '#94A3B8',
                                            border: `1px solid ${form.skillConfidence === num ? '#3B82F6' : '#334155'}`
                                        }}>
                                        {num}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: 12, marginTop: 8 }}>
                                <span>Not at all</span>
                                <span>Absolutely</span>
                            </div>
                        </div>

                        {/* 2. Future Events */}
                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 12 }}>
                                2. Would you attend another event hosted by this organizer/college? <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <button type="button" onClick={() => setForm({ ...form, wantMoreEvents: 'true' })}
                                    style={{ flex: 1, padding: '16px', borderRadius: 12, border: `1px solid ${form.wantMoreEvents === 'true' ? '#10B981' : '#334155'}`, background: form.wantMoreEvents === 'true' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', color: form.wantMoreEvents === 'true' ? '#10B981' : '#E2E8F0', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                    Yes, definitely
                                </button>
                                <button type="button" onClick={() => setForm({ ...form, wantMoreEvents: 'false' })}
                                    style={{ flex: 1, padding: '16px', borderRadius: 12, border: `1px solid ${form.wantMoreEvents === 'false' ? '#EF4444' : '#334155'}`, background: form.wantMoreEvents === 'false' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', color: form.wantMoreEvents === 'false' ? '#EF4444' : '#E2E8F0', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                                    No, thanks
                                </button>
                            </div>
                        </div>

                        {/* 3. Organizer Rating */}
                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 12 }}>
                                3. How would you rate the overall logistics & organization? <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, border: '1px solid #334155' }}>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num} type="button"
                                        onClick={() => setForm({ ...form, organizerRating: num })}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, transition: 'transform 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Star size={32} fill={form.organizerRating >= num ? '#F59E0B' : 'transparent'} color={form.organizerRating >= num ? '#F59E0B' : '#475569'} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Open Comments */}
                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#F8FAFC', marginBottom: 12 }}>
                                4. Any other thoughts or suggestions? (Optional)
                            </label>
                            <textarea
                                placeholder="What did you love? What was confusing?"
                                value={form.openComment}
                                onChange={e => setForm({ ...form, openComment: e.target.value })}
                                style={{ width: '100%', minHeight: 120, background: 'rgba(255,255,255,0.03)', border: '1px solid #334155', borderRadius: 12, padding: 16, color: '#F8FAFC', fontSize: 15, resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        <button type="submit" disabled={submitting} className="btn-gradient" style={{ width: '100%', padding: '16px', fontSize: 16, justifyContent: 'center' }}>
                            {submitting ? 'Submitting...' : <><Send size={18} /> Submit Anonymous Pulse</>}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
