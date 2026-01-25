import React, { useState } from 'react';
import { X, User, Lock, ArrowRight, Eye, EyeOff, MapPin, FileText, BadgeCheck } from 'lucide-react';

const API_URL = import.meta.env.PROD
    ? '/api'
    : 'http://127.0.0.1:5001/api';

export default function AuthModal({ isOpen, onClose, onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        headquarter: '',
        cmsId: '',
        sfaId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegistering && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);

        const endpoint = isRegistering ? '/auth/register' : '/auth/login';
        const url = `${API_URL}${endpoint}`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                throw new Error(`Server Error: ${res.status}`);
            }

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            if (isRegistering) {
                alert('Registration successful! Please log in.');
                setIsRegistering(false);
            } else {
                onLogin(data);
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(err.message === 'Failed to fetch' ? 'Cannot connect to server (Is it running?)' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-card" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>{isRegistering ? 'Create Account' : 'Member Login'}</h2>
                    <button onClick={onClose} className="icon-btn" style={{ border: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && (
                        <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Username / ID"
                            style={{ paddingLeft: '38px' }}
                            className="search-input"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--color-text-muted)' }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            style={{ paddingLeft: '38px', paddingRight: '40px' }}
                            className="search-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {isRegistering && (
                        <>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    style={{ paddingLeft: '38px' }}
                                    className="search-input"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    style={{ paddingLeft: '38px' }}
                                    className="search-input"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Headquarter"
                                    style={{ paddingLeft: '38px' }}
                                    className="search-input"
                                    value={formData.headquarter}
                                    onChange={(e) => setFormData({ ...formData, headquarter: e.target.value })}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <FileText size={18} style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="CMS ID"
                                    style={{ paddingLeft: '38px' }}
                                    className="search-input"
                                    value={formData.cmsId}
                                    onChange={(e) => setFormData({ ...formData, cmsId: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ marginTop: '10px', padding: '12px', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '10px', color: 'var(--color-text-muted)' }}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontWeight: 600, cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
                        >
                            {isRegistering ? 'Login' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
