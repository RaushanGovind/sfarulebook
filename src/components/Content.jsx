import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

// Lazy load the editor to speed up initial page load
const ReactQuill = lazy(() => import('react-quill-new'));

export default function Content({ lesson, onPrev, onNext, hasPrev, hasNext, language, isEditor, onSave }) {
    const [editedContent, setEditedContent] = useState("");

    // Helper to get locale content
    const getContent = () => {
        if (!lesson) return "";
        if (typeof lesson.content === 'string') return lesson.content;
        return lesson.content[language] || lesson.content['hi'] || lesson.content['en'];
    };

    // Sync state with prop
    useEffect(() => {
        setEditedContent(getContent());
    }, [lesson, language]);

    if (!lesson) {
        return (
            <div className="content-scroll flex items-center justify-center">
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Select a lesson</h2>
                    <p>Choose a chapter from the sidebar to begin reading.</p>
                </div>
            </div>
        );
    }

    const getLevel = () => {
        return lesson.level || "Document";
    };

    const handleSave = () => {
        onSave(editedContent);
        // Could replace alert with a nicer toast later
        const btn = document.getElementById('save-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span>Saved!</span>`;
            setTimeout(() => {
                if (btn) btn.innerHTML = originalText;
            }, 1000);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    // Add key to force animation re-trigger on lesson change
    const contentKey = lesson.originalIndex !== undefined ? lesson.originalIndex : (lesson.title?.en || "content");

    return (
        <div className="content-scroll">
            <div className="document-container" key={contentKey}>

                {/* Document Header */}
                <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
                    <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        letterSpacing: '0.05em'
                    }}>
                        {getLevel()}
                    </span>
                </div>

                {isEditor ? (
                    <div className="editor-wrapper">
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Edit Content ({language.toUpperCase()})</h3>
                            <button
                                id="save-btn"
                                onClick={handleSave}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 16px', backgroundColor: 'var(--color-accent)', color: 'white',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                                    fontSize: '0.9rem', transition: 'background 0.2s'
                                }}
                            >
                                <Save size={16} /> Save to Draft
                            </button>
                        </div>
                        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Editor...</div>}>
                            <div style={{ resize: 'vertical', overflow: 'hidden', minHeight: '400px', height: '600px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '50px', background: 'white' }}>
                                <ReactQuill
                                    theme="snow"
                                    value={editedContent}
                                    onChange={setEditedContent}
                                    modules={modules}
                                    style={{ height: '100%', border: 'none' }}
                                />
                            </div>
                        </Suspense>
                    </div>
                ) : (
                    /* Render HTML Content directly */
                    /* Key helps react efficiently update DOM but dangerouslySetInnerHTML handles internal diffing usually. */
                    <div className="prose" dangerouslySetInnerHTML={{ __html: getContent() }} />
                )}

                {/* Navigation Footer */}
                {!isEditor && (
                    <div className="nav-footer">
                        <button className="nav-btn" onClick={onPrev} disabled={!hasPrev}>
                            <ChevronLeft size={16} />
                            {language === 'hi' ? 'पिछला' : 'Previous'}
                        </button>
                        <button className="nav-btn" onClick={onNext} disabled={!hasNext}>
                            {language === 'hi' ? 'अगला' : 'Next'}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {/* History Section */}
                {lesson.history && lesson.history.length > 0 && (
                    <div style={{ marginTop: '60px', borderTop: '2px dashed var(--color-border)', paddingTop: '30px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                            📜 Rule Revision History
                        </h3>
                        {lesson.history.slice().reverse().map((hist, idx) => {
                            const histContent = typeof hist.content === 'string' ? hist.content : (hist.content[language] || hist.content['en']);
                            return (
                                <div key={idx} style={{
                                    marginBottom: '20px',
                                    padding: '15px',
                                    background: 'var(--color-bg-sidebar)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                            Vers. {lesson.history.length - idx} &bull; {new Date(hist.approvedAt).toLocaleDateString()} {new Date(hist.approvedAt).toLocaleTimeString()}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            {hist.changeSummary || "Archived"}
                                        </div>
                                    </div>
                                    <div className="prose" style={{ opacity: 0.8, fontSize: '0.95em' }}>
                                        <div dangerouslySetInnerHTML={{ __html: histContent }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                SFA Rules Book &copy; {new Date().getFullYear()} &bull; Professional Edition
            </div>
        </div>
    );
}
