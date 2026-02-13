'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Plus } from 'lucide-react';

interface NamingToken {
    id: string;
    type: 'system' | 'field' | 'text';
    value: string; // The underlying value e.g. {{date}} or {{field:Shift}} or " - "
    label: string; // Display label e.g. "Date" or "Shift"
}

interface NamingConventionBuilderProps {
    defaultValue: string;
    fields: { label: string; id: number }[];
    onSave: (value: string) => void;
}

function DraggableItem({ token, onRemove }: { token: NamingToken; onRemove?: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: token.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isText = token.type === 'text';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm cursor-grab active:cursor-grabbing select-none
                ${token.type === 'system' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                ${token.type === 'field' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                ${token.type === 'text' ? 'bg-slate-100 text-slate-600 border-slate-200 font-mono' : ''}
            `}
        >
            <GripVertical size={12} className="mr-1 opacity-50" />
            {token.label}
            {onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="ml-2 hover:bg-black/10 rounded-full p-0.5"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}

function ToolbarItem({ type, value, label }: { type: 'system' | 'field' | 'text'; value: string; label: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolbar-${value}`,
        data: { type, value, label, isToolbar: true }
    });

    const style = { transform: CSS.Translate.toString(transform) };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm cursor-grab active:cursor-grabbing select-none mb-2 mr-2 inline-flex
                ${type === 'system' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : ''}
                ${type === 'field' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' : ''}
                ${type === 'text' ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' : ''}
            `}
        >
            <Plus size={12} className="mr-1 opacity-50" />
            {label}
        </div>
    );
}

export default function NamingConventionBuilder({ defaultValue, fields, onSave }: NamingConventionBuilderProps) {
    const [tokens, setTokens] = useState<NamingToken[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<NamingToken | null>(null);

    // Parse initial string
    useEffect(() => {
        if (!defaultValue) return;

        const parsed: NamingToken[] = [];
        const regex = /\{\{(.*?)\}\}|([^{}]+)/g;
        let match;
        let count = 0;

        while ((match = regex.exec(defaultValue)) !== null) {
            const fullMatch = match[0];
            const variable = match[1];
            const text = match[2];

            if (variable) {
                if (variable.startsWith('field:')) {
                    const label = variable.replace('field:', '');
                    parsed.push({ id: `token-${count++}`, type: 'field', value: fullMatch, label });
                } else {
                    const label = variable.charAt(0).toUpperCase() + variable.slice(1);
                    parsed.push({ id: `token-${count++}`, type: 'system', value: fullMatch, label });
                }
            } else if (text) {
                parsed.push({ id: `token-${count++}`, type: 'text', value: text, label: `"${text}"` });
            }
        }
        setTokens(parsed);
    }, []); // Run once on mount

    // Serialize and Save when tokens change
    useEffect(() => {
        const newValue = tokens.map(t => t.value).join('');
        // Debounce slightly or just save? For now, we'll let parent handle debounce if needed, 
        // but typically onSave might be "onBlur" equivalent. 
        // Actually, let's expose a manual save or auto-save.
        // We will call onSave whenever it changes, but the parent (FormBuilder) handles the action.
        if (tokens.length > 0 || defaultValue) { // Avoid clearing if initially empty and still empty
            onSave(newValue);
        }
    }, [tokens, onSave]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);

        if (active.data.current?.isToolbar) {
            setActiveItem({
                id: active.id as string,
                type: active.data.current.type,
                value: active.data.current.value,
                label: active.data.current.label
            });
        } else {
            setActiveItem(tokens.find(t => t.id === active.id) || null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        // Sorting existing items
        if (!active.data.current?.isToolbar && over.id !== active.id) {
            const oldIndex = tokens.findIndex((t) => t.id === active.id);
            const newIndex = tokens.findIndex((t) => t.id === over.id);

            // Should be handled by arrayMove in dnd-kit normally, but we are managing state manually
            const newTokens = [...tokens];
            const [moved] = newTokens.splice(oldIndex, 1);
            newTokens.splice(newIndex, 0, moved);
            setTokens(newTokens);
            return;
        }

        // Dropping from toolbar
        if (active.data.current?.isToolbar && over.id === 'drop-zone') {
            const newItem: NamingToken = {
                id: `token-${Date.now()}`,
                type: active.data.current.type,
                value: active.data.current.value,
                label: active.data.current.label
            };
            setTokens([...tokens, newItem]);
        }
    };

    const removeItem = (id: string) => {
        setTokens(tokens.filter(t => t.id !== id));
    };

    const addTextSeparator = () => {
        const text = prompt("Enter text separator (e.g. ' - ' or 'Shift: '):");
        if (text) {
            const newItem: NamingToken = {
                id: `token-${Date.now()}`,
                type: 'text',
                value: text,
                label: `"${text}"`
            };
            setTokens([...tokens, newItem]);
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Build Naming Pattern:</p>
                    {/* Drop Zone */}
                    <SortableContext items={tokens} strategy={horizontalListSortingStrategy}>
                        <DroppableZone id="drop-zone" tokens={tokens} onRemove={removeItem} />
                    </SortableContext>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Available Variables:</p>
                    <div className="flex flex-wrap">
                        <ToolbarItem type="system" value="{{date}}" label="Date" />
                        <ToolbarItem type="system" value="{{trainee}}" label="Trainee" />
                        <ToolbarItem type="system" value="{{trainer}}" label="Trainer" />

                        {fields.map(f => (
                            <ToolbarItem key={f.id} type="field" value={`{{field:${f.label}}}`} label={f.label} />
                        ))}

                        <button
                            onClick={addTextSeparator}
                            className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 mb-2 mr-2"
                        >
                            <Plus size={12} className="mr-1" />
                            Text
                        </button>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeItem ? (
                    <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border shadow-md cursor-grabbing
                        ${activeItem.type === 'system' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${activeItem.type === 'field' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${activeItem.type === 'text' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                    `}>
                        <GripVertical size={12} className="mr-1 opacity-50" />
                        {activeItem.label}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function DroppableZone({ id, tokens, onRemove }: { id: string, tokens: NamingToken[], onRemove: (id: string) => void }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[60px] p-2 rounded-lg border-2 border-dashed flex flex-wrap items-center gap-2 transition-colors
                ${isOver ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'}
            `}
        >
            {tokens.length === 0 && !isOver && (
                <span className="text-slate-400 text-sm italic mx-auto">Drag items here...</span>
            )}
            {tokens.map(token => (
                <DraggableItem key={token.id} token={token} onRemove={() => onRemove(token.id)} />
            ))}
        </div>
    );
}
