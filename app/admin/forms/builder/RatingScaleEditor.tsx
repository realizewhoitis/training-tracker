'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: string;
    item: string;
    onEdit: (current: string) => void;
    onDelete: (item: string) => void;
}

function SortableItem({ id, item, onEdit, onDelete }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    // eslint-disable-next-line react/forbid-dom-props
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="relative group/rating flex flex-col items-center mx-1">
            <div
                {...attributes}
                {...listeners}
                className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm cursor-move hover:border-blue-400 hover:text-blue-600 transition-colors"
                title="Drag to reorder"
            >
                {item}
            </div>

            <div className="absolute -top-3 -right-3 opacity-0 group-hover/rating:opacity-100 transition-opacity flex flex-col space-y-1 z-10">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item); }}
                    className="p-1 bg-white border border-slate-200 rounded-full text-red-500 hover:bg-red-50 shadow-sm"
                    title="Delete option"
                >
                    <Trash2 size={12} />
                </button>
            </div>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item); }}
                className="mt-2 text-[10px] text-slate-400 opacity-0 group-hover/rating:opacity-100 hover:text-blue-600 flex items-center"
            >
                <Pencil size={10} className="mr-1" /> Edit
            </button>
        </div>
    );
}

export default function RatingScaleEditor({
    defaultValue,
    onSave
}: {
    defaultValue: string | undefined | null;
    onSave: (val: string) => Promise<void>;
}) {
    // Parse the default value or fall back to the standard 1-7 N.O.
    const standardScale = ["1", "2", "3", "4", "5", "6", "7", "N.O."];
    let parsed: string[] = standardScale;
    try {
        if (defaultValue) parsed = JSON.parse(defaultValue);
    } catch (e) { }

    const [items, setItems] = useState<string[]>(parsed);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);
            const newSorted = arrayMove(items, oldIndex, newIndex);
            setItems(newSorted);
            await triggerSave(newSorted);
        }
    };

    const handleEdit = async (currentItem: string) => {
        const newLabel = prompt('Rename rating option:', currentItem);
        if (newLabel && newLabel !== currentItem && newLabel.trim() !== '') {
            // Check for duplicates
            if (items.includes(newLabel.trim())) {
                alert('That label already exists in the scale.');
                return;
            }
            const updated = items.map(i => i === currentItem ? newLabel.trim() : i);
            setItems(updated);
            await triggerSave(updated);
        }
    };

    const handleDelete = async (itemToDelete: string) => {
        if (items.length <= 2) {
            alert('A rating scale must have at least 2 options.');
            return;
        }
        if (confirm(`Remove "${itemToDelete}" from the rating scale?`)) {
            const updated = items.filter(i => i !== itemToDelete);
            setItems(updated);
            await triggerSave(updated);
        }
    };

    const handleAdd = async () => {
        const newLabel = prompt('Enter a new label (e.g., "8", "N/A", "Bonus"):');
        if (newLabel && newLabel.trim() !== '') {
            if (items.includes(newLabel.trim())) {
                alert('That label already exists in the scale.');
                return;
            }
            const updated = [...items, newLabel.trim()];
            setItems(updated);
            await triggerSave(updated);
        }
    }

    const triggerSave = async (newItems: string[]) => {
        setIsSaving(true);
        await onSave(JSON.stringify(newItems));
        setIsSaving(false);
    }

    return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">Custom Rating Scale</h3>
                    <p className="text-xs text-slate-500">Define the exact buttons that appear for "Rating" questions on this form.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-100 shadow-sm"
                >
                    <Plus size={14} /> <span>Add Option</span>
                </button>
            </div>

            <div className="flex items-start justify-center p-4 bg-white rounded border border-slate-100 min-h-[100px] overflow-x-auto shadow-inner">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items} strategy={horizontalListSortingStrategy}>
                        <div className="flex space-x-2 pb-4">
                            {items.map((item) => (
                                <SortableItem
                                    key={item}
                                    id={item}
                                    item={item}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {isSaving && <p className="text-xs text-blue-500 mt-2 text-center animate-pulse">Saving scale configuration...</p>}
        </div>
    );
}
