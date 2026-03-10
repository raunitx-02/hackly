import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import InstitutionAutocomplete from '../components/InstitutionAutocomplete';
import {
    Zap, Eye, EyeOff, Mail, Lock, User, Building, Chrome,
    ArrowRight, CheckCircle, Sparkles, Phone, Calendar,
} from 'lucide-react';

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [collegeValue, setCollegeValue] = useState('');
    const { signup, login, loginWithGoogle, signupWithGoogle, currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm();
    const role = watch('role');

    useEffect(() => {
        if (currentUser && userProfile) {
            const redirectUrl = searchParams.get('redirect') || '/dashboard';
            navigate(redirectUrl);
        }
    }, [currentUser, userProfile, navigate, searchParams]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (isSignup) {
                if (data.password !== data.confirmPassword) {
                    toast.error('Passwords do not match');
                    setLoading(false);
                    return;
                }
                const college = data.role === 'organizer' ? collegeValue : collegeValue;
                if (data.role === 'organizer' && !collegeValue) {
                    toast.error('Please enter your institution name');
                    setLoading(false);
                    return;
                }
                await signup({
                    email: data.email,
                    password: data.password,
                    name: data.name,
                    role: data.role,
                    college: collegeValue,
                    phone: data.phone || '',
                    gender: data.gender || '',
                    age: data.age || '',
                    yearOfStudy: data.yearOfStudy || '',
                    branch: data.branch || '',
                    state: data.state || '',
                });
                toast.success('Account created! Welcome to Hackly 🎉');
            } else {
                await login(data.email, data.password);
                toast.success('Welcome back!');
            }
            const redirectUrl = searchParams.get('redirect') || '/dashboard';
            navigate(redirectUrl);
        } catch (err) {
            const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password' :
                err.code === 'auth/email-already-in-use' ? 'Email already registered' :
                    err.code === 'auth/weak-password' ? 'Password must be at least 6 characters' :
                        err.message || 'Authentication failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        try {
            const redirectUrl = searchParams.get('redirect') || '/dashboard';
            if (isSignup) {
                await signupWithGoogle();
                toast.success('Almost there! Complete your profile 👇');
                navigate('/complete-profile');
            } else {
                await loginWithGoogle();
                toast.success('Welcome back! 👋');
                navigate(redirectUrl);
            }
        } catch (err) {
            if (err.code === 'hackly/no-account') {
                toast.error('No Hackly account found for this Google account. Please register first.');
            } else if (err.code === 'hackly/already-exists') {
                toast.error('This Google account is already registered. Please login instead.');
            } else {
                toast.error('Google sign-in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignup(!isSignup);
        setCollegeValue('');
        reset();
    };

    const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, validation = {} }) => (
        <div>
            <label className="label">{label}</label>
            <div style={{ position: 'relative' }}>
                {Icon && (
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }}>
                        <Icon size={16} />
                    </div>
                )}
                <input
                    type={name === 'password' || name === 'confirmPassword' ? (showPw ? 'text' : 'password') : type}
                    placeholder={placeholder}
                    className="input"
                    style={{ paddingLeft: Icon ? 42 : 16, paddingRight: (name === 'password' || name === 'confirmPassword') ? 44 : 16 }}
                    {...register(name, validation)}
                />
                {(name === 'password' || name === 'confirmPassword') && (
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4,
                    }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {errors[name] && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors[name].message}</p>}
        </div>
    );

    const SelectField = ({ label, name, options, validation = {} }) => (
        <div>
            <label className="label">{label}</label>
            <select className="input" {...register(name, validation)}>
                {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            {errors[name] && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors[name].message}</p>}
        </div>
    );

    // Section header for grouped fields
    const SectionLabel = ({ text }) => (
        <div style={{ borderBottom: '1px solid #334155', paddingBottom: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase' }}>{text}</span>
        </div>
    );

    const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Chandigarh', 'Delhi', 'J&K', 'Ladakh', 'Puducherry', 'Other'];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0F172A', paddingTop: 64 }}>
            {/* Left Branding Panel */}
            <div style={{
                width: '42%', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #1a0b2e 100%)',
                borderRight: '1px solid #334155', padding: '60px 48px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
            }} className="auth-branding">
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.06,
                    backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />
                <div style={{
                    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)',
                    top: '-100px', right: '-100px', pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                        <span style={{ color: '#F8FAFC' }}>The Future of</span><br />
                        <span className="gradient-text">College Events</span>
                    </h2>
                    <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.7 }}>
                        Join 50,000+ students and organizers building the next generation of Indian college hackathons.
                    </p>
                    <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            'Create and manage events in minutes',
                            'Real-time team collaboration',
                            'Live leaderboards and judging',
                            'Built specifically for Indian colleges',
                        ].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <CheckCircle size={13} color="#10B981" />
                                </div>
                                <span style={{ color: '#94A3B8', fontSize: 14 }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    position: 'relative', zIndex: 1,
                    background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 20,
                    border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <Sparkles size={20} color="#F59E0B" style={{ marginBottom: 12 }} />
                    <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14 }}>
                        "Hackly helped us manage 1,500 participants for our national hackathon seamlessly. The judge panel saved us 3 days of manual work."
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: 'white',
                        }}>AK</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC' }}>Aditya Kumar</div>
                            <div style={{ color: '#64748B', fontSize: 11 }}>Tech Lead · VIT Vellore</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div style={{
                flex: 1, display: 'flex', justifyContent: 'center', overflowY: 'auto',
                padding: isSignup && role ? '32px 40px' : '40px 40px',
            }}>
                <div style={{ width: '100%', maxWidth: 460, paddingBottom: 32 }}>
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
                            {isSignup ? 'Create your account' : 'Welcome back'}
                        </h1>
                        <p style={{ color: '#64748B', fontSize: 15 }}>
                            {isSignup ? 'Join thousands of college event organizers' : 'Sign in to your Hackly account'}
                        </p>
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        style={{
                            width: '100%', padding: '13px', background: '#1E293B',
                            border: '1px solid #334155', borderRadius: 10, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            color: '#F8FAFC', fontSize: 15, fontWeight: 600, marginBottom: 20,
                            transition: 'all 0.2s', minHeight: 44,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1E293B'; }}
                    >
                        <Chrome size={18} color="#4285F4" />
                        {isSignup ? 'Sign up with Google' : 'Continue with Google'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: '#334155' }} />
                        <span style={{ color: '#475569', fontSize: 13 }}>or with email</span>
                        <div style={{ flex: 1, height: 1, background: '#334155' }} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* ── BASIC INFO ── */}
                        {isSignup && <SectionLabel text="Basic Information" />}

                        {isSignup && (
                            <InputField label="Full Name *" name="name" icon={User} placeholder="Arjun Sharma"
                                validation={{ required: 'Name is required' }} />
                        )}
                        <InputField label="Email Address *" name="email" type="email" icon={Mail} placeholder="you@college.edu"
                            validation={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }} />
                        <InputField label="Password *" name="password" icon={Lock} placeholder={isSignup ? 'Min 6 characters' : 'Enter password'}
                            validation={{ required: 'Password is required', minLength: isSignup ? { value: 6, message: 'Min 6 characters' } : undefined }} />

                        {isSignup && (
                            <>
                                <InputField label="Confirm Password *" name="confirmPassword" icon={Lock} placeholder="Repeat password"
                                    validation={{ required: 'Please confirm password' }} />

                                {/* Phone + Gender row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                    <InputField label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="+91 98765 43210" />
                                    <SelectField label="Gender" name="gender" options={[
                                        { v: '', l: 'Select gender' },
                                        { v: 'male', l: '♂ Male' },
                                        { v: 'female', l: '♀ Female' },
                                        { v: 'non-binary', l: '⚧ Non-binary' },
                                        { v: 'prefer-not', l: 'Prefer not to say' },
                                    ]} />
                                </div>

                                {/* Age + State row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                    <InputField label="Age" name="age" type="number" icon={Calendar} placeholder="20" />
                                    <SelectField label="State" name="state" options={[{ v: '', l: 'Select state' }, ...STATES.map(s => ({ v: s, l: s }))]} />
                                </div>

                                {/* ── ROLE ── */}
                                <SectionLabel text="Choose Your Role" />
                                <div>
                                    <label className="label">Your Role *</label>
                                    <select className="input" {...register('role', { required: 'Role is required' })}>
                                        <option value="">Select your role</option>
                                        <option value="organizer">🎯 Organizer (Create events)</option>
                                        <option value="participant">👨‍💻 Participant (Join events)</option>
                                        <option value="judge">⭐ Judge (Score projects)</option>
                                        <option value="sponsor">🤝 Sponsor (Fund & Support)</option>
                                    </select>
                                    {errors.role && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.role.message}</p>}
                                </div>

                                {/* ── PARTICIPANT-SPECIFIC FIELDS ── */}
                                {role === 'participant' && (
                                    <>
                                        <SectionLabel text="Academic Details" />
                                        <InstitutionAutocomplete
                                            label="College / School / Institute"
                                            value={collegeValue}
                                            onChange={setCollegeValue}
                                            placeholder="Type your college or school name..."
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                            <SelectField label="Year of Study" name="yearOfStudy" options={[
                                                { v: '', l: 'Select year' },
                                                { v: '1', l: '1st Year' },
                                                { v: '2', l: '2nd Year' },
                                                { v: '3', l: '3rd Year' },
                                                { v: '4', l: '4th Year' },
                                                { v: '5', l: '5th Year' },
                                                { v: 'pg', l: 'Post Graduate' },
                                                { v: 'phd', l: 'PhD' },
                                                { v: 'school', l: 'School Student' },
                                                { v: 'other', l: 'Other' },
                                            ]} />
                                            <InputField label="Branch / Stream" name="branch" placeholder="CS, ECE, MBA..." />
                                        </div>
                                    </>
                                )}

                                {/* ── ORGANIZER-SPECIFIC FIELDS ── */}
                                {role === 'organizer' && (
                                    <>
                                        <SectionLabel text="Institution Details" />
                                        <InstitutionAutocomplete
                                            label="College / School Name *"
                                            value={collegeValue}
                                            onChange={setCollegeValue}
                                            placeholder="Type your institution name..."
                                            error={!collegeValue && errors.college ? 'Institution name is required' : ''}
                                        />
                                    </>
                                )}

                                {/* ── JUDGE OR SPONSOR-SPECIFIC FIELDS ── */}
                                {(role === 'judge' || role === 'sponsor') && (
                                    <>
                                        <SectionLabel text="Professional Details" />
                                        <InstitutionAutocomplete
                                            label="Institution / Company"
                                            value={collegeValue}
                                            onChange={setCollegeValue}
                                            placeholder="Your college or company..."
                                        />
                                    </>
                                )}
                            </>
                        )}

                        {!isSignup && (
                            <div style={{ textAlign: 'right', marginTop: -8 }}>
                                <a href="#" style={{ color: '#3B82F6', fontSize: 13, textDecoration: 'none' }}>
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient"
                            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, marginTop: 4, minHeight: 44, opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? (
                                <div style={{ width: 20, height: 20, border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            ) : (
                                <>{isSignup ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: '#64748B', fontSize: 14, marginTop: 20 }}>
                        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                        <button onClick={toggleMode} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#3B82F6', fontWeight: 600, fontSize: 14,
                        }}>
                            {isSignup ? 'Sign in' : 'Create account'}
                        </button>
                    </p>

                    <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 16, lineHeight: 1.6 }}>
                        By continuing, you agree to our{' '}
                        <Link to="/terms" style={{ color: '#3B82F6', textDecoration: 'none' }}>Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" style={{ color: '#3B82F6', textDecoration: 'none' }}>Privacy Policy</Link>
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-branding { display: none !important; }
        }
      `}</style>
        </div>
    );
}
