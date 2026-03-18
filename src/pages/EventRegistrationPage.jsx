import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, runTransaction, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, User, Mail, Hash, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const DEFAULT_FIELDS = [
    { id: 'f_name', label: 'Full Name', type: 'text', required: true },
    { id: 'f_email', label: 'Email Address', type: 'email', required: true },
    { id: 'f_enrollment', label: 'Enrollment / College ID', type: 'text', required: true },
];

export default function EventRegistrationPage() {
    const { id } = useParams();
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeStageIdx, setActiveStageIdx] = useState(0);
    const [responses, setResponses] = useState({});

    useEffect(() => {
        async function fetchData() {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                // 1. Fetch Event
                const eventSnap = await getDoc(doc(db, 'events', id));
                if (!eventSnap.exists()) {
                    toast.error("Event not found");
                    navigate('/events');
                    return;
                }
                const eventData = { id: eventSnap.id, ...eventSnap.data() };
                setEvent(eventData);

                // 2. Fetch Existing Registration
                const q = query(collection(db, 'registrations'), where('eventId', '==', id), where('userId', '==', currentUser.uid));
                const regSnap = await getDocs(q);
                
                if (!regSnap.empty) {
                    const regDoc = regSnap.docs[0];
                    const regData = { id: regDoc.id, ...regDoc.data() };
                    setRegistration(regData);

                    // 3. Determine next stage (using the same logic as render)
                    const baseForms = (eventData.customForms && eventData.customForms.length > 0)
                        ? eventData.customForms
                        : [{ title: 'Registration', fields: DEFAULT_FIELDS }];
                    
                    const completedStages = regData.completedStages || [];
                    const nextIdx = baseForms.findIndex((_, idx) => !completedStages.includes(idx));
                    if (nextIdx !== -1) {
                        setActiveStageIdx(nextIdx);
                    } else {
                        setActiveStageIdx(-1); // All completed
                    }
                } else {
                    setActiveStageIdx(0);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, currentUser, navigate]);

    const handleResponseChange = (fieldId, value) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return navigate('/auth');
        
        const currentForm = forms[activeStageIdx] || { fields: [] };
        
        // Basic validation
        for (const field of currentForm.fields) {
            if (field.required && !responses[field.id]) {
                return toast.error(`${field.label} is required`);
            }
        }

        setSubmitting(true);
        try {
            if (!registration) {
                // First time registration
                await runTransaction(db, async (transaction) => {
                    const eventRef = doc(db, 'events', id);
                    const eventSnap = await transaction.get(eventRef);
                    const eventData = eventSnap.data();

                    const regRef = doc(collection(db, 'registrations'));
                    const regData = {
                        eventId: id,
                        userId: currentUser.uid,
                        leaderName: userProfile?.name || currentUser.displayName,
                        leaderEmail: currentUser.email,
                        responses: responses,
                        completedStages: [0],
                        registeredAt: new Date().toISOString(),
                        status: event.registrationMode === 'review' ? 'pending' : 'accepted',
                        teamName: responses.team_name || '',
                    };
                    transaction.set(regRef, regData);
                    
                    transaction.update(eventRef, {
                        registered: (eventData.registered || 0) + 1
                    });
                });
                toast.success("Initial registration successful! 🚀");
            } else {
                // Subsequent stage
                const updatedResponses = { ...(registration.responses || {}), ...responses };
                const updatedStages = [...(registration.completedStages || []), activeStageIdx];
                
                await updateDoc(doc(db, 'registrations', registration.id), {
                    responses: updatedResponses,
                    completedStages: updatedStages,
                    updatedAt: new Date().toISOString()
                });
                toast.success(`${currentForm.title} submitted! ✨`);
            }
            
            // Reload to find next stage
            window.location.reload();
        } catch (err) {
            toast.error("Submission failed: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    if (!currentUser) {
        return (
            <DashboardLayout>
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2 style={{ color: '#F8FAFC', marginBottom: 16 }}>Please log in to register</h2>
                    <button onClick={() => navigate('/auth')} className="btn-gradient" style={{ padding: '12px 24px' }}>Login / Signup</button>
                </div>
            </DashboardLayout>
        );
    }

    if (activeStageIdx === -1) {
        return (
            <DashboardLayout>
                <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', background: '#1E293B', padding: 40, borderRadius: 24, border: '1px solid #334155' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle size={32} color="#10B981" />
                    </div>
                    <h2 style={{ color: '#F8FAFC', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>You're all set!</h2>
                    <p style={{ color: '#94A3B8', lineHeight: 1.6, marginBottom: 24 }}>
                        You have completed all registration stages for <strong>{event?.title}</strong>. 
                        We'll notify you if any further action is needed.
                    </p>
                    <button onClick={() => navigate(`/events/${id}`)} className="btn-outline" style={{ width: '100%', padding: 14 }}>View Event Details</button>
                </div>
            </DashboardLayout>
        );
    }

    const baseForms = (event?.customForms && event.customForms.length > 0) 
        ? event.customForms 
        : [{ title: 'Registration', fields: DEFAULT_FIELDS }];

    let forms = [...baseForms];

    const isCustom = event?.customForms && event.customForms.length > 0;
    let currentForm = forms[activeStageIdx] || { title: 'Registration', fields: [] };

    // If it's a team event AND we are on the first stage (index 0) AND not registered yet
    // ONLY expand if the form is NOT custom (organizer provided)
    if (event?.maxTeamSize > 1 && activeStageIdx === 0 && !registration && !isCustom) {
        const firstForm = { ...forms[0] };
        const expandedFields = [
            { id: 'team_name', label: 'Team Name', type: 'text', required: true }
        ];

        for (let i = 1; i <= event.maxTeamSize; i++) {
            firstForm.fields.forEach(f => {
                expandedFields.push({
                    ...f,
                    id: `${f.id}_m${i}`,
                    label: i === 1 ? f.label : `${f.label} (${i})`,
                    required: i === 1 ? f.required : false // Only leader is strictly required
                });
            });
        }
        forms[0] = { ...firstForm, fields: expandedFields };
    }

    currentForm = forms[activeStageIdx] || { title: 'Registration', fields: [] };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ background: '#1E293B', borderRadius: 24, border: '1px solid #334155', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
                    
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ color: '#3B82F6', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                            Stage {activeStageIdx + 1} of {forms.length}
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>{currentForm.title}</h1>
                        <p style={{ color: '#94A3B8' }}>{registration ? "Please provide the following additional details." : `Register for ${event?.title}`}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {currentForm.fields.map(field => (
                                <div key={field.id} style={field.type === 'header' ? { gridColumn: '1 / -1', marginTop: 12 } : {}}>
                                    {field.type === 'header' ? (
                                        <div style={{ paddingBottom: 8, borderBottom: '1px solid #334155', marginBottom: 12 }}>
                                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase' }}>{field.label}</h3>
                                        </div>
                                    ) : (
                                        <>
                                            <label className="label">
                                                {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                                            </label>
                                            
                                            {field.type === 'textarea' ? (
                                                <textarea 
                                                    className="input" 
                                                    style={{ minHeight: 100, resize: 'vertical' }}
                                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                                    required={field.required}
                                                    value={responses[field.id] || ''}
                                                    onChange={e => handleResponseChange(field.id, e.target.value)}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select 
                                                    className="input"
                                                    required={field.required}
                                                    value={responses[field.id] || ''}
                                                    onChange={e => handleResponseChange(field.id, e.target.value)}
                                                >
                                                    <option value="">Select an option</option>
                                                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : field.type === 'radio' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                                                    {field.options?.map(opt => (
                                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#CBD5E1', fontSize: 14, cursor: 'pointer' }}>
                                                            <input 
                                                                type="radio" 
                                                                name={field.id}
                                                                value={opt}
                                                                checked={responses[field.id] === opt}
                                                                onChange={e => handleResponseChange(field.id, e.target.value)}
                                                                style={{ accentColor: '#3B82F6', width: 18, height: 18 }} 
                                                            />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : field.type === 'checkbox' ? (
                                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#CBD5E1', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!!responses[field.id]}
                                                        onChange={e => handleResponseChange(field.id, e.target.checked)}
                                                        style={{ accentColor: '#3B82F6', width: 18, height: 18 }} 
                                                    />
                                                    {field.label}
                                                </label>
                                            ) : (
                                                <input 
                                                    type={field.type}
                                                    className="input"
                                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                                    required={field.required}
                                                    value={responses[field.id] || ''}
                                                    onChange={e => handleResponseChange(field.id, e.target.value)}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="btn-gradient" 
                            style={{ width: '100%', padding: '16px', fontSize: 16, justifyContent: 'center', gap: 10, marginTop: 40 }}
                        >
                            {submitting ? 'Submitting Responses...' : (
                                <>
                                    {activeStageIdx === forms.length - 1 ? 'Complete Registration' : 'Continue to Next Stage'} <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .label { color: #94A3B8; font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block; }
                .input { width: 100%; background: #0F172A; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; color: #F8FAFC; font-size: 14px; transition: all 0.2s; }
                .input:focus { border-color: #3B82F6; outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
                .btn-gradient { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; alignItems: center; transition: all 0.2s; }
                .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.25); }
                .btn-gradient:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
            `}</style>
        </DashboardLayout>
    );
}
