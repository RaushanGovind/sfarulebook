import React, { useEffect, useState } from 'react';
import { BookOpen, User, ArrowRight, Activity, Users } from 'lucide-react';

export default function LandingPage({ onEnter, onLogin }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.PROD
        ? 'https://sfa-rules-book.vercel.app/api'
        : 'http://127.0.0.1:5000/api';

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${API_URL}/public/members`);
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data);
                }
            } catch (error) {
                console.error("Failed to load members", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [API_URL]);

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
                padding: '24px 40px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
                position: 'fixed', width: '100%', top: 0, zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '1.4rem' }}>
                    <BookOpen size={28} color="#2563eb" />
                    <span style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SFA Rules Book
                    </span>
                </div>
                <div>
                    <button
                        onClick={onLogin}
                        className="landing-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <User size={18} /> Member Login
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
                        Master the Rules. <br />
                        <span style={{ color: '#2563eb' }}>Lead with Safety.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '40px', lineHeight: 1.6 }}>
                        The official digital SFA Rules Book. Browse active rules, stay updated with real-time amendments, and access approved safety protocols instantly.
                    </p>

                    <button
                        onClick={onEnter}
                        className="landing-btn-primary"
                        style={{ fontSize: '1.2rem', padding: '16px 40px' }}
                    >
                        Browse Active Rules <ArrowRight size={20} />
                    </button>
                </div>

                {/* Features / Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px', width: '100%', maxWidth: '1000px', marginBottom: '60px'
                }}>
                    <div className="feature-card">
                        <div className="icon-wrapper"><Activity size={32} /></div>
                        <h3>Always Active</h3>
                        <p>Access only current, approved rules. No confusion with obsolete drafts.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-wrapper"><Users size={32} /></div>
                        <h3>Community Driven</h3>
                        <p>Rules approved by consensus from our dedicated member base.</p>
                    </div>
                </div>

                {/* Registered Members Ticker / List */}
                <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '30px', fontWeight: 700 }}>Our Registered Members</h2>

                    {loading ? (
                        <div style={{ color: '#94a3b8' }}>Loading directory...</div>
                    ) : members.length > 0 ? (
                        <div className="members-grid">
                            {members.map((m) => (
                                <div key={m.userId} className="member-card">
                                    <div className="member-avatar">
                                        {m.fullName ? m.fullName[0].toUpperCase() : (m.username ? m.username[0].toUpperCase() : '?')}
                                    </div>
                                    <div className="member-info">
                                        <div className="member-name">{m.fullName || m.username || 'Member'}</div>
                                        <div className="member-meta">
                                            <span>{m.userId}</span> •
                                            <span>{m.headquarter || 'HQ N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8' }}>No members registered yet.</div>
                    )}
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

                .members-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 16px;
                }
                .member-card {
                    background: white; padding: 16px; border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
                    display: flex; align-items: center; gap: 12px; transition: transform 0.2s;
                }
                .member-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .member-avatar {
                    width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white; border-radius: 50%; display: flex; align-items: center; justifyContent: center;
                    font-weight: 700; font-size: 1.1rem; flex-shrink: 0;
                }
                .member-info { text-align: left; overflow: hidden; }
                .member-name { font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .member-meta { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }

                @media (max-width: 640px) {
                    h1 { font-size: 2.5rem !important; }
                    .header { padding: 16px 20px !important; }
                }
            `}</style>
        </div>
    );
}
