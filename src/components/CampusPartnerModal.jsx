import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CAMPUS_PARTNER_CONFIG } from '../data/campusPartnerConfig';

export default function CampusPartnerModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const handleBackdropClick = (e) => {
        if (e.target.id === 'campus-modal-backdrop') onClose();
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'campusPartners'), {
                ...data,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            setIsSuccess(true);
            toast.success('Application submitted successfully!');

            setTimeout(() => {
                reset();
                setIsSuccess(false);
                setIsSubmitting(false);
                onClose();
            }, 3000);

        } catch (error) {
            console.error('Error submitting campus partner application:', error);
            toast.error('Failed to submit application. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div id="campus-modal-backdrop" onClick={handleBackdropClick} style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, animation: 'fadeIn 0.2s ease-out', overflowY: 'auto'
        }}>
            <div style={{
                background: '#1E293B', width: '100%', maxWidth: 640,
                borderRadius: 20, border: '1px solid #334155',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.1)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh',
                animation: 'zoomIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid #334155', flexShrink: 0 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>{CAMPUS_PARTNER_CONFIG.modal.title}</h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#F8FAFC'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 32, overflowY: 'auto' }}>
                    {isSuccess ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle size={32} color="#10B981" />
                            </div>
                            <h3 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>Application Received!</h3>
                            <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                                {CAMPUS_PARTNER_CONFIG.modal.successMessage}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div>
                                    <label className="label">Full Name *</label>
                                    <input type="text" className="input" placeholder="Rahul Sharma" {...register('name', { required: 'Required' })} />
                                    {errors.name && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Email Address *</label>
                                    <input type="email" className="input" placeholder="rahul@college.edu" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
                                    {errors.email && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div>
                                    <label className="label">Phone / WhatsApp *</label>
                                    <input type="tel" className="input" placeholder="+91 98765 43210" {...register('phone', { required: 'Required' })} />
                                    {errors.phone && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="label">College / Institute Name *</label>
                                    <input type="text" className="input" placeholder="e.g. SRM IST" {...register('college', { required: 'Required' })} />
                                    {errors.college && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.college.message}</p>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                <div>
                                    <label className="label">City & State *</label>
                                    <input type="text" className="input" placeholder="Chennai, Tamil Nadu" {...register('cityState', { required: 'Required' })} />
                                    {errors.cityState && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.cityState.message}</p>}
                                </div>
                                <div>
                                    <label className="label">Current Year & Course *</label>
                                    <input type="text" className="input" placeholder="3rd Year B.Tech CSE" {...register('yearCourse', { required: 'Required' })} />
                                    {errors.yearCourse && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.yearCourse.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="label">Role on Campus *</label>
                                <select className="input" {...register('role', { required: 'Required' })}>
                                    <option value="">Select your role...</option>
                                    {CAMPUS_PARTNER_CONFIG.modal.roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                {errors.role && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.role.message}</p>}
                            </div>

                            <div>
                                <label className="label">Existing Club / Fest affiliation (Optional)</label>
                                <input type="text" className="input" placeholder="e.g. DSC Lead, GDSC Core, Tech Fest Head..." {...register('clubAffiliation')} />
                            </div>

                            <div>
                                <label className="label">How do you plan to promote Hackly on your campus? *</label>
                                <textarea className="input" rows={4} placeholder="I will organize a tech meetup and present Hackly to our college administration..." {...register('promotionPlan', { required: 'Required', minLength: { value: 20, message: 'Please provide a bit more detail (min 20 characters)' } })}></textarea>
                                {errors.promotionPlan && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.promotionPlan.message}</p>}
                            </div>

                            <button type="submit" disabled={isSubmitting} className="btn-gradient" style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 10, cursor: 'pointer' }}>
                                {isSubmitting ? 'Submitting...' : 'Apply to program'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
