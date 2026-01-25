import React, { useState, useEffect } from 'react';
import { User, X, MapPin } from 'lucide-react';

export default function MemberDirectoryModal({ isOpen, onClose }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.PROD
        ? '/api'
        : 'http://127.0.0.1:5001/api';

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        setLoading(true);
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 3500 }}>
            <div className="modal-card" style={{ maxWidth: '800px', width: '95%', padding: '0' }}>
                <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={24} color="var(--color-primary)" />
                        <h2 style={{ margin: 0 }}>Registered SFA Members</h2>
                    </div>
                    <button onClick={onClose} className="icon-btn" style={{ border: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                            Loading member list...
                        </div>
                    ) : members.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px'
                        }}>
                            {members.map((m) => (
                                <div key={m.userId} style={{
                                    background: 'var(--color-bg-card)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        flexShrink: 0
                                    }}>
                                        {m.fullName ? m.fullName[0].toUpperCase() : (m.username ? m.username[0].toUpperCase() : '?')}
                                    </div>
                                    <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {m.fullName || m.username || 'Member'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontWeight: 'bold' }}>{m.userId}</span>
                                            <span>•</span>
                                            <MapPin size={12} />
                                            <span>{m.headquarter || 'HQ N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                            No members registered yet.
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--color-border)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                    Total Active Members: <b>{members.length}</b>
                </div>
            </div>
        </div>
    );
}
