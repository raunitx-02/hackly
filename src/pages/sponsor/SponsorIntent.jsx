import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SPONSOR_CONFIG } from '../../data/sponsorConfig';
import toast from 'react-hot-toast';
import { Target, CheckCircle } from 'lucide-react';

export default function SponsorIntent() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Intent State
    const [themes, setThemes] = useState([]);
    const [skills, setSkills] = useState([]);
    const [audience, setAudience] = useState([]);
    const [outcomes, setOutcomes] = useState([]);

    useEffect(() => {
        const loadIntent = async () => {
            if (!currentUser) return;
            try {
                const docSnap = await getDoc(doc(db, 'sponsorIntent', currentUser.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.themes) setThemes(data.themes);
                    if (data.skills) setSkills(data.skills);
                    if (data.audience) setAudience(data.audience);
                    if (data.outcomes) setOutcomes(data.outcomes);
                }
            } catch (err) {
                console.error("Failed to load intent:", err);
            } finally {
                setLoading(false);
            }
        };
        loadIntent();
    }, [currentUser]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'sponsorIntent', currentUser.uid), {
                sponsorId: currentUser.uid,
                themes,
                skills,
                audience,
                outcomes,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            toast.success("Intent Profile updated!");
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const toggleTag = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    if (loading) return <div style={{ color: '#94A3B8' }}>Loading your profile...</div>;

    const TagSection = ({ title, desc, options, selected, onToggle }) => (
        <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: 32, marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>{title}</h3>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{desc}</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {options.map(opt => {
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => onToggle(opt)}
                            style={{
                                padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                                background: isSelected ? 'rgba(59,130,246,0.15)' : '#0F172A',
                                border: `1px solid ${isSelected ? '#3B82F6' : '#334155'}`,
                                color: isSelected ? '#60A5FA' : '#94A3B8',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {isSelected && <CheckCircle size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />}
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                    <Target size={16} /> Matchmaking Profile
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 12 }}>Sponsorship Intent Builder</h1>
                <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.7, maxWidth: 800 }}>
                    Hackly doesn't just sell logos—we connect you with the right student communities. Define what you care about below, and we'll automatically match you with relevant events and adopted tracks.
                </p>
            </div>

            <TagSection 
                title="Focus Themes" 
                desc="What industries or high-level domains are you targeting?"
                options={SPONSOR_CONFIG.themes}
                selected={themes}
                onToggle={(item) => toggleTag(themes, setThemes, item)}
            />

            <TagSection 
                title="Target Technologies & Skills" 
                desc="What specific tech stacks do you want students to build with (or hire for)?"
                options={SPONSOR_CONFIG.skills}
                selected={skills}
                onToggle={(item) => toggleTag(skills, setSkills, item)}
            />

            <TagSection 
                title="Target Audience" 
                desc="What type of demographics are you trying to reach?"
                options={SPONSOR_CONFIG.audienceTypes}
                selected={audience}
                onToggle={(item) => toggleTag(audience, setAudience, item)}
            />

            <TagSection 
                title="Primary Outcomes" 
                desc="What does success look like for your sponsorship?"
                options={SPONSOR_CONFIG.outcomes}
                selected={outcomes}
                onToggle={(item) => toggleTag(outcomes, setOutcomes, item)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <button onClick={handleSave} disabled={saving} className="btn-gradient" style={{ padding: '14px 28px', fontSize: 15 }}>
                    {saving ? 'Saving Profile...' : 'Save Intent Profile'}
                </button>
            </div>
        </div>
    );
}
