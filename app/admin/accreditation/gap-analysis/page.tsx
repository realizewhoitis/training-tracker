import { getTenantPrisma } from '@/lib/prisma';
import { ArrowLeft, BarChart4, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function GapAnalysisPage() {
    const prisma = await getTenantPrisma() as any;

    const standards = await prisma.accreditationStandard.findMany({
        include: {
            requirements: {
                include: {
                    mappings: true,
                    evidence: true
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
                        (req: any) => req.mappings.length === 0 && req.evidence.length === 0
                    );
                    const uncoveredCount = uncoveredRequirements.length;
                    const coveredCount = totalRequirements - uncoveredCount;
                    const percentage = totalRequirements === 0 ? 100 : Math.round((coveredCount / totalRequirements) * 100);

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
                                        <thead className="bg-red-50/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider w-1/4">Uncovered Clause</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-red-800 uppercase tracking-wider">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {uncoveredRequirements.map((req: any) => (
                                                <tr key={req.id} className="hover:bg-red-50/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            {req.clauseNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-700">
                                                        {req.description}
                                                    </td>
                                                </tr>
                                            ))}
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
