function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #334155' }}>{title}</h2>
            {children}
        </div>
    );
}
function P({ children }) { return <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.9, marginBottom: 12 }}>{children}</p>; }

export default function PrivacyPage() {
    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid #334155' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 12 }}>Privacy Policy</h1>
                        <p style={{ color: '#64748B', fontSize: 14 }}>Last updated: March 8, 2026 · Effective: March 8, 2026</p>
                    </div>
                </section>
                <section style={{ padding: '64px 0 96px' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <Section title="1. Introduction">
                            <P>Hackly ("we", "us", "our") operates hackly.online. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.</P>
                        </Section>
                        <Section title="2. Information We Collect">
                            <P><strong style={{ color: '#F8FAFC' }}>Account Information:</strong> When you sign up, we collect your name, email address, and role (Organizer, Participant, or Judge).</P>
                            <P><strong style={{ color: '#F8FAFC' }}>Event Data:</strong> Event details, submissions, team information, and scores you create or contribute to on the platform.</P>
                            <P><strong style={{ color: '#F8FAFC' }}>Usage Data:</strong> Pages visited, features used, and device/browser information — collected anonymously to improve the product.</P>
                        </Section>
                        <Section title="3. How We Use Your Information">
                            <P>• To provide and operate the Hackly platform</P>
                            <P>• To send transactional emails (event registrations, team invites, score notifications)</P>
                            <P>• To improve our product and fix bugs</P>
                            <P>• To respond to support requests</P>
                            <P>We do <strong style={{ color: '#F8FAFC' }}>not</strong> sell your personal data to third parties. Ever.</P>
                        </Section>
                        <Section title="4. Data Storage">
                            <P>All data is stored securely on Google Firebase (Firestore) with servers in the US. Firebase is SOC 2 Type II and ISO 27001 certified.</P>
                        </Section>
                        <Section title="5. Data Retention">
                            <P>We retain your account data as long as your account is active. You can request deletion of your account and all associated data at any time by emailing hello@hackly.online.</P>
                        </Section>
                        <Section title="6. Cookies">
                            <P>We use essential cookies for authentication (Firebase Auth session tokens). We do not use advertising or tracking cookies. See our <a href="/cookies" style={{ color: '#3B82F6' }}>Cookie Policy</a> for details.</P>
                        </Section>
                        <Section title="7. Your Rights">
                            <P>You have the right to access, correct, and delete your personal data. To exercise these rights, contact us at hello@hackly.online.</P>
                        </Section>
                        <Section title="8. Contact">
                            <P>For any privacy-related questions, email hello@hackly.online or visit our <a href="/contact" style={{ color: '#3B82F6' }}>contact page</a>.</P>
                        </Section>
                    </div>
                </section>
            </div>
        </div>
    );
}
