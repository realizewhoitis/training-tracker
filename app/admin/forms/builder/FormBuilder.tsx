'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Type, Star } from 'lucide-react';
import { addSection, addField, publishTemplate } from '@/app/actions/form-builder';

// Separate component for sortable items
function SortableItem(props: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </div>
    );
}

export default function FormBuilder({ template }: { template: any }) {
    const [isPublishing, setIsPublishing] = useState(false);

    // Using sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Simplistic handlers for adding items - in a real app these would have modals or inline edits
    const handleAddSection = async () => {
        const title = prompt("Section Title:");
        if (title) {
            // Calculate max order
            const maxOrder = template.sections.length > 0 ? Math.max(...template.sections.map((s: any) => s.order)) : 0;
            await addSection(template.id, title, maxOrder + 1);
        }
    };

    const handleAddField = async (sectionId: number, type: string) => {
        const label = prompt(`Label for ${type} field:`);
        if (label) {
            // Need to find the section to get current field max order
            const section = template.sections.find((s: any) => s.id === sectionId);
            const maxOrder = section.fields.length > 0 ? Math.max(...section.fields.map((f: any) => f.order)) : 0;
            await addField(sectionId, label, type, maxOrder + 1);
        }
    }

    const handlePublish = async () => {
        if (confirm("Are you sure? Once published, trainees will see this form.")) {
            setIsPublishing(true);
            await publishTemplate(template.id);
            setIsPublishing(false);
            alert("Published!");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-700">Builder Preview</h2>
                <div className="space-x-2">
                    <button onClick={handleAddSection} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm">
                        + Add Section
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={template.isPublished || isPublishing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                    >
                        {template.isPublished ? 'Published' : 'Publish Template'}
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 min-h-[500px] p-8 rounded-xl border border-slate-200 shadow-inner">
                {/* Visual Representation of the Form */}
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center mb-8 border-b border-slate-200 pb-4">
                        <h1 className="text-3xl font-bold text-slate-800">{template.title}</h1>
                        <p className="text-slate-500">Daily Observation Report</p>
                    </div>

                    {template.sections.map((section: any) => (
                        <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 group">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center">
                                    <GripVertical className="text-slate-300 mr-2 cursor-move" size={16} />
                                    {section.title}
                                </h3>
                                <div className="space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleAddField(section.id, 'RATING')} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded hover:bg-amber-100" title="Add Rating 1-7">
                                        + Rating
                                    </button>
                                    <button onClick={() => handleAddField(section.id, 'TEXT')} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100" title="Add Text Area">
                                        + Text
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {section.fields.length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-2">No fields in this section yet.</p>
                                )}
                                {section.fields.map((field: any) => (
                                    <div key={field.id} className="flex items-start p-3 bg-slate-50 rounded border border-slate-100 relative group/field">
                                        <GripVertical className="text-slate-300 mr-3 mt-1 cursor-move" size={14} />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-slate-700 mb-1">{field.label}</p>

                                            {field.type === 'RATING' && (
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4, 5, 6, 7, "N.O."].map(n => (
                                                        <div key={n} className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-xs text-slate-500">
                                                            {n}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {field.type === 'TEXT' && (
                                                <div className="w-full h-16 bg-white border border-slate-200 rounded p-2 text-xs text-slate-300">
                                                    Check for spelling and grammar...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {template.sections.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <p>This form is empty.</p>
                            <p className="text-sm">Click &quot;Add Section&quot; to start building.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
