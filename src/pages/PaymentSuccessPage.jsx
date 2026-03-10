import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkles, Check } from 'lucide-react';
import { PRICING_PLANS } from '../data/pricingConfig';

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const planName = searchParams.get('plan') || 'Pro';

    const plan = PRICING_PLANS.find(p => p.name === planName) || PRICING_PLANS[1];
    const features = plan.features || [];

    const [visibleFeatures, setVisibleFeatures] = useState([]);

    useEffect(() => {
        // Staggered animation
        features.forEach((feature, index) => {
            setTimeout(() => {
                setVisibleFeatures(prev => [...prev, feature]);
            }, 800 + (index * 400)); // Start after 800ms, then 400ms per feature
        });
    }, [features]);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
           {/* Cool CSS background overlay */}
           <div style={{
                position: 'absolute',
                width: 600,
                height: 600,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                animation: 'pulseGlow 3s ease-in-out infinite alternate'
            }} />

           <div style={{
               background: '#1E293B',
               border: '1px solid #334155',
               borderRadius: 24,
               padding: '48px 40px',
               width: '100%',
               maxWidth: 520,
               position: 'relative',
               zIndex: 1,
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
               textAlign: 'center'
           }}>
              <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 0 30px rgba(16,185,129,0.4)',
                  animation: 'popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}>
                  <Check size={40} color="white" style={{ animation: 'checkDraw 0.6s ease-out 0.4s both' }} />
              </div>
              
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#F8FAFC', marginBottom: 12, animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
                  Congratulations! 🎉
              </h1>
              <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 32, animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
                  You are now on the <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{plan.name}</span> plan. Welcome aboard!
              </p>

              <div style={{ textAlign: 'left', background: 'rgba(15,23,42,0.5)', borderRadius: 16, padding: '24px', marginBottom: 32, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
                      <Sparkles size={18} color="#3B82F6" />
                      <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>Features Unlocked</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {features.map((feature, index) => (
                          <div key={index} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              opacity: visibleFeatures.includes(feature) ? 1 : 0,
                              transform: visibleFeatures.includes(feature) ? 'translateX(0)' : 'translateX(-10px)',
                              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}>
                              <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2, filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.4))' }} />
                              <span style={{ color: '#E2E8F0', fontSize: 14, lineHeight: 1.5, textShadow: '0 0 20px rgba(255,255,255,0.05)' }}>{feature}</span>
                          </div>
                      ))}
                  </div>
              </div>

              <button 
                  onClick={() => navigate('/dashboard')}
                  className="btn-gradient"
                  style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: 16,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      animation: 'fadeInUp 0.6s ease-out 1s both' /* Delayed button appearance */
                  }}
              >
                  Go to Dashboard <ArrowRight size={18} />
              </button>
           </div>

           <style>{`
             @keyframes pulseGlow {
                 0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.5; }
                 100% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.8; }
             }
             @keyframes popIn {
                 0% { transform: scale(0.5); opacity: 0; }
                 70% { transform: scale(1.1); opacity: 1; }
                 100% { transform: scale(1); opacity: 1; }
             }
             @keyframes checkDraw {
                 0% { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; }
                 100% { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; }
             }
             @keyframes fadeInUp {
                 0% { transform: translateY(20px); opacity: 0; }
                 100% { transform: translateY(0); opacity: 1; }
             }
           `}</style>
        </div>
    );
}
