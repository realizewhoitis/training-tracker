import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bookmark, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { EvidenceLocker } from '@/app/admin/evidence/EvidenceLocker';

export default async function RequirementDetailPage({ params }: { params: Promise<{ standardId: string, reqId: string }> }) {
    const p = await params;
    const standardId = parseInt(p.standardId);
    const reqId = parseInt(p.reqId);

    if (isNaN(standardId) || isNaN(reqId)) return notFound();

    const prisma = await getTenantPrisma() as any;

    const requirement = await prisma.standardRequirement.findUnique({
        where: { id: reqId },
        include: {
            standard: true,
            evidence: {
                orderBy: { uploadedAt: 'desc' }
            },
            mappings: {
                include: { version: { include: { container: true } } }
            }
        }
    });

    if (!requirement || requirement.standardId !== standardId) return notFound();

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href={`/admin/accreditation/${standardId}`} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <Bookmark className="mr-3 text-indigo-600" />
                    Clause {requirement.clauseNumber}
                </h1>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold ml-4">
                    {requirement.standard.name}
                </span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Requirement Description</h2>
                <p className="text-slate-700 text-lg leading-relaxed">{requirement.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <LockKeyhole className="mr-2 text-slate-400" /> Uploaded Proofs
                    </h2>
                    <EvidenceLocker files={requirement.evidence} requirementId={requirement.id} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        Mapped Policies
                    </h2>
                    <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800">Linked Versions ({requirement.mappings.length})</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {requirement.mappings.length === 0 ? (
                                <p className="text-slate-400 italic text-center py-4">No policies map to this requirement yet.</p>
                            ) : requirement.mappings.map((mapping: any) => (
                                <div key={mapping.id} className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                    <div className="font-bold text-indigo-900">{mapping.version.container.title}</div>
                                    <div className="text-xs text-indigo-700 mt-1">Version {mapping.version.versionNumber} • Status: {mapping.version.status}</div>
                                    {mapping.mappedParagraphs && <div className="text-xs text-slate-500 mt-2 bg-white px-2 py-1 rounded">Ref: {mapping.mappedParagraphs}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
