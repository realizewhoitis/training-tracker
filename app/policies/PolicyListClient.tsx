'use client';

import { useState } from 'react';
import { FileText, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { useFormStatus } from 'react-dom';

/* eslint-disable @typescript-eslint/no-explicit-any */

function SubmitAcknowledgeButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
        >
            {pending ? "Acknowledging..." : "Acknowledge Receipt"}
        </button>
    );
}

export default function PolicyListClient({
    initialPolicies,
    currentUserId,
    acknowledgePolicyAction
}: {
    initialPolicies: any[];
    currentUserId: number;
    acknowledgePolicyAction: (formData: FormData) => Promise<void>;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTION_REQUIRED'>('ALL');

    const filteredPolicies = initialPolicies.filter(policy => {
        // 1. Text Search across Title and Content
        const matchesSearch = searchTerm === '' ||
            policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (policy.content && policy.content.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Status Filter
        const isAcknowledged = policy.acknowledgments.some((ack: any) => ack.employeeId === currentUserId);
        const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'ACTION_REQUIRED' && !isAcknowledged);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search policy titles or contents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <Filter className="text-slate-400" size={18} />
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full md:w-48 rounded-md border-slate-300 text-sm py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="ALL">All Policies</option>
                        <option value="ACTION_REQUIRED">Action Required</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredPolicies.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
                            <Search size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No policies found</h3>
                        <p className="text-slate-500">We couldn't find anything matching your search criteria.</p>
                        {(searchTerm !== '' || filterStatus !== 'ALL') && (
                            <button
                                onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                                className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : filteredPolicies.map((policy: any) => {
                    const isAcknowledged = policy.acknowledgments.some((ack: any) => ack.employeeId === currentUserId);

                    return (
                        <div key={policy.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${isAcknowledged ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800">{policy.title}</h3>
                                        <p className="text-sm text-slate-500">Version {policy.version} • Posted {new Date(policy.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    {isAcknowledged ? (
                                        <span className="flex items-center text-green-600 text-sm font-medium px-3 py-1 bg-green-50 rounded-full">
                                            <CheckCircle size={16} className="mr-1" />
                                            Acknowledged
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-amber-600 text-sm font-medium px-3 py-1 bg-amber-50 rounded-full">
                                            <AlertCircle size={16} className="mr-1" />
                                            Action Required
                                        </span>
                                    )}
                                </div>
                            </div>

                            {policy.mediaUrl ? (
                                <div className="mb-6 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                    <h4 className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-sm flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileText size={16} className="mr-2 text-indigo-500" />
                                            Primary Policy Document
                                        </div>
                                        <a href={policy.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-xs font-semibold px-3 py-1.5 rounded-md border border-indigo-200 transition-colors">Open in New Tab</a>
                                    </h4>
                                    <iframe
                                        src={policy.mediaUrl}
                                        className="w-full h-[600px] bg-zinc-100"
                                        title="Core Policy Document"
                                    />
                                </div>
                            ) : null}

                            {policy.content && policy.content.trim() !== '<p><br></p>' && (
                                <div
                                    className="bg-slate-50 p-4 rounded-lg mb-4 text-slate-700 text-sm leading-relaxed border border-slate-100"
                                    dangerouslySetInnerHTML={{ __html: policy.content }}
                                />
                            )}

                            {!isAcknowledged && (
                                <div className="flex justify-end">
                                    <form action={acknowledgePolicyAction}>
                                        <input type="hidden" name="policyId" value={policy.id} />
                                        <input type="hidden" name="userId" value={currentUserId} />
                                        <SubmitAcknowledgeButton />
                                    </form>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
