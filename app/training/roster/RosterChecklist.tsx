'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { submitRoster } from '@/app/actions/log-training';
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from 'lucide-react';

interface Training {
    TrainingID: number;
    TrainingName: string | null;
}

interface Employee {
    empId: number;
    empName: string | null;
    shift: { name: string } | null;
}

export default function RosterChecklist({
    trainings,
    employees
}: {
    trainings: Training[];
    employees: Employee[];
}) {
    const router = useRouter();

    const [selectedTrainingId, setSelectedTrainingId] = useState<number | 'NEW' | ''>('');
    const [newTopicName, setNewTopicName] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [hours, setHours] = useState<string>('1.0');
    const [note, setNote] = useState<string>('');

    const [selectedEmpIds, setSelectedEmpIds] = useState<Set<number>>(new Set());
    const [expandedShifts, setExpandedShifts] = useState<Set<string>>(new Set(['ALL']));
    const [viewMode, setViewMode] = useState<'shift' | 'alpha'>('shift');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Alphabetical list
    const sortedEmployeesAlpha = useMemo(() => {
        return [...employees].sort((a, b) => (a.empName || '').localeCompare(b.empName || ''));
    }, [employees]);

    // Group employees by shift for easier selection
    const groupedEmployees = useMemo(() => {
        const groups: Record<string, Employee[]> = { 'Unassigned': [] };
        employees.forEach(emp => {
            const shiftName = emp.shift?.name || 'Unassigned';
            if (!groups[shiftName]) groups[shiftName] = [];
            groups[shiftName].push(emp);
        });

        // Delete Unassigned if empty to keep UI clean
        if (groups['Unassigned'].length === 0) delete groups['Unassigned'];

        return groups;
    }, [employees]);

    const handleToggleEmployee = (empId: number) => {
        const next = new Set(selectedEmpIds);
        if (next.has(empId)) {
            next.delete(empId);
        } else {
            next.add(empId);
        }
        setSelectedEmpIds(next);
    };

    const handleToggleShiftGroup = (shiftName: string, emps: Employee[]) => {
        const next = new Set(selectedEmpIds);
        // If all in this shift are currently selected, deselect them. Otherwise select all.
        const allSelected = emps.every(e => next.has(e.empId));

        emps.forEach(e => {
            if (allSelected) {
                next.delete(e.empId);
            } else {
                next.add(e.empId);
            }
        });
        setSelectedEmpIds(next);
    };

    const toggleShiftExpansion = (shiftName: string) => {
        const next = new Set(expandedShifts);
        if (next.has(shiftName)) next.delete(shiftName);
        else next.add(shiftName);
        setExpandedShifts(next);
    }

    const selectAll = () => setSelectedEmpIds(new Set(employees.map(e => e.empId)));
    const clearAll = () => setSelectedEmpIds(new Set());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedTrainingId) return setError("Please select a training topic.");
        if (selectedTrainingId === 'NEW' && !newTopicName.trim()) return setError("Please enter a name for the new training topic.");
        if (selectedEmpIds.size === 0) return setError("Please select at least one employee.");
        if (!date) return setError("Please specify a date.");
        if (!hours || parseFloat(hours) <= 0) return setError("Please specify valid hours.");

        setIsSubmitting(true);

        try {
            const finalTopicPayload = selectedTrainingId === 'NEW' ? newTopicName.trim() : Number(selectedTrainingId);

            const res = await submitRoster(
                finalTopicPayload,
                new Date(date),
                parseFloat(hours),
                Array.from(selectedEmpIds),
                note
            );

            if (!res.success) {
                setError(res.error || "Failed to submit roster.");
            } else {
                // Success
                router.push('/training?roster_success=true');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ERROR DISPLAY */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 flex items-start shadow-sm">
                    <XCircle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COL: EVENT DETAILS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
                            Event Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Training Topic <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                                    value={selectedTrainingId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'NEW') setSelectedTrainingId('NEW');
                                        else setSelectedTrainingId(val ? Number(val) : '');
                                    }}
                                    required
                                >
                                    <option value="">-- Select a Topic --</option>
                                    <option value="NEW" className="font-bold text-blue-600 bg-blue-50">➕ Create New Topic...</option>
                                    {trainings.map(t => (
                                        <option key={t.TrainingID} value={t.TrainingID}>
                                            {t.TrainingName}
                                        </option>
                                    ))}
                                </select>

                                {selectedTrainingId === 'NEW' && (
                                    <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            New Topic Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newTopicName}
                                            onChange={(e) => setNewTopicName(e.target.value)}
                                            placeholder="e.g. CPR Certification"
                                            className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white border-2 border-blue-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Hours <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.25"
                                    step="0.25"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Session Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Location, instructor, or brief description..."
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50 text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting || selectedEmpIds.size === 0}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? 'Logging...' : `Submit Roster (${selectedEmpIds.size} selected)`}
                            </button>
                        </div>
                    </div>
                </div>


                {/* RIGHT COL: EMPLOYEE ROSTER */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="bg-slate-800 text-white p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h2 className="text-lg font-bold flex items-center">
                                    <CheckCircle2 className="w-5 h-5 mr-2 text-blue-400" />
                                    Active Roster
                                </h2>
                                <p className="text-slate-400 text-sm">Select who attended this session</p>
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('shift')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'shift' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        Group by Shift
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('alpha')}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'alpha' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        Alphabetical List
                                    </button>
                                </div>
                            </div>
                            <div className="flex space-x-3 text-sm font-medium items-end sm:items-center">
                                <button type="button" onClick={selectAll} className="text-blue-300 hover:text-white transition-colors">Select All</button>
                                <span className="text-slate-600">|</span>
                                <button type="button" onClick={clearAll} className="text-slate-300 hover:text-white transition-colors">Clear All</button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 flex-1">
                            {viewMode === 'shift' ? (
                                <div className="space-y-4">
                                    {Object.entries(groupedEmployees).map(([shiftName, emps]) => {
                                        const isExpanded = expandedShifts.has(shiftName) || expandedShifts.has('ALL');
                                        const allSelected = emps.every(e => selectedEmpIds.has(e.empId));
                                        const someSelected = emps.some(e => selectedEmpIds.has(e.empId)) && !allSelected;

                                        return (
                                            <div key={shiftName} className="bg-white border text-balance border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                                {/* SHIFT HEADER */}
                                                <div className="bg-slate-100 flex items-center justify-between p-3 border-b border-slate-200">
                                                    <button
                                                        type="button"
                                                        className="flex items-center cursor-pointer flex-1"
                                                        onClick={() => toggleShiftExpansion(shiftName)}
                                                    >
                                                        {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500 mr-2" /> : <ChevronRight className="w-5 h-5 text-slate-500 mr-2" />}
                                                        <span className="font-bold text-slate-700">Shift {shiftName}</span>
                                                        <span className="ml-3 text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                                            {emps.length} Members
                                                        </span>
                                                    </button>

                                                    <label
                                                        className="text-sm font-medium hover:bg-slate-200 px-3 py-1 rounded transition-colors flex items-center cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className={`w-4 h-4 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${someSelected ? 'opacity-50' : ''}`}
                                                            checked={allSelected || someSelected}
                                                            onChange={() => handleToggleShiftGroup(shiftName, emps)}
                                                        />
                                                        <span className={allSelected ? "text-blue-700 font-bold" : "text-slate-600"}>
                                                            {allSelected ? "Shift Selected" : "Select Shift"}
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* EMPLOYEE LIST */}
                                                {isExpanded && (
                                                    <div className="p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                        {emps.map(emp => (
                                                            <label
                                                                key={emp.empId}
                                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedEmpIds.has(emp.empId)
                                                                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                                                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                                    checked={selectedEmpIds.has(emp.empId)}
                                                                    onChange={() => handleToggleEmployee(emp.empId)}
                                                                />
                                                                <span className={`ml-3 font-medium ${selectedEmpIds.has(emp.empId) ? 'text-blue-900' : 'text-slate-700'}`}>
                                                                    {emp.empName}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {sortedEmployeesAlpha.map(emp => (
                                            <label
                                                key={emp.empId}
                                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedEmpIds.has(emp.empId)
                                                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={selectedEmpIds.has(emp.empId)}
                                                    onChange={() => handleToggleEmployee(emp.empId)}
                                                />
                                                <div className="ml-3">
                                                    <div className={`font-medium ${selectedEmpIds.has(emp.empId) ? 'text-blue-900' : 'text-slate-700'}`}>
                                                        {emp.empName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        Shift {emp.shift?.name || 'Unassigned'}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>

        </form>
    );
}
