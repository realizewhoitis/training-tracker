'use client';

import { useState } from 'react';
import { Search, Filter, Edit } from 'lucide-react';
import Link from 'next/link';
import { DeleteContainerButton } from './DeleteContainerButton';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AdminPolicyListClient({
    initialContainers,
    admins,
    deletePolicyContainerAction
}: {
    initialContainers: any[];
    admins: any[];
    deletePolicyContainerAction: (formData: FormData) => Promise<void>;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [filterOwner, setFilterOwner] = useState<string>('ALL');

    const filteredContainers = initialContainers.filter(container => {
        // 1. Text Search across Title and Description
        const matchesSearch = searchTerm === '' ||
            container.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (container.description && container.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Category Filter
        const matchesCategory = filterCategory === 'ALL' || container.category === filterCategory;

        // 3. Owner Filter
        const matchesOwner = filterOwner === 'ALL' ||
            (filterOwner === 'UNASSIGNED' && !container.ownerId) ||
            (container.ownerId === parseInt(filterOwner));

        return matchesSearch && matchesCategory && matchesOwner;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search document titles or descriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Filter className="text-slate-400 shrink-0" size={18} />
                        <select
                            title="Filter by Category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full sm:w-40 rounded-md border-slate-300 text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="SOP">SOPs</option>
                            <option value="TRAINING">Training</option>
                            <option value="MEMO">Memos</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <select
                            title="Filter by Owner"
                            value={filterOwner}
                            onChange={(e) => setFilterOwner(e.target.value)}
                            className="w-full sm:w-48 rounded-md border-slate-300 text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="ALL">All Owners</option>
                            <option value="UNASSIGNED">Unassigned Only</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id.toString()}>{admin.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Versions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredContainers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
                                        <Search size={24} />
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-900">No documents found</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Adjust your search or filter criteria to find what you're looking for.
                                    </p>
                                    {(searchTerm !== '' || filterCategory !== 'ALL' || filterOwner !== 'ALL') && (
                                        <button
                                            onClick={() => { setSearchTerm(''); setFilterCategory('ALL'); setFilterOwner('ALL'); }}
                                            className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : filteredContainers.map(container => (
                            <tr key={container.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900 flex items-center space-x-2">
                                        <span>{container.title}</span>
                                        {container.nextReviewDate && new Date(container.nextReviewDate).getTime() < Date.now() && (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">EXPIRED</span>
                                        )}
                                        {container.nextReviewDate && new Date(container.nextReviewDate).getTime() >= Date.now() && new Date(container.nextReviewDate).getTime() < Date.now() + 90 * 24 * 60 * 60 * 1000 && (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">EXPIRING SOON</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500">{container.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 object-contain rounded text-xs font-medium">
                                        {container.category || 'UNTITLED'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {container.owner?.name || <span className="text-slate-400 italic">Unassigned</span>}
                                    {container.reviewCycleMonths && <div className="text-xs text-slate-500 mt-1">Review: Every {container.reviewCycleMonths} mo</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {container._count.versions}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link href={`/admin/policies/${container.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Manage Versions">
                                            <Edit size={18} />
                                        </Link>
                                        <form action={deletePolicyContainerAction}>
                                            <input type="hidden" name="id" value={container.id} />
                                            <DeleteContainerButton />
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
