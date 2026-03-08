function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #334155' }}>{title}</h2>
            {children}
        </div>
    );
}
function P({ children }) { return <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.9, marginBottom: 12 }}>{children}</p>; }

export default function CookiePage() {
    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid #334155' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 12 }}>Cookie Policy</h1>
                        <p style={{ color: '#64748B', fontSize: 14 }}>Last updated: March 8, 2026</p>
                    </div>
                </section>
                <section style={{ padding: '64px 0 96px' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <Section title="What Are Cookies?">
                            <P>Cookies are small text files stored in your browser when you visit a website. They help websites remember your preferences and keep you logged in.</P>
                        </Section>
                        <Section title="Cookies We Use">
                            <P><strong style={{ color: '#F8FAFC' }}>Authentication Cookies (Essential):</strong> Firebase Auth stores a session token in localStorage to keep you logged in across page reloads. These are strictly necessary for the app to function.</P>
                            <P><strong style={{ color: '#F8FAFC' }}>Preference Cookies (Essential):</strong> We may store UI preferences (e.g. which dashboard tab you last viewed) in localStorage. No personal data is stored.</P>
                            <P>We do <strong style={{ color: '#F8FAFC' }}>not</strong> use advertising cookies, analytics tracking cookies, or third-party marketing cookies.</P>
                        </Section>
                        <Section title="Third-party Cookies">
                            <P>Firebase (Google) may set cookies as part of their authentication service. Please refer to <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>Firebase's Privacy Policy</a> for details on cookies they set.</P>
                        </Section>
                        <Section title="Managing Cookies">
                            <P>You can control cookies through your browser settings. Note that disabling authentication cookies will prevent you from staying logged in to Hackly.</P>
                        </Section>
                        <Section title="Contact">
                            <P>Questions about our cookie usage? Email hello@hackly.online.</P>
                        </Section>
                    </div>
                </section>
            </div>
        </div>
    );
}
