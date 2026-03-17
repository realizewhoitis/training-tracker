import { getTenantPrisma } from '@/lib/prisma';
import { ArrowLeft, BarChart4, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function GapAnalysisPage() {
    const prisma = await getTenantPrisma() as any;

    const standards = await prisma.accreditationStandard.findMany({
        include: {
            requirements: {
                include: {
                    policyMappings: true
                },
                orderBy: { clauseNumber: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-8">
                <Link href="/admin/accreditation" className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <BarChart4 className="mr-3 text-indigo-600" />
                    Compliance Gap Analysis
                </h1>
            </div>

            <p className="text-slate-600 max-w-3xl leading-relaxed">
                This report identifies Accreditation Requirements that are currently <strong className="text-red-600">Uncovered</strong>.
                A requirement is considered uncovered if it has zero active Policy Document Mappings and zero uploaded Compliance Evidence files.
            </p>

            <div className="space-y-10">
                {standards.length === 0 && (
                    <div className="bg-slate-50 text-slate-500 p-8 text-center rounded-xl border border-slate-200">
                        No standards found. Please create an Accreditation Framework first.
                    </div>
                )}
                {standards.map((standard: any) => {
                    const totalRequirements = standard.requirements.length;
                    const uncoveredRequirements = standard.requirements.filter(
                        (req: any) => req.policyMappings.length === 0 && req.evidence.length === 0
                    );
                    const uncoveredCount = uncoveredRequirements.length;
                    const coveredCount = totalRequirements - uncoveredCount;
                    const percentage = totalRequirements === 0 ? 0 : Math.round((coveredCount / totalRequirements) * 100);

                    return (
                        <div key={standard.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{standard.name}</h2>
                                    <div className="text-sm text-slate-500 mt-1">
                                        <span className="font-semibold text-slate-700">{coveredCount}/{totalRequirements}</span> requirements covered
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-black ${percentage === 100 ? 'text-green-600' : percentage > 70 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {percentage}%
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Compliance Rate</div>
                                </div>
                            </div>

                            <div className="p-0">
                                {uncoveredCount === 0 ? (
                                    <div className="p-8 text-center text-green-700 bg-green-50/50 flex flex-col items-center">
                                        <AlertTriangle size={32} className="mb-3 text-green-500 opacity-50" />
                                        <span className="font-medium">No gaps detected! All requirements in this framework are currently covered.</span>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="py-3 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-[10%]">Clause</th>
                                                <th className="py-3 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-[45%]">Description</th>
                                                <th className="py-3 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-[45%]">Compliance Coverage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {standard.requirements.map((req: any) => {
                                                const hasMappings = req.policyMappings.length > 0;
                                                const hasEvidence = req.evidence?.length > 0;
                                                const isMapped = hasMappings || hasEvidence;
                                                return (
                                                    <tr key={req.id} className={isMapped ? 'bg-white' : 'bg-amber-50/30'}>
                                                        <td className="py-4 px-6 align-top whitespace-nowrap">
                                                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                                {req.clauseNumber}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 align-top">
                                                            <p className="text-slate-600 line-clamp-3 leading-relaxed max-w-xl">{req.description}</p>
                                                        </td>
                                                        <td className="py-4 px-6 align-top min-w-[250px]">
                                                            {isMapped ? (
                                                                <div className="space-y-4">
                                                                    {hasMappings && (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider mb-2">
                                                                                <CheckCircle2 size={14} className="mr-1" />
                                                                                Draft/Policy Mapped
                                                                            </div>
                                                                            {req.policyMappings.map((mapping: any) => (
                                                                                <Link
                                                                                    key={mapping.id}
                                                                                    href={`/admin/policies/${mapping.version.containerId}`}
                                                                                    className="block bg-green-50 border border-green-200 p-2 rounded hover:shadow-sm transition-shadow"
                                                                                >
                                                                                    <div className="font-medium text-green-900 truncate">
                                                                                        {mapping.version.title || 'Untitled Policy'}
                                                                                    </div>
                                                                                    <div className="text-xs text-green-700 mt-1 flex justify-between">
                                                                                        <span>v{mapping.version.versionNumber}</span>
                                                                                        <span className="uppercase">{mapping.version.status}</span>
                                                                                    </div>
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {hasEvidence && (
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2 pt-1 border-t border-slate-100">
                                                                                <CheckCircle2 size={14} className="mr-1" />
                                                                                Evidence Discovered
                                                                            </div>
                                                                            <div className="text-sm font-medium text-slate-700">
                                                                                {req.evidence?.length} Proof Document{req.evidence?.length === 1 ? '' : 's'}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-start text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                                                    <AlertTriangle size={16} className="mt-0.5 mr-2 shrink-0" />
                                                                    <div>
                                                                        <div className="font-bold text-sm">Gap Detected</div>
                                                                        <p className="text-xs mt-1 text-amber-700 opacity-90">No policy or evidence addresses this requirement.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
