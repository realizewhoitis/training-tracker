'use client';

import { useState } from 'react';
import { Settings, Trash2, Plus, X } from 'lucide-react';
import { Shift } from '@prisma/client';
import { createShift, deleteShift } from '../actions/shift-actions';

export default function ManageShiftsModal({ initialShifts }: { initialShifts: Shift[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [newShiftName, setNewShiftName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShiftName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await createShift(newShiftName.trim());
            if (!res.success || !res.shift) {
                throw new Error(res.error || "Failed to create shift");
            }
            setShifts([...shifts, res.shift].sort((a, b) => a.name.localeCompare(b.name)));
            setNewShiftName('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (shiftId: number, shiftName: string) => {
        if (!confirm(`Are you sure you want to delete the "${shiftName}" shift?\n\nAny employees currently assigned to this shift will become "Unassigned".`)) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await deleteShift(shiftId);
            if (!res.success) {
                throw new Error(res.error || "Failed to delete shift");
            }
            setShifts(shifts.filter(s => s.id !== shiftId));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium border border-slate-300"
            >
                <Settings className="w-4 h-4" />
                <span>Manage Shifts</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900">Manage Shifts</h2>
                            <button onClick={() => setIsOpen(false)} aria-label="Close modal" className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2 mb-6">
                                {shifts.length === 0 ? (
                                    <p className="text-slate-500 text-sm italic text-center py-4">No shifts created yet.</p>
                                ) : (
                                    shifts.map(shift => (
                                        <div key={shift.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                            <span className="font-medium text-slate-700">{shift.name}</span>
                                            <button
                                                onClick={() => handleDelete(shift.id, shift.name)}
                                                disabled={isSubmitting}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50"
                                                aria-label={`Delete ${shift.name} shift`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>

                        <div className="p-4 border-t border-gray-100 bg-slate-50">
                            <form onSubmit={handleCreate} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New shift name..."
                                    className="flex-1 rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-sm px-3 shadow-sm"
                                    value={newShiftName}
                                    onChange={e => setNewShiftName(e.target.value)}
                                    disabled={isSubmitting}
                                    maxLength={30}
                                />
                                <button
                                    type="submit"
                                    disabled={!newShiftName.trim() || isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
