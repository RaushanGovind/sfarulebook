import React, { useEffect, useState } from 'react';
import { BookOpen, User, ArrowRight, Activity, Users, Globe } from 'lucide-react';

export default function LandingPage({ onEnter, onLogin, language, onLanguageToggle }) {
    const isHindi = language === 'hi';

    const content = {
        title: isHindi ? 'नियमों में महारत हासिल करें।' : 'Master the Rules.',
        subtitle: isHindi ? 'सुरक्षा के साथ नेतृत्व करें।' : 'Lead with Safety.',
        description: isHindi
            ? 'आधिकारिक डिजिटल SFA नियम पुस्तिका। सक्रिय ब्राउज़ करें, वास्तविक समय के संशोधनों के साथ अपडेट रहें, और अनुमोदित सुरक्षा प्रोटोकॉल तक तुरंत पहुंचें।'
            : 'The official digital SFA Rules Book. Browse active rules, stay updated with real-time amendments, and access approved safety protocols instantly.',
        browseBtn: isHindi ? 'सक्रिय नियम ब्राउज़ करें' : 'Browse Active Rules',
        loginBtn: isHindi ? 'सदस्य लॉगिन' : 'Member Login',
        feat1Title: isHindi ? 'हमेशा सक्रिय' : 'Always Active',
        feat1Desc: isHindi ? 'केवल वर्तमान, अनुमोदित नियमों तक पहुंचें। पुराने ड्राफ्ट के साथ कोई भ्रम नहीं।' : 'Access only current, approved rules. No confusion with obsolete drafts.',
        feat2Title: isHindi ? 'समुदाय संचालित' : 'Community Driven',
        feat2Desc: isHindi ? 'हमारे समर्पित सदस्य आधार से आम सहमति से अनुमोदित नियम।' : 'Rules approved by consensus from our dedicated member base.',
        privacyTitle: isHindi ? 'सदस्य निर्देशिका निजी है' : 'Member Directory is Private',
        privacyDesc: isHindi
            ? 'हमारे समुदाय की सुरक्षा के लिए, पंजीकृत सदस्यों की सूची और सक्रिय नियम केवल लॉग-इन सदस्यों को ही दिखाई देते हैं।'
            : 'To protect our community, the list of registered members and active rules are only visible to logged-in members.'
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#1e293b'
        }}>
            {/* Header / Hero */}
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 40px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
                position: 'fixed', width: '100%', top: 0, zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <BookOpen size={24} color="#2563eb" />
                    <span style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SFA Rules Book
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onLanguageToggle}
                        className="landing-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Globe size={18} /> {language.toUpperCase()}
                    </button>
                    <button
                        onClick={onLogin}
                        className="landing-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <User size={18} /> {content.loginBtn}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '120px 20px 60px', textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, color: '#0f172a' }}>
                        {content.title} <br />
                        <span style={{ color: '#2563eb' }}>{content.subtitle}</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '40px', lineHeight: 1.6 }}>
                        {content.description}
                    </p>

                    <button
                        onClick={onEnter}
                        className="landing-btn-primary"
                        style={{ fontSize: '1.2rem', padding: '16px 40px' }}
                    >
                        {content.browseBtn} <ArrowRight size={20} />
                    </button>
                </div>

                {/* Features / Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px', width: '100%', maxWidth: '1000px', marginBottom: '60px'
                }}>
                    <div className="feature-card">
                        <div className="icon-wrapper"><Activity size={32} /></div>
                        <h3>{content.feat1Title}</h3>
                        <p>{content.feat1Desc}</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-wrapper"><Users size={32} /></div>
                        <h3>{content.feat2Title}</h3>
                        <p>{content.feat2Desc}</p>
                    </div>
                </div>

                {/* Registered Members Section Removed from Public View as requested */}
                <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', opacity: 0.8 }}>
                    <div style={{ padding: '40px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                        <Users size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{content.privacyTitle}</h2>
                        <p style={{ color: '#64748b' }}>{content.privacyDesc}</p>
                    </div>
                </div>

            </main>

            <footer style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} SFA Rules Book. All rights reserved.
            </footer>

            <style>{`
                .landing-btn-primary {
                    background: #2563eb; color: white; border: none; padding: 12px 24px; 
                    border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
                    display: inline-flex; alignItems: center; gap: 8px;
                }
                .landing-btn-primary:hover {
                    background: #1d4ed8; transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
                }

                .landing-btn-secondary {
                    background: white; color: #1e293b; border: 1px solid #e2e8f0; padding: 10px 20px; 
                    border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                }
                .landing-btn-secondary:hover {
                    background: #f1f5f9; border-color: #cbd5e1;
                }

                .feature-card {
                    background: white; padding: 32px; border-radius: 20px; text-align: left;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid rgba(255,255,255,0.5);
                }
                .feature-card h3 { font-size: 1.25rem; margin: 16px 0 8px; color: #1e293b; }
                .feature-card p { color: #64748b; line-height: 1.5; }
                .icon-wrapper { 
                    width: 56px; height: 56px; background: #eff6ff; color: #2563eb; 
                    border-radius: 16px; display: flex; align-items: center; justifyContent: center;
                }

                @media (max-width: 640px) {
                    h1 { font-size: 2.5rem !important; }
                    header { padding: 16px 20px !important; }
                }
            `}</style>
        </div>
    );
}
