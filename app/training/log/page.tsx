
'use client';

import { useState } from 'react';
import { Clipboard, CheckCircle, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { submitTrainingLogs, TrainingLogEntry } from '@/app/actions/log-training';

export default function BulkLogPage() {
    const [inputText, setInputText] = useState('');
    const [parsedData, setParsedData] = useState<TrainingLogEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ successCount: number, errors: string[] } | null>(null);

    const handleParse = () => {
        const rows = inputText.trim().split('\n');
        const newData: TrainingLogEntry[] = [];

        // Expected format: EmpID [tab/comma] TrainingID [tab/comma] Date [tab/comma] Hours [tab/comma] Note
        rows.forEach(row => {
            // Split by tab or comma
            const cols = row.split(/[\t,]+/).map(c => c.trim());

            if (cols.length >= 4) {
                const empId = parseInt(cols[0]);
                const trainingId = parseInt(cols[1]);
                const date = new Date(cols[2]);
                const hours = parseFloat(cols[3]);
                const note = cols[4] || '';

                if (!isNaN(empId) && !isNaN(trainingId) && !isNaN(date.getTime()) && !isNaN(hours)) {
                    newData.push({
                        employeeId: empId,
                        trainingId: trainingId,
                        date: date,
                        hours: hours,
                        note: note
                    });
                }
            }
        });
        setParsedData(newData);
        setResult(null);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const res = await submitTrainingLogs(parsedData);
        setResult(res);
        setIsSubmitting(false);
        if (res.successCount > 0) {
            // Clear data on partial or full success to prevent double submission
            if (res.errors.length === 0) {
                setParsedData([]);
                setInputText('');
            } else {
                // Keep the logic simple for MVP: just show the result
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Bulk Training Entry</h1>
                    <p className="text-slate-500">Copy and paste logs from Excel or CSV</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-slate-800 flex items-center">
                                <Clipboard size={18} className="mr-2 text-indigo-500" />
                                Paste Data
                            </h2>
                            <button onClick={() => setInputText('')} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
                        </div>

                        <div className="mb-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                            <strong>Format:</strong> EmployeeID | TrainingID | Date (YYYY-MM-DD) | Hours | Note (Optional)
                            <br />
                            Separated by tabs (Excel default) or commas.
                        </div>

                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full h-64 p-4 font-mono text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`101\t5\t2025-01-15\t4.0\tCPR Training\n102\t2\t2025-01-16\t2.0\tRadio Update`}
                        />

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleParse}
                                disabled={!inputText}
                                className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={18} className="mr-2" />
                                Preview Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-4">
                    {result && (
                        <div className={`p-4 rounded-lg border ${result.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center mb-2">
                                {result.errors.length > 0 ? <AlertTriangle className="text-amber-500 mr-2" /> : <CheckCircle className="text-green-500 mr-2" />}
                                <span className="font-semibold text-slate-800">
                                    {result.successCount} records saved. {result.errors.length} errors.
                                </span>
                            </div>
                            {result.errors.length > 0 && (
                                <ul className="text-sm text-amber-700 list-disc list-inside max-h-32 overflow-y-auto">
                                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-slate-800">Preview ({parsedData.length})</h2>
                            {parsedData.length > 0 && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Submit Logs'}
                                    {!isSubmitting && <Save size={18} className="ml-2" />}
                                </button>
                            )}
                        </div>

                        {parsedData.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                                <p>No valid data parsed yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[500px]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 font-medium text-slate-600">Emp ID</th>
                                            <th className="px-3 py-2 font-medium text-slate-600">Training ID</th>
                                            <th className="px-3 py-2 font-medium text-slate-600">Date</th>
                                            <th className="px-3 py-2 font-medium text-slate-600">Hrs</th>
                                            <th className="px-3 py-2 font-medium text-slate-600">Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {parsedData.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-3 py-2">{row.employeeId}</td>
                                                <td className="px-3 py-2">{row.trainingId}</td>
                                                <td className="px-3 py-2 whitespace-nowrap">{row.date.toLocaleDateString()}</td>
                                                <td className="px-3 py-2">{row.hours}</td>
                                                <td className="px-3 py-2 truncate max-w-[100px]">{row.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
