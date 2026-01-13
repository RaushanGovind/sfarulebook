import React, { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle, Clock, UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = 'http://127.0.0.1:5000/api';

export default function ProposalList({ user, onBack, language }) {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({}); // Track expanded items

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const token = localStorage.getItem("sfaToken");
            const res = await fetch(`${API_URL}/proposals`, {
                headers: { 'x-auth-token': token }
            });
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
                                    {/* Member Consent */}
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

                                    {/* Admin Approve */}
                                    {user.role === 'admin' && !isReadyToPublish && (
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
                                    {user.role === 'admin' && isReadyToPublish && (
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
