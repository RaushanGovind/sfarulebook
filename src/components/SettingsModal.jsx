import React, { useState, useEffect } from 'react';
import { X, User, Shield, Monitor } from 'lucide-react';

const API_URL = 'http://127.0.0.1:5001/api';

export default function SettingsModal({ settings, onSave, onClose, onReset, onResetContent, user }) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [passData, setPassData] = useState({ current: '', new: '' });
    const [activeTab, setActiveTab] = useState('appearance'); // appearance, security, users
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        if (activeTab === 'users' && user?.role === 'admin') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const token = localStorage.getItem("sfaToken");
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleAdmin = async (userId, currentRole) => {
        if (!confirm(`Are you sure?`)) return;
        // Logic to toggle role
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        const token = localStorage.getItem("sfaToken");
        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else {
                alert("Failed to update role");
            }
        } catch (e) { alert("Network Error"); }
    };

    const handleSave = () => {
        onSave(localSettings);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("sfaToken");
        try {
            const res = await fetch(`${API_URL}/auth/password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ currentPassword: passData.current, newPassword: passData.new })
            });
            if (res.ok) {
                alert("Password changed!");
                setPassData({ current: '', new: '' });
            } else {
                const d = await res.json();
                alert(d.message);
            }
        } catch (e) { alert("Error changing password"); }
    };

    if (!localSettings) return null;

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                flex: 1, padding: '10px', background: activeTab === id ? 'var(--color-bg)' : 'transparent',
                border: 'none', borderBottom: activeTab === id ? '2px solid var(--color-accent)' : '2px solid transparent',
                cursor: 'pointer', fontWeight: 600, color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
        >
            {Icon && <Icon size={16} />} {label}
        </button>
    );

    return (
        <div className="modal-overlay" style={{ zIndex: 4000 }}>
            <div className="modal-card" style={{ maxWidth: '500px', width: '95%', padding: 0, overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: '15px 20px', borderBottom: '1px solid var(--color-border)' }}>
                    <h2>Settings</h2>
                    <button onClick={onClose} className="icon-btn" style={{ border: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <TabButton id="appearance" label="Appearance" icon={Monitor} />
                    <TabButton id="security" label="Security" icon={Shield} />
                    {user?.role === 'admin' && <TabButton id="users" label="Users" icon={User} />}
                </div>

                <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>

                    {/* APPEARANCE TAB */}
                    {activeTab === 'appearance' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Page Layout Section */}
                            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Page Layout</h4>

                                {/* Page Numbers Toggle */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <label style={{ fontSize: '0.9rem', cursor: 'pointer' }} htmlFor="pageNoToggle">Show Page Numbers</label>
                                    <div
                                        onClick={() => setLocalSettings({ ...localSettings, showPageNumbers: !localSettings.showPageNumbers })}
                                        style={{
                                            width: '40px', height: '22px', borderRadius: '12px',
                                            background: localSettings.showPageNumbers ? 'var(--color-primary)' : '#ccc',
                                            position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                                            position: 'absolute', top: '2px', left: localSettings.showPageNumbers ? '20px' : '2px',
                                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                        }} />
                                    </div>
                                </div>

                                {/* Page Size Select */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Page Size</label>
                                    <select
                                        value={localSettings.pageSize || 'a4'}
                                        onChange={(e) => setLocalSettings({ ...localSettings, pageSize: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    >
                                        <option value="responsive">Responsive (Full Width)</option>
                                        <option value="a4">A4 (Standard)</option>
                                        <option value="a3">A3 (Large)</option>
                                        <option value="a5">A5 (Small)</option>
                                        <option value="letter">US Letter</option>
                                        <option value="legal">US Legal</option>
                                    </select>
                                </div>
                            </div>

                            {/* Typography Section */}
                            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Typography</h4>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>English Font</label>
                                    <select
                                        value={localSettings.fontFamilyEn || "'Merriweather', serif"}
                                        onChange={(e) => setLocalSettings({ ...localSettings, fontFamilyEn: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: localSettings.fontFamilyEn }}
                                    >
                                        <option value="'Inter', sans-serif">Inter (Modern Sans)</option>
                                        <option value="'Merriweather', serif">Merriweather (Classic Serif)</option>
                                        <option value="'Roboto Mono', monospace">Roboto Mono (Code)</option>
                                        <option value="'Comic Sans MS', cursive">Comic Sans (Casual)</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Hindi Font</label>
                                    <select
                                        value={localSettings.fontFamilyHi || "'Noto Sans Devanagari', sans-serif"}
                                        onChange={(e) => setLocalSettings({ ...localSettings, fontFamilyHi: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: localSettings.fontFamilyHi }}
                                    >
                                        <option value="'Noto Sans Devanagari', sans-serif">Noto Sans (Standard)</option>
                                        <option value="'Tiro Devanagari Hindi', serif">Tiro Devanagari (Traditional)</option>
                                        <option value="'Rozha One', serif">Rozha One (Stylish)</option>
                                        <option value="'Poppins', sans-serif">Poppins (Modern)</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Base Font Size ({localSettings.fontSize}px)</label>
                                    <input
                                        type="range" min="12" max="32" value={localSettings.fontSize}
                                        onChange={(e) => setLocalSettings({ ...localSettings, fontSize: Number(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Theme Section */}
                            <div>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Colors</h4>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {[
                                        { bg: '#ffffff', text: '#334155', sBg: '#f8fafc', sText: '#334155', name: 'Clean' },
                                        { bg: '#fdfbf7', text: '#1c1917', sBg: '#f5f5f4', sText: '#1c1917', name: 'Parchment' }, // Default
                                        { bg: '#fef2f2', text: '#450a0a', sBg: '#fff1f2', sText: '#881337', name: 'Rose' },
                                        { bg: '#f0fdf4', text: '#052e16', sBg: '#f0fdfa', sText: '#064e3b', name: 'Forest' },
                                        { bg: '#1e293b', text: '#e2e8f0', sBg: '#0f172a', sText: '#94a3b8', name: 'Midnight' },
                                        { bg: '#000000', text: '#e5e5e5', sBg: '#171717', sText: '#a3a3a3', name: 'OLED' }
                                    ].map(t => (
                                        <div key={t.name}
                                            onClick={() => setLocalSettings({
                                                ...localSettings,
                                                bgColor: t.bg,
                                                textColor: t.text,
                                                sidebarBg: t.sBg,
                                                sidebarText: t.sText
                                            })}
                                            style={{
                                                width: '36px', height: '36px', borderRadius: '50%', background: t.bg,
                                                border: `2px solid ${localSettings.bgColor === t.bg ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            title={t.name}
                                        >
                                            <span style={{ fontSize: '10px', color: t.text, fontWeight: 'bold' }}>A</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                Update your password below. If you logged in via Google, you cannot change your password here.
                            </p>
                            <input
                                type="password" placeholder="Current Password" required
                                className="search-input"
                                value={passData.current}
                                onChange={e => setPassData({ ...passData, current: e.target.value })}
                            />
                            <input
                                type="password" placeholder="New Password" required
                                className="search-input"
                                value={passData.new}
                                onChange={e => setPassData({ ...passData, new: e.target.value })}
                            />
                            <button type="submit" className="action-btn" style={{ background: 'var(--color-accent)', color: 'white' }}>
                                Change Password
                            </button>
                        </form>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <div>
                            {loadingUsers ? <p>Loading...</p> : (
                                <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '10px 0' }}>
                                                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        {u.role.toUpperCase()} {u._id === user.id && '(You)'}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {u._id !== user.id && (
                                                        <button
                                                            onClick={() => toggleAdmin(u._id, u.role)}
                                                            style={{
                                                                padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)',
                                                                background: u.role === 'admin' ? '#fee2e2' : '#dcfce7',
                                                                color: u.role === 'admin' ? '#b91c1c' : '#166534',
                                                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                                            }}
                                                        >
                                                            {u.role === 'admin' ? 'Revoke' : 'Promote'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {!loadingUsers && users.length === 0 && <p style={{ color: '#888' }}>No users found.</p>}
                        </div>
                    )}

                </div>

                <div className="modal-footer" style={{ padding: '15px 20px', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {onResetContent && (
                            <button onClick={() => { if (confirm("Clear content?")) onResetContent(); }} style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Reset Content
                            </button>
                        )}
                        <button onClick={onReset} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>
                            Reset Defaults
                        </button>
                    </div>
                    <button onClick={handleSave} className="action-btn" style={{ background: 'var(--color-primary)', color: 'white' }}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
