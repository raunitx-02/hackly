import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import { User, Lock, Bell, Trash2, Save, AlertTriangle } from 'lucide-react';

function Section({ title, icon: Icon, children }) {
    return (
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #334155' }}>
                <Icon size={18} color="#3B82F6" />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Toggle({ label, desc, checked, onChange }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
            <div>
                <div style={{ color: '#F8FAFC', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                {desc && <div style={{ color: '#64748B', fontSize: 12 }}>{desc}</div>}
            </div>
            <div
                onClick={() => onChange(!checked)}
                style={{
                    width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                    background: checked ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : '#334155',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
            >
                <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3, left: checked ? 23 : 3,
                    transition: 'left 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { userProfile, currentUser, updateProfile, changePassword } = useAuth();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPw, setSavingPw] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [notifications, setNotifications] = useState({
        emailEvents: true, emailTeams: true, emailJudging: false, pushAll: false,
    });

    const { register: regProfile, handleSubmit: submitProfile, formState: { errors: pe } } = useForm({
        defaultValues: { name: userProfile?.name || '', email: userProfile?.email || '', college: userProfile?.college || '' },
    });

    const { register: regPw, handleSubmit: submitPw, reset: resetPw, formState: { errors: pwe } } = useForm();

    const onProfileSave = async (data) => {
        setSavingProfile(true);
        try {
            await updateProfile({ name: data.name, college: data.college });
            toast.success('Profile updated!');
        } catch (err) { toast.error('Failed: ' + err.message); }
        finally { setSavingProfile(false); }
    };

    const onPasswordSave = async (data) => {
        if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
        setSavingPw(true);
        try {
            await changePassword(data.currentPassword, data.newPassword);
            toast.success('Password changed!');
            resetPw();
        } catch (err) { toast.error('Error: ' + (err.code === 'auth/wrong-password' ? 'Wrong current password' : err.message)); }
        finally { setSavingPw(false); }
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Settings</h1>
                    <p style={{ color: '#64748B', fontSize: 15 }}>Manage your account preferences</p>
                </div>

                {/* Profile */}
                <Section title="Edit Profile" icon={User}>
                    <form onSubmit={submitProfile(onProfileSave)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Avatar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 24, fontWeight: 700, color: 'white', flexShrink: 0,
                                }}>
                                    {(userProfile?.name || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{userProfile?.name}</div>
                                    <div style={{ color: '#64748B', fontSize: 13, textTransform: 'capitalize' }}>{userProfile?.role}</div>
                                </div>
                            </div>
                            <div>
                                <label className="label">Full Name</label>
                                <input className="input" {...regProfile('name', { required: 'Name required' })} />
                                {pe.name && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{pe.name.message}</p>}
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input className="input" value={currentUser?.email || ''} disabled style={{ opacity: 0.6 }} />
                                <p style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>Email cannot be changed here</p>
                            </div>
                            <div>
                                <label className="label">College / Institution</label>
                                <input className="input" {...regProfile('college')} />
                            </div>
                            <button type="submit" disabled={savingProfile} className="btn-gradient" style={{ alignSelf: 'flex-start', minHeight: 44 }}>
                                <Save size={15} />
                                {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Password */}
                <Section title="Change Password" icon={Lock}>
                    <form onSubmit={submitPw(onPasswordSave)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="label">Current Password</label>
                                <input type="password" className="input" {...regPw('currentPassword', { required: 'Required' })} />
                                {pwe.currentPassword && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{pwe.currentPassword.message}</p>}
                            </div>
                            <div>
                                <label className="label">New Password</label>
                                <input type="password" className="input" {...regPw('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
                                {pwe.newPassword && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{pwe.newPassword.message}</p>}
                            </div>
                            <div>
                                <label className="label">Confirm New Password</label>
                                <input type="password" className="input" {...regPw('confirmPassword', { required: 'Required' })} />
                            </div>
                            <button type="submit" disabled={savingPw} className="btn-gradient" style={{ alignSelf: 'flex-start', minHeight: 44 }}>
                                {savingPw ? 'Saving...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Notifications */}
                <Section title="Notifications" icon={Bell}>
                    <Toggle label="Event updates" desc="Get notified about events you're registered for" checked={notifications.emailEvents} onChange={v => setNotifications(n => ({ ...n, emailEvents: v }))} />
                    <Toggle label="Team invites & updates" desc="Notifications about team activities" checked={notifications.emailTeams} onChange={v => setNotifications(n => ({ ...n, emailTeams: v }))} />
                    <Toggle label="Judging notifications" desc="Alerts when your submissions are reviewed" checked={notifications.emailJudging} onChange={v => setNotifications(n => ({ ...n, emailJudging: v }))} />
                    <Toggle label="Push notifications" desc="Browser push notifications for all activity" checked={notifications.pushAll} onChange={v => setNotifications(n => ({ ...n, pushAll: v }))} />
                    <button onClick={() => toast.success('Notification preferences saved')} className="btn-gradient" style={{ marginTop: 20, minHeight: 44 }}>
                        <Save size={15} /> Save Preferences
                    </button>
                </Section>

                {/* Danger Zone */}
                <div style={{ background: '#1E293B', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertTriangle size={18} color="#EF4444" />
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#EF4444' }}>Danger Zone</h3>
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
                        Permanently delete your account and all associated data. <strong>This action cannot be undone.</strong>
                    </p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="input"
                            placeholder='Type "DELETE" to confirm'
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            style={{ flex: 1, minWidth: 200, borderColor: deleteConfirm === 'DELETE' ? '#EF4444' : '#334155' }}
                        />
                        <button
                            disabled={deleteConfirm !== 'DELETE'}
                            onClick={() => toast.error('Feature requires re-auth — connect your Firebase')}
                            style={{
                                padding: '12px 20px', borderRadius: 9999, border: '1px solid #EF4444',
                                background: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.15)' : 'transparent',
                                color: '#EF4444', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                                opacity: deleteConfirm === 'DELETE' ? 1 : 0.5, fontSize: 14, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 8, minHeight: 44,
                            }}
                        >
                            <Trash2 size={15} /> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
