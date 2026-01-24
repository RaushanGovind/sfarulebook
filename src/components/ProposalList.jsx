import React, { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle, Clock, UploadCloud, ChevronDown, ChevronUp, Lock, RefreshCcw, XCircle, Send } from 'lucide-react';

const API_URL = import.meta.env.PROD
    ? 'https://sfa-rules-book.vercel.app/api'
    : 'http://127.0.0.1:5001/api';

export default function ProposalList({ user, onBack, language }) {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [filter, setFilter] = useState('open'); // 'open' | 'draft' | 'approved' | 'published'

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const token = localStorage.getItem("sfaToken");
            const headers = {};
            if (token) headers['x-auth-token'] = token;

            const res = await fetch(`${API_URL}/proposals`, { headers });
            const data = await res.json();
            setProposals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const token = localStorage.getItem("sfaToken");
        try {
            const res = await fetch(`${API_URL}/proposals/${id}/${action}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Success: ${action}`);
                fetchProposals();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert(`Error performing ${action}`);
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading Proposals...</div>;

    // Filter Logic
    const filteredProposals = proposals.filter(p => {
        if (filter === 'draft') return p.status === 'draft';
        if (filter === 'open') return p.status === 'open';
        if (filter === 'approved') return p.status === 'approved';
        return true;
    });

    const isAdmin = user?.role === 'admin';

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={onBack} className="icon-btn" style={{ width: 'auto', padding: '0 10px' }}>&larr; Back</button>
                <h2>Proposal Managment</h2>
            </div>

            {/* Admin Filter Tabs */}
            {isAdmin && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {['draft', 'open', 'approved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid var(--color-border)',
                                background: filter === status ? 'var(--color-primary)' : 'transparent',
                                color: filter === status ? 'white' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            {status}s
                        </button>
                    ))}
                </div>
            )}

            {!isAdmin && (
                <div style={{ padding: '10px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#0369a1' }}>Open for Voting</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#0c4a6e' }}>
                        Review the proposals below and click "Agree" if you support the change.
                    </p>
                </div>
            )}

            {filteredProposals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    No {filter} proposals found.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredProposals.map(p => {
                        const isExpanded = expanded[p._id];
                        const contentHtml = (p.content?.[language] || p.content?.['en'] || '');

                        return (
                            <div key={p._id} style={{
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                padding: '16px',
                                background: 'var(--color-bg-card)',
                                position: 'relative'
                            }}>
                                {/* Status Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{
                                        background: p.status === 'open' ? '#dcfce7' : (p.status === 'draft' ? '#f1f5f9' : '#fef9c3'),
                                        color: p.status === 'open' ? '#166534' : (p.status === 'draft' ? '#475569' : '#854d0e'),
                                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                                    }}>
                                        {p.status}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>
                                    {p.title?.[language] || p.title?.['en'] || 'Untitled'}
                                </h3>

                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                    <span>Author: <b>{p.author?.username || 'Unknown'}</b></span>
                                    {p.status === 'open' && <span>Votes: <b>{p.consents.length}</b></span>}
                                </div>

                                {/* Content Preview */}
                                <div
                                    onClick={() => toggleExpand(p._id)}
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-border)',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginBottom: '16px',
                                        background: 'var(--color-bg-sidebar)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        <span>PROPOSED CONTENT</span>
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </div>
                                    {isExpanded ? (
                                        <div
                                            className="prose"
                                            style={{
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                padding: '10px',
                                                background: 'var(--color-bg)',
                                                borderRadius: '4px',
                                                border: '1px solid var(--color-border)'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {contentHtml.replace(/<[^>]+>/g, '')}
                                        </div>
                                    )}
                                </div>

                                {/* ACTIONS */}
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>

                                    {/* ADMIN: OPEN FOR VOTING (From Draft) */}
                                    {isAdmin && p.status === 'draft' && (
                                        <button
                                            onClick={() => handleAction(p._id, 'open')}
                                            style={{
                                                background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                            }}
                                        >
                                            <Send size={16} /> Open for Voting
                                        </button>
                                    )}

                                    {/* ADMIN: WITHDRAW (From Open) */}
                                    {isAdmin && p.status === 'open' && (
                                        <button
                                            onClick={() => handleAction(p._id, 'withdraw')}
                                            disabled={p.consents.length > 0}
                                            title={p.consents.length > 0 ? "Cannot withdraw: Votes received" : "Withdraw to Draft"}
                                            style={{
                                                background: p.consents.length > 0 ? '#cbd5e1' : '#fff',
                                                color: p.consents.length > 0 ? '#94a3b8' : '#ef4444',
                                                border: `1px solid ${p.consents.length > 0 ? 'transparent' : '#ef4444'}`,
                                                padding: '8px 16px', borderRadius: '6px',
                                                cursor: p.consents.length > 0 ? 'not-allowed' : 'pointer',
                                                fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                            }}
                                        >
                                            <XCircle size={16} /> Withdraw
                                        </button>
                                    )}

                                    {/* MEMBER: VOTE (Only Open) */}
                                    {user && p.status === 'open' && (
                                        <button
                                            onClick={() => handleAction(p._id, 'consent')}
                                            style={{
                                                background: p.consents.includes(user.id) ? '#22c55e' : 'white',
                                                color: p.consents.includes(user.id) ? 'white' : '#166534',
                                                border: '1px solid #166534',
                                                padding: '8px 16px', borderRadius: '6px',
                                                cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center',
                                                flex: 1, justifyContent: 'center'
                                            }}
                                        >
                                            <ThumbsUp size={16} /> {p.consents.includes(user.id) ? 'Agreed' : 'Agree'}
                                        </button>
                                    )}

                                    {/* ADMIN: PUBLISH (If Approved) */}
                                    {isAdmin && p.status === 'approved' && (
                                        <button
                                            onClick={() => handleAction(p._id, 'publish')}
                                            style={{
                                                background: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center',
                                                width: '100%', justifyContent: 'center'
                                            }}
                                        >
                                            <UploadCloud size={16} /> Publish Rule Live
                                        </button>
                                    )}

                                    {/* ADMIN: MOVE TO APPROVE (From Open - Manual Override/Consensus Met) */}
                                    {isAdmin && p.status === 'open' && (
                                        <button
                                            onClick={() => handleAction(p._id, 'approve')}
                                            style={{
                                                background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                            }}
                                            title="Mark consensus reached"
                                        >
                                            <CheckCircle size={16} /> Finalize
                                        </button>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
const [proposals, setProposals] = useState([]);
const [loading, setLoading] = useState(true);
const [expanded, setExpanded] = useState({}); // Track expanded items

useEffect(() => {
    fetchProposals();
}, []);

const fetchProposals = async () => {
    try {
        const token = localStorage.getItem("sfaToken");
        const headers = {};
        if (token) headers['x-auth-token'] = token;

        const res = await fetch(`${API_URL}/proposals`, { headers });
        const data = await res.json();
        setProposals(data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

const handleConsent = async (id) => {
    const token = localStorage.getItem("sfaToken");
    await fetch(`${API_URL}/proposals/${id}/consent`, {
        method: 'PUT',
        headers: { 'x-auth-token': token }
    });
    fetchProposals();
};

const handleApprove = async (id) => {
    const token = localStorage.getItem("sfaToken");
    try {
        const res = await fetch(`${API_URL}/proposals/${id}/approve`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (res.ok) {
            alert("Approved! Once all admins approve, 'Publish' button will appear.");
            fetchProposals();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Error approving");
    }
};

const handlePublish = async (id) => {
    const token = localStorage.getItem("sfaToken");
    if (!confirm("Are you sure? This will make the rule LIVE and archive the old version.")) return;

    try {
        const res = await fetch(`${API_URL}/proposals/${id}/publish`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
        const data = await res.json();
        if (res.ok) {
            alert("Successfully Published!");
            fetchProposals();
            // Optionally redirect back
            setTimeout(onBack, 1000);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Error publishing");
    }
};

const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
};

if (loading) return <div style={{ padding: '20px' }}>Loading Proposals...</div>;

return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button onClick={onBack} className="icon-btn" style={{ width: 'auto', padding: '0 10px' }}>&larr; Back</button>
            <h2>Pending Proposals</h2>
        </div>

        {proposals.length === 0 ? (
            <p>No pending proposals found.</p>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {proposals.map(p => {
                    const isExpanded = expanded[p._id];
                    const contentHtml = (p.content?.[language] || p.content?.['en'] || '');
                    const isReadyToPublish = p.status === 'approved'; // Using 'approved' as ready state

                    return (
                        <div key={p._id} style={{
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            padding: '16px',
                            background: 'var(--color-bg-card)',
                            boxShadow: isReadyToPublish ? '0 0 0 2px #22c55e' : 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{
                                    background: isReadyToPublish ? '#dcfce7' : '#fef9c3',
                                    color: isReadyToPublish ? '#166534' : '#854d0e',
                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                                }}>
                                    {isReadyToPublish ? "READY TO PUBLISH" : "PENDING APPROVAL"}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    By: {p.author?.userId || 'Unknown'} ({p.author?.username}) • {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 style={{ marginBottom: '5px' }}>
                                {p.action.toUpperCase()}: {p.title?.[language] || p.title?.['en'] || 'Untitled'}
                            </h3>

                            {/* Expandable Content Area */}
                            <div
                                onClick={() => toggleExpand(p._id)}
                                style={{
                                    cursor: 'pointer',
                                    border: '1px solid var(--color-border)',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    marginBottom: '15px',
                                    background: 'var(--color-bg-sidebar)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    <span>{isExpanded ? "Hide Full Changes" : "Click to View Changes"}</span>
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                                {isExpanded ? (
                                    <div
                                        className="prose"
                                        style={{
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            padding: '10px',
                                            background: 'var(--color-bg)',
                                            borderRadius: '4px'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                                    />
                                ) : (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {contentHtml.replace(/<[^>]+>/g, '')}
                                    </div>
                                )}
                            </div>


                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {/* Member Consent - Only if Logged In */}
                                {user && (
                                    <button
                                        onClick={() => handleConsent(p._id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)',
                                            background: p.consents.includes(user.id) ? 'var(--color-primary)' : 'transparent',
                                            color: p.consents.includes(user.id) ? 'white' : 'inherit',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ThumbsUp size={16} />
                                        {p.consents.includes(user.id) ? 'Consented' : 'Give Consent'}
                                        ({p.consents.length})
                                    </button>
                                )}

                                {/* Admin Approve */}
                                {user?.role === 'admin' && !isReadyToPublish && (
                                    <button
                                        onClick={() => handleApprove(p._id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 12px', borderRadius: '6px', border: 'none',
                                            background: p.approvals.includes(user.id) ? '#22c55e' : '#0f172a',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                        disabled={p.approvals.includes(user.id)}
                                    >
                                        <CheckCircle size={16} />
                                        {p.approvals.includes(user.id) ? 'Approved' : 'Approve'}
                                        ({p.approvals.length})
                                    </button>
                                )}

                                {/* Admin Publish (Only if Ready) */}
                                {user?.role === 'admin' && isReadyToPublish && (
                                    <button
                                        onClick={() => handlePublish(p._id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 16px', borderRadius: '6px', border: 'none',
                                            background: '#3b82f6', // Blue for publish action
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        <UploadCloud size={18} />
                                        PUBLISH NOW
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);
}
