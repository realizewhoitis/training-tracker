'use client';
import { useState } from 'react';
import { Search, ChevronRight, Check } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function SplitScreenMapper({
    standards,
    existingMappings = []
}: {
    standards: any[],
    existingMappings: any[]
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStandardId, setSelectedStandardId] = useState<number | null>(standards.length > 0 ? standards[0].id : null);
    const [activeMappings, setActiveMappings] = useState<Set<number>>(new Set(existingMappings.map(m => m.requirementId)));

    const selectedStandard = standards.find(s => s.id === selectedStandardId);

    const filteredRequirements = selectedStandard?.requirements.filter((req: any) =>
        req.clauseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const toggleMapping = (reqId: number) => {
        const newMappings = new Set(activeMappings);
        if (newMappings.has(reqId)) {
            newMappings.delete(reqId);
        } else {
            newMappings.add(reqId);
        }
        setActiveMappings(newMappings);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-[600px]">
            {/* Header: Select Framework */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">Accreditation Mapping</h3>
                    <p className="text-xs text-slate-500">Link this policy version to external standards</p>
                </div>
                {standards.length > 0 && (
                    <select
                        value={selectedStandardId || ''}
                        onChange={(e) => setSelectedStandardId(parseInt(e.target.value))}
                        className="rounded-md border-slate-300 text-sm py-1.5 pl-3 pr-8 focus:ring-indigo-500 font-medium"
                    >
                        {standards.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {standards.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-50">
                    <div>
                        <p className="text-slate-500 font-medium">No Accreditation Frameworks Available</p>
                        <p className="text-xs text-slate-400 mt-1">Configure standards in the Workbench first.</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side: Requirements List */}
                    <div className="w-1/2 md:w-2/5 border-r border-slate-200 flex flex-col bg-slate-50 relative">
                        <div className="p-3 border-b border-slate-200 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search clauses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filteredRequirements.length === 0 ? (
                                <div className="text-center p-4 text-xs text-slate-500">No clauses match your search.</div>
                            ) : filteredRequirements.map((req: any) => {
                                const isMapped = activeMappings.has(req.id);
                                return (
                                    <button
                                        type="button"
                                        key={req.id}
                                        onClick={() => toggleMapping(req.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-start group ${isMapped
                                                ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center mr-3 ${isMapped ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 group-hover:border-indigo-400'
                                            }`}>
                                            {isMapped && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <div className={`font-mono font-bold text-xs ${isMapped ? 'text-indigo-800' : 'text-slate-700'}`}>
                                                {req.clauseNumber}
                                            </div>
                                            <div className={`text-xs mt-1 line-clamp-2 ${isMapped ? 'text-indigo-700' : 'text-slate-500'}`}>
                                                {req.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Selected Summary */}
                    <div className="w-1/2 md:w-3/5 p-6 bg-white overflow-y-auto">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center text-sm">
                            <ChevronRight size={16} className="text-indigo-500 mr-1" />
                            Currently Mapped Clauses ({activeMappings.size})
                        </h4>

                        {/* Hidden input to pass active mappings to the form action */}
                        <input type="hidden" name="mappedRequirements" value={JSON.stringify(Array.from(activeMappings))} />

                        {activeMappings.size === 0 ? (
                            <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Click clauses on the left to map them to this policy version.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Array.from(activeMappings).map(reqId => {
                                    // Find requirement across all standards (in case they mapped from diff standards)
                                    let mappedReq: any = null;
                                    let mappedStd: any = null;

                                    for (const s of standards) {
                                        const found = s.requirements.find((r: any) => r.id === reqId);
                                        if (found) {
                                            mappedReq = found;
                                            mappedStd = s;
                                            break;
                                        }
                                    }

                                    if (!mappedReq) return null;

                                    return (
                                        <div key={reqId} className="p-4 rounded-lg bg-indigo-50/50 border border-indigo-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">{mappedStd.name}</span>
                                                <span className="font-mono font-bold text-sm text-indigo-900 bg-white px-2 py-0.5 rounded shadow-sm border border-indigo-100">
                                                    {mappedReq.clauseNumber}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-100">
                                                {mappedReq.description}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
