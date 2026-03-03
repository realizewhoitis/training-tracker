import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FileDiff, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { diffWords } from 'diff';

const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

export default async function PolicyDiffPage({ params }: { params: Promise<{ id: string, versionId: string }> }) {
    const p = await params;
    const containerId = parseInt(p.id);
    const draftId = parseInt(p.versionId);

    if (isNaN(containerId) || isNaN(draftId)) return notFound();

    const prisma = await getTenantPrisma();

    const draftVersion = await prisma.policyVersion.findUnique({
        where: { id: draftId }
    });

    if (!draftVersion || draftVersion.containerId !== containerId) return notFound();

    // Find the currently published version for this container
    const publishedVersion = await prisma.policyVersion.findFirst({
        where: {
            containerId: containerId,
            status: 'PUBLISHED'
        },
        orderBy: { publishedAt: 'desc' }
    });

    const oldText = publishedVersion ? stripHtml(publishedVersion.content) : '';
    const newText = stripHtml(draftVersion.content);

    const differences = diffWords(oldText, newText);

    const renderOld = () => differences.map((part, i) => {
        if (part.added) return null;
        if (part.removed) return <span key={i} className="bg-red-200 text-red-900 line-through rounded px-1">{part.value}</span>;
        return <span key={i}>{part.value}</span>;
    });

    const renderNew = () => differences.map((part, i) => {
        if (part.removed) return null;
        if (part.added) return <span key={i} className="bg-green-200 text-green-900 font-medium rounded px-1">{part.value}</span>;
        return <span key={i}>{part.value}</span>;
    });

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href={`/admin/policies/${containerId}/edit/${draftId}`} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <FileDiff className="mr-3 text-indigo-600" />
                    Side-by-Side Comparison
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Published Version Panel */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700px]">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                        <div>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Active Published</span>
                            <h2 className="text-lg font-bold text-slate-800 mt-1">v{publishedVersion?.versionNumber || 'None'}</h2>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                            {publishedVersion ? `Level ${publishedVersion.enforcementLevel} • ${publishedVersion.readingTimer}s timer` : 'No active version exists.'}
                        </div>
                    </div>
                    <div className="p-6 overflow-y-auto flex-grow prose prose-slate max-w-none text-sm bg-slate-50/50 whitespace-pre-wrap font-sans">
                        {publishedVersion ? (
                            <div>{renderOld()}</div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400 italic">
                                This is the first version of this document. No prior published version exists to compare against.
                            </div>
                        )}
                    </div>
                </div>

                {/* Draft Version Panel */}
                <div className="bg-white rounded-xl border border-indigo-200 shadow-sm ring-1 ring-indigo-50 flex flex-col h-[700px]">
                    <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/50 flex justify-between items-center shrink-0">
                        <div>
                            <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Incoming Draft</span>
                            <h2 className="text-lg font-bold text-slate-800 mt-1">v{draftVersion.versionNumber}</h2>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                            Level {draftVersion.enforcementLevel} • {draftVersion.readingTimer}s timer
                        </div>
                    </div>
                    <div className="p-6 overflow-y-auto flex-grow prose prose-slate max-w-none text-sm whitespace-pre-wrap font-sans">
                        <div>{renderNew()}</div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-6">
                <Link
                    href={`/admin/policies/${containerId}/edit/${draftId}`}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors"
                >
                    <ArrowRightLeft size={18} />
                    <span>Return to Editor</span>
                </Link>
            </div>
        </div>
    );
}
