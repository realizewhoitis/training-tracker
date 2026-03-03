'use client';

import { useState } from 'react';
import { addMapping, deleteMapping } from './actions';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export function MappingWorkbenchClient({ version, standards }: { version: any, standards: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [mappedParagraph, setMappedParagraph] = useState('');

    const handleAdd = async (reqId: number) => {
        await addMapping(version.id, reqId, mappedParagraph);
        setMappedParagraph('');
    };

    return (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 bg-slate-50 rounded-xl border border-slate-200 p-2 lg:p-4">
            {/* Left Scorecard */}
            <div className="bg-white rounded-lg border border-slate-200 flex flex-col shadow-sm overflow-hidden h-[75vh]">
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0">
                    <h2 className="font-bold text-slate-800">Framework Requirements</h2>
                    <input
                        type="text"
                        placeholder="Search clause e.g. 1.2.1..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full mt-2 rounded border-slate-300 text-sm"
                    />
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-6">
                    {standards.map(standard => {
                        const filteredReqs = standard.requirements.filter((req: any) =>
                            req.clauseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.description.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        if (filteredReqs.length === 0) return null;
                        return (
                            <div key={standard.id}>
                                <h3 className="text-sm font-bold text-indigo-700 bg-indigo-50 p-2 rounded">{standard.name}</h3>
                                <div className="space-y-3 mt-3 px-2">
                                    {filteredReqs.map((req: any) => {
                                        const isMapped = version.mappings.some((m: any) => m.requirementId === req.id);
                                        return (
                                            <div key={req.id} className={`p-3 rounded-lg border text-sm ${isMapped ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold text-slate-800">{req.clauseNumber}</span>
                                                        <p className="text-slate-600 mt-1">{req.description}</p>
                                                    </div>
                                                    {isMapped ? (
                                                        <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0" />
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAdd(req.id)}
                                                            className="text-indigo-600 hover:text-white hover:bg-indigo-600 p-1.5 rounded transition-colors shrink-0 border border-indigo-200"
                                                            title="Map to Document"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Right Document & active Mappings */}
            <div className="flex flex-col gap-4 h-[75vh]">
                {/* Active Mappings */}
                <div className="bg-white rounded-lg border border-slate-200 flex flex-col shadow-sm max-h-48 overflow-y-auto shrink-0">
                    <div className="p-3 border-b border-slate-200 bg-slate-50 sticky top-0 font-bold text-slate-800 text-sm z-10 flex justify-between items-center">
                        <span>Active Policy Mappings ({version.mappings.length})</span>
                    </div>
                    <div className="p-3 space-y-2 relative">
                        {version.mappings.length === 0 && <p className="text-sm text-slate-400 italic">No standards mapped.</p>}
                        {version.mappings.map((mapping: any) => (
                            <div key={mapping.id} className="flex justify-between items-center text-sm p-2 bg-indigo-50 text-indigo-900 rounded border border-indigo-100">
                                <div>
                                    <span className="font-bold">{mapping.requirement.standard.name} {mapping.requirement.clauseNumber}</span>
                                    {mapping.mappedParagraphs && <span className="text-indigo-600 ml-2 italic text-xs">Pg/Para: {mapping.mappedParagraphs}</span>}
                                </div>
                                <button onClick={() => deleteMapping(mapping.id)} className="text-red-500 hover:text-red-700 bg-white p-1 rounded-md">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document Display */}
                <div className="bg-white rounded-lg border border-slate-200 flex flex-col shadow-sm overflow-hidden flex-1">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">Policy Content Reference</h2>
                        <input
                            type="text"
                            placeholder="Optional: Paragraph reference (e.g. pg 4)"
                            className="text-sm rounded border-slate-300 w-64 px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                            value={mappedParagraph}
                            onChange={(e) => setMappedParagraph(e.target.value)}
                        />
                    </div>
                    <div className="p-6 overflow-y-auto prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        <div dangerouslySetInnerHTML={{ __html: version.content }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
