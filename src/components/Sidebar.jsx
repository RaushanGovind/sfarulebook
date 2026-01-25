import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Trash2, PlusCircle, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

export default function Sidebar({ lessons, currentIndex, onSelect, isOpen, onCloseMobile, language, customStyle, isEditor, onDelete, onAdd, onReorder }) {
    const activeRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [width, setWidth] = useState(280);
    const [isResizing, setIsResizing] = useState(false);

    // Resize Logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < 600) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require movement of 8px to start drag, prevents accidental clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [currentIndex]);

    const getTitle = (lesson) => {
        if (typeof lesson.title === 'string') return lesson.title;
        return lesson.title[language] || lesson.title['hi'] || lesson.title['en'];
    };

    // Note: Filtering disables drag and drop because indices mismatch. 
    // We only enable DnD when not searching.
    const isSearching = searchTerm.length > 0;

    const filteredLessons = lessons.map((l, i) => ({ ...l, originalIndex: i }))
        .filter(lesson => {
            const query = searchTerm.toLowerCase();
            const titleMatch = getTitle(lesson).toLowerCase().includes(query);

            let contentMatch = false;
            if (lesson.content) {
                if (typeof lesson.content === 'string') {
                    contentMatch = lesson.content.toLowerCase().includes(query);
                } else {
                    contentMatch = (lesson.content.en || "").toLowerCase().includes(query) ||
                        (lesson.content.hi || "").toLowerCase().includes(query);
                }
            }

            return titleMatch || contentMatch;
        });

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            // Find original indices
            const oldIndex = lessons.findIndex((_, i) => `item-${i}` === active.id);
            const newIndex = lessons.findIndex((_, i) => `item-${i}` === over.id);
            onReorder(oldIndex, newIndex);
        }
    };

    // Grouping logic for display
    let lastLevel = null;

    return (
        <>
            <div
                className={`modal-overlay ${isOpen ? 'block md:hidden' : 'hidden'}`}
                style={{ display: isOpen && window.innerWidth < 768 ? 'block' : 'none', zIndex: 45 }}
                onClick={onCloseMobile}
            />

            <aside
                className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
                style={{ ...customStyle, width: isOpen ? undefined : `${width}px` }}
            >
                {/* Drag Handle */}
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                    }}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '6px',
                        cursor: 'col-resize',
                        zIndex: 100,
                        background: 'transparent',
                        ':hover': { background: 'rgba(0,0,0,0.1)' } // Hover effect usually needs CSS class or state, simple transparent is functional
                    }}
                    title="Drag to resize"
                />
                <div className="sidebar-header">
                    <h2>📘 SFA Rules</h2>
                </div>

                <div className="sidebar-search">
                    <input
                        type="text"
                        placeholder={language === 'hi' ? "खोजें..." : "Search..."}
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="sidebar-menu" id="menu">
                    {/* If Editor Mode and Not Searching, Enable DragContext */}
                    {isEditor && !isSearching ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={lessons.map((_, i) => `item-${i}`)}
                                strategy={verticalListSortingStrategy}
                            >
                                {filteredLessons.map((lesson) => {
                                    const showHeader = lesson.level !== lastLevel;
                                    if (!searchTerm) lastLevel = lesson.level;
                                    const itemId = `item-${lesson.originalIndex}`;

                                    const isLinkRule = lesson.fromLink;
                                    const itemStyle = isLinkRule ? {
                                        backgroundColor: '#1e293b', // Darker theme for editor mode to show contrast
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        padding: '10px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                    } : {
                                        color: 'var(--color-text-main)'
                                    };

                                    return (
                                        <React.Fragment key={itemId}>
                                            {showHeader && (
                                                <div style={{
                                                    padding: '16px 14px 8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: 'var(--color-text-muted)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    {lesson.level}
                                                </div>
                                            )}
                                            <SortableItem id={itemId}>
                                                <div
                                                    className={`menu-item ${lesson.originalIndex === currentIndex ? 'active' : ''}`}
                                                    onClick={() => {
                                                        onSelect(lesson.originalIndex);
                                                        if (window.innerWidth < 768) onCloseMobile();
                                                    }}
                                                    ref={lesson.originalIndex === currentIndex ? activeRef : null}
                                                    style={{
                                                        cursor: isEditor ? 'grab' : 'pointer',
                                                        ...itemStyle
                                                    }}
                                                >
                                                    {isEditor && (
                                                        <GripVertical size={16} style={{ color: isLinkRule ? '#94a3b8' : 'var(--color-text-muted)', marginRight: '4px' }} />
                                                    )}

                                                    {/* Title */}
                                                    <span style={{ flex: 1 }}>
                                                        {getTitle(lesson)}
                                                    </span>

                                                    {/* Actions */}
                                                    {isEditor ? (
                                                        <button
                                                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm("Are you sure you want to delete this rule?")) {
                                                                    onDelete(lesson.originalIndex);
                                                                }
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                display: 'flex',
                                                                opacity: 0.7
                                                            }}
                                                            title="Delete Rule"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    ) : (
                                                        lesson.originalIndex === currentIndex && <ChevronRight size={16} />
                                                    )}
                                                </div>
                                            </SortableItem>
                                        </React.Fragment>
                                    );
                                })}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        // Static List (Non-Editor or Searching)
                        filteredLessons.map((lesson) => {
                            const showHeader = lesson.level !== lastLevel;
                            if (!searchTerm) lastLevel = lesson.level;

                            const isLinkRule = lesson.fromLink;
                            const itemStyle = isLinkRule ? {
                                backgroundColor: '#fff7ed', // Warm orange/yellow tint for Active
                                color: '#9a3412',
                                fontWeight: 'bold',
                                border: '1px solid #fed7aa',
                                borderRadius: '8px',
                                marginBottom: '24px', // Significant separation
                                padding: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            } : {
                                color: 'var(--color-text-main)'
                            };

                            return (
                                <React.Fragment key={lesson.originalIndex}>
                                    {showHeader && (
                                        <div style={{
                                            padding: '16px 14px 8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            color: 'var(--color-text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {lesson.level}
                                        </div>
                                    )}
                                    <div
                                        className={`menu-item ${lesson.originalIndex === currentIndex ? 'active' : ''}`}
                                        onClick={() => {
                                            onSelect(lesson.originalIndex);
                                            if (window.innerWidth < 768) onCloseMobile();
                                        }}
                                        ref={lesson.originalIndex === currentIndex ? activeRef : null}
                                        style={itemStyle}
                                    >
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7, minWidth: '20px', display: 'none' }}>
                                        </span>
                                        <span style={{ flex: 1 }}>
                                            {getTitle(lesson)}
                                        </span>
                                        {lesson.originalIndex === currentIndex && <ChevronRight size={16} />}
                                    </div>
                                </React.Fragment>
                            );
                        })
                    )}

                    {filteredLessons.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            No chapters found
                        </div>
                    )}

                    {isEditor && (
                        <button
                            onClick={onAdd}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '12px',
                                border: '2px dashed var(--color-border)',
                                background: 'transparent',
                                borderRadius: '8px',
                                color: 'var(--color-accent)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <PlusCircle size={18} /> Add New Rule
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
