import React, { useState, useEffect } from 'react';
import { ThumbsUp, CheckCircle, Clock, UploadCloud, ChevronDown, ChevronUp, Lock, RefreshCcw, XCircle, Send, Trash2, Edit, GitCompare, Users } from 'lucide-react';
import * as Diff from 'diff';
import EditProposalModal from './EditProposalModal';

const API_URL = import.meta.env.PROD
    ? 'https://sfa-rules-book.vercel.app/api'
    : '/api';

// Star Rating Component
function StarRating({ value, onChange, disabled = false }) {
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange && onChange(star)}
                    onMouseEnter={() => !disabled && setHover(star)}
                    onMouseLeave={() => !disabled && setHover(0)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: disabled ? 'default' : 'pointer',
                        fontSize: '24px',
                        color: (hover || value) >= star ? '#fbbf24' : '#d1d5db',
                        transition: 'color 0.2s',
                        padding: '0 2px'
                    }}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

// ReviewSection Component for Rating & Comments
function ReviewSection({ proposal, user, isAdmin, onUpdate }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showAllFeedback, setShowAllFeedback] = useState(false);

    const canInteract = user && (
        (proposal.status === 'internal_review' && isAdmin) ||
        (proposal.status === 'public_review')
    );

    const userRating = proposal.ratings?.find(r => r.user?._id === user?.id || r.user === user?.id);
    const avgRating = proposal.ratings?.length > 0
        ? (proposal.ratings.reduce((sum, r) => sum + r.value, 0) / proposal.ratings.length).toFixed(1)
        : null;

    const handleRate = async (value) => {
        if (!canInteract) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem("sfaToken");
            const res = await fetch(`${API_URL}/proposals/${proposal._id}/rate`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating: value })
            });
            if (res.ok) {
                onUpdate();
                setRating(value);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to submit rating');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting rating');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComment = async () => {
        if (!comment.trim() || !canInteract) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem("sfaToken");
            const res = await fetch(`${API_URL}/proposals/${proposal._id}/remark`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: comment })
            });
            if (res.ok) {
                onUpdate();
                setComment('');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to submit comment');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            width: '100%',
            padding: '16px',
            background: proposal.status === 'public_review' ? '#f0fdf4' : '#fef3c7',
            borderRadius: '8px',
            marginTop: '12px',
            border: `2px solid ${proposal.status === 'public_review' ? '#86efac' : '#fde68a'}`
        }}>
            <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                marginBottom: '12px',
                color: proposal.status === 'public_review' ? '#166534' : '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Users size={18} />
                {proposal.status === 'public_review' ? '🌍 Public Review - Open for Community Feedback' : '👥 Team Review (Admin Only)'}
            </div>

            {/* Stats Summary */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '12px',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: 500
            }}>
                <span>📊 {proposal.ratings?.length || 0} ratings</span>
                <span>💬 {proposal.remarks?.length || 0} comments</span>
                {avgRating && <span>⭐ Avg: {avgRating} / 5</span>}
            </div>

            {/* Star Rating Input (Only if user can interact) */}
            {canInteract && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>
                        {userRating ? 'Your Rating:' : 'Rate this proposal:'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                disabled={submitting}
                                style={{
                                    fontSize: '1.8rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: submitting ? 'wait' : 'pointer',
                                    padding: 0,
                                    transition: 'transform 0.1s',
                                    transform: (hoverRating >= star || (userRating?.value || rating) >= star) ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                {(hoverRating >= star || (userRating?.value || rating) >= star) ? '⭐' : '☆'}
                            </button>
                        ))}
                    </div>
                    {userRating && (
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748b', fontStyle: 'italic' }}>
                            You rated: {userRating.value} star{userRating.value !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Comment Input (Only if user can interact) */}
            {canInteract && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '6px', fontWeight: 600 }}>Add a comment:</div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts, suggestions, or concerns..."
                        disabled={submitting}
                        style={{
                            width: '100%',
                            minHeight: '70px',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                    <button
                        onClick={handleComment}
                        disabled={!comment.trim() || submitting}
                        style={{
                            marginTop: '8px',
                            padding: '8px 16px',
                            background: comment.trim() && !submitting ? '#3b82f6' : '#cbd5e1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: comment.trim() && !submitting ? 'pointer' : 'not-allowed',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                        }}
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            )}

            {/* View All Feedback Toggle */}
            {(proposal.ratings?.length > 0 || proposal.remarks?.length > 0) && (
                <div>
                    <button
                        onClick={() => setShowAllFeedback(!showAllFeedback)}
                        style={{
                            background: 'white',
                            border: '1px solid #cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: showAllFeedback ? '12px' : '0'
                        }}
                    >
                        {showAllFeedback ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showAllFeedback ? 'Hide' : 'View All'} Feedback
                    </button>

                    {showAllFeedback && (
                        <div style={{
                            marginTop: '12px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            background: 'white',
                            borderRadius: '6px',
                            padding: '12px'
                        }}>
                            {(() => {
                                // Merge ratings and remarks into unified reviews
                                const reviewsMap = new Map();

                                // Process Ratings
                                proposal.ratings?.forEach(r => {
                                    // Use ID string for map key, handle populated object or string ID
                                    const uid = r.user?._id || r.user || 'anon';
                                    if (!reviewsMap.has(uid)) {
                                        reviewsMap.set(uid, {
                                            user: r.user,
                                            rating: r.value,
                                            remarks: [],
                                            latestDate: null // ratings don't have date in this schema usually, treat as old or undated
                                        });
                                    } else {
                                        const entry = reviewsMap.get(uid);
                                        entry.rating = r.value;
                                        // Update user object if we found a better one (populated)
                                        if (r.user && (!entry.user || !entry.user.username)) entry.user = r.user;
                                    }
                                });

                                // Process Remarks
                                proposal.remarks?.forEach(r => {
                                    const uid = r.user?._id || r.user || 'anon';
                                    if (!reviewsMap.has(uid)) {
                                        reviewsMap.set(uid, {
                                            user: r.user,
                                            rating: null,
                                            remarks: [r],
                                            latestDate: new Date(r.createdAt)
                                        });
                                    } else {
                                        const entry = reviewsMap.get(uid);
                                        entry.remarks.push(r);
                                        if (r.user && (!entry.user || !entry.user.username)) entry.user = r.user;

                                        const d = new Date(r.createdAt);
                                        if (!entry.latestDate || d > entry.latestDate) entry.latestDate = d;
                                    }
                                });

                                // Sort by latest activity
                                const reviews = Array.from(reviewsMap.values()).sort((a, b) => {
                                    if (!a.latestDate) return 1;
                                    if (!b.latestDate) return -1;
                                    return b.latestDate - a.latestDate;
                                });

                                if (reviews.length === 0) return <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '8px' }}>No feedback yet.</div>;

                                return reviews.map((review, i) => (
                                    <div key={i} style={{
                                        padding: '12px', marginBottom: '10px',
                                        border: '1px solid #f1f5f9',
                                        background: '#f8fafc', borderRadius: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <strong style={{ color: '#1e293b', fontSize: '0.9rem' }}>
                                                    {review.user?.fullName || review.user?.username || 'Anonymous'}
                                                </strong>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {review.user?.userId || ''}
                                                    {review.user?.role === 'admin' && <span style={{ marginLeft: '4px', color: '#8b5cf6' }}>👑 Admin</span>}
                                                </div>
                                            </div>
                                            {review.rating && (
                                                <div style={{ background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fcd34d' }}>
                                                    <span style={{ fontSize: '1rem', color: '#f59e0b', fontWeight: 'bold' }}>{review.rating} ⭐</span>
                                                </div>
                                            )}
                                        </div>

                                        {review.remarks.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {review.remarks.map((rem, ri) => (
                                                    <div key={ri} style={{
                                                        fontSize: '0.85rem', color: '#334155',
                                                        background: 'white', padding: '8px', borderRadius: '6px',
                                                        borderLeft: '3px solid #3b82f6'
                                                    }}>
                                                        {rem.text}
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                                                            {new Date(rem.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* Login prompt for anonymous users */}
            {!canInteract && !user && (
                <div style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#64748b',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    🔐 Please log in to rate and comment on this proposal
                </div>
            )}
        </div>
    );
}


export default function ProposalList({ user, onBack, language, lessons = [] }) {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [diffMode, setDiffMode] = useState({});
    const [filter, setFilter] = useState('draft'); // Default to 'draft' so users see their drafts first

    const renderDiff = (oldHtml, newHtml) => {
        const strip = (html) => {
            if (!html) return "";
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        };

        const oldText = strip(oldHtml);
        const newText = strip(newHtml);

        const diff = Diff.diffWords(oldText, newText);

        return (
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {diff.map((part, i) => (
                    <span
                        key={i}
                        style={{
                            backgroundColor: part.added ? '#bbf7d0' : part.removed ? '#fecaca' : 'transparent',
                            color: part.added ? '#14532d' : part.removed ? '#7f1d1d' : 'inherit',
                            textDecoration: part.removed ? 'line-through' : 'none',
                            padding: '0 2px'
                        }}
                    >
                        {part.value}
                    </span>
                ))}
            </div>
        );
    };

    const toggleDiff = (id) => {
        setDiffMode(prev => {
            const newState = { ...prev, [id]: !prev[id] };
            if (newState[id]) {
                setExpanded(e => ({ ...e, [id]: true }));
            }
            return newState;
        });
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    // Auto-select appropriate tab after loading
    useEffect(() => {
        if (!loading && proposals.length > 0 && user) {
            // Check if user has any drafts - if so, stay on draft tab
            const userDrafts = proposals.filter(p =>
                p.status === 'draft' &&
                (p.author?._id === user.id || p.author === user.id)
            );
            if (userDrafts.length > 0) {
                setFilter('draft');
            } else {
                // If no drafts, check for open voting or public review
                const hasOpen = proposals.some(p => p.status === 'open');
                const hasPublicReview = proposals.some(p => p.status === 'public_review');
                if (hasOpen) setFilter('open');
                else if (hasPublicReview) setFilter('public_review');
            }
        }
    }, [loading, proposals, user]);

    const fetchProposals = async () => {
        try {
            const token = localStorage.getItem("sfaToken");
            const headers = {};
            if (token) headers['x-auth-token'] = token;

            const res = await fetch(`${API_URL}/proposals`, { headers });
            const data = await res.json();
            console.log('Fetched proposals:', data); // Debug log
            setProposals(data);
        } catch (err) {
            console.error('Error fetching proposals:', err);
        } finally {
            setLoading(false);
        }
    };

    const [editingProposal, setEditingProposal] = useState(null);

    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleDelete = (id) => {
        setDeleteTarget(id);
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget;
        const token = localStorage.getItem("sfaToken");
        try {
            const res = await fetch(`${API_URL}/proposals/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                showToast("Draft deleted");
                fetchProposals();
                setDeleteTarget(null);
            } else {
                const contentType = res.headers.get("content-type");
                let errorMessage;
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await res.json();
                    errorMessage = errorData.message || "Failed to delete";
                } else {
                    errorMessage = await res.text();
                }
                alert(`Failed to delete: ${errorMessage}`);
            }
        } catch (err) {
            console.error(err);
            alert(`Error deleting: ${err.message}`);
        }
    };

    const handleUpdate = async (data) => {
        if (!editingProposal) return;
        const token = localStorage.getItem("sfaToken");
        try {
            const res = await fetch(`${API_URL}/proposals/${editingProposal._id}`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                alert("Proposal Updated");
                fetchProposals();
                setEditingProposal(null);
            } else {
                const err = await res.json();
                alert(err.message || "Failed to update");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating");
        }
    };

    const handleAction = async (id, action) => {
        const token = localStorage.getItem("sfaToken");
        try {
            const res = await fetch(`${API_URL}/proposals/${id}/${action}`, {
                method: 'PUT',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            // Check content type to identify JSON responses
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                // If not JSON, it's likely a server error page
                const text = await res.text();
                throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
            }

            if (res.ok) {
                if (data && data.message) {
                    alert(data.message);
                } else {
                    alert(`Success: ${action.replace('_', ' ')}`);
                }
                fetchProposals();
            } else {
                alert(data.message || data.error || 'Unknown error occurred');
            }
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Error performing ${action}: ${err.message}`);
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading Proposals...</div>;

    // Filter Logic
    const filteredProposals = proposals.filter(p => {
        if (filter === 'draft') return p.status === 'draft';
        if (filter === 'internal_review') return p.status === 'internal_review';
        if (filter === 'open') return p.status === 'open';
        if (filter === 'approved') return p.status === 'approved';
        if (filter === 'public_review') return p.status === 'public_review';
        return true;
    });

    const isAdmin = user?.role === 'admin';

    const getTabLabel = (status) => {
        switch (status) {
            case 'draft': return 'My Drafts';
            case 'internal_review': return 'Team Review';
            case 'open': return 'Voting';
            case 'approved': return 'Ready';
            case 'public_review': return 'Public Review';
            default: return status;
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Redundant header removed - handled by top bar */}

            {/* Debug info - remove after testing */}

            {/* Debug info - remove after testing */}
            {proposals.length === 0 && !loading && (
                <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '6px', marginBottom: '10px', fontSize: '0.85rem' }}>
                    ⚠️ No proposals found. Check if you're logged in and the server is running.
                </div>
            )}

            {/* Filter Tabs with counts */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                {['draft', 'internal_review', 'open', 'approved', 'public_review'].map(status => {
                    const count = proposals.filter(p => p.status === status).length;
                    return (
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
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {getTabLabel(status)}
                            {count > 0 && (
                                <span style={{
                                    background: filter === status ? 'rgba(255,255,255,0.3)' : 'var(--color-primary)',
                                    color: filter === status ? 'white' : 'white',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    minWidth: '18px',
                                    textAlign: 'center'
                                }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {filteredProposals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                    No items in "{getTabLabel(filter)}"
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
                                        {p.status.replace('_', ' ')}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>
                                    {p.title?.[language] || p.title?.['en'] || 'Untitled'}
                                </h3>

                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <span>Author: <b>{p.author?.fullName || p.author?.username || 'Unknown'}</b> <span style={{ color: '#94a3b8' }}>({p.author?.userId})</span></span>
                                    {p.status === 'open' && <span>Votes: <b>{p.consents?.length || 0}</b></span>}
                                </div>

                                {/* Voters List - Show who voted */}
                                {p.status === 'open' && p.consents?.length > 0 && (
                                    <div style={{
                                        marginBottom: '12px',
                                        padding: '10px',
                                        background: '#f0fdf4',
                                        borderRadius: '8px',
                                        border: '1px solid #86efac'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            ✅ Members Who Agreed ({p.consents.length})
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {p.consents.map((voter, i) => (
                                                <span
                                                    key={voter._id || i}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 10px',
                                                        background: 'white',
                                                        border: '1px solid #86efac',
                                                        borderRadius: '16px',
                                                        fontSize: '0.75rem',
                                                        color: '#166534'
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 600 }}>{voter.fullName || voter.username || 'Member'}</span>
                                                    <span style={{ color: '#94a3b8' }}>({voter.userId})</span>
                                                    {voter.role === 'admin' && <span style={{ color: '#8b5cf6' }}>👑</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleDiff(p._id); }}
                                                title="Toggle Diff View"
                                                style={{
                                                    background: diffMode[p._id] ? 'var(--color-primary)' : 'transparent',
                                                    color: diffMode[p._id] ? 'white' : 'var(--color-text-muted)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 8px'
                                                }}
                                            >
                                                <GitCompare size={12} /> {diffMode[p._id] ? "Hide Diff" : "Compare"}
                                            </button>
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </div>
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
                                        >
                                            {diffMode[p._id] ? (
                                                (() => {
                                                    const originalLesson = lessons.find(l => l._id === p.originalLessonId);
                                                    const oldContent = originalLesson
                                                        ? (typeof originalLesson.content === 'string' ? originalLesson.content : (originalLesson.content[language] || ""))
                                                        : "";
                                                    return renderDiff(oldContent, contentHtml);
                                                })()
                                            ) : (
                                                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {(() => {
                                                // Decode HTML entities for preview
                                                const doc = new DOMParser().parseFromString(contentHtml, 'text/html');
                                                return doc.body.textContent || "";
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* ACTIONS */}
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>

                                    {/* AUTHOR/ADMIN: SUBMIT FOR REVIEW (Draft -> Internal Review) */}
                                    {(isAdmin || (user?.id === (p.author?._id || p.author?.id || p.author))) && p.status === 'draft' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(p._id, 'submit_internal')}
                                                style={{
                                                    background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: '8px',
                                                    border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center',
                                                    flex: 1, justifyContent: 'center', minWidth: '160px'
                                                }}
                                            >
                                                <Send size={16} /> Submit for Review
                                            </button>

                                            <button
                                                onClick={() => setEditingProposal(p)}
                                                style={{
                                                    background: 'white', color: '#0f172a', padding: '8px 16px', borderRadius: '6px',
                                                    border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                                }}
                                                title="Edit Draft"
                                            >
                                                <Edit size={16} /> Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                style={{
                                                    background: 'white', color: '#ef4444', padding: '8px 16px', borderRadius: '6px',
                                                    border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                                }}
                                                title="Delete Draft"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}

                                    {/* ADMIN: INTERNAL REVIEW & APPROVALS */}
                                    {isAdmin && p.status === 'internal_review' && (
                                        <div style={{ width: '100%', marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                                                🔒 Internal Admin Review
                                            </div>

                                            {/* Approvals List */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                                                    Approved by {p.approvals?.length || 0} Admins:
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {p.approvals?.length === 0 && <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No approvals yet</span>}
                                                    {p.approvals?.map((a, i) => (
                                                        <span key={i} style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            background: '#dbeafe', color: '#1e40af',
                                                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                                        }}>
                                                            <CheckCircle size={10} /> {a.fullName || a.username || 'Admin'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {/* Approve Button - If I haven't approved yet */}
                                                {!p.approvals?.some(a => (a._id || a) === user.id) && (
                                                    <button
                                                        onClick={() => handleAction(p._id, 'approve_internal')}
                                                        style={{
                                                            background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                            border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                                        }}
                                                    >
                                                        <CheckCircle size={16} /> Approve
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleAction(p._id, 'open')}
                                                    style={{
                                                        background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                        border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center'
                                                    }}
                                                    title="All admins must approve first"
                                                >
                                                    <Send size={16} /> Open for Voting
                                                </button>
                                            </div>

                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>
                                                * Proposal must be approved by ALL admins before opening for voting.
                                            </div>
                                        </div>
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
                                        <>
                                            <button
                                                onClick={() => handleAction(p._id, 'submit_public')}
                                                style={{
                                                    background: '#8b5cf6', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                    border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center',
                                                    flex: 1
                                                }}
                                            >
                                                <Users size={16} /> Submit for Public Review
                                            </button>
                                            <button
                                                onClick={() => handleAction(p._id, 'publish')}
                                                style={{
                                                    background: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '6px',
                                                    border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center',
                                                    flex: 1
                                                }}
                                            >
                                                <UploadCloud size={16} /> Publish Rule Live
                                            </button>
                                        </>
                                    )}

                                    {/* INTERACTIVE RATING & COMMENTS SECTION */}
                                    {(p.status === 'internal_review' || p.status === 'public_review') && (
                                        <ReviewSection
                                            proposal={p}
                                            user={user}
                                            isAdmin={isAdmin}
                                            onUpdate={fetchProposals}
                                        />
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
            {/* Edit Modal */}
            {editingProposal && (
                <EditProposalModal
                    isOpen={!!editingProposal}
                    onClose={() => setEditingProposal(null)}
                    proposal={editingProposal}
                    onSave={handleUpdate}
                />
            )}

            {/* Custom Toast */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#333',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    fontWeight: 500,
                    animation: 'fadeInOut 3s ease-in-out'
                }}>
                    {toast}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                    <div className="modal-card" style={{ maxWidth: '350px', textAlign: 'center', padding: '24px' }}>
                        <div style={{ color: '#ef4444', marginBottom: '16px' }}>
                            <Trash2 size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Delete Draft?</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                            Are you sure you want to delete this draft? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid var(--color-border)',
                                    background: 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
