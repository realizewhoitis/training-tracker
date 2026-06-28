'use client';

import { useState } from 'react';

type Log = {
    id: string;
    timestamp: Date;
    action: string;
    resource: string;
    details: string | null;
    severity: string;
    userId: number | null;
    user: { name: string | null; email: string } | null;
};

type Stats = {
    criticalLast24h: number;
    warnLast24h: number;
    eventsLast24h: number;
};

const SEVERITY_STYLES: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800 border border-red-200',
    WARN:     'bg-yellow-100 text-yellow-800 border border-yellow-200',
    INFO:     'bg-blue-100 text-blue-800 border border-blue-200',
};

const ROW_STYLES: Record<string, string> = {
    CRITICAL: 'bg-red-50 hover:bg-red-100',
    WARN:     'bg-yellow-50 hover:bg-yellow-100',
    INFO:     'bg-white hover:bg-gray-50',
};

function parseDetails(raw: string | null): { message?: string; stack?: string; context?: string } | null {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export default function SystemHealthClient({ logs, stats }: { logs: Log[]; stats: Stats }) {
    const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARN' | 'INFO'>('ALL');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const filtered = filter === 'ALL' ? logs : logs.filter(l => l.severity === filter);

    const toggle = (id: string) =>
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time error log and audit trail</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Critical Errors (24h)</p>
                    <p className={`text-3xl font-bold mt-1 ${stats.criticalLast24h > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {stats.criticalLast24h}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Warnings (24h)</p>
                    <p className={`text-3xl font-bold mt-1 ${stats.warnLast24h > 0 ? 'text-yellow-600' : 'text-gray-800'}`}>
                        {stats.warnLast24h}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Events (24h)</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stats.eventsLast24h}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['ALL', 'CRITICAL', 'WARN', 'INFO'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            filter === f
                                ? 'bg-slate-800 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {f === 'ALL' ? 'All Events' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
                <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} entries</span>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <p className="text-lg font-medium">No events found</p>
                        <p className="text-sm mt-1">
                            {filter === 'CRITICAL' ? 'No errors — system is clean.' : 'Nothing to show for this filter.'}
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Severity</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route / Resource</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">User</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(log => {
                                const parsed = parseDetails(log.details);
                                const isOpen = expanded.has(log.id);
                                const hasDetails = !!parsed;

                                return (
                                    <>
                                        <tr
                                            key={log.id}
                                            className={`${ROW_STYLES[log.severity] ?? 'bg-white hover:bg-gray-50'} ${hasDetails ? 'cursor-pointer' : ''}`}
                                            onClick={() => hasDetails && toggle(log.id)}
                                        >
                                            <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_STYLES[log.severity] ?? ''}`}>
                                                    {log.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">{log.action}</td>
                                            <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{log.resource}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {log.user?.name ?? (log.userId ? `User #${log.userId}` : '—')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs text-right">
                                                {hasDetails && (
                                                    <span>{isOpen ? '▲' : '▼'}</span>
                                                )}
                                            </td>
                                        </tr>
                                        {isOpen && parsed && (
                                            <tr key={`${log.id}-detail`} className="bg-slate-900">
                                                <td colSpan={6} className="px-6 py-4">
                                                    {parsed.message && (
                                                        <p className="text-red-400 font-mono text-sm mb-2">{parsed.message}</p>
                                                    )}
                                                    {parsed.context && (
                                                        <p className="text-slate-400 text-xs mb-3">{parsed.context}</p>
                                                    )}
                                                    {parsed.stack && (
                                                        <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                                                            {parsed.stack}
                                                        </pre>
                                                    )}
                                                    {!parsed.message && !parsed.stack && (
                                                        <pre className="text-slate-300 font-mono text-xs">{log.details}</pre>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
