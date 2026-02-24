'use client';

import { useState } from 'react';
import { Clipboard, UserCheck, Search, Filter, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import CsvPasteImporter from './CsvPasteImporter';
import { submitTrainingLogs } from '@/app/actions/log-training';

type Employee = {
    empId: number;
    empName: string | null;
    shift?: { name: string } | null;
};

type Training = {
    TrainingID: number;
    TrainingName: string;
};

export default function BulkTrainingManager({ employees, trainings }: { employees: Employee[], trainings: Training[] }) {
    const [activeTab, setActiveTab] = useState<'checklist' | 'csv'>('checklist');

    // Checklist State
    const [selectedTrainingId, setSelectedTrainingId] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [hours, setHours] = useState<number>(1);
    const [note, setNote] = useState('');
    const [selectedEmpIds, setSelectedEmpIds] = useState<Set<number>>(new Set());
    const [shiftFilter, setShiftFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ successCount: number, errors: string[] } | null>(null);

    // Filter Logic
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.empName?.toLowerCase().includes(searchQuery.toLowerCase()) || emp.empId.toString().includes(searchQuery);
        const matchesShift = shiftFilter === 'ALL' || emp.shift?.name === shiftFilter;
        return matchesSearch && matchesShift;
    });

    const handleToggleEmployee = (id: number) => {
        const newSet = new Set(selectedEmpIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedEmpIds(newSet);
    };

    const handleSelectAllFiltered = () => {
        const newSet = new Set(selectedEmpIds);
        filteredEmployees.forEach(emp => newSet.add(emp.empId));
        setSelectedEmpIds(newSet);
    };

    const handleDeselectAll = () => {
        setSelectedEmpIds(new Set());
    };

    const handleSubmitChecklist = async () => {
        if (!selectedTrainingId || selectedEmpIds.size === 0) return;

        setIsSubmitting(true);
        const entries = Array.from(selectedEmpIds).map(empId => ({
            employeeId: empId,
            trainingId: Number(selectedTrainingId),
            date: new Date(date),
            hours: Number(hours),
            note: note
        }));

        const res = await submitTrainingLogs(entries);
        setResult(res);
        setIsSubmitting(false);

        if (res.successCount > 0 && res.errors.length === 0) {
            // Reset selection on success
            setSelectedEmpIds(new Set());
            setNote('');
        }
    };

    const uniqueShifts = Array.from(new Set(employees.map(e => e.shift?.name).filter(Boolean))) as string[];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('checklist')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'checklist'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <UserCheck size={18} className="mr-2" />
                    Interactive Checklist
                </button>
                <button
                    onClick={() => setActiveTab('csv')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'csv'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Clipboard size={18} className="mr-2" />
                    Copy from Excel/CSV
                </button>
            </div>

            {/* Result Message */}
            {result && (
                <div className={`p-4 rounded-lg border flex items-start ${result.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                    {result.errors.length > 0 ? <AlertTriangle className="text-amber-500 mr-2 mt-0.5" size={20} /> : <CheckCircle className="text-green-500 mr-2 mt-0.5" size={20} />}
                    <div>
                        <p className="font-semibold text-slate-800">
                            {result.successCount} records saved successfully.
                        </p>
                        {result.errors.length > 0 && (
                            <ul className="mt-2 text-sm text-amber-700 list-disc list-inside max-h-32 overflow-y-auto">
                                {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        )}
                    </div>
                    <button onClick={() => setResult(null)} className="ml-auto text-sm text-slate-500 hover:underline">Dismiss</button>
                </div>
            )}

            {activeTab === 'checklist' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h2 className="font-semibold text-slate-800">1. Log Details</h2>

                            <div>
                                <label htmlFor="trainingEvent" className="block text-sm font-medium text-slate-700 mb-1">Training Event</label>
                                <select
                                    id="trainingEvent"
                                    title="Training Event"
                                    value={selectedTrainingId}
                                    onChange={(e) => setSelectedTrainingId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Training...</option>
                                    {trainings.map(t => (
                                        <option key={t.TrainingID} value={t.TrainingID}>{t.TrainingName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="trainingDate" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        id="trainingDate"
                                        title="Date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="trainingHours" className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                                    <input
                                        id="trainingHours"
                                        title="Hours"
                                        type="number"
                                        step="0.5"
                                        value={hours}
                                        onChange={(e) => setHours(parseFloat(e.target.value))}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="trainingNote" className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                                <textarea
                                    id="trainingNote"
                                    title="Note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="e.g. In-service training"
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm h-20 resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-700">Selected: {selectedEmpIds.size}</span>
                                    <button onClick={handleDeselectAll} className="text-xs text-blue-600 hover:underline">Clear All</button>
                                </div>
                                <button
                                    onClick={handleSubmitChecklist}
                                    disabled={!selectedTrainingId || selectedEmpIds.size === 0 || isSubmitting}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {isSubmitting ? 'Saving...' : 'Submit Log'}
                                    {!isSubmitting && <Save size={18} className="ml-2" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Employee Checklist */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
                            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 rounded-t-xl">
                                <h2 className="font-semibold text-slate-800">2. Select Employees</h2>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            title="Search name or ID"
                                            aria-label="Search name or ID"
                                            placeholder="Search name/ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg w-full sm:w-48"
                                        />
                                    </div>
                                    <select
                                        title="Shift Filter"
                                        aria-label="Shift Filter"
                                        value={shiftFilter}
                                        onChange={(e) => setShiftFilter(e.target.value)}
                                        className="text-sm border border-slate-300 rounded-lg py-1.5 pl-2 pr-8"
                                    >
                                        <option value="ALL">All Shifts</option>
                                        {uniqueShifts.map(s => <option key={s} value={s}>Shift {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-end">
                                <button
                                    onClick={handleSelectAllFiltered}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1"
                                >
                                    Select All Visible ({filteredEmployees.length})
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {filteredEmployees.map(emp => (
                                        <div
                                            key={emp.empId}
                                            onClick={() => handleToggleEmployee(emp.empId)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center ${selectedEmpIds.has(emp.empId)
                                                ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                                                : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selectedEmpIds.has(emp.empId) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                                                }`}>
                                                {selectedEmpIds.has(emp.empId) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{emp.empName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500">#{emp.empId}</span>
                                                    {emp.shift && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                                                            Shift {emp.shift.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredEmployees.length === 0 && (
                                        <div className="col-span-full py-12 text-center text-slate-500 italic">
                                            No employees match your filters.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <CsvPasteImporter onSuccess={() => setResult({ successCount: 0, errors: [] })} />
            )}
        </div>
    );
}
