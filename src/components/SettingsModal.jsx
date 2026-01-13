import React, { useState } from 'react';
import { X, Moon, Sun, Type, Layout } from 'lucide-react';

export default function SettingsModal({ settings, onSave, onClose, onReset, onResetContent }) {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Layout size={20} />
                        Appearance
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Font Family */}
                <div className="setting-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Type size={16} /> Font Family
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {["'Inter', 'Noto Sans Devanagari', sans-serif", 'Georgia, serif', 'Courier New, monospace'].map((font) => (
                            <button
                                key={font}
                                onClick={() => handleChange('fontFamily', font)}
                                style={{
                                    padding: '10px',
                                    border: `1px solid ${localSettings.fontFamily === font ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                    borderRadius: '8px',
                                    background: localSettings.fontFamily === font ? 'var(--color-sidebar-active)' : 'transparent',
                                    color: 'var(--color-text-main)',
                                    cursor: 'pointer',
                                    fontFamily: font
                                }}
                            >
                                {font.split(',')[0].replace(/'/g, "")}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Font Size */}
                <div className="setting-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Font Size</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{localSettings.fontSize}px</span>
                    </label>
                    <input
                        type="range"
                        min="14"
                        max="24"
                        step="1"
                        value={localSettings.fontSize}
                        onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                    />
                </div>

                {/* Colors */}
                <div className="setting-group">
                    <label>Theme Colors (Custom Override)</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Background</label>
                            <input type="color" value={localSettings.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Text</label>
                            <input type="color" value={localSettings.textColor} onChange={(e) => handleChange('textColor', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {onResetContent && (
                        <button
                            onClick={onResetContent}
                            style={{
                                padding: '10px 16px',
                                background: '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#b91c1c',
                                cursor: 'pointer',
                                marginRight: 'auto',
                                fontSize: '0.85rem'
                            }}
                        >
                            Reset Content
                        </button>
                    )}
                    <button
                        onClick={onReset}
                        style={{
                            padding: '10px 16px',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '8px',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={() => onSave(localSettings)}
                        style={{
                            padding: '10px 24px',
                            background: 'var(--color-accent)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
