import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
    const { id: eventId } = useParams();
    const [scores, setScores] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [teams, setTeams] = useState({});
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Real-time listener
        const scoreQ = query(collection(db, 'scores'), where('eventId', '==', eventId));
        const unsubScores = onSnapshot(scoreQ, (snap) => {
            setScores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        const subQ = query(collection(db, 'submissions'), where('eventId', '==', eventId));
        const unsubSubs = onSnapshot(subQ, (snap) => {
            const map = {};
            snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
            setSubmissions(map);
        });

        const teamQ = query(collection(db, 'teams'), where('eventId', '==', eventId));
        const unsubTeams = onSnapshot(teamQ, (snap) => {
            const map = {};
            snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
            setTeams(map);
        });

        return () => { unsubScores(); unsubSubs(); unsubTeams(); };
    }, [eventId]);

    // Aggregate scores by submission
    const aggregated = Object.values(
        scores.reduce((acc, score) => {
            const sub = submissions[score.submissionId];
            if (!sub) return acc;
            if (!acc[score.submissionId]) {
                acc[score.submissionId] = { submissionId: score.submissionId, sub, scores: [], total: 0, count: 0 };
            }
            acc[score.submissionId].scores.push(score);
            acc[score.submissionId].total += score.totalScore;
            acc[score.submissionId].count += 1;
            return acc;
        }, {})
    )
        .map(entry => ({ ...entry, avg: entry.count ? entry.total / entry.count : 0 }))
        .sort((a, b) => b.avg - a.avg);

    const top3 = aggregated.slice(0, 3);
    const rest = aggregated.slice(3);

    const PodiumItem = ({ entry, rank }) => {
        const heights = { 1: 120, 2: 90, 3: 70 };
        const colors = { 1: '#F59E0B', 2: '#94A3B8', 3: '#CD7F32' };
        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        const teamName = entry?.sub?.teamId ? teams[entry.sub.teamId]?.teamName : '—';
        const order = { 1: 2, 2: 1, 3: 3 }; // 2nd left, 1st center, 3rd right

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', order: order[rank], flex: 1 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{medals[rank]}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#F8FAFC', marginBottom: 2, textAlign: 'center' }}>
                    {teamName || entry?.sub?.projectName || '—'}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: colors[rank], marginBottom: 10 }}>
                    {entry ? entry.avg.toFixed(1) : '—'}
                </div>
                <div style={{
                    width: '100%', height: heights[rank],
                    background: `linear-gradient(180deg, ${colors[rank]}40, ${colors[rank]}20)`,
                    border: `1px solid ${colors[rank]}60`, borderRadius: '8px 8px 0 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 800, color: `${colors[rank]}80`,
                }}>
                    {rank}
                </div>
            </div>
        );
    };

    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 88 }}>
                <div className="container" style={{ paddingBottom: 80 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
                                🏆 Live Leaderboard
                            </h1>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse-dot 1s ease-in-out infinite' }} className="animate-pulse-dot" />
                            <span style={{ color: '#f87171', fontWeight: 700, fontSize: 13 }}>LIVE</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px 0' }}>
                            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                            <p style={{ color: '#64748B' }}>Loading leaderboard...</p>
                        </div>
                    ) : aggregated.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', background: '#1E293B', borderRadius: 16, border: '1px solid #334155' }}>
                            <Trophy size={48} color="#334155" style={{ marginBottom: 16 }} />
                            <h3 style={{ color: '#94A3B8', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No scores yet</h3>
                            <p style={{ color: '#64748B' }}>Scores will appear here as judges review submissions.</p>
                        </div>
                    ) : (
                        <>
                            {/* Podium */}
                            {top3.length > 0 && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
                                    border: '1px solid #334155', borderRadius: 20, padding: '40px 32px',
                                    marginBottom: 32,
                                }}>
                                    <h2 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#94A3B8', marginBottom: 32, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        🏆 Top Performers
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, maxWidth: 560, margin: '0 auto' }}>
                                        {[2, 1, 3].map(rank => {
                                            const entry = aggregated[rank - 1];
                                            return entry ? <PodiumItem key={rank} entry={entry} rank={rank} /> : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Rankings Table */}
                            <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155' }}>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>Full Rankings</h2>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #334155' }}>
                                                {['Rank', 'Team', 'Project', 'Avg Score', 'Reviews'].map(h => (
                                                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {aggregated.map((entry, i) => {
                                                const rank = i + 1;
                                                const teamName = entry.sub?.teamId ? teams[entry.sub.teamId]?.teamName : '—';
                                                const medals = ['🥇', '🥈', '🥉'];
                                                return (
                                                    <tr key={entry.submissionId} style={{ borderBottom: '1px solid #334155' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={{ padding: '14px 20px' }}>
                                                            <span style={{ fontSize: rank <= 3 ? 20 : 14, fontWeight: 700, color: rank <= 3 ? '#F59E0B' : '#94A3B8' }}>
                                                                {rank <= 3 ? medals[rank - 1] : `#${rank}`}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '14px 20px', color: '#F8FAFC', fontSize: 14, fontWeight: 600 }}>
                                                            {teamName}
                                                        </td>
                                                        <td style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 14 }}>
                                                            {entry.sub?.projectName || '—'}
                                                        </td>
                                                        <td style={{ padding: '14px 20px' }}>
                                                            <span style={{
                                                                fontSize: 16, fontWeight: 800,
                                                                color: rank === 1 ? '#F59E0B' : rank === 2 ? '#94A3B8' : rank === 3 ? '#CD7F32' : '#3B82F6',
                                                            }}>
                                                                {entry.avg.toFixed(1)}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '14px 20px', color: '#64748B', fontSize: 14 }}>
                                                            {entry.count} judge{entry.count !== 1 ? 's' : ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
        </div>
    );
}
