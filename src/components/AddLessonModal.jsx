import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

export default function AddLessonModal({ isOpen, onClose, onSave, existingLevels = [] }) {
    const [formData, setFormData] = useState({
        level: '',
        titleEn: '',
        titleHi: ''
    });

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({ level: '', titleEn: '', titleHi: '' });
        }
    }, [isOpen]);

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
                en: `<h1>${formData.titleEn}</h1><p>Start writing content here...</p>`,
                hi: `<h1>${formData.titleHi}</h1><p>यहाँ सामग्री लिखना शुरू करें...</p>`
            }
        });
        onClose();
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2>Add New Chapter/Rule</h2>
                    <button onClick={onClose} className="icon-btn" style={{ border: 'none' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Section/Level Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Section / Category</label>
                        <input
                            list="levels"
                            name="level"
                            placeholder="Select or Type New Category..."
                            className="search-input"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            required
                        />
                        <datalist id="levels">
                            {existingLevels.map((lvl, i) => (
                                <option key={i} value={lvl} />
                            ))}
                        </datalist>
                    </div>

                    {/* Title English */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Title (English)</label>
                        <input
                            type="text"
                            placeholder="e.g. 4. Membership Rules"
                            className="search-input"
                            value={formData.titleEn}
                            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                            required
                        />
                    </div>

                    {/* Title Hindi */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Title (Hindi)</label>
                        <input
                            type="text"
                            placeholder="e.g. 4. सदस्यता नियम"
                            className="search-input"
                            value={formData.titleHi}
                            onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                            required
                        />
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
                            <Plus size={18} /> Add Rule
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
