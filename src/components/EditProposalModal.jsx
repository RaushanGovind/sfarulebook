import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function EditProposalModal({ isOpen, onClose, onSave, proposal }) {
    const [formData, setFormData] = useState({
        level: '',
        titleEn: '',
        titleHi: '',
        contentEn: '',
        contentHi: ''
    });

    useEffect(() => {
        if (isOpen && proposal) {
            setFormData({
                level: proposal.level || '',
                titleEn: proposal.title?.en || '',
                titleHi: proposal.title?.hi || '',
                contentEn: proposal.content?.en || '',
                contentHi: proposal.content?.hi || ''
            });
        }
    }, [isOpen, proposal]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            level: formData.level,
            title: {
                en: formData.titleEn,
                hi: formData.titleHi
            },
            content: {
                en: formData.contentEn,
                hi: formData.contentHi
            }
        });
        onClose();
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 2100 }}>
            <div className="modal-card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h2>Edit Proposal</h2>
                    <button onClick={onClose} className="icon-btn" style={{ border: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Level */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Section / Category</label>
                        <input
                            type="text"
                            className="search-input"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Title English */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Title (English)</label>
                            <input
                                type="text"
                                className="search-input"
                                value={formData.titleEn}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                            />
                        </div>

                        {/* Title Hindi */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Title (Hindi)</label>
                            <input
                                type="text"
                                className="search-input"
                                value={formData.titleHi}
                                onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Content English */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Content (English)</label>
                        <div className="quill-wrapper">
                            <ReactQuill
                                theme="snow"
                                value={formData.contentEn}
                                onChange={(v) => setFormData(prev => ({ ...prev, contentEn: v }))}
                                modules={modules}
                            />
                        </div>
                    </div>

                    {/* Content Hindi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Content (Hindi)</label>
                        <div className="quill-wrapper">
                            <ReactQuill
                                theme="snow"
                                value={formData.contentHi}
                                onChange={(v) => setFormData(prev => ({ ...prev, contentHi: v }))}
                                modules={modules}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 16px',
                                background: 'transparent',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 24px',
                                background: 'var(--color-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Save size={18} /> Update Proposal
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
