function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #334155' }}>{title}</h2>
            {children}
        </div>
    );
}
function P({ children }) { return <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.9, marginBottom: 12 }}>{children}</p>; }

export default function TermsPage() {
    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid #334155' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 12 }}>Terms of Service</h1>
                        <p style={{ color: '#64748B', fontSize: 14 }}>Last updated: March 8, 2026 · Effective: March 8, 2026</p>
                    </div>
                </section>
                <section style={{ padding: '64px 0 96px' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <Section title="1. Acceptance of Terms">
                            <P>By accessing or using Hackly (hackly.online), you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</P>
                        </Section>
                        <Section title="2. User Accounts">
                            <P>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your password and for all activity under your account.</P>
                        </Section>
                        <Section title="3. Acceptable Use">
                            <P>You agree not to: (a) use the platform for any illegal purpose; (b) upload malicious code; (c) impersonate other users or organisations; (d) scrape or mass-download data without permission.</P>
                        </Section>
                        <Section title="4. Event Organizers">
                            <P>Organizers are responsible for the content of events they create, including problem statements, prize rules, and judging criteria. Hackly does not guarantee prize disbursement — that is the organiser's responsibility.</P>
                        </Section>
                        <Section title="5. Intellectual Property">
                            <P>All project submissions remain the intellectual property of the participants who created them. Hackly does not claim ownership over any user-generated content.</P>
                        </Section>
                        <Section title="6. Limitation of Liability">
                            <P>Hackly is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including event cancellations or data loss.</P>
                        </Section>
                        <Section title="7. Termination">
                            <P>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time.</P>
                        </Section>
                        <Section title="8. Changes to Terms">
                            <P>We may update these Terms periodically. Continued use after changes constitutes acceptance of the new Terms.</P>
                        </Section>
                        <Section title="9. Contact">
                            <P>For questions about these Terms, contact us at hello@hackly.online.</P>
                        </Section>
                    </div>
                </section>
            </div>
        </div>
    );
}
