import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #334155' }}>{title}</h2>
            {children}
        </div>
    );
}
function P({ children }) { return <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.9, marginBottom: 12 }}>{children}</p>; }

export default function GDPRPage() {
    return (
        <div style={{ background: '#0F172A', minHeight: '100vh' }}>
            <div style={{ paddingTop: 80 }}>
                <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid #334155' }}>
                    <div className="container">
                        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 12 }}>GDPR Compliance</h1>
                        <p style={{ color: '#64748B', fontSize: 14 }}>Last updated: March 8, 2026</p>
                    </div>
                </section>
                <section style={{ padding: '64px 0 96px' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '18px 22px', marginBottom: 40 }}>
                            <p style={{ color: '#34d399', fontSize: 14, lineHeight: 1.7 }}>
                                <strong>Note:</strong> Hackly is primarily built for Indian colleges and users. While we are not legally required to comply with GDPR (which applies to EU residents), we voluntarily follow GDPR principles as a best practice for all users globally.
                            </p>
                        </div>
                        <Section title="Your Rights Under GDPR Principles">
                            <P>Regardless of your location, Hackly respects the following rights:</P>
                            {[
                                ['Right to Access', 'Request a copy of all personal data we hold about you.'],
                                ['Right to Rectification', 'Correct any inaccurate personal data by updating your profile settings.'],
                                ['Right to Erasure', 'Request deletion of your account and all associated data.'],
                                ['Right to Data Portability', 'Request your data in a portable, machine-readable format (JSON).'],
                                ['Right to Object', 'Object to us processing your data for any non-essential purpose.'],
                            ].map(([right, desc]) => (
                                <div key={right} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                                    <CheckCircle size={16} color="#10B981" style={{ marginTop: 3, flexShrink: 0 }} />
                                    <div>
                                        <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>{right}: </span>
                                        <span style={{ color: '#94A3B8', fontSize: 15 }}>{desc}</span>
                                    </div>
                                </div>
                            ))}
                        </Section>
                        <Section title="Legal Basis for Processing">
                            <P><strong style={{ color: '#F8FAFC' }}>Contract:</strong> We process your data to provide the Hackly service you signed up for.</P>
                            <P><strong style={{ color: '#F8FAFC' }}>Legitimate Interest:</strong> We process aggregated usage data to improve the platform.</P>
                            <P><strong style={{ color: '#F8FAFC' }}>Consent:</strong> For any optional marketing communications, we obtain explicit consent first.</P>
                        </Section>
                        <Section title="Data Transfers">
                            <P>Your data is stored on Google Firebase (US-based servers). Google maintains Standard Contractual Clauses (SCCs) for GDPR-compliant data transfers from the EU/EEA.</P>
                        </Section>
                        <Section title="How to Exercise Your Rights">
                            <P>To exercise any of the above rights, email hello@hackly.online with the subject line "GDPR Request". We will respond within 30 days.</P>
                        </Section>
                        <div style={{ marginTop: 16, paddingTop: 24, borderTop: '1px solid #334155' }}>
                            <p style={{ color: '#64748B', fontSize: 14 }}>
                                See also: <Link to="/privacy" style={{ color: '#3B82F6', textDecoration: 'none' }}>Privacy Policy</Link> · <Link to="/terms" style={{ color: '#3B82F6', textDecoration: 'none' }}>Terms of Service</Link> · <Link to="/cookies" style={{ color: '#3B82F6', textDecoration: 'none' }}>Cookie Policy</Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
