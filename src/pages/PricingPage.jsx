import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RazorpayService from '../services/RazorpayService';
import toast from 'react-hot-toast';
import { CheckCircle, X, ArrowRight } from 'lucide-react';
import { PRICING_PLANS, PRICING_NOTE, FEATURES_COMPARISON } from '../data/pricingConfig';
import { DFY_CONFIG } from '../data/dfyConfig';
import BookCallModal from '../components/BookCallModal';

const Cell = ({ value }) => {
    if (value === true) return <div style={{ display: 'flex', justifyContent: 'center' }}><CheckCircle size={20} color="#10B981" /></div>;
    if (value === false) return <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ color: '#334155', fontWeight: 600 }}>—</span></div>;
    return <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{value}</span>;
};

export default function PricingPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isBookCallOpen, setIsBookCallOpen] = useState(false);
    const [bookCallSource, setBookCallSource] = useState('');

    const openBookCallModal = (source) => {
        setBookCallSource(source);
        setIsBookCallOpen(true);
    };

    const handleSubscription = async (plan) => {
        // 1. If it's a "Book a call" plan, just redirect to contact/modal
        if (plan.ctaLink === '/contact' || plan.name === 'Institution Pro') {
            navigate('/contact');
            return;
        }

        // 2. If user not logged in, redirect to signup
        if (!currentUser) {
            toast.error('Please login to subscribe to a plan');
            navigate('/auth?mode=signup&redirect=/pricing');
            return;
        }

        // 3. Trigger Razorpay Payment Flow
        await RazorpayService.processSubscription(currentUser, plan);
    };

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 88 }}>
                {/* Header */}
                <div style={{ padding: '72px 0 56px', textAlign: 'center' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>
                            Simple, <span className="gradient-text">Transparent Pricing</span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 18, maxWidth: 520, margin: '0 auto' }}>
                            Start free. Scale as you grow. No hidden fees or surprises.
                        </p>
                    </div>
                </div>

                {/* Cards */}
                <div className="container" style={{ marginBottom: 40 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 1200, margin: '0 auto' }}>
                        {PRICING_PLANS.map(plan => (
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
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                                    <span style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC' }}>{plan.price}</span>
                                    <span style={{ color: '#64748B', fontSize: 13 }}>{plan.period}</span>
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
                                    className={plan.highlighted ? 'btn-gradient' : 'btn-outline'}
                                    style={{ width: '100%', textAlign: 'center', cursor: 'pointer', display: 'block', marginTop: 24, minHeight: 44, lineHeight: '20px' }}>
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
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
