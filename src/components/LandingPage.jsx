import React, { useEffect, useState } from 'react';
import { BookOpen, User, ArrowRight, Activity, Users, Globe, Hammer, ShieldCheck, Scale } from 'lucide-react';

export default function LandingPage({ onEnter, onLogin, language, onLanguageToggle }) {
    const isHindi = language === 'hi';

    const content = {
        badge: isHindi ? 'विकास चरण (निर्माणाधीन)' : 'Development Phase (Under Construction)',
        title: isHindi ? 'SFA नियमों का भविष्य तय करें।' : 'Shaping the Future of SFA Rules.',
        subtitle: isHindi ? 'सहयोग से बनेगी बेहतर व्यवस्था।' : 'Building a Better System via Consensus.',
        description: isHindi
            ? 'SFA Rules Book वर्तमान में विकास के अधीन है। यह एक विशेष मंच है जिसे सदस्यों को सामूहिक रूप से नियम (Bylaws) प्रस्तावित करने, उन पर चर्चा करने और आम सहमति बनाने में मदद करने के लिए बनाया गया है।'
            : 'SFA Rules Book is currently under development. This is a dedicated platform designed to help members collectively propose, debate, and reach a consensus on SFA Bylaws and operational rules.',
        browseBtn: isHindi ? 'सक्रिय नियम एवं ड्राफ्ट देखें' : 'View Active Rules & Drafts',
        loginBtn: isHindi ? 'सदस्य लॉगिन' : 'Member Login',

        featureTitle: isHindi ? 'यह प्लेटफॉर्म क्यों बनाया गया है?' : 'Why this Platform?',

        feat1Title: isHindi ? 'लोकतांत्रिक नियम निर्माण' : 'Democratic Lawmaking',
        feat1Desc: isHindi
            ? 'कोई भी ऑथराइज्ड एडमिन नए नियम का प्रस्ताव दे सकता है, जिस पर सभी सदस्य अपनी सहमति (Consent) दे सकते हैं।'
            : 'Any authorized admin can propose new rules, which all members can then review and provide their digital consent.',

        feat2Title: isHindi ? 'पारदर्शिता और रिकॉर्ड' : 'Transparency & Records',
        feat2Desc: isHindi
            ? 'हर संशोधन का इतिहास सुरक्षित रहता है। आप देख सकते हैं कि कौन सा नियम कब और क्यों बदला गया।'
            : 'Every amendment has a clear history. You can track when and why a rule was changed, ensuring full accountability.',

        feat3Title: isHindi ? 'संसदीय कार्यप्रणाली' : 'Consensus Mechanism',
        feat3Desc: isHindi
            ? 'जब तक कोर कमेटी और सदस्य बहुमत से सहमत नहीं होते, नियम "Live" नहीं होता। यह पक्षपात को रोकता है।'
            : 'A rule only goes "Live" after core committee approval and member consensus, preventing arbitrary decisions.',

        disclaimerTitle: isHindi ? 'महत्वपूर्ण सूचना' : 'Important Notice',
        disclaimerDesc: isHindi
            ? 'यह अभी आधिकारिक नियम पुस्तिका नहीं है। यहाँ मौजूद सामग्री केवल चर्चा और विकास के उद्देश्य से है। अंतिम नियमों की घोषणा कोर कमेटी द्वारा आधिकारिक तौर पर की जाएगी।'
            : 'This is not yet an official rulebook. The content provided here is for discussion and development purposes only. Final rules will be officially declared by the Core Committee.',

        privacyTitle: isHindi ? 'सुरक्षित और निजी' : 'Secure & Private',
        privacyDesc: isHindi
            ? 'प्रस्तावों, सदस्य विवरण और विस्तृत चर्चाओं तक पहुँच केवल पंजीकृत सदस्यों के लिए आरक्षित है।'
            : 'Access to proposals, member details, and detailed discussions is strictly reserved for registered members.'
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            color: '#1e293b'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 40px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
                position: 'fixed', width: '100%', top: 0, zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <BookOpen size={24} color="#2563eb" />
                    <span style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SFA Rules Portal
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
                padding: '140px 20px 60px', textAlign: 'center'
            }}>
                <div style={{ maxWidth: '900px', marginBottom: '60px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: '#fef3c7', color: '#92400e', padding: '6px 16px',
                        borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                        marginBottom: '24px', border: '1px solid #fcd34d'
                    }}>
                        <Hammer size={16} /> {content.badge}
                    </div>

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

                {/* Purpose Section */}
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '40px', color: '#1e293b' }}>
                    {content.featureTitle}
                </h2>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px', width: '100%', maxWidth: '1100px', marginBottom: '60px'
                }}>
                    <div className="feature-card">
                        <div className="icon-wrapper"><Scale size={32} /></div>
                        <h3>{content.feat1Title}</h3>
                        <p>{content.feat1Desc}</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-wrapper"><Activity size={32} /></div>
                        <h3>{content.feat2Title}</h3>
                        <p>{content.feat2Desc}</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-wrapper"><ShieldCheck size={32} /></div>
                        <h3>{content.feat3Title}</h3>
                        <p>{content.feat3Desc}</p>
                    </div>
                </div>

                {/* Disclaimer / Privacy Info */}
                <div style={{
                    width: '100%', maxWidth: '1100px', margin: '0 auto', display: 'flex',
                    flexDirection: 'column', gap: '20px'
                }}>
                    <div style={{
                        padding: '30px', background: '#fffbeb', borderRadius: '20px',
                        border: '1px solid #fef3c7', textAlign: 'left', display: 'flex', gap: '20px', alignItems: 'center'
                    }}>
                        <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '12px', color: '#92400e' }}>
                            <Hammer size={32} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 8px', color: '#92400e' }}>{content.disclaimerTitle}</h3>
                            <p style={{ margin: 0, color: '#b45309', fontSize: '0.95rem' }}>{content.disclaimerDesc}</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '30px', background: 'white', borderRadius: '20px',
                        border: '1px dashed #cbd5e1', textAlign: 'left', display: 'flex', gap: '20px', alignItems: 'center', opacity: 0.9
                    }}>
                        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '12px', color: '#475569' }}>
                            <Users size={32} />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>{content.privacyTitle}</h3>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{content.privacyDesc}</p>
                        </div>
                    </div>
                </div>

            </main>

            <footer style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} SFA Rules Management System. All rights reserved.
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
                .feature-card p { color: #64748b; line-height: 1.6; font-size: 0.95rem; }
                .icon-wrapper { 
                    width: 56px; height: 56px; background: #eff6ff; color: #2563eb; 
                    border-radius: 16px; display: flex; align-items: center; justifyContent: center;
                }

                @media (max-width: 640px) {
                    h1 { font-size: 2.2rem !important; }
                    header { padding: 16px 20px !important; }
                    .landing-btn-secondary span { display: none; }
                }
            `}</style>
        </div>
    );
}
