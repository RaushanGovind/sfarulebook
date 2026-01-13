import React, { useState, useEffect } from 'react';
import { User, Shield, Check, X } from 'lucide-react';

const API_URL = 'http://127.0.0.1:5000/api';

export default function UserManagementModal({ isOpen, onClose, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && currentUser?.role === 'admin') {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("sfaToken");
            const res = await fetch(`${API_URL}/users`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId, currentRole) => {
        if (!confirm(`Are you sure you want to change this user's role?`)) return;

        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        const token = localStorage.getItem("sfaToken");

        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // Update local state
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            } else {
                alert("Failed to update role");
            }
        } catch (err) {
            alert("Network error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-card" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header">
                    <h2>Manage Users</h2>
                    <button onClick={onClose} className="icon-btn" style={{ border: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Username</th>
                                    <th style={{ padding: '10px' }}>Role</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={16} />
                                            {u.username}
                                            {u._id === currentUser.id && <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>(You)</span>}
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                background: u.role === 'admin' ? '#dcfce7' : '#f1f5f9',
                                                color: u.role === 'admin' ? '#166534' : '#475569',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600
                                            }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            {u._id !== currentUser.id && (
                                                <button
                                                    onClick={() => toggleAdmin(u._id, u.role)}
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-border)',
                                                        background: 'var(--color-bg)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                    }}
                                                >
                                                    <Shield size={14} />
                                                    {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
