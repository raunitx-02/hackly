import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, CalendarDays, Users, FileText, Star, BarChart3, Handshake,
    ArrowRight, CheckCircle, Play, ChevronRight, Twitter, Linkedin,
    Github, Mail, Code2, Trophy, PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RazorpayService from '../services/RazorpayService';
import toast from 'react-hot-toast';

// Count-up hook
function useCountUp(target, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

const FEATURES = [
    { icon: CalendarDays, title: 'Event Creation', slug: 'event-creation', desc: 'Build complete hackathons with problem statements, judging criteria, and prize pools in minutes.', color: '#3B82F6' },
    { icon: Users, title: 'Team Management', slug: 'team-management', desc: 'Participants form teams, join open teams, and collaborate seamlessly within the platform.', color: '#8B5CF6' },
    { icon: FileText, title: 'Submission Portal', slug: 'submission-portal', desc: 'Teams submit projects with GitHub links, demos, PPTs, and screenshots — all in one place.', color: '#10B981' },
    { icon: Star, title: 'Judge Panel', slug: 'judge-panel', desc: 'Judges score projects against custom criteria with weighted rubrics and real-time updates.', color: '#F59E0B' },
    { icon: BarChart3, title: 'Live Leaderboard', slug: 'live-leaderboard', desc: 'Watch rankings update in real-time. Automatic podium reveals and score aggregation.', color: '#EF4444' },
    { icon: Handshake, title: 'Sponsor Management', slug: 'sponsor-management', desc: 'Showcase sponsors with tiered visibility, brand assets, and analytics per sponsor tier.', color: '#06B6D4' },
];

const STEPS = [
    { num: '01', title: 'Create Event', desc: 'Organizers set up the event, define problem statements, prizes, and invite judges.', icon: PlusCircle },
    { num: '02', title: 'Participants Register', desc: 'Students browse, register, form teams, and collaborate before submission deadline.', icon: Users },
    { num: '03', title: 'Judge & Announce', desc: 'Judges score projects in parallel; live leaderboard reveals winners automatically.', icon: Trophy },
];

import { PRICING_PLANS, PRICING_NOTE } from '../data/pricingConfig';
import { HOW_IT_WORKS_STEPS } from '../data/howItWorksConfig';
import { AUDIENCE_CARDS } from '../data/audienceConfig';
import BookCallModal from '../components/BookCallModal';
import CampusPartnerModal from '../components/CampusPartnerModal';
import RotatingText from '../components/RotatingText';
import { CTA_WORDS, CTA_ROTATION_INTERVAL } from '../data/ctaConfig';
import { CAMPUS_PARTNER_CONFIG } from '../data/campusPartnerConfig';

const TESTIMONIALS = [
    {
        name: 'Arjun Sharma', college: 'IIT Bombay', role: 'Event Organizer',
        quote: 'Hackly transformed how we run Techfest. What used to take weeks of coordination now happens automatically. Our hackathon had 2000+ participants managed seamlessly.',
        avatar: 'AS',
    },
    {
        name: 'Priya Patel', college: 'BITS Pilani', role: 'Tech Fest Coordinator',
        quote: 'The judge panel feature is incredible. Our judges scored 200 projects simultaneously, results were instant. Students loved the live leaderboard experience.',
        avatar: 'PP',
    },
    {
        name: 'Rohan Gupta', college: 'NIT Trichy', role: 'Student Participant',
        quote: 'Found my team, submitted our project, and watched us climb the leaderboard — all on one platform. This is how college hackathons should work.',
        avatar: 'RG',
    },
];





export default function LandingPage() {
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);
    const [isBookCallOpen, setIsBookCallOpen] = useState(false);
    const [bookCallSource, setBookCallSource] = useState('');
    const [isCampusPartnerOpen, setIsCampusPartnerOpen] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const openBookCallModal = (source) => {
        setBookCallSource(source);
        setIsBookCallOpen(true);
    };

    const handleSubscription = async (plan) => {
        if (plan.ctaLink === '/contact' || plan.name === 'Institution Pro') {
            navigate('/contact');
            return;
        }

        if (!currentUser) {
            toast.error('Please login to subscribe to a plan');
            navigate('/auth?mode=signup&redirect=/pricing');
            return;
        }

        await RazorpayService.processSubscription(currentUser, plan);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            {/* ─── HERO ─── */}
            <section style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                padding: '120px 0 80px', position: 'relative', overflow: 'hidden',
            }}>
                {/* Background grid */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.08,
                    backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }} />
                {/* Glow blobs */}
                <div style={{
                    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)',
                    top: '-10%', left: '-5%', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
                    bottom: '0%', right: '5%', pointerEvents: 'none',
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
                        {/* Left text */}
                        <div className="animate-fade-up">
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '6px 16px', borderRadius: 9999,
                                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                                marginBottom: 24,
                            }}>
                                <Zap size={14} color="#3B82F6" fill="#3B82F6" />
                                <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>Built for Indian schools, coaching institutes & colleges</span>
                            </div>

                            <h1 style={{
                                fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1,
                                letterSpacing: '-0.03em', marginBottom: 24,
                            }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    Run Hackathons
                                </span><br />
                                <span className="gradient-text">That Actually Matter</span>
                            </h1>

                            <p style={{ color: '#94A3B8', fontSize: 18, lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                                The all‑in‑one platform for schools, coaching institutes, and colleges in India to run structured, scam‑free hackathons and tech fests in just a few clicks.
                            </p>

                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <Link to="/auth?mode=signup" className="btn-gradient" style={{ fontSize: 16, padding: '14px 28px', textDecoration: 'none' }}>
                                    Start for Free <ArrowRight size={18} />
                                </Link>
                                <button className="btn-outline" style={{ fontSize: 16, padding: '14px 28px', minHeight: 44 }}>
                                    <Play size={16} fill="#F8FAFC" /> Watch Demo
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
                                {['No credit card required', 'Free forever plan', '5-min setup'].map(t => (
                                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <CheckCircle size={14} color="#10B981" />
                                        <span style={{ color: '#94A3B8', fontSize: 13 }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Dashboard mockup */}
                        <div style={{ position: 'relative' }} className="hero-mockup">
                            <div style={{
                                background: '#1E293B', borderRadius: 20, border: '1px solid #334155',
                                padding: 20, boxShadow: '0 0 60px rgba(59,130,246,0.2), 0 40px 80px rgba(0,0,0,0.5)',
                                transform: 'perspective(1000px) rotateY(-8deg) rotateX(2deg)',
                                transition: 'transform 0.4s ease',
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-2deg) rotateX(0)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(2deg)'}
                            >
                                {/* Fake browser bar */}
                                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                                    {['#EF4444', '#F59E0B', '#10B981'].map(c => (
                                        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                                    ))}
                                </div>
                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                                    {[['12', 'Events'], ['1,204', 'Participants'], ['₹1.2L', 'Prize Pool']].map(([v, l]) => (
                                        <div key={l} style={{ background: '#0F172A', borderRadius: 10, padding: '12px', border: '1px solid #334155' }}>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>{v}</div>
                                            <div style={{ fontSize: 11, color: '#64748B' }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                                {/* Event rows */}
                                {['Smart India Hackathon 2025', 'TechVision 3.0', 'Code Rush'].map((e, i) => (
                                    <div key={e} style={{
                                        background: '#0F172A', borderRadius: 8, padding: '10px 14px',
                                        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
                                        border: '1px solid #1E293B',
                                    }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                            background: ['linear-gradient(135deg,#3B82F6,#8B5CF6)', 'linear-gradient(135deg,#10B981,#3B82F6)', 'linear-gradient(135deg,#F59E0B,#EF4444)'][i],
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <CalendarDays size={14} color="white" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>{e}</div>
                                            <div style={{ fontSize: 10, color: '#64748B' }}>{[312, 89, 45][i]} participants</div>
                                        </div>
                                        <div style={{
                                            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 9999,
                                            background: ['rgba(16,185,129,0.15)', 'rgba(59,130,246,0.15)', 'rgba(245,158,11,0.15)'][i],
                                            color: ['#34d399', '#60a5fa', '#fbbf24'][i],
                                        }}>
                                            {['Active', 'Reg. Open', 'Upcoming'][i]}
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: 12, height: 6, background: 'linear-gradient(90deg,#3B82F6,#8B5CF6)', borderRadius: 3, opacity: 0.6 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS FOR INSTITUTIONS ─── */}
            <section style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
                borderTop: '1px solid #334155', borderBottom: '1px solid #334155',
                padding: '80px 0',
            }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, marginBottom: 16 }}>
                            How it works for your <span className="gradient-text">institution</span>
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 640, margin: '0 auto' }}>
                            From first demo to declaring winners, everything is handled in a few simple steps.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 56 }}>
                        {HOW_IT_WORKS_STEPS.map((step) => (
                            <div key={step.id} style={{
                                background: '#1E293B', borderRadius: 16, border: '1px solid #334155',
                                padding: '32px 24px', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                position: 'relative', overflow: 'hidden'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {step.stepLabel}
                                    </span>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        <step.icon size={20} color="#3B82F6" />
                                    </div>
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>{step.title}</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {step.bullets.map((bullet, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, color: '#94A3B8', fontSize: 14, lineHeight: 1.5 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', marginTop: 8, flexShrink: 0 }} />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Want to see this flow with your own data?</p>
                        <button onClick={() => openBookCallModal('how_it_works_section')} className="btn-gradient" style={{ display: 'inline-block', cursor: 'pointer', padding: '12px 32px', fontSize: 15 }}>
                            Book a free demo
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section id="features" className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 16px', borderRadius: 9999,
                            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                            marginBottom: 16,
                        }}>
                            <Star size={14} color="#a78bfa" />
                            <span style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>Everything You Need</span>
                        </div>
                        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
                            Powerful Features for <span className="gradient-text">Every Role</span>
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
                            From organizers to participants to judges — every stakeholder gets purpose-built tools.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                        {FEATURES.map(f => (
                            <Link key={f.title} to={`/features/${f.slug}`} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12, marginBottom: 18,
                                        background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${f.color}40`,
                                    }}>
                                        <f.icon size={24} color={f.color} />
                                    </div>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#F8FAFC' }}>{f.title}</h3>
                                    <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, marginBottom: 14 }}>{f.desc}</p>
                                    <span style={{ color: f.color, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Learn more <ChevronRight size={13} /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── WHO IT'S FOR ─── */}
            <section className="section" style={{ background: 'rgba(30,41,59,0.3)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, marginBottom: 16 }}>
                            Built for every kind of <span className="gradient-text">campus</span>
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 640, margin: '0 auto' }}>
                            One platform that works for schools, coaching institutes, and colleges across India.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 56 }}>
                        {AUDIENCE_CARDS.map(card => (
                            <div key={card.id} style={{
                                background: '#1E293B', borderRadius: 16, border: '1px solid #334155',
                                padding: '32px 24px', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                display: 'flex', flexDirection: 'column'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <card.icon size={24} color="#3B82F6" />
                                </div>
                                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>{card.title}</h3>
                                <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.6, marginBottom: 24, minHeight: 48 }}>{card.shortLine}</p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                    {card.bullets.map((bullet, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, color: '#CBD5E1', fontSize: 14, lineHeight: 1.5 }}>
                                            <div style={{ marginTop: 6, color: '#3B82F6', fontWeight: 900 }}>·</div>
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#F8FAFC', fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Not sure where you fit?</p>
                        <button onClick={() => openBookCallModal('audience_section')} className="btn-outline" style={{ display: 'inline-flex', cursor: 'pointer', padding: '12px 32px', fontSize: 15 }}>
                            Book a quick call
                        </button>
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
                            Loved by <span className="gradient-text">College Organizers</span>
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        {TESTIMONIALS.map(t => (
                            <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)}
                                </div>
                                <p style={{ color: '#CBD5E1', fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic', flex: 1 }}>
                                    "{t.quote}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 15, fontWeight: 700, color: 'white',
                                    }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: '#F8FAFC' }}>{t.name}</div>
                                        <div style={{ color: '#64748B', fontSize: 12 }}>{t.role} · {t.college}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── PRICING ─── */}
            <section id="pricing" className="section" style={{ background: 'rgba(30,41,59,0.3)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
                            Simple, Transparent <span className="gradient-text">Pricing</span>
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                            Start free. Scale as you grow. No hidden fees.
                        </p>
                    </div>

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
                                        letterSpacing: '0.05em', whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 12px rgba(59,130,246,0.5)'
                                    }}>
                                        ⭐ {plan.badge}
                                    </div>
                                )}
                                <div style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>{plan.name}</div>
                                <div style={{ color: '#64748B', fontSize: 13, marginBottom: 24, minHeight: 40 }}>{plan.tagline}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                                    <span style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC' }}>{plan.price}</span>
                                    <span style={{ color: '#64748B', fontSize: 13 }}>{plan.period}</span>
                                </div>
                                <div style={{ marginBottom: 28, flex: 1 }}>
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
                                    style={{ width: '100%', textAlign: 'center', cursor: 'pointer', display: 'block', minHeight: 44, lineHeight: '20px', marginTop: 'auto' }}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 32 }}>
                        <p style={{ color: '#64748B', fontSize: 14, maxWidth: 600, margin: '0 auto', fontStyle: 'italic' }}>
                            {PRICING_NOTE}
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── CTA Banner ─── */}
            <section className="section">
                <div className="container">
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                        border: '1px solid rgba(59,130,246,0.3)', borderRadius: 24, padding: '60px 40px',
                        textAlign: 'center',
                    }}>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            Ready to Run Your Next <RotatingText words={CTA_WORDS} interval={CTA_ROTATION_INTERVAL} /><span className="gradient-text">?</span>
                        </h2>
                        <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
                            Join institutions across India already running their events on Hackly.
                        </p>
                        <Link to="/auth?mode=signup" className="btn-gradient" style={{ fontSize: 16, padding: '14px 32px', textDecoration: 'none' }}>
                            Create Your First Event Free <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── CAMPUS PARTNER PROGRAM ─── */}
            <section id="campus-partners" className="section" style={{ background: '#0F172A', borderTop: '1px solid #1E293B', padding: '80px 0' }}>
                <div className="container">
                    <div style={{
                        background: '#1E293B', borderRadius: 24, border: '1px solid #334155',
                        padding: '48px', overflow: 'hidden', position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
                            background: 'radial-gradient(circle at top right, rgba(59,130,246,0.1) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <div style={{ textAlign: 'center', marginBottom: 48 }}>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, marginBottom: 16, color: '#F8FAFC' }}>
                                {CAMPUS_PARTNER_CONFIG.section.title}
                            </h2>
                            <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 640, margin: '0 auto' }}>
                                {CAMPUS_PARTNER_CONFIG.section.subtitle}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, marginBottom: 48 }}>
                            <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 16, padding: 32, border: '1px solid #334155' }}>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 20 }}>{CAMPUS_PARTNER_CONFIG.section.leftColumn.subheading}</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {CAMPUS_PARTNER_CONFIG.section.leftColumn.bullets.map((b, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, color: '#CBD5E1', fontSize: 15, lineHeight: 1.5 }}>
                                            <CheckCircle size={18} color="#3B82F6" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: 16, padding: 32, border: '1px solid #334155' }}>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 20 }}>{CAMPUS_PARTNER_CONFIG.section.rightColumn.subheading}</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {CAMPUS_PARTNER_CONFIG.section.rightColumn.bullets.map((b, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, color: '#CBD5E1', fontSize: 15, lineHeight: 1.5 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', marginTop: 8, flexShrink: 0 }} />
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => setIsCampusPartnerOpen(true)} className="btn-gradient" style={{ padding: '16px 40px', fontSize: 16, cursor: 'pointer' }}>
                                {CAMPUS_PARTNER_CONFIG.section.ctaText}
                            </button>
                        </div>
                    </div>
                </div>
            </section>



            <style>{`
        @media (max-width: 900px) {
          .hero-mockup { display: none; }
        }
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

            <BookCallModal isOpen={isBookCallOpen} onClose={() => setIsBookCallOpen(false)} source={bookCallSource} />
            <CampusPartnerModal isOpen={isCampusPartnerOpen} onClose={() => setIsCampusPartnerOpen(false)} />
        </div>
    );
}
