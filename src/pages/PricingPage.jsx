import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CashfreeService from '../services/CashfreeService';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { PRICING_PLANS, PRICING_NOTE, FEATURES_COMPARISON } from '../data/pricingConfig';
import { DFY_CONFIG } from '../data/dfyConfig';
import BookCallModal from '../components/BookCallModal';

const Cell = ({ value }) => {
    if (value === true) return <div style={{ display: 'flex', justifyContent: 'center' }}><CheckCircle size={20} color="#10B981" /></div>;
    if (value === false) return <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ color: '#334155', fontWeight: 600 }}>—</span></div>;
    return <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{value}</span>;
};

export default function PricingPage() {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const [isBookCallOpen, setIsBookCallOpen] = useState(false);
    const [bookCallSource, setBookCallSource] = useState('');
    const [isAnnual, setIsAnnual] = useState(true);

    // Visibility Check: Redirect Participants and Judges
    useEffect(() => {
        if (currentUser && userProfile) {
            const role = String(userProfile.role || '').toLowerCase();
            if (role === 'participant' || role === 'judge' || role === 'sponsor') {
                navigate('/dashboard');
                toast('Pricing is oriented for organizers.', { icon: 'ℹ️' });
            }
        }
    }, [currentUser, userProfile, navigate]);

    const openBookCallModal = (source) => {
        setBookCallSource(source);
        setIsBookCallOpen(true);
    };

    const handleSubscription = async (plan) => {
        // 1. If it's a "Book a call" plan, direct to contact
        if (plan.ctaLink === '/contact') {
            navigate('/contact');
            return;
        }

        // 2. Auth check
        if (!currentUser) {
            toast.error('Please login to subscribe to a plan');
            navigate('/auth?mode=signup&redirect=/pricing');
            return;
        }

        // 3. Prevent subscribing to current plan
        if (userProfile?.currentPlan === plan.name) {
            toast('You are already subscribed to this plan.', { icon: 'ℹ️' });
            return;
        }

        // Prepare the specific plan structure RazorpayService expects 
        // using the currently toggled price
        const selectedPriceValue = isAnnual ? plan.annualPrice : plan.monthlyPrice;
        const planForPayment = {
            ...plan,
            priceValue: selectedPriceValue // Ensure RazorpayService picks up the exact numeric amount
        };

        // 4. Trigger Cashfree Payment Flow
        await CashfreeService.processSubscription(currentUser, planForPayment);
    };

    // Helper to format currency
    const formatPrice = (amount) => {
        if (amount === 0) return '₹0';
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Helper for Dynamic CTA Text
    const getCtaText = (plan) => {
        // Find current user's plan tier
        const currentPlanObj = PRICING_PLANS.find(p => p.name === userProfile?.currentPlan);
        const currentTier = currentPlanObj ? currentPlanObj.tier : -1;

        if (userProfile?.currentPlan === plan.name) return 'You are subscribed';
        if (plan.ctaLink === '/contact') return 'Book a call';
        if (!currentUser) return plan.cta; // Default "Start free" / "Get started now"

        // For logged in Organizers
        if (plan.tier > currentTier) return 'Upgrade';
        if (plan.tier < currentTier) return 'Downgrade';
        
        return plan.cta;
    };

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh', paddingBottom: 60 }}>
            <div style={{ paddingTop: 88 }}>
                {/* Header */}
                <div style={{ padding: '72px 0 36px', textAlign: 'center' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>
                            Simple, <span className="gradient-text">Transparent Pricing</span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 520, margin: '0 auto', marginBottom: 40 }}>
                            Start free. Scale as you grow. No hidden fees or surprises.
                        </p>

                        {/* Billing Toggle */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 16,
                            background: '#1E293B', border: '1px solid #334155',
                            padding: '8px 16px', borderRadius: 9999, margin: '0 auto'
                        }}>
                            <span style={{ color: !isAnnual ? '#F8FAFC' : '#94A3B8', fontWeight: 600, fontSize: 15, transition: 'color 0.2s' }}>
                                Monthly
                            </span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                style={{
                                    position: 'relative', width: 56, height: 32, borderRadius: 9999,
                                    background: isAnnual ? '#3B82F6' : '#334155', border: 'none',
                                    cursor: 'pointer', transition: 'background 0.3s'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 4, left: isAnnual ? 28 : 4,
                                    width: 24, height: 24, background: '#fff', borderRadius: '50%',
                                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </button>
                            <span style={{ color: isAnnual ? '#F8FAFC' : '#94A3B8', fontWeight: 600, fontSize: 15, transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                                Annually
                                <span style={{
                                    background: 'rgba(16,185,129,0.15)', color: '#10B981',
                                    fontSize: 11, padding: '2px 8px', borderRadius: 9999, fontWeight: 700
                                }}>
                                    Save 10%
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div className="container" style={{ marginBottom: 40 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
                        {PRICING_PLANS.map(plan => {
                            const isCurrentPlan = userProfile?.currentPlan === plan.name;
                            const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                            const ctaLabel = getCtaText(plan);

                            return (
                                <div key={plan.name} style={{
                                    position: 'relative', borderRadius: 16,
                                    background: plan.highlighted
                                        ? 'linear-gradient(#1E293B,#1E293B) padding-box, linear-gradient(135deg,#3B82F6,#8B5CF6) border-box'
                                        : '#1E293B',
                                    border: plan.highlighted ? '2px solid transparent' : '1px solid #334155',
                                    padding: 28, transition: 'transform 0.2s, box-shadow 0.2s',
                                    display: 'flex', flexDirection: 'column'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {plan.badge && (
                                        <div style={{
                                            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                            background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', color: 'white',
                                            fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 9999,
                                            boxShadow: '0 4px 12px rgba(59,130,246,0.5)'
                                        }}>⭐ {plan.badge}</div>
                                    )}
                                    <div style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>{plan.name}</div>
                                    <div style={{ color: '#64748B', fontSize: 13, marginBottom: 24, minHeight: 40 }}>{plan.tagline}</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28, flexWrap: 'wrap' }}>
                                        {plan.name === 'Institution Pro' && (
                                            <span style={{ color: '#94A3B8', fontSize: 14, fontWeight: 600, marginRight: 2 }}>Starting from</span>
                                        )}
                                        <span style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC' }}>
                                            {formatPrice(displayPrice)}
                                        </span>
                                        <span style={{ color: '#64748B', fontSize: 13 }}>
                                            / {isAnnual ? 'year' : 'month'}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {plan.features.map(f => (
                                            <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                                                <CheckCircle size={16} color={plan.highlighted ? "#3B82F6" : "#10B981"} style={{ flexShrink: 0, marginTop: 2 }} />
                                                <span style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 1.5 }}>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleSubscription(plan)}
                                        disabled={isCurrentPlan}
                                        className={isCurrentPlan ? '' : (plan.highlighted ? 'btn-gradient' : 'btn-outline')}
                                        style={{ 
                                            width: '100%', textAlign: 'center', cursor: isCurrentPlan ? 'not-allowed' : 'pointer', 
                                            display: 'block', marginTop: 24, minHeight: 44, lineHeight: '20px',
                                            background: isCurrentPlan ? 'rgba(51, 65, 85, 0.5)' : undefined,
                                            color: isCurrentPlan ? '#94A3B8' : undefined,
                                            border: isCurrentPlan ? '1px solid #334155' : undefined,
                                            borderRadius: isCurrentPlan ? '8px' : undefined
                                        }}>
                                        {ctaLabel}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* DFY Pricing Card */}
                    <div style={{
                        marginTop: 40,
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 16,
                        padding: 32,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        maxWidth: 900,
                        margin: '40px auto 0'
                    }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '4px 12px', borderRadius: 9999,
                            background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)',
                            marginBottom: 16, color: '#34d399', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                            Premium Service
                        </div>
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>{DFY_CONFIG.pricingCard.title}</h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 24 }}>{DFY_CONFIG.pricingCard.subtitle}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, width: '100%', marginBottom: 32, textAlign: 'left' }}>
                            {DFY_CONFIG.pricingCard.bullets.map((bullet, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.5 }}>{bullet}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC' }}>{DFY_CONFIG.pricingCard.priceText}</div>
                            <button onClick={() => openBookCallModal(DFY_CONFIG.pricingCard.ctaSource)} className="btn-gradient" style={{ padding: '14px 32px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                {DFY_CONFIG.pricingCard.ctaText}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 40 }}>
                        <p style={{ color: '#64748B', fontSize: 14, maxWidth: 600, margin: '0 auto', fontStyle: 'italic' }}>
                            {PRICING_NOTE}
                        </p>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="container" style={{ paddingBottom: 80 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 36 }}>
                        Feature <span className="gradient-text">Comparison</span>
                    </h2>
                    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155' }}>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748B', fontSize: 13, fontWeight: 600 }}>Feature</th>
                                    {PRICING_PLANS.map(p => (
                                        <th key={p.name} style={{ padding: '16px 24px', textAlign: 'center', color: p.highlighted ? '#3B82F6' : '#94A3B8', fontSize: 15, fontWeight: 700 }}>
                                            {p.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {FEATURES_COMPARISON.map((row, i) => (
                                    <tr key={row.feature} style={{ borderBottom: '1px solid #334155', background: i % 2 === 0 ? 'rgba(15,23,42,0.3)' : 'transparent' }}>
                                        <td style={{ padding: '13px 24px', color: '#94A3B8', fontSize: 14 }}>{row.feature}</td>
                                        {[row.free, row.starter, row.growth, row.pro].map((val, j) => (
                                            <td key={j} style={{ padding: '13px 24px', textAlign: 'center' }}>
                                                <Cell value={val} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DFY Detail Section */}
                <section style={{ padding: '80px 0', background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid #334155' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: 56 }}>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, marginBottom: 16 }}>
                                {DFY_CONFIG.detailSection.title}
                            </h2>
                            <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 640, margin: '0 auto' }}>
                                {DFY_CONFIG.detailSection.subtitle}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
                            {DFY_CONFIG.detailSection.cards.map((card, i) => (
                                <div key={i} style={{
                                    background: '#1E293B', borderRadius: 16, border: '1px solid #334155',
                                    padding: '32px 24px', textAlign: 'center'
                                }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>{card.heading}</h3>
                                    <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6 }}>{card.text}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 12, padding: '16px', textAlign: 'center', maxWidth: 600,
                            margin: '0 auto 40px',
                            color: '#60A5FA', fontSize: 15, fontWeight: 500
                        }}>
                            {DFY_CONFIG.detailSection.infoStripText}
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => openBookCallModal(DFY_CONFIG.detailSection.ctaSource)} className="btn-gradient" style={{ padding: '14px 36px', fontSize: 16, cursor: 'pointer' }}>
                                {DFY_CONFIG.detailSection.ctaText}
                            </button>
                        </div>
                    </div>
                </section>

                <BookCallModal isOpen={isBookCallOpen} onClose={() => setIsBookCallOpen(false)} source={bookCallSource} />
            </div>
        </div>
    );
}
