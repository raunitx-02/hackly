import { useParams, Link, Navigate } from 'react-router-dom';
import {
    CalendarDays, Users, FileText, Star, BarChart3, Handshake,
    ArrowRight, CheckCircle, ChevronRight, Zap,
} from 'lucide-react';

const FEATURE_DATA = {
    'event-creation': {
        icon: CalendarDays, color: '#3B82F6', title: 'Event Creation',
        tagline: 'Launch world-class hackathons in minutes — not weeks.',
        hero: 'Build your entire event on Hackly: problem statements, judging criteria, prize pools, registration limits, custom branding, and more. Everything in one organised wizard.',
        highlights: [
            { heading: '4-Step Wizard', body: 'Walk through basic info, schedule, prizes & judges, and a review screen before publishing — so nothing gets missed.' },
            { heading: 'Problem Statements', body: 'Add multiple problem statements with full descriptions. Participants can filter and choose which one to tackle.' },
            { heading: 'Flexible Scheduling', body: 'Set registration open/close dates, event start/end times. The platform enforces deadlines automatically.' },
            { heading: 'Prize Pool Builder', body: 'Define 1st, 2nd, 3rd place prize amounts. Totals are auto-calculated and shown publicly on the event card.' },
            { heading: 'Judge Invitations', body: 'Invite judges by email. As soon as they sign up, the judge dashboard becomes available to them for that event.' },
            { heading: 'Publish or Draft', body: 'Save as a draft while you\'re still planning, then publish when you\'re ready. Drafts are invisible to participants.' },
        ],
        steps: ['Fill in event name, type, mode, city & college', 'Set registration deadline, start date, end date', 'Add prize pool & invite judge emails', 'Review all details and hit Publish'],
        cta: 'Create Your First Event',
    },
    'team-management': {
        icon: Users, color: '#8B5CF6', title: 'Team Management',
        tagline: 'From solo participant to dream team — in seconds.',
        hero: 'Hackly\'s team system lets participants create teams, open them for others to join, or find and join existing open teams — all without any organiser overhead.',
        highlights: [
            { heading: 'Create a Team', body: 'Any registered participant can create a named team, automatically becoming the team leader.' },
            { heading: 'Open / Closed Teams', body: 'Teams are open by default — anyone can join until the team lead closes it or it hits max size.' },
            { heading: 'Browse Open Teams', body: 'Participants see a real-time list of teams with vacancies. One click to join, no approval needed.' },
            { heading: 'Max Team Size Enforced', body: 'The organiser sets a max team size (e.g. 4). Once a team is full it\'s automatically removed from the join list.' },
            { heading: 'Real-time Updates', body: 'All team data is Firestore-live — the moment someone joins, every other participant sees the updated member count.' },
            { heading: 'Team Identity on Leaderboard', body: 'Team names appear on the live leaderboard and submissions dashboard, not individual UIDs.' },
        ],
        steps: ['Register for the event', 'Create a team or browse open teams', 'Invite friends by sharing team name', 'Start building together'],
        cta: 'Browse Events',
    },
    'submission-portal': {
        icon: FileText, color: '#10B981', title: 'Submission Portal',
        tagline: 'One place for projects, links, decks, and demos.',
        hero: 'The Hackly submission portal gives every team a single structured page to showcase their work — GitHub repo, live demo, presentation deck, tech stack, and a written description.',
        highlights: [
            { heading: 'Rich Project Profile', body: 'Teams fill in project name, description, GitHub URL, live demo URL, and a Google Slides / Drive PPT link.' },
            { heading: 'Tech Stack Tags', body: 'Add technology tags (React, Firebase, TensorFlow…) displayed as chips on the submission card.' },
            { heading: 'Problem Statement Mapping', body: 'Teams select which problem statement they\'re solving — judges can filter submissions by PS.' },
            { heading: 'Edit Before Deadline', body: 'Submissions are editable any time before the event end date. Changes save instantly to Firestore.' },
            { heading: 'Visible to Judges', body: 'All judge panel entries pull live from submissions — no manual file sharing needed.' },
            { heading: 'Submission Confirmation', body: 'A green ✅ Submitted badge appears on the card once submitted, with a clear "Edit" button to update.' },
        ],
        steps: ['Register & form a team', 'Build your project', 'Fill in the submission form before deadline', 'Judges can immediately start scoring'],
        cta: 'Join a Hackathon',
    },
    'judge-panel': {
        icon: Star, color: '#F59E0B', title: 'Judge Panel',
        tagline: 'Fair, fast, transparent judging at any scale.',
        hero: 'Hackly\'s judge panel lets multiple judges score all submissions in parallel — using custom weighted rubrics defined by the organiser. Results aggregate in real-time.',
        highlights: [
            { heading: 'Custom Rubric', body: 'Organiser defines criteria (Innovation, Technical Depth, UI/UX…) each with a percentage weight. Weights must total 100%.' },
            { heading: 'Weighted Scoring Sliders', body: 'Judges move a slider (1–10) per criterion. A weighted total score is calculated live in the drawer.' },
            { heading: 'Multi-judge Aggregation', body: 'If three judges score the same project, the leaderboard shows the average of all three totals, not one judge\'s score.' },
            { heading: 'Already-scored Badge', body: 'Once a judge submits a score for a project, that card shows a green ✅ Scored badge. They cannot double-score.' },
            { heading: 'Links & Context', body: 'The scoring drawer shows GitHub, demo links, tech stack, and full description — judges never lose context.' },
            { heading: 'Blind Scoring', body: 'Judges only see team names, not individual participant profiles — reducing bias in the scoring process.' },
        ],
        steps: ['Organiser invites judge by email', 'Judge signs up → Judge Panel route unlocks', 'Open submissions side-by-side with scorecards', 'Submit scores — leaderboard updates instantly'],
        cta: 'Organise an Event',
    },
    'live-leaderboard': {
        icon: BarChart3, color: '#EF4444', title: 'Live Leaderboard',
        tagline: 'Real-time rankings. Zero manual calculation.',
        hero: 'As judges submit scores, Hackly aggregates them, calculates weighted averages, and re-ranks every team on the live leaderboard — all automatically, all in real-time.',
        highlights: [
            { heading: 'Firestore Real-time', body: 'Built on Firestore onSnapshot listeners — rankings update the moment any judge submits a score.' },
            { heading: 'Podium Visual', body: 'Top 3 teams are displayed on an animated podium with gold 🥇, silver 🥈, bronze 🥉 medals.' },
            { heading: 'Full Rankings Table', body: 'Below the podium, a ranked table shows every team, project name, average score, and number of reviews.' },
            { heading: 'LIVE Indicator', body: 'A pulsing red LIVE badge shows participants the board is active — builds excitement during the event.' },
            { heading: 'Tie Handling', body: 'Teams with identical average scores share a rank. The table shows the correct rank numbers (e.g. two #2s).' },
            { heading: 'Public Access', body: 'The leaderboard URL works without login — share it with sponsors, faculty, and the audience on a projector.' },
        ],
        steps: ['Judges start scoring submissions', 'Scores auto-aggregate per submission', 'Rankings update live for all viewers', 'Event ends — final leaderboard is the official result'],
        cta: 'View a Live Event',
    },
    'sponsor-management': {
        icon: Handshake, color: '#06B6D4', title: 'Sponsor Management',
        tagline: 'Give sponsors the visibility they deserve.',
        hero: 'Hackly\'s sponsor tier system lets organizers showcase sponsors with brand assets, website links, and tier-based visibility across the event page — attracting better sponsorships every year.',
        highlights: [
            { heading: 'Tier System', body: 'Define Gold, Silver, Bronze tiers or name them anything you like. Higher tiers get larger logos and more prominent placement.' },
            { heading: 'Brand Asset Upload', body: 'Upload sponsor logos that appear on the event detail page, registration confirmation emails, and the leaderboard page.' },
            { heading: 'Website Links', body: 'Each sponsor card links to the sponsor\'s website — giving sponsors measurable click-through visibility.' },
            { heading: 'Analytics Per Sponsor', body: 'Track how many participants clicked through to each sponsor\'s page — share these numbers in post-event reports.' },
            { heading: 'Sponsor Landing Section', body: 'The event page has a dedicated Sponsors section with tier grouping, displayed beautifully below the prizes section.' },
            { heading: 'Attract Bigger Sponsors', body: 'A professional sponsor showcase helps you pitch to larger companies — show them a polished event page before they sign.' },
        ],
        steps: ['Add sponsor name, tier, logo, and website link', 'Sponsors appear on the event page automatically', 'Participants and audience see sponsor brands', 'Post-event: share click analytics with sponsors'],
        cta: 'Create an Event',
    },
};

export default function FeatureDetailPage() {
    const { slug } = useParams();
    const data = FEATURE_DATA[slug];
    if (!data) return <Navigate to="/" replace />;

    const Icon = data.icon;

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                {/* Hero */}
                <section style={{
                    background: `linear-gradient(135deg, ${data.color}15 0%, rgba(15,23,42,0) 60%)`,
                    borderBottom: '1px solid #334155', padding: '72px 0 56px', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.05,
                        backgroundImage: `linear-gradient(${data.color}80 1px, transparent 1px), linear-gradient(90deg, ${data.color}80 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                    }} />
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        {/* Breadcrumb */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, color: '#64748B', fontSize: 14 }}>
                            <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>Home</Link>
                            <ChevronRight size={14} />
                            <Link to="/#features" style={{ color: '#64748B', textDecoration: 'none' }}>Features</Link>
                            <ChevronRight size={14} />
                            <span style={{ color: '#94A3B8' }}>{data.title}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 18, flexShrink: 0,
                                background: `${data.color}20`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', border: `1px solid ${data.color}40`,
                            }}>
                                <Icon size={34} color={data.color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 280 }}>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                                    borderRadius: 9999, background: `${data.color}15`, border: `1px solid ${data.color}30`,
                                    marginBottom: 14,
                                }}>
                                    <span style={{ color: data.color, fontSize: 12, fontWeight: 700 }}>FEATURE</span>
                                </div>
                                <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, color: '#F8FAFC', marginBottom: 16, lineHeight: 1.15 }}>
                                    {data.title}
                                </h1>
                                <p style={{ fontSize: 20, color: data.color, fontWeight: 600, marginBottom: 12 }}>{data.tagline}</p>
                                <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.8, maxWidth: 640 }}>{data.hero}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Highlights Grid */}
                <section style={{ padding: '72px 0' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
                            What's <span style={{ background: `linear-gradient(135deg,${data.color},#8B5CF6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>included</span>
                        </h2>
                        <p style={{ color: '#64748B', textAlign: 'center', marginBottom: 48 }}>Every detail, built to work out of the box.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                            {data.highlights.map((h, i) => (
                                <div key={i} style={{
                                    background: '#1E293B', borderRadius: 16, border: '1px solid #334155',
                                    padding: 28, transition: 'border-color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = data.color + '60'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10, background: `${data.color}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                                    }}>
                                        <Zap size={18} color={data.color} />
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{h.heading}</h3>
                                    <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7 }}>{h.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section style={{ padding: '0 0 72px' }}>
                    <div className="container">
                        <div style={{ background: `linear-gradient(135deg, ${data.color}10, rgba(139,92,246,0.08))`, borderRadius: 20, border: '1px solid #334155', padding: '48px 40px' }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>How it works</h2>
                            <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {data.steps.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', flex: '1 1 200px' }}>
                                        <div style={{ textAlign: 'center', padding: '0 16px', flex: 1 }}>
                                            <div style={{
                                                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 14px',
                                                background: `linear-gradient(135deg, ${data.color}, #8B5CF6)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 18, fontWeight: 800, color: 'white',
                                            }}>
                                                {i + 1}
                                            </div>
                                            <p style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 1.6 }}>{step}</p>
                                        </div>
                                        {i < data.steps.length - 1 && <ChevronRight size={22} color="#334155" style={{ flexShrink: 0 }} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ padding: '0 0 96px' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 24 }}>Ready to try {data.title}?</p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link to="/auth?mode=signup" className="btn-gradient" style={{ textDecoration: 'none', fontSize: 16, padding: '13px 28px' }}>
                                    {data.cta} <ArrowRight size={16} />
                                </Link>
                                <Link to="/#features" className="btn-outline" style={{ textDecoration: 'none', padding: '13px 28px', fontSize: 16 }}>
                                    ← All Features
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
