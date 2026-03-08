import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Tag } from 'lucide-react';

const POSTS = [
    {
        slug: '#', category: 'Product', date: 'March 6, 2026',
        title: 'Hackly 1.0 is Live — What We Built and Why',
        excerpt: 'After months of building in stealth, we\'re officially launching Hackly — the all-in-one hackathon platform for Indian colleges. Here\'s the full story of what we built and why.',
        readTime: '5 min read', avatar: 'HQ',
    },
    {
        slug: '#', category: 'Guide', date: 'February 28, 2026',
        title: 'How to Run a 2000-Person Hackathon Without Losing Your Mind',
        excerpt: 'Practical tips from organizers who\'ve done it. From registration chaos to judging 300 projects — we cover the operational playbook for large-scale college events.',
        readTime: '8 min read', avatar: 'AK',
    },
    {
        slug: '#', category: 'Tips', date: 'February 18, 2026',
        title: '5 Judging Criteria That Actually Separate Great Projects from Good Ones',
        excerpt: 'Most hackathons use vague rubrics. Here\'s how to build a scoring system that\'s fair, consistent, and gives participants clear feedback.',
        readTime: '4 min read', avatar: 'PS',
    },
    {
        slug: '#', category: 'Community', date: 'February 10, 2026',
        title: 'Why Indian Hackathons are the Best Recruiting Ground for Startups',
        excerpt: 'Sponsors are leaving talent on the table. Here\'s why the best engineering talent in India is discovered at college hackathons — and how to find them.',
        readTime: '6 min read', avatar: 'RG',
    },
    {
        slug: '#', category: 'Product', date: 'January 30, 2026',
        title: 'Real-time Leaderboards: The Psychology Behind Why They Work',
        excerpt: 'A live leaderboard increases participant productivity by 30%. We dug into the research — and explain how we designed Hackly\'s leaderboard to maximize engagement.',
        readTime: '5 min read', avatar: 'HQ',
    },
    {
        slug: '#', category: 'Guide', date: 'January 18, 2026',
        title: 'Sponsorship 101: How to Get Your College Hackathon Funded',
        excerpt: 'Getting sponsors to say yes is a skill. We break down sponsor tiers, how to pitch them, and what numbers to show in your sponsorship deck.',
        readTime: '7 min read', avatar: 'MA',
    },
];

const COLORS = { Product: '#3B82F6', Guide: '#10B981', Tips: '#F59E0B', Community: '#8B5CF6' };

export default function BlogPage() {
    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                <section style={{ padding: '72px 0 56px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid #334155', textAlign: 'center' }}>
                    <div className="container">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 9999, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 20 }}>
                            <BookOpen size={14} color="#3B82F6" />
                            <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>Hackly Blog</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, marginBottom: 16 }}>
                            Insights for{' '}
                            <span style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Event Organizers
                            </span>
                        </h1>
                        <p style={{ color: '#94A3B8', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                            Practical guides, product updates, and community stories from the Hackly team.
                        </p>
                    </div>
                </section>

                <section style={{ padding: '72px 0 96px' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                            {POSTS.map((post, i) => (
                                <article key={i} style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 28, display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s, transform 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B82F680'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                        <span style={{ padding: '3px 10px', borderRadius: 9999, background: `${COLORS[post.category]}20`, color: COLORS[post.category], fontSize: 11, fontWeight: 700 }}>
                                            {post.category}
                                        </span>
                                        <span style={{ color: '#64748B', fontSize: 12 }}>{post.date}</span>
                                    </div>
                                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, lineHeight: 1.5, flex: 1 }}>{post.title}</h2>
                                    <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{post.excerpt}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>{post.avatar}</div>
                                            <span style={{ color: '#64748B', fontSize: 13 }}>{post.readTime}</span>
                                        </div>
                                        <a href={post.slug} style={{ color: '#3B82F6', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Read more <ArrowRight size={13} />
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
