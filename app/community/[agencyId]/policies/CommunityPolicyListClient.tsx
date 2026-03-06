'use client';

import { useState } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CommunityPolicyListClient({
    initialContainers,
    agency
}: {
    initialContainers: any[];
    agency: any;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    const filteredContainers = initialContainers.filter(container => {
        // 1. Text Search across Title and Description
        const matchesSearch = searchTerm === '' ||
            container.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (container.description && container.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Category Filter
        const matchesCategory = filterCategory === 'ALL' || container.category === filterCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search public documents by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 hover:border-slate-200 focus:ring-0 focus:border-indigo-500 transition-colors text-base"
                    />
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <Filter className="text-slate-400 shrink-0 hidden sm:block" size={20} />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full md:w-56 rounded-xl border-2 border-slate-100 text-slate-700 py-3 pl-4 pr-10 focus:ring-0 focus:border-indigo-500 transition-colors text-base font-medium"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="POLICY">Policies</option>
                        <option value="SOP">SOPs</option>
                        <option value="MEMO">Memos</option>
                        <option value="OTHER">Other Documents</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {filteredContainers.length === 0 ? (
                    <div className="p-16 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-white shadow-sm">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No documents found</h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            We couldn't find any public documents matching your current search or category filters.
                        </p>
                        {(searchTerm !== '' || filterCategory !== 'ALL') && (
                            <button
                                onClick={() => { setSearchTerm(''); setFilterCategory('ALL'); }}
                                className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                Clear Search Filters
                            </button>
                        )}
                    </div>
                ) : filteredContainers.map((container: any) => {
                    const publishedVersion = container.versions[0];
                    if (!publishedVersion) return null;

                    return (
                        <div key={container.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden group">
                            <Link href={`/community/${agency.id}/policies/${container.id}`} className="block p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{container.title}</h2>
                                        <p className="text-slate-500 mt-2 text-base leading-relaxed">{container.description}</p>
                                    </div>
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shrink-0 w-fit">
                                        {container.category || 'POLICY'}
                                    </span>
                                </div>
                                <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                                    <div className="text-sm font-medium text-slate-400">
                                        Effective Date: {new Date(publishedVersion.publishedAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-indigo-600 font-bold flex items-center text-sm uppercase tracking-wide group-hover:text-indigo-800">
                                        <FileText size={18} className="mr-2" /> Read Full Document
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
