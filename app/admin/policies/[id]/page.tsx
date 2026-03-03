import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FileText, Plus, ArrowLeft, History, FilePenLine } from 'lucide-react';
import Link from 'next/link';
import { createDraftAction } from './actions';
import { EvidenceLocker } from '../../evidence/EvidenceLocker';

export default async function PolicyManagePage({ params }: { params: Promise<{ id: string }> }) {
    const p = await params;
    const id = parseInt(p.id);
    if (isNaN(id)) return notFound();

    const container = await ((await getTenantPrisma()) as any).policyContainer.findUnique({
        where: { id },
        include: {
            evidence: {
                orderBy: { uploadedAt: 'desc' }
            },
            versions: {
                orderBy: { versionNumber: 'desc' },
                include: {
                    _count: { select: { attestations: true } }
                }
            }
        }
    });

    if (!container) return notFound();

    const hasDraft = container.versions.some(v => v.status === 'DRAFT');

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href="/admin/policies" className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <FileText className="mr-3 text-indigo-600" />
                    {container.title}
                </h1>
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold ml-4">
                    {container.category || 'Container'}
                </span>
            </div>

            <p className="text-slate-600 text-lg mb-8">{container.description}</p>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <History className="mr-2 text-slate-500" /> Version History
                    </h2>

                    {!hasDraft && (
                        <form action={createDraftAction}>
                            <input type="hidden" name="containerId" value={container.id} />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center shadow-sm">
                                <Plus size={16} className="mr-2" />
                                Create New Draft
                            </button>
                        </form>
                    )}
                </div>

                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Version</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Enforcement</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Signatures</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {container.versions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No versions exist yet. Create a new draft.
                                </td>
                            </tr>
                        ) : container.versions.map(version => (
                            <tr key={version.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    v{version.versionNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${version.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                        version.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-800' :
                                            'bg-amber-100 text-amber-800'
                                        }`}>
                                        {version.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                    {version.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                                    Level {version.enforcementLevel}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center font-medium">
                                    {version._count.attestations}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <Link href={`/admin/policies/${container.id}/edit/${version.id}`} className="inline-flex items-center text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors font-medium">
                                        <FilePenLine size={16} className="mr-1.5" />
                                        {version.status === 'DRAFT' ? 'Edit Draft' : 'View Scope'}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EvidenceLocker files={container.evidence} containerId={container.id} />
        </div>
    );
}
