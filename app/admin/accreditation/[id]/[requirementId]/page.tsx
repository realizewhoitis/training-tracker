import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, Upload, ShieldCheck, Clock, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { uploadEvidence, deleteEvidence } from './actions';
import { DeleteEvidenceButton, UploadEvidenceForm } from './EvidenceClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function EvidenceLockerPage({ params }: { params: Promise<{ id: string, requirementId: string }> }) {
    const p = await params;
    const standardId = parseInt(p.id);
    const requirementId = parseInt(p.requirementId);

    if (isNaN(standardId) || isNaN(requirementId)) return notFound();

    const prisma = await getTenantPrisma() as any;

    const requirement = await prisma.standardRequirement.findUnique({
        where: { id: requirementId },
        include: {
            standard: true,
            evidence: {
                orderBy: { uploadedAt: 'desc' },
                include: { uploadedBy: true }
            },
            policyMappings: {
                include: {
                    version: {
                        include: { container: true }
                    }
                }
            }
        }
    });

    if (!requirement || requirement.standardId !== standardId) return notFound();

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-2">
                <Link href={`/admin/accreditation/${standardId}`} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                    <span className="sr-only">Back</span>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <ShieldCheck className="mr-3 text-indigo-600" />
                    Evidence Locker
                </h1>
            </div>

            <div className="ml-10 space-y-2">
                <p className="text-slate-500 font-medium">{requirement.standard.name}</p>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg inline-block w-full max-w-3xl">
                    <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-1 rounded inline-block mb-2">
                        {requirement.clauseNumber}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{requirement.description}</p>
                </div>
            </div>

            <hr className="border-slate-200" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload New Evidence Form */}
                <div className="lg:col-span-1 border border-slate-200 rounded-xl overflow-hidden sticky top-6 bg-white shadow-sm">
                    <div className="bg-indigo-50 border-b border-indigo-100 p-4 shrink-0 flex items-center">
                        <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                        <h3 className="font-bold text-indigo-900">Upload Proof</h3>
                    </div>
                    <div className="p-6">
                        <UploadEvidenceForm requirementId={requirement.id} action={uploadEvidence} />
                    </div>
                </div>

                {/* Evidence & Mappings List */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Uploaded Evidence */}
                    <section className="space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center">
                            <FileText className="mr-2 text-slate-400" size={20} />
                            Verified Evidence ({requirement.evidence.length})
                        </h3>

                        {requirement.evidence.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                                <FileWarning size={32} className="mx-auto text-slate-400 mb-3" />
                                <p className="text-sm font-medium text-slate-700">No evidence uploaded</p>
                                <p className="text-xs text-slate-500 mt-1">Provide screenshots, audit logs, or photos proving compliance.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {requirement.evidence.map((ev: any) => (
                                    <div key={ev.id} className="border border-slate-200 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                        <div className="flex items-start justify-between">
                                            <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 font-medium text-indigo-600 hover:text-indigo-800 hover:underline truncate pr-4 text-sm font-medium">
                                                {ev.fileName}
                                            </a>
                                            <form action={deleteEvidence}>
                                                <input type="hidden" name="id" value={ev.id} />
                                                <input type="hidden" name="requirementId" value={requirement.id} />
                                                <input type="hidden" name="standardId" value={standardId} />
                                                <DeleteEvidenceButton isLocked={ev.isLocked} />
                                            </form>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                                            <div className="flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {new Date(ev.uploadedAt).toLocaleDateString()}
                                            </div>
                                            <div className="truncate pl-2 flex items-center" title={`Uploaded by ID ${ev.uploadedById}`}>
                                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 inline-block"></span>
                                                {ev.uploadedBy?.email || 'System user'}
                                            </div>
                                        </div>
                                        {ev.isLocked && (
                                            <span className="absolute -top-2.5 -right-2.5 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-600" title="This evidence is locked for auditing purposes">LOCKED</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Associated Policies */}
                    <section className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center">
                            <BookOpen className="mr-2 text-slate-400" size={20} />
                            Mapped Policies ({requirement.policyMappings.length})
                        </h3>

                        {requirement.policyMappings.length === 0 ? (
                            <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
                                This requirement is not currently addressed in any active policy document.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {requirement.policyMappings.map((mapping: any) => (
                                    <Link key={mapping.id} href={`/admin/policies/${mapping.version.containerId}`} className="block border border-slate-200 rounded-lg p-4 bg-white hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-slate-800">{mapping.version.title || 'Untitled Policy'}</h4>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${mapping.version.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {mapping.version.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Version {mapping.version.versionNumber}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
