import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import InstitutionAutocomplete from '../components/InstitutionAutocomplete';
import { Zap, User, Building, ArrowRight, CheckCircle, Phone, Calendar } from 'lucide-react';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Chandigarh', 'Delhi', 'J&K', 'Ladakh', 'Puducherry', 'Other'];

const ROLES = [
    { value: 'organizer', emoji: '🎯', label: 'Organizer', desc: 'Create and manage hackathons & tech fests' },
    { value: 'participant', emoji: '👨‍💻', label: 'Participant', desc: 'Join events, form teams, submit projects' },
    { value: 'judge', emoji: '⭐', label: 'Judge', desc: 'Evaluate and score project submissions' },
    { value: 'sponsor', emoji: '🤝', label: 'Sponsor', desc: 'Fund events, discover talent, build brand visibility' },
];

const SectionLabel = ({ text }) => (
    <div style={{ borderBottom: '1px solid #334155', paddingBottom: 8, marginTop: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase' }}>{text}</span>
    </div>
);

export default function CompleteProfilePage() {
    const { currentUser, completeGoogleProfile } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: currentUser?.displayName || '',
        role: '',
        college: '',
        phone: '',
        gender: '',
        age: '',
        state: '',
        yearOfStudy: '',
        branch: '',
    });
    const [loading, setLoading] = useState(false);

    if (!currentUser) { navigate('/auth'); return null; }

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.role) { toast.error('Please select your role'); return; }
        if (form.role === 'organizer' && !form.college) { toast.error('Please enter your institution name'); return; }
        setLoading(true);
        try {
            await completeGoogleProfile({
                uid: currentUser.uid,
                name: form.name || currentUser.displayName || 'User',
                email: currentUser.email,
                role: form.role,
                college: form.college,
                phone: form.phone,
                gender: form.gender,
                age: form.age,
                state: form.state,
                yearOfStudy: form.yearOfStudy,
                branch: form.branch,
            });
            toast.success('Welcome to Hackly! 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 20px 60px' }}>
            <div style={{ width: '100%', maxWidth: 540 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 64, height: 64, background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                        borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Zap size={30} color="white" fill="white" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>One last step 👋</h1>
                    <p style={{ color: '#64748B', fontSize: 15 }}>
                        Hi <strong style={{ color: '#94A3B8' }}>{currentUser.displayName || currentUser.email}</strong>! Tell us a bit about yourself.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{
                    background: '#1E293B', borderRadius: 20, border: '1px solid #334155',
                    padding: 36, display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    {/* ── BASIC ── */}
                    <SectionLabel text="Basic Information" />

                    <div>
                        <label className="label">Your Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}><User size={16} /></div>
                            <input className="input" style={{ paddingLeft: 42 }} placeholder="Arjun Sharma"
                                value={form.name} onChange={e => set('name', e.target.value)} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <div>
                            <label className="label">Phone</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}><Phone size={16} /></div>
                                <input className="input" style={{ paddingLeft: 42 }} placeholder="+91 9876543210"
                                    value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Gender</label>
                            <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                                <option value="">Select gender</option>
                                <option value="male">♂ Male</option>
                                <option value="female">♀ Female</option>
                                <option value="non-binary">⚧ Non-binary</option>
                                <option value="prefer-not">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                        <div>
                            <label className="label">Age</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}><Calendar size={16} /></div>
                                <input className="input" style={{ paddingLeft: 42 }} placeholder="20" type="number"
                                    value={form.age} onChange={e => set('age', e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="label">State</label>
                            <select className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                                <option value="">Select state</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* ── ROLE ── */}
                    <SectionLabel text="Choose Your Role" />
                    <div>
                        <label className="label">Your Role *</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                            {ROLES.map(r => (
                                <button type="button" key={r.value} onClick={() => set('role', r.value)}
                                    style={{
                                        padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                                        background: form.role === r.value ? 'rgba(59,130,246,0.12)' : 'rgba(15,23,42,0.6)',
                                        border: `1.5px solid ${form.role === r.value ? '#3B82F6' : '#334155'}`,
                                        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                                        transition: 'all 0.15s',
                                    }}>
                                    <span style={{ fontSize: 22 }}>{r.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 14 }}>{r.label}</div>
                                        <div style={{ color: '#64748B', fontSize: 12 }}>{r.desc}</div>
                                    </div>
                                    {form.role === r.value && <CheckCircle size={16} color="#3B82F6" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── PARTICIPANT EXTRA ── */}
                    {form.role === 'participant' && (
                        <>
                            <SectionLabel text="Academic Details" />
                            <InstitutionAutocomplete
                                label="College / School / Institute"
                                value={form.college}
                                onChange={v => set('college', v)}
                                placeholder="Type your institution name..."
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                <div>
                                    <label className="label">Year of Study</label>
                                    <select className="input" value={form.yearOfStudy} onChange={e => set('yearOfStudy', e.target.value)}>
                                        <option value="">Select year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                        <option value="5">5th Year</option>
                                        <option value="pg">Post Graduate</option>
                                        <option value="phd">PhD</option>
                                        <option value="school">School Student</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Branch / Stream</label>
                                    <input className="input" placeholder="CS, ECE, MBA..."
                                        value={form.branch} onChange={e => set('branch', e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── ORGANIZER EXTRA ── */}
                    {form.role === 'organizer' && (
                        <>
                            <SectionLabel text="Institution Details" />
                            <InstitutionAutocomplete
                                label="College / School Name *"
                                value={form.college}
                                onChange={v => set('college', v)}
                                placeholder="Type your institution name..."
                            />
                        </>
                    )}

                    {/* ── JUDGE OR SPONSOR EXTRA ── */}
                    {(form.role === 'judge' || form.role === 'sponsor') && (
                        <>
                            <SectionLabel text="Professional Details" />
                            <InstitutionAutocomplete
                                label="Institution / Company"
                                value={form.college}
                                onChange={v => set('college', v)}
                                placeholder="Your college or company..."
                            />
                        </>
                    )}

                    <button type="submit" className="btn-gradient" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, minHeight: 48, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                        {loading
                            ? <div style={{ width: 20, height: 20, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            : <>Complete Setup <ArrowRight size={18} /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 20 }}>
                    By continuing, you agree to our{' '}
                    <Link to="/terms" style={{ color: '#3B82F6', textDecoration: 'none' }}>Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{ color: '#3B82F6', textDecoration: 'none' }}>Privacy Policy</Link>
                </p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
