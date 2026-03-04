import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function CommunityPolicyViewer({ params }: { params: Promise<{ agencyId: string, id: string }> }) {
    const p = await params;
    const containerId = parseInt(p.id);

    if (isNaN(containerId)) return notFound();

    const prisma = await getTenantPrisma() as any;

    const agency = await prisma.agency.findUnique({
        where: { id: p.agencyId }
    });

    if (!agency) return notFound();

    const container = await prisma.policyContainer.findUnique({
        where: { id: containerId, agencyId: agency.id, isPublic: true },
        include: {
            versions: {
                where: { status: 'PUBLISHED' },
                orderBy: { publishedAt: 'desc' },
                take: 1
            },
            evidence: {
                orderBy: { uploadedAt: 'desc' }
            }
        }
    });

    if (!container) return notFound();

    const publishedVersion = container.versions[0];
    if (!publishedVersion) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-indigo-900 text-white py-6 px-6 border-b border-indigo-800">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <ShieldCheck size={28} className="mr-3 text-indigo-300" />
                        <span className="font-bold tracking-tight text-lg">{agency.name} Transparency Portal</span>
                    </div>
                    <Link href={`/community/${agency.id}/policies`} className="text-indigo-200 hover:text-white flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Directory
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-10 px-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <div className="p-8 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 mb-2">{container.title}</h1>
                                <p className="text-slate-500 text-lg leading-relaxed">{container.description}</p>
                            </div>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ml-4">
                                {container.category || 'POLICY'}
                            </span>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                            <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                                <Clock size={16} className="mr-2 text-slate-400" />
                                Effective Date: {new Date(publishedVersion.publishedAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                                <FileText size={16} className="mr-2 text-slate-400" />
                                Version {publishedVersion.versionNumber}
                            </div>
                            {container.nextReviewDate && (
                                <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 border-emerald-200">
                                    <ShieldCheck size={16} className="mr-2 text-emerald-500" />
                                    Next Review: {new Date(container.nextReviewDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {publishedVersion.mediaUrl && (
                        <div className="mx-8 md:mx-12 mt-8 mb-4 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                            <h4 className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 text-sm flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText size={16} className="mr-2 text-indigo-500" />
                                    Primary Policy Document
                                </div>
                                <a href={publishedVersion.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-xs font-semibold px-3 py-1.5 rounded-md border border-indigo-200 transition-colors">Open in New Tab</a>
                            </h4>
                            <iframe
                                src={publishedVersion.mediaUrl}
                                className="w-full h-[800px] bg-zinc-100"
                                title="Core Policy Document"
                            />
                        </div>
                    )}

                    {publishedVersion.content && publishedVersion.content.trim() !== '<p><br></p>' && (
                        <div className="p-8 md:p-12 prose prose-slate max-w-none font-sans text-slate-700 text-base leading-loose whitespace-pre-wrap">
                            <div dangerouslySetInnerHTML={{ __html: publishedVersion.content }} />
                        </div>
                    )}
                </div>

                {container.evidence && container.evidence.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800">Public Compliance Evidence</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {container.evidence.map((file: any) => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-lg">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <FileText size={16} className="text-indigo-400 shrink-0" />
                                        <div className="truncate">
                                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline truncate block">
                                                {file.fileName}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
