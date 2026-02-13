'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Trash2, FileText, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { deleteDOR } from '@/app/actions/dor-submission';

interface FormSubmissionsTableProps {
    submissions: any[];
}

type SortKey = 'id' | 'date' | 'template' | 'trainee' | 'trainer' | 'status';

export default function FormSubmissionsTable({ submissions }: FormSubmissionsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [filterText, setFilterText] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'REVIEWED'>('ALL');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc'); // Default to asc for new key, though desc is often better for date
        }
    };

    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) return <div className="w-4 h-4" />; // Placeholder
        return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    const filteredAndSortedSubmissions = useMemo(() => {
        return submissions
            .filter(dor => {
                const matchesText =
                    dor.trainee.empName?.toLowerCase().includes(filterText.toLowerCase()) ||
                    dor.trainer.name.toLowerCase().includes(filterText.toLowerCase()) ||
                    dor.template.title.toLowerCase().includes(filterText.toLowerCase()) ||
                    dor.id.toString().includes(filterText);

                const matchesStatus = statusFilter === 'ALL' || dor.status === statusFilter;

                return matchesText && matchesStatus;
            })
            .sort((a, b) => {
                const modifier = sortDir === 'asc' ? 1 : -1;
                switch (sortKey) {
                    case 'date':
                        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * modifier;
                    case 'trainee':
                        return (a.trainee.empName || '').localeCompare(b.trainee.empName || '') * modifier;
                    case 'trainer':
                        return a.trainer.name.localeCompare(b.trainer.name) * modifier;
                    case 'template':
                        return a.template.title.localeCompare(b.template.title) * modifier;
                    case 'status':
                        return a.status.localeCompare(b.status) * modifier;
                    case 'id':
                        return (a.id - b.id) * modifier;
                    default:
                        return 0;
                }
            });
    }, [submissions, sortKey, sortDir, filterText, statusFilter]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, template, or ID..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter by Status"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="REVIEWED">Reviewed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    onClick={() => handleSort('id')}
                                >
                                    <div className="flex items-center gap-1">ID {getSortIcon('id')}</div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    onClick={() => handleSort('date')}
                                >
                                    <div className="flex items-center gap-1">Date {getSortIcon('date')}</div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    onClick={() => handleSort('template')}
                                >
                                    <div className="flex items-center gap-1">Template {getSortIcon('template')}</div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    onClick={() => handleSort('trainee')}
                                >
                                    <div className="flex items-center gap-1">Trainee {getSortIcon('trainee')}</div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    onClick={() => handleSort('trainer')}
                                >
                                    <div className="flex items-center gap-1">Trainer (Author) {getSortIcon('trainer')}</div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAndSortedSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                                        No submissions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedSubmissions.map((dor) => (
                                    <tr key={dor.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 text-sm">#{dor.id}</td>
                                        <td className="px-6 py-4 text-slate-700 text-sm font-medium">
                                            {new Date(dor.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 text-sm">
                                            <div className="flex flex-col">
                                                <div className="flex items-center font-medium">
                                                    <FileText size={16} className="text-slate-400 mr-2" />
                                                    {dor.customTitle || dor.template.title}
                                                </div>
                                                {dor.customTitle && (
                                                    <span className="text-xs text-slate-400 ml-6">{dor.template.title}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 text-sm">
                                            {dor.trainee.empName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 text-sm">
                                            {dor.trainer.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${dor.status === 'REVIEWED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {dor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/dor/${dor.id}`}
                                                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                    title="View"
                                                >
                                                    <Eye size={18} />
                                                </Link>

                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
                                                            await deleteDOR(dor.id);
                                                        }
                                                    }}
                                                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
