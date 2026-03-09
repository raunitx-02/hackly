import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CheckCircle, CalendarDays, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BOOK_CALL_CONFIG } from '../data/bookCallConfig';

export default function BookCallModal({ isOpen, onClose, source }) {
    if (!isOpen) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [eventTypes, setEventTypes] = useState([]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const getNext14Days = () => {
        const dates = [];
        for (let i = 1; i <= 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push({
                value: d.toISOString().split('T')[0],
                label: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }
        return dates;
    };
    const next14Days = getNext14Days();

    const handleBackdropClick = (e) => {
        if (e.target.id === 'modal-backdrop') onClose();
    };

    const toggleEventType = (type) => {
        if (eventTypes.includes(type)) {
            setEventTypes(eventTypes.filter(t => t !== type));
        } else {
            setEventTypes([...eventTypes, type]);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedDate || !selectedTimeSlot) {
            toast.error('Please select a date and time slot.');
            return;
        }

        setIsSubmitting(true);
        try {
            const isDFY = source === 'dfy_pricing' || source === 'dfy_section';

            await addDoc(collection(db, 'demoRequests'), {
                ...data,
                eventTypes,
                selectedDate,
                selectedTimeSlot,
                source,
                interestType: isDFY ? 'DoneForYou' : 'StandardSaaS',
                status: 'pending',
                createdAt: serverTimestamp()
            });

            toast.success('Thanks! We’ve received your request and will confirm your slot shortly.');

            // Clear form and close after a short delay
            setTimeout(() => {
                reset();
                setEventTypes([]);
                setSelectedDate('');
                setSelectedTimeSlot('');
                setIsSubmitting(false);
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Error submitting demo request:', error);
            toast.error('Failed to submit request. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div id="modal-backdrop" onClick={handleBackdropClick} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: '#1E293B', width: '100%', maxWidth: 840,
                borderRadius: 20, border: '1px solid #334155',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh',
                animation: 'zoomIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #334155' }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{BOOK_CALL_CONFIG.modalTitle}</h2>
                        <p style={{ color: '#94A3B8', fontSize: 14 }}>{BOOK_CALL_CONFIG.modalSubtitle}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#F8FAFC'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>

                    {/* Left Info Panel */}
                    <div style={{ flex: '1 1 300px', minWidth: 0, padding: 32, background: 'rgba(15, 23, 42, 0.4)', borderRight: '1px solid #334155' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 20 }}>{BOOK_CALL_CONFIG.infoSection.heading}</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {BOOK_CALL_CONFIG.infoSection.bullets.map((b, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, color: '#CBD5E1', fontSize: 14, lineHeight: 1.6 }}>
                                    <CheckCircle size={18} color="#3B82F6" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Form Panel */}
                    <div style={{ flex: '2 1 400px', minWidth: 0, padding: 32 }}>
                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div>
                                    <label className="label">Full Name *</label>
                                    <input type="text" className="input" placeholder="Arjun Sharma" {...register('name', { required: 'Name is required' })} />
                                    {errors.name && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Work Email *</label>
                                    <input type="email" className="input" placeholder="arjun@college.edu" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
                                    {errors.email && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div>
                                    <label className="label">Phone / WhatsApp *</label>
                                    <input type="tel" className="input" placeholder="+91 98765 43210" {...register('phone', { required: 'Phone is required' })} />
                                    {errors.phone && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Institution Type *</label>
                                    <select className="input" {...register('institutionType', { required: 'Required' })}>
                                        <option value="">Select type...</option>
                                        {BOOK_CALL_CONFIG.formOptions.institutionTypes.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    {errors.institutionType && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.institutionType.message}</p>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div>
                                    <label className="label">Institution Name *</label>
                                    <input type="text" className="input" placeholder="e.g. IIT Delhi" {...register('institutionName', { required: 'Required' })} />
                                    {errors.institutionName && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.institutionName.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Your Role *</label>
                                    <select className="input" {...register('role', { required: 'Required' })}>
                                        <option value="">Select role...</option>
                                        {BOOK_CALL_CONFIG.formOptions.roles.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                    {errors.role && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.role.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="label">Approximate Student Strength</label>
                                <select className="input" {...register('studentStrength')}>
                                    <option value="">Select strength...</option>
                                    {BOOK_CALL_CONFIG.formOptions.studentStrengths.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="label">Preferred Contact Channel *</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                                    {BOOK_CALL_CONFIG.formOptions.contactChannels.map(c => (
                                        <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#CBD5E1', fontSize: 14 }}>
                                            <input type="radio" value={c} {...register('contactChannel', { required: 'Required' })} />
                                            {c}
                                        </label>
                                    ))}
                                </div>
                                {errors.contactChannel && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.contactChannel.message}</p>}
                            </div>

                            <div>
                                <label className="label" style={{ marginBottom: 8, display: 'block' }}>What are you planning to run?</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {BOOK_CALL_CONFIG.formOptions.eventTypes.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => toggleEventType(t)}
                                            style={{
                                                background: eventTypes.includes(t) ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${eventTypes.includes(t) ? '#3B82F6' : '#334155'}`,
                                                color: eventTypes.includes(t) ? '#60A5FA' : '#94A3B8',
                                                padding: '6px 14px', borderRadius: 9999, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">Anything specific you want to discuss? (Optional)</label>
                                <textarea className="input" rows={2} placeholder="Any specific requirements or questions..." {...register('notes')}></textarea>
                            </div>

                            {/* Time Selection Block */}
                            <div style={{ background: '#0F172A', padding: 20, borderRadius: 12, border: '1px solid #334155', marginTop: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <CalendarDays size={18} color="#8B5CF6" />
                                    <span style={{ fontSize: 15, fontWeight: 600, color: '#F8FAFC' }}>Pick a time</span>
                                </div>

                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                    {next14Days.map(d => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() => setSelectedDate(d.value)}
                                            style={{
                                                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                                                background: selectedDate === d.value ? '#3B82F6' : '#1E293B',
                                                border: `1px solid ${selectedDate === d.value ? '#3B82F6' : '#334155'}`,
                                                color: selectedDate === d.value ? 'white' : '#CBD5E1',
                                                textAlign: 'center', transition: 'all 0.2s', flex: '1 1 auto'
                                            }}
                                        >
                                            <div style={{ fontSize: 12, fontWeight: selectedDate === d.value ? 600 : 400 }}>{d.label}</div>
                                        </button>
                                    ))}
                                </div>

                                {selectedDate && (
                                    <div style={{ animation: 'fadeIn 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Clock size={16} color="#94A3B8" />
                                            <span style={{ fontSize: 14, color: '#94A3B8' }}>Available Slots</span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                                            {BOOK_CALL_CONFIG.timeSlots.map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setSelectedTimeSlot(t)}
                                                    style={{
                                                        padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                                                        background: selectedTimeSlot === t ? 'rgba(139,92,246,0.1)' : 'transparent',
                                                        border: `1px solid ${selectedTimeSlot === t ? '#8B5CF6' : '#334155'}`,
                                                        color: selectedTimeSlot === t ? '#A78BFA' : '#CBD5E1',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{BOOK_CALL_CONFIG.timeNote}</p>
                            </div>

                            <div style={{ marginTop: 10 }}>
                                <button type="submit" disabled={isSubmitting} className="btn-gradient" style={{ width: '100%', padding: '16px', fontSize: 16, display: 'flex', justifyContent: 'center' }}>
                                    {isSubmitting ? 'Submitting...' : BOOK_CALL_CONFIG.submitText}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 16 }}>
                                    {BOOK_CALL_CONFIG.whatsappText} <a href={`https://wa.me/${BOOK_CALL_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>{BOOK_CALL_CONFIG.whatsappNumber}</a>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
