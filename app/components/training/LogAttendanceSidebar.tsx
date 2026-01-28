'use client';

import { useState } from 'react';
import { Calendar, Save, Upload, FileText, CheckCircle, AlertTriangle, X, Download } from 'lucide-react';
import { addAttendee, bulkAddAttendees, BulkAttendeeEntry } from '@/app/actions/training';

type Employee = {
    empId: number;
    empName: string | null;
};

export default function LogAttendanceSidebar({
    trainingId,
    employees
}: {
    trainingId: number,
    employees: Employee[]
}) {
    const [mode, setMode] = useState<'SINGLE' | 'BATCH'>('SINGLE');
    const [batchText, setBatchText] = useState('');
    const [parsedEntries, setParsedEntries] = useState<BulkAttendeeEntry[]>([]);
    const [batchResult, setBatchResult] = useState<{ successCount: number, errors: string[] } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse simple CSV/TSV: EmpID, Date, Hours, Note
    const handleParse = () => {
        const rows = batchText.trim().split('\n');
        const newData: BulkAttendeeEntry[] = [];

        rows.forEach(row => {
            // Split by tab or comma, verify not empty
            const cols = row.split(/[\t,]+/).map(c => c.trim());
            if (cols.length >= 1 && cols[0] !== '') {
                const empId = parseInt(cols[0]);
                const dateRaw = cols[1];
                const hoursRaw = cols[2];
                const note = cols[3] || '';

                // Defaults
                const date = dateRaw ? new Date(dateRaw) : new Date();
                const hours = hoursRaw ? parseFloat(hoursRaw) : 1.0;

                if (!isNaN(empId) && !isNaN(hours)) {
                    newData.push({ employeeId: empId, date, hours, note });
                }
            }
        });
        setParsedEntries(newData);
        setBatchResult(null);
    };

    const handleDownloadTemplate = () => {
        const headers = ['EmployeeID', 'Date (YYYY-MM-DD)', 'Hours', 'Note'];
        const sampleRow = ['101', new Date().toISOString().split('T')[0], '1.0', 'Passed'];
        const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'training_attendance_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleBatchSubmit = async () => {
        setIsSubmitting(true);
        const res = await bulkAddAttendees(trainingId, parsedEntries);
        setBatchResult(res);
        setIsSubmitting(false);
        if (res.successCount > 0 && res.errors.length === 0) {
            setBatchText('');
            setParsedEntries([]);
        }
    };

    const handleSingleSubmit = async (formData: FormData) => {
        const res = await addAttendee(trainingId, formData);
        if (!res.success && res.error) {
            alert(`Error: ${res.error}`);
        } else {
            // Optional: reset form if needed
            const form = document.getElementById('single-entry-form') as HTMLFormElement;
            if (form) form.reset();
        }
    };

    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-4">
                <button
                    onClick={() => setMode('SINGLE')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${mode === 'SINGLE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Manual Entry
                </button>
                <button
                    onClick={() => setMode('BATCH')}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 ${mode === 'BATCH' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Batch Upload
                </button>
            </div>

            {mode === 'SINGLE' ? (
                /* SINGLE ENTRY FORM */
                <form action={handleSingleSubmit} id="single-entry-form" className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="employeeId">Employee</label>
                        <select
                            id="employeeId"
                            name="employeeId"
                            required
                            className="w-full text-sm border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2"
                            aria-label="Select Employee"
                        >
                            <option value="">-- Select Employee --</option>
                            {employees.map(emp => (
                                <option key={emp.empId} value={emp.empId}>{emp.empName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="date">Date</label>
                            <input
                                id="date"
                                type="date"
                                name="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full text-sm border-slate-300 rounded-lg p-2"
                                aria-label="Attendance Date"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="hours">Hours</label>
                            <input
                                id="hours"
                                type="number"
                                name="hours"
                                step="0.5"
                                required
                                defaultValue="1.0"
                                className="w-full text-sm border-slate-300 rounded-lg p-2"
                                aria-label="Attendance Hours"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="note">Notes (Optional)</label>
                        <input
                            id="note"
                            type="text"
                            name="note"
                            placeholder="e.g. Pass/Fail"
                            className="w-full text-sm border-slate-300 rounded-lg p-2"
                            aria-label="Attendance Note"
                        />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center">
                        <Calendar size={16} className="mr-2" />
                        Add Record
                    </button>
                </form>
            ) : (
                /* BATCH UPLOAD FORM */
                <div className="space-y-4">
                    <div className="flex items-start justify-between bg-white p-3 rounded border border-slate-200 text-xs text-slate-500">
                        <div>
                            <p className="font-semibold mb-1">Format:</p>
                            <code className="bg-slate-100 px-1 py-0.5 rounded">EmpID, Date, Hours, Note</code>
                            <p className="mt-1">Use tabs or commas.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                            title="Download CSV Template"
                        >
                            <Download size={14} />
                            <span className="underline">Template</span>
                        </button>
                    </div>

                    <textarea
                        value={batchText}
                        onChange={(e) => setBatchText(e.target.value)}
                        placeholder={`101, 2026-01-20, 1.0, Passed\n102, 2026-01-20, 1.0, Passed`}
                        className="w-full h-32 p-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-blue-500 focus:outline-none"
                        aria-label="Batch attendance data input"
                    />

                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            {parsedEntries.length} records found
                        </span>
                        <button
                            type="button"
                            onClick={handleParse}
                            className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 text-slate-600"
                        >
                            Preview
                        </button>
                    </div>

                    {parsedEntries.length > 0 && (
                        <div className="max-h-32 overflow-y-auto border border-slate-200 rounded text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr><th>ID</th><th>Date</th><th>Hrs</th></tr>
                                </thead>
                                <tbody>
                                    {parsedEntries.map((r, i) => (
                                        <tr key={i} className="border-t border-slate-100">
                                            <td className="p-1">{r.employeeId}</td>
                                            <td className="p-1">{r.date.toLocaleDateString()}</td>
                                            <td className="p-1">{r.hours}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {batchResult && (
                        <div className={`p-2 rounded text-xs ${batchResult.errors.length > 0 ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
                            <strong>Result:</strong> {batchResult.successCount} saved. {batchResult.errors.length} errors.
                            {batchResult.errors.length > 0 && (
                                <ul className="mt-1 list-disc list-inside">
                                    {batchResult.errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                                    {batchResult.errors.length > 3 && <li>...and more</li>}
                                </ul>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleBatchSubmit}
                        disabled={parsedEntries.length === 0 || isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {isSubmitting ? 'Uploading...' : 'Upload Batch'}
                        <Upload size={16} className="ml-2" />
                    </button>
                </div>
            )}
        </div>
    );
}
