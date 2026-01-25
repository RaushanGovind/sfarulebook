// Lazy load the editor but we also need Quill for registration
// We can get Quill from the package usually.
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

// We need to import Quill synchronously to register blots effectively before render if possible, 
// OR we rely on the lazy load. 
// Standard pattern: import ReactQuill, { Quill } from ...
// But we are lazy loading `react-quill-new`.
// Let's lazy load the internal component separately or just statically import it for now to avoid complexity with blot registration.
// Static import is safer for advanced customization.
import ReactQuill, { Quill } from 'react-quill-new';

// Register Custom HR Blot
const BlockEmbed = Quill.import('blots/block/embed');

class DividerBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        node.setAttribute('style', `border: none; border-top: ${value}px solid #333; margin: 10px 0;`);
        // Store value for delta
        node.setAttribute('data-thickness', value);
        return node;
    }

    static value(node) {
        return node.getAttribute('data-thickness');
    }
}
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';
Quill.register(DividerBlot);

export default function Content({ lesson, onPrev, onNext, hasPrev, hasNext, language, isEditor, onSave, settings, totalLessons, pageNumber }) {
    const [editedContent, setEditedContent] = useState("");
    const quillRef = useRef(null);
    // ... (rest of the file remains unchanged until render)


    // Helper to get locale content
    const getContent = () => {
        if (!lesson) return "";
        if (typeof lesson.content === 'string') return lesson.content;
        return lesson.content[language] || lesson.content['hi'] || lesson.content['en'];
    };

    const getTitle = () => {
        if (!lesson) return "";
        if (typeof lesson.title === 'string') return lesson.title;
        return lesson.title[language] || lesson.title['en'];
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
        const btn = document.getElementById('save-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span>Saved!</span>`;
            setTimeout(() => {
                if (btn) btn.innerHTML = originalText;
            }, 1000);
        }
    };

    // Custom Handler
    const insertDivider = () => {
        const thickness = prompt("Enter line thickness (e.g. 1, 3, 5):", "2");
        if (thickness && !isNaN(thickness)) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            if (range) {
                quill.insertEmbed(range.index, 'divider', thickness);
                quill.setSelection(range.index + 1);
            }
        }
    };

    // Memoize modules to prevent re-instantiation
    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['blockquote'],
                ['link', 'clean'],
                ['divider']
            ],
            handlers: {
                'divider': insertDivider
            }
        }
    }), []);

    // Custom Toolbar Icon for divider
    useEffect(() => {
        const dividerBtn = document.querySelector('.ql-divider');
        if (dividerBtn) {
            dividerBtn.innerHTML = '<b style="font-size:16px;">—</b>'; // Simple icon
            dividerBtn.title = "Insert Horizontal Line";
        }
    }, [isEditor]); // Re-run when editor appears

    // Add key to force animation re-trigger on lesson change
    const contentKey = lesson.originalIndex !== undefined ? lesson.originalIndex : (lesson.title?.en || "content");

    // Page Size Logic
    const getPageWidth = () => {
        if (!settings || !settings.pageSize) return '100%';
        switch (settings.pageSize) {
            case 'a4': return '210mm'; // Standard A4 width
            case 'a3': return '297mm';
            case 'a5': return '148mm';
            case 'letter': return '216mm'; // 8.5 inches
            case 'legal': return '216mm';
            default: return '100%';
        }
    };

    const containerStyle = {
        maxWidth: getPageWidth(),
        width: '100%',
        margin: '0 auto', // Center it
        minHeight: settings?.pageSize !== 'responsive' ? '297mm' : 'auto', // Approx height for A4 visual
        position: 'relative',
        boxShadow: settings?.pageSize !== 'responsive' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
        // Removed hardcoded padding to allow CSS .document-container to handle responsive padding
        backgroundColor: settings?.pageSize !== 'responsive' ? (settings?.bgColor || 'white') : 'transparent' // Paper look
    };

    // If using "responsive", we rely on the parent CSS padding. 
    // If using a fixed size (A4), we want to override the default padding and look like a sheet of paper.
    // However, the parent `.content-scroll` has padding. Let's adjust slightly.
    // Actually simplicity: Just apply max-width. The parent handles the scroll and main padding.

    return (
        <div className="content-scroll">
            <div className="document-container" key={contentKey} style={settings?.pageSize !== 'responsive' ? containerStyle : {}}>



                {/* Document Header */}
                <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        letterSpacing: '0.05em'
                    }}>
                        {getLevel()}
                    </span>

                    {/* Header Chapter Title (Right Side) */}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', maxWidth: '60%', textAlign: 'right' }}>
                        {getTitle()}
                    </span>
                </div>

                {isEditor ? (
                    <div className="editor-wrapper" style={{ position: 'relative' }}>
                        {/* Floating Save Button */}
                        <button
                            id="save-btn"
                            onClick={handleSave}
                            style={{
                                position: 'absolute',
                                top: '-65px', // Sit in the header area
                                right: '0',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', backgroundColor: 'var(--color-accent)', color: 'white',
                                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                                fontSize: '0.9rem', transition: 'background 0.2s', zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            <Save size={16} /> Save Changes
                        </button>

                        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading Editor...</div>}>
                            <div style={{ minHeight: '500px' }}>
                                <ReactQuill
                                    ref={quillRef}
                                    theme="snow"
                                    value={editedContent}
                                    onChange={setEditedContent}
                                    modules={modules}
                                    style={{ border: 'none' }}
                                    placeholder="Start typing..."
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
                    <div className="nav-footer" style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        marginTop: '40px',
                        borderTop: '1px solid var(--color-border)',
                        paddingTop: '20px'
                    }}>
                        {/* Buttons Row */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', width: '100%' }}>
                            <button
                                className="nav-btn"
                                onClick={onPrev}
                                disabled={!hasPrev}
                                title={language === 'hi' ? 'पिछला' : 'Previous'}
                                style={{ padding: '10px', borderRadius: '50%', width: '44px', height: '44px', justifyContent: 'center' }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                className="nav-btn"
                                onClick={onNext}
                                disabled={!hasNext}
                                title={language === 'hi' ? 'अगला' : 'Next'}
                                style={{ padding: '10px', borderRadius: '50%', width: '44px', height: '44px', justifyContent: 'center' }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Page Info Row (Responsive) */}
                        {settings?.showPageNumbers && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                fontSize: '0.75rem',
                                color: 'var(--color-text-muted)',
                                padding: '0 10px',
                                marginTop: '5px'
                            }}>
                                <div style={{ fontStyle: 'italic', maxWidth: '45%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {getTitle()}
                                </div>
                                <div style={{ fontWeight: 'bold' }}>
                                    {lesson.fromLink ? (language === 'hi' ? "सक्रिय नियम" : "Active Rule") : `Page ${pageNumber ? pageNumber - 1 : "?"} of ${totalLessons ? totalLessons - 1 : "?"}`}
                                </div>
                            </div>
                        )}
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
