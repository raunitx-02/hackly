import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Shield, Languages, UserMinus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        blockedKeywords: [],
        blockRegistrationForBlacklisted: true,
        strikesBeforeBlacklist: 3,
        autoApprovalEnabled: false
    });
    const [keywordInput, setKeywordInput] = useState('');
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const docSnap = await getDoc(doc(db, 'adminSettings', 'general'));
                if (docSnap.exists()) {
                    setSettings(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await setDoc(doc(db, 'adminSettings', 'general'), {
                ...settings,
                updatedAt: serverTimestamp(),
                updatedBy: currentUser.uid
            });
            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    const addKeyword = () => {
        if (!keywordInput.trim()) return;
        const words = keywordInput.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
        const newKeywords = [...new Set([...settings.blockedKeywords, ...words])];
        setSettings({ ...settings, blockedKeywords: newKeywords });
        setKeywordInput('');
    };

    const removeKeyword = (word) => {
        setSettings({
            ...settings,
            blockedKeywords: settings.blockedKeywords.filter(w => w !== word)
        });
    };

    if (loading) return <div style={{ color: '#94A3B8' }}>Loading settings...</div>;

    const Section = ({ title, icon: Icon, children }) => (
        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 8, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', borderRadius: 8 }}>
                    <Icon size={20} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div style={{ maxWidth: 800 }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>Platform Settings</h1>
                    <p style={{ color: '#94A3B8' }}>Configure content filters, security thresholds, and automation.</p>
                </div>
                <button onClick={handleSave} className="btn-gradient" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px',
                    borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer'
                }}>
                    <Save size={18} /> Save Changes
                </button>
            </div>

            {/* Blocked Keywords */}
            <Section title="Content Filtering" icon={Languages}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: '#94A3B8', fontSize: 14, marginBottom: 8 }}>Add Blocked Keywords (comma separated)</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                            placeholder="e.g. scam, offensive, fake"
                            style={{
                                flex: 1, background: '#0F172A', border: '1px solid #334155',
                                borderRadius: 10, padding: '10px 16px', color: '#F8FAFC'
                            }}
                        />
                        <button onClick={addKeyword} style={{
                            padding: '0 20px', borderRadius: 10, border: 'none',
                            background: '#334155', color: 'white', fontWeight: 600, cursor: 'pointer'
                        }}>Add</button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {settings.blockedKeywords.map(word => (
                        <span key={word} style={{
                            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                            padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            {word}
                            <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeKeyword(word)} />
                        </span>
                    ))}
                    {settings.blockedKeywords.length === 0 && <p style={{ color: '#64748B', fontSize: 14, fontStyle: 'italic' }}>No keywords blocked yet.</p>}
                </div>
            </Section>

            {/* Moderation Policies */}
            <Section title="Moderation & Security" icon={Shield}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>Auto-blacklist threshold</div>
                            <div style={{ color: '#64748B', fontSize: 13 }}>Number of strikes in 24h before automatic account restriction.</div>
                        </div>
                        <input
                            type="number"
                            value={settings.strikesBeforeBlacklist}
                            onChange={(e) => setSettings({ ...settings, strikesBeforeBlacklist: parseInt(e.target.value) })}
                            style={{
                                width: 80, background: '#0F172A', border: '1px solid #334155',
                                borderRadius: 8, padding: '8px 12px', color: '#F8FAFC', textAlign: 'center'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>Block registration for blacklisted users</div>
                            <div style={{ color: '#64748B', fontSize: 13 }}>Prevent restricted users from registering for new events.</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.blockRegistrationForBlacklisted}
                            onChange={(e) => setSettings({ ...settings, blockRegistrationForBlacklisted: e.target.checked })}
                            style={{ width: 20, height: 20, cursor: 'pointer' }}
                        />
                    </div>

                    <div style={{ padding: 16, background: 'rgba(245,158,11,0.05)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: 12 }}>
                        <AlertTriangle size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
                        <p style={{ color: '#F59E0B', fontSize: 13, lineHeight: 1.5 }}>
                            <strong>Note:</strong> Content moderation settings apply globally across all event creation and update flows. Server-side Cloud Functions use these definitions to enforce policies.
                        </p>
                    </div>
                </div>
            </Section>
        </div>
    );
}

const X = ({ size, style, onClick }) => (
    <svg width={size} height={size} style={style} onClick={onClick} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
