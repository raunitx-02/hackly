import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Users, User, Mail, Hash, ArrowLeft, Send } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function EventRegistrationPage() {
    const { id } = useParams();
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState([]); // [{ name, email, enrollmentId }]

    useEffect(() => {
        async function fetchEvent() {
            try {
                const snap = await getDoc(doc(db, 'events', id));
                if (snap.exists()) {
                    const data = snap.id ? { id: snap.id, ...snap.data() } : snap.data();
                    setEvent(data);
                    
                    // Initialize empty members array based on maxTeamSize
                    const maxMembers = data.maxTeamSize || 1;
                    const initialMembers = Array.from({ length: maxMembers - 1 }, () => ({
                        name: '', email: '', enrollmentId: ''
                    }));
                    setMembers(initialMembers);
                } else {
                    toast.error("Event not found");
                    navigate('/events');
                }
            } catch (err) {
                toast.error("Failed to load event");
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [id, navigate]);

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return navigate('/auth');
        
        if (event.registrationCategories?.length > 0 && !selectedCategory) {
            return toast.error("Please select a registration category");
        }

        if (event.maxTeamSize > 1 && !teamName.trim()) {
            return toast.error("Team name is required for team events");
        }

        // Validate Leader Info (Assume leader is the current user + we need their enrollment/email)
        const leaderEnrollment = e.target.leaderEnrollment.value;
        if (!leaderEnrollment) return toast.error("Leader enrollment ID is required");

        // Validate Members
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            // If any field is filled, all must be filled
            if (m.name || m.email || m.enrollmentId) {
                if (!m.name || !m.email || !m.enrollmentId) {
                    return toast.error(`Please complete all details for Team Member ${i + 2}`);
                }
            }
        }

        setSubmitting(true);
        try {
            await runTransaction(db, async (transaction) => {
                const eventRef = doc(db, 'events', id);
                const eventSnap = await transaction.get(eventRef);
                const eventData = eventSnap.data();

                // Category limit check
                const currentCounts = eventData.categoryCounts || {};
                if (selectedCategory) {
                    const category = eventData.registrationCategories.find(c => c.name === selectedCategory);
                    const count = currentCounts[selectedCategory] || 0;
                    if (category && count >= category.limit) {
                        throw new Error(`The category "${selectedCategory}" is full.`);
                    }
                    currentCounts[selectedCategory] = count + 1;
                }

                // Create Registration
                const regRef = doc(collection(db, 'registrations'));
                const regData = {
                    eventId: id,
                    userId: currentUser.uid,
                    leaderName: userProfile?.name || currentUser.displayName,
                    leaderEmail: currentUser.email,
                    leaderEnrollment: leaderEnrollment,
                    teamName: teamName || 'Solo',
                    members: members.filter(m => m.name && m.email),
                    registeredAt: new Date().toISOString(),
                    status: event.registrationMode === 'review' ? 'pending' : 'accepted',
                    category: selectedCategory || null
                };
                transaction.set(regRef, regData);

                // Create Team
                if (event.maxTeamSize > 1) {
                    const teamRef = doc(collection(db, 'teams'));
                    const teamData = {
                        eventId: id,
                        teamName: teamName.trim(),
                        leaderId: currentUser.uid,
                        leaderName: userProfile?.name || currentUser.displayName,
                        leaderEnrollment: leaderEnrollment,
                        members: [
                            { uid: currentUser.uid, name: userProfile?.name || currentUser.displayName, email: currentUser.email, enrollmentId: leaderEnrollment },
                            ...members.filter(m => m.name && m.email)
                        ].map(m => m.uid || m.email), // We store UIDs or emails as identifiers
                        memberDetails: [
                            { name: userProfile?.name || currentUser.displayName, email: currentUser.email, enrollmentId: leaderEnrollment, role: 'leader' },
                            ...members.filter(m => m.name && m.email).map(m => ({ ...m, role: 'member' }))
                        ],
                        isOpen: false,
                        status: event.registrationMode === 'review' ? 'pending' : 'accepted',
                        createdAt: new Date().toISOString()
                    };
                    transaction.set(teamRef, teamData);
                }

                // Update Event
                transaction.update(eventRef, {
                    categoryCounts: currentCounts,
                    registered: (eventData.registered || 0) + 1
                });
            });

            toast.success("Registration successful! 🚀");
            navigate(`/events/${id}`);
        } catch (err) {
            toast.error("Registration failed: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
                <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
                    <ArrowLeft size={16} /> Back to Event
                </button>

                <div style={{ background: '#1E293B', borderRadius: 24, border: '1px solid #334155', padding: '40px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }} />
                    
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Register for {event.title}</h1>
                        <p style={{ color: '#94A3B8' }}>Fill in your team details to secure your spot.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Category Selection */}
                        {event.registrationCategories?.length > 0 && (
                            <div style={{ marginBottom: 32 }}>
                                <label className="label">Registration Category *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
                                    {event.registrationCategories.map(cat => {
                                        const count = event.categoryCounts?.[cat.name] || 0;
                                        const isFull = count >= cat.limit;
                                        return (
                                            <div 
                                                key={cat.name} 
                                                onClick={() => !isFull && setSelectedCategory(cat.name)}
                                                style={{
                                                    padding: '16px', borderRadius: 12, border: '1px solid',
                                                    cursor: isFull ? 'not-allowed' : 'pointer', transition: '0.2s',
                                                    background: selectedCategory === cat.name ? 'rgba(59,130,246,0.1)' : '#0F172A',
                                                    borderColor: selectedCategory === cat.name ? '#3B82F6' : '#334155',
                                                    opacity: isFull ? 0.5 : 1
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: 14 }}>{cat.name}</div>
                                                <div style={{ fontSize: 12, color: isFull ? '#EF4444' : '#10B981', marginTop: 4 }}>
                                                    {isFull ? 'Sold Out' : `${cat.limit - count} spots left`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Team Section */}
                        {event.maxTeamSize > 1 && (
                            <div style={{ marginBottom: 32 }}>
                                <label className="label">Team Name *</label>
                                <div style={{ position: 'relative', marginTop: 8 }}>
                                    <Users size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                    <input className="input" style={{ paddingLeft: 44 }} placeholder="Enter a creative team name" value={teamName} onChange={e => setTeamName(e.target.value)} required />
                                </div>
                            </div>
                        )}

                        {/* Leader Section */}
                        <div style={{ marginBottom: 32, padding: 24, background: 'rgba(59,130,246,0.03)', borderRadius: 16, border: '1px solid rgba(59,130,246,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={16} color="white" />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Team Leader (You)</h3>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label className="label" style={{ fontSize: 12 }}>Full Name</label>
                                    <input className="input" style={{ background: '#0F172A', opacity: 0.7 }} value={userProfile?.name || currentUser?.displayName || ''} disabled />
                                </div>
                                <div>
                                    <label className="label" style={{ fontSize: 12 }}>Email Address</label>
                                    <input className="input" style={{ background: '#0F172A', opacity: 0.7 }} value={currentUser?.email || ''} disabled />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label className="label" style={{ fontSize: 12 }}>Enrollment ID / College ID *</label>
                                    <div style={{ position: 'relative', marginTop: 4 }}>
                                        <Hash size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                        <input name="leaderEnrollment" className="input" style={{ paddingLeft: 40, background: '#0F172A' }} placeholder="Your unique student ID" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        {members.map((member, idx) => (
                            <div key={idx} style={{ marginBottom: 32, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid #334155' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={16} color="white" />
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>Team Member {idx + 2}</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label className="label" style={{ fontSize: 12 }}>Full Name</label>
                                        <input 
                                            className="input" 
                                            style={{ background: '#0F172A' }} 
                                            placeholder="Enter name"
                                            value={member.name}
                                            onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="label" style={{ fontSize: 12 }}>Email Address</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                            <input 
                                                className="input" 
                                                style={{ paddingLeft: 40, background: '#0F172A' }} 
                                                placeholder="email@college.edu"
                                                value={member.email}
                                                onChange={e => handleMemberChange(idx, 'email', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="label" style={{ fontSize: 12 }}>Enrollment ID / College ID</label>
                                        <div style={{ position: 'relative' }}>
                                            <Hash size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                            <input 
                                                className="input" 
                                                style={{ paddingLeft: 40, background: '#0F172A' }} 
                                                placeholder="Unique student ID"
                                                value={member.enrollmentId}
                                                onChange={e => handleMemberChange(idx, 'enrollmentId', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="btn-gradient" 
                            style={{ width: '100%', padding: '16px', fontSize: 16, justifyContent: 'center', gap: 10, marginTop: 16 }}
                        >
                            {submitting ? 'Processing Registration...' : (
                                <>
                                    Complete Registration <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .label { color: #94A3B8; font-weight: 600; font-size: 14px; margin-bottom: 8px; display: block; }
                .input { width: 100%; background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 12px 16px; color: #F8FAFC; font-size: 14px; transition: all 0.2s; }
                .input:focus { border-color: #3B82F6; outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
                .btn-gradient { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; alignItems: center; transition: all 0.2s; }
                .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59,130,246,0.25); }
                .btn-gradient:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
            `}</style>
        </DashboardLayout>
    );
}
