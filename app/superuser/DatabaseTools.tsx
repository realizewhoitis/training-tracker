'use client';

import { useState } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { syncDatabaseSequences } from './actions';

export default function DatabaseTools() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; failures?: string[] } | null>(null);

    const handleSync = async () => {
        setIsSyncing(true);
        setResult(null);
        try {
            const response = await syncDatabaseSequences();
            setResult(response);
        } catch (error: any) {
            setResult({ success: false, message: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Database className="mr-2 text-emerald-500" /> Database Maintenance
            </h2>
            <p className="text-sm text-slate-500 mb-4">
                Run critical database operations. If you recently imported data from Microsoft Access or another system, you must synchronize the auto-increment ID sequences to prevent "Unique Constraint Failed" creation errors.
            </p>

            <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronizing Sequences...' : 'Sync ID Sequences'}
            </button>

            {result && (
                <div className={`mt-4 p-4 rounded-lg text-sm flex items-start ${result.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {result.success ? (
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-emerald-500" />
                    ) : (
                        <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
                    )}
                    <div>
                        <p className="font-bold">{result.message}</p>
                        {result.failures && result.failures.length > 0 && (
                            <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                                {result.failures.map(f => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
