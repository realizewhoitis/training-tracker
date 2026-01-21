'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { Save, User as UserIcon } from 'lucide-react';
import { submitDOR, updateDOR } from '@/app/actions/dor-submission';

interface DORFormProps {
    template: any;
    trainees: any[];
    initialData?: any; // FormResponse object if editing
}

export default function DORForm({ template, trainees, initialData }: DORFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse initial scores if they exist
    const initialScores = initialData ? JSON.parse(initialData.responseData) : {};

    return (
        <form
            action={initialData ? updateDOR : submitDOR}
            className="max-w-4xl mx-auto space-y-8 pb-20"
            onSubmit={() => setIsSubmitting(true)}
        >
            <input type="hidden" name="templateId" value={template.id} />
            {initialData && <input type="hidden" name="dorId" value={initialData.id} />}

            {/* Header & Trainee Selection */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            {initialData ? `Edit Report #${initialData.id}` : template.title}
                        </h1>
                        <p className="text-slate-500">
                            {initialData ? `Editing Record • ${new Date(initialData.date).toLocaleDateString()}` : `Daily Observation Report • Version ${template.version}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <UserIcon size={24} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Trainee</label>
                        <select
                            name="traineeId"
                            required
                            defaultValue={initialData ? initialData.traineeId : ""}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">-- Choose Employee --</option>
                            {trainees.map(t => (
                                <option key={t.empId} value={t.empId}>{t.empName}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Dynamic Sections */}
            {template.sections.map((section: any) => (
                <div key={section.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">
                        {section.title}
                    </h3>

                    <div className="space-y-6">
                        {section.fields.map((field: any) => (
                            <div key={field.id} className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    {field.label}
                                </label>

                                {field.type === 'RATING' && (
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                            <label key={num} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`field-${field.id}`}
                                                    value={num}
                                                    defaultChecked={parseInt(initialScores[field.id]) === num}
                                                    className="peer sr-only"
                                                    required={field.required}
                                                />
                                                <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-colors">
                                                    {num}
                                                </div>
                                            </label>
                                        ))}
                                        {/* Not Observed Option */}
                                        <label className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`field-${field.id}`}
                                                value="N.O."
                                                defaultChecked={initialScores[field.id] === 'N.O.'}
                                                className="peer sr-only"
                                            />
                                            <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 font-medium hover:bg-slate-50 peer-checked:bg-slate-500 peer-checked:text-white peer-checked:border-slate-500 transition-colors text-xs">
                                                N.O.
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {field.type === 'TEXT' && (
                                    <textarea
                                        name={`field-${field.id}`}
                                        defaultValue={initialScores[field.id] || ''}
                                        rows={3}
                                        className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter comments..."
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Submission Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-10">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm disabled:opacity-50 disabled:cursor-wait"
                    >
                        <Save className="mr-2" size={20} />
                        {isSubmitting ? 'Saving...' : (initialData ? 'Update Report' : 'Submit DOR')}
                    </button>
                </div>
            </div>
        </form>
    );
}
