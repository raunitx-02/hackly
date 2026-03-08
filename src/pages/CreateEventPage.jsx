import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import {
    CheckCircle, ChevronRight, ChevronLeft, Plus, Trash2,
    CalendarDays, MapPin, Users, Trophy, Star, Eye, Settings,
} from 'lucide-react';
import { ORGANIZER_CONFIG } from '../data/advancedOrganizerConfig';

const STEPS = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Schedule & Setup' },
    { num: 3, label: 'Prizes & Judges' },
    { num: 4, label: 'Review & Publish' },
];

function StepIndicator({ current }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
            {STEPS.map((s, i) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                            background: current > s.num ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' :
                                current === s.num ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : '#1E293B',
                            border: current >= s.num ? 'none' : '2px solid #334155',
                            color: current >= s.num ? 'white' : '#64748B',
                        }}>
                            {current > s.num ? <CheckCircle size={18} /> : s.num}
                        </div>
                        <span style={{
                            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                            color: current >= s.num ? '#F8FAFC' : '#64748B',
                        }} className="step-label">
                            {s.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div style={{
                            flex: 1, height: 2, margin: '0 12px',
                            background: current > s.num ? 'linear-gradient(90deg,#3B82F6,#8B5CF6)' : '#334155',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

function SectionCard({ children, title, icon: Icon }) {
    return (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            {title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #334155' }}>
                    {Icon && <Icon size={18} color="#3B82F6" />}
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div>
            {label && <label className="label">{label}</label>}
            {children}
            {error && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
        </div>
    );
}

function Row({ children, cols = 2 }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
            {children}
        </div>
    );
}
import { BLOCKED_KEYWORDS } from '../data/adminBlockedKeywords';

export default function CreateEventPage() {
    const [step, setStep] = useState(1);
    const [problemStatements, setProblemStatements] = useState(['']);
    const [judges, setJudges] = useState(['']);
    const [criteria, setCriteria] = useState([{ name: 'Innovation', weight: 25 }, { name: 'Technical', weight: 25 }, { name: 'UI/UX', weight: 25 }, { name: 'Presentation', weight: 25 }]);
    const [submitting, setSubmitting] = useState(false);
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors }, trigger, getValues } = useForm({
        defaultValues: { mode: 'Online', maxTeamSize: 4, maxParticipants: 500, type: 'Hackathon', registrationMode: 'open', anonymousJudging: false, publicProjects: false }
    });

    const formData = watch();

    const next = async () => {
        const fieldsPerStep = {
            1: ['title', 'type', 'college', 'city'],
            2: ['startDate', 'endDate', 'registrationDeadline'],
            3: [],
        };
        const valid = await trigger(fieldsPerStep[step] || []);
        if (valid) setStep(s => s + 1);
    };

    const containsBlockedWords = (text) => {
        if (!text) return false;
        const normalized = text.toLowerCase();
        return BLOCKED_KEYWORDS.some(word => normalized.includes(word.toLowerCase()));
    };

    const publish = async (status) => {
        const data = getValues();

        // Content Moderation check
        const fieldsToCheck = [data.title, data.tagline, data.description, ...problemStatements];
        if (fieldsToCheck.some(containsBlockedWords)) {
            toast.error("Your content contains prohibited words. Please review your title or description.");
            return;
        }

        setSubmitting(true);
        try {
            const doc = {
                title: data.title, type: data.type, tagline: data.tagline || '',
                description: data.description || '', college: data.college || userProfile?.college || '',
                city: data.city || '', organizerId: currentUser.uid,
                startDate: data.startDate, endDate: data.endDate,
                registrationDeadline: data.registrationDeadline,
                maxTeamSize: Number(data.maxTeamSize) || 4,
                maxParticipants: Number(data.maxParticipants) || 500,
                mode: data.mode || 'Online',
                registrationMode: data.registrationMode || 'open',
                anonymousJudging: !!data.anonymousJudging,
                publicProjects: !!data.publicProjects,
                problemStatements: problemStatements.filter(Boolean),
                prizes: { first: data.prize1 || '', second: data.prize2 || '', third: data.prize3 || '', total: data.prizeTotal || '' },
                judges: judges.filter(Boolean),
                judgingCriteria: criteria,
                status: status === 'published' ? 'pending_review' : 'draft',
                registered: 0,
                createdAt: new Date().toISOString(),
            };
            const ref = await addDoc(collection(db, 'events'), doc);
            toast.success(status === 'published' ? 'Event submitted for review! 🚀' : 'Saved as draft');
            navigate(`/dashboard/events`);
        } catch (err) {
            toast.error('Failed to save event: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const totalWeight = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 780, margin: '0 auto' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Create New Event</h1>
                    <p style={{ color: '#64748B', fontSize: 15 }}>Fill in the details to launch your event on Hackly</p>
                </div>

                <StepIndicator current={step} />

                {/* ─── Step 1: Basic Info ─── */}
                {step === 1 && (
                    <SectionCard title="Event Details" icon={CalendarDays}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <Field label="Event Name *" error={errors.title?.message}>
                                <input className="input" placeholder="SIH 2025, TechFest IIT..." {...register('title', { required: 'Event name is required' })} />
                            </Field>
                            <Row>
                                <Field label="Event Type *" error={errors.type?.message}>
                                    <select className="input" {...register('type', { required: true })}>
                                        <option value="Hackathon">Hackathon</option>
                                        <option value="Tech Fest">Tech Fest</option>
                                        <option value="Coding Contest">Coding Contest</option>
                                        <option value="Workshop">Workshop</option>
                                    </select>
                                </Field>
                                <Field label="Event Mode">
                                    <select className="input" {...register('mode')}>
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </Field>
                            </Row>
                            <Row>
                                <Field label="Registration Mode">
                                    <select className="input" {...register('registrationMode')}>
                                        {ORGANIZER_CONFIG.registrationModes.map(m => (
                                            <option key={m.id} value={m.id}>{m.label}</option>
                                        ))}
                                    </select>
                                </Field>
                                <div style={{ paddingTop: 32 }}>
                                    <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.5 }}>
                                        {formData.registrationMode === 'review' ? ORGANIZER_CONFIG.registrationModes[1].desc : ORGANIZER_CONFIG.registrationModes[0].desc}
                                    </p>
                                </div>
                            </Row>
                            <Field label="Tagline">
                                <input className="input" placeholder="One line that describes your event..." {...register('tagline')} />
                            </Field>
                            <Field label="Description">
                                <textarea className="input" rows={4} placeholder="Tell participants what this event is about..." {...register('description')} style={{ resize: 'vertical' }} />
                            </Field>
                            <Row>
                                <Field label="Organizing College *" error={errors.college?.message}>
                                    <input className="input" placeholder="IIT Bombay" defaultValue={userProfile?.college} {...register('college', { required: 'College is required' })} />
                                </Field>
                                <Field label="City *" error={errors.city?.message}>
                                    <input className="input" placeholder="Mumbai" {...register('city', { required: 'City is required' })} />
                                </Field>
                            </Row>
                        </div>
                    </SectionCard>
                )}

                {/* ─── Step 2: Schedule ─── */}
                {step === 2 && (
                    <>
                        <SectionCard title="Dates & Schedule" icon={CalendarDays}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <Row>
                                    <Field label="Start Date *" error={errors.startDate?.message}>
                                        <input type="datetime-local" className="input" {...register('startDate', { required: 'Start date required' })} />
                                    </Field>
                                    <Field label="End Date *" error={errors.endDate?.message}>
                                        <input type="datetime-local" className="input" {...register('endDate', { required: 'End date required' })} />
                                    </Field>
                                </Row>
                                <Field label="Registration Deadline *" error={errors.registrationDeadline?.message}>
                                    <input type="datetime-local" className="input" {...register('registrationDeadline', { required: 'Registration deadline required' })} />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard title="Team & Capacity" icon={Users}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <Row>
                                    <Field label="Max Team Size">
                                        <input type="number" className="input" min={1} max={10} {...register('maxTeamSize')} />
                                    </Field>
                                    <Field label="Max Participants">
                                        <input type="number" className="input" min={10} {...register('maxParticipants')} />
                                    </Field>
                                </Row>
                            </div>
                        </SectionCard>

                        <SectionCard title="Problem Statements" icon={MapPin}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {problemStatements.map((ps, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                                        <input className="input" placeholder={`Problem Statement ${i + 1}`} value={ps}
                                            onChange={e => { const a = [...problemStatements]; a[i] = e.target.value; setProblemStatements(a); }} />
                                        {problemStatements.length > 1 && (
                                            <button type="button" onClick={() => setProblemStatements(problemStatements.filter((_, j) => j !== i))}
                                                style={{ padding: '0 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', color: '#EF4444', flexShrink: 0 }}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setProblemStatements([...problemStatements, ''])}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.4)', borderRadius: 8, color: '#3B82F6', cursor: 'pointer', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start' }}>
                                    <Plus size={15} /> Add Problem Statement
                                </button>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ─── Step 3: Prizes & Judges ─── */}
                {step === 3 && (
                    <>
                        <SectionCard title="Prize Pool" icon={Trophy}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <Field label="Total Prize Pool (₹)">
                                    <input type="number" className="input" placeholder="100000" {...register('prizeTotal')} />
                                </Field>
                                <Row cols={3}>
                                    {[['1st', 'prize1', '50,000'], ['2nd', 'prize2', '25,000'], ['3rd', 'prize3', '10,000']].map(([rank, name, placeholder]) => (
                                        <Field key={rank} label={`${rank} Prize (₹)`}>
                                            <input type="number" className="input" placeholder={placeholder} {...register(name)} />
                                        </Field>
                                    ))}
                                </Row>
                            </div>
                        </SectionCard>

                        <SectionCard title="Judges" icon={Star}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {judges.map((j, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8 }}>
                                        <input type="email" className="input" placeholder="judge@example.com" value={j}
                                            onChange={e => { const a = [...judges]; a[i] = e.target.value; setJudges(a); }} />
                                        {judges.length > 1 && (
                                            <button type="button" onClick={() => setJudges(judges.filter((_, k) => k !== i))}
                                                style={{ padding: '0 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', color: '#EF4444', flexShrink: 0 }}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setJudges([...judges, ''])}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.4)', borderRadius: 8, color: '#3B82F6', cursor: 'pointer', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start' }}>
                                    <Plus size={15} /> Add Judge
                                </button>
                            </div>
                        </SectionCard>

                        <SectionCard title="Judging Criteria" icon={Star}>
                            <p style={{ color: '#64748B', fontSize: 13, marginBottom: 16 }}>
                                Total weight must be 100%. Currently: <span style={{ color: totalWeight === 100 ? '#10B981' : '#EF4444', fontWeight: 700 }}>{totalWeight}%</span>
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {criteria.map((c, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 8, alignItems: 'center' }}>
                                        <input className="input" placeholder="Criterion name" value={c.name}
                                            onChange={e => { const a = [...criteria]; a[i] = { ...a[i], name: e.target.value }; setCriteria(a); }} />
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" className="input" value={c.weight} min={1} max={100}
                                                onChange={e => { const a = [...criteria]; a[i] = { ...a[i], weight: Number(e.target.value) }; setCriteria(a); }}
                                                style={{ paddingRight: 28 }} />
                                            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: 13 }}>%</span>
                                        </div>
                                        {criteria.length > 1 && (
                                            <button type="button" onClick={() => setCriteria(criteria.filter((_, k) => k !== i))}
                                                style={{ padding: '0 12px', height: 44, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, cursor: 'pointer', color: '#EF4444', flexShrink: 0 }}>
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setCriteria([...criteria, { name: '', weight: 0 }])}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.4)', borderRadius: 8, color: '#3B82F6', cursor: 'pointer', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start' }}>
                                    <Plus size={15} /> Add Criterion
                                </button>
                            </div>
                        </SectionCard>

                        <SectionCard title="Advanced Settings" icon={Settings}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input type="checkbox" {...register('anonymousJudging')} style={{ width: 18, height: 18, accentColor: '#3B82F6' }} />
                                    <span style={{ color: '#F8FAFC', fontSize: 14 }}>{ORGANIZER_CONFIG.labels.anonymousJudging}</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input type="checkbox" {...register('publicProjects')} style={{ width: 18, height: 18, accentColor: '#3B82F6' }} />
                                    <span style={{ color: '#F8FAFC', fontSize: 14 }}>{ORGANIZER_CONFIG.labels.publicProjects}</span>
                                </label>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ─── Step 4: Review ─── */}
                {step === 4 && (
                    <SectionCard title="Review Your Event" icon={Eye}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {[
                                { label: 'Event Name', value: formData.title },
                                { label: 'Type', value: formData.type },
                                { label: 'Mode', value: formData.mode },
                                { label: 'Tagline', value: formData.tagline || '—' },
                                { label: 'College', value: formData.college },
                                { label: 'City', value: formData.city },
                                { label: 'Start Date', value: formData.startDate ? new Date(formData.startDate).toLocaleString('en-IN') : '—' },
                                { label: 'End Date', value: formData.endDate ? new Date(formData.endDate).toLocaleString('en-IN') : '—' },
                                { label: 'Registration Deadline', value: formData.registrationDeadline ? new Date(formData.registrationDeadline).toLocaleString('en-IN') : '—' },
                                { label: 'Max Team Size', value: formData.maxTeamSize },
                                { label: 'Max Participants', value: formData.maxParticipants },
                                { label: 'Prize Pool', value: formData.prizeTotal ? `₹${Number(formData.prizeTotal).toLocaleString()}` : '—' },
                                { label: '1st/2nd/3rd Prize', value: `₹${formData.prize1 || 0} / ₹${formData.prize2 || 0} / ₹${formData.prize3 || 0}` },
                                { label: 'Problem Statements', value: problemStatements.filter(Boolean).join(', ') || '—' },
                                { label: 'Judges', value: judges.filter(Boolean).join(', ') || '—' },
                                { label: 'Registration Mode', value: ORGANIZER_CONFIG.registrationModes.find(m => m.id === formData.registrationMode)?.label || 'Open' },
                                { label: 'Anonymous Judging', value: formData.anonymousJudging ? 'Enabled' : 'Disabled' },
                                { label: 'Public Projects Gallery', value: formData.publicProjects ? 'Enabled' : 'Disabled' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: '1px solid #334155' }}>
                                    <span style={{ color: '#64748B', fontSize: 13, fontWeight: 600, minWidth: 180 }}>{label}</span>
                                    <span style={{ color: '#F8FAFC', fontSize: 14 }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                            <button
                                onClick={() => publish('draft')}
                                disabled={submitting}
                                className="btn-outline"
                                style={{ opacity: submitting ? 0.7 : 1, minHeight: 44 }}
                            >
                                Save as Draft
                            </button>
                            <button
                                onClick={() => publish('published')}
                                disabled={submitting}
                                className="btn-gradient"
                                style={{ opacity: submitting ? 0.7 : 1, minHeight: 44 }}
                            >
                                {submitting ? 'Publishing...' : '🚀 Publish Event'}
                            </button>
                        </div>
                    </SectionCard>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                    <button
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1}
                        className="btn-outline"
                        style={{ opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer', minHeight: 44 }}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>
                    {step < 4 && (
                        <button onClick={next} className="btn-gradient" style={{ minHeight: 44 }}>
                            Next <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
            <style>{`
        @media (max-width: 640px) {
          .step-label { display: none; }
        }
      `}</style>
        </DashboardLayout>
    );
}
