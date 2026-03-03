import { getTenantPrisma } from '@/lib/prisma';
import { FileText, FolderPlus, Edit } from 'lucide-react';
import { createPolicyContainer, deletePolicyContainer } from './actions';
import { DeleteContainerButton } from './DeleteContainerButton';
import Link from 'next/link';

export default async function AdminPoliciesPage() {
    const containers = await (await getTenantPrisma()).policyContainer.findMany({
        orderBy: { title: 'asc' },
        include: { _count: { select: { versions: true } }, owner: true }
    });

    const admins = await (await getTenantPrisma()).user.findMany({
        where: { role: { in: ['ADMIN', 'SUPERVISOR', 'SUPERUSER'] } },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                        <FileText className="mr-3 text-indigo-600" />
                        Document & Policy Repository
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Manage central documents, SOPs, and compliance versions.
                    </p>
                </div>
            </div>

            {/* Create Container Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <FolderPlus className="w-5 h-5 mr-2 text-indigo-500" />
                    Create New Document Container
                </h3>
                <form action={createPolicyContainer} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Title (e.g. SOP-104)</label>
                        <input name="title" type="text" required className="w-full rounded-md border-slate-300 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <input name="description" type="text" className="w-full rounded-md border-slate-300 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                        <select name="category" className="w-full rounded-md border-slate-300 text-sm">
                            <option value="SOP">Standard Operating Procedure</option>
                            <option value="TRAINING">Training Material</option>
                            <option value="MEMO">Agency Memo</option>
                            <option value="OTHER">Other Form</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Review Cycle</label>
                        <select name="reviewCycleMonths" className="w-full rounded-md border-slate-300 text-sm">
                            <option value="">No Expiration</option>
                            <option value="12">Annual (12 Months)</option>
                            <option value="24">Biennial (24 Months)</option>
                            <option value="36">Triennial (36 Months)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Policy Owner</label>
                        <select name="ownerId" className="w-full rounded-md border-slate-300 text-sm">
                            <option value="">Unassigned</option>
                            {admins.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
                            Create Container
                        </button>
                    </div>
                </form>
            </div>

            {/* Containers Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Versions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {containers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No documents found. Create a container above to begin.
                                </td>
                            </tr>
                        ) : containers.map(container => (
                            <tr key={container.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900 flex items-center space-x-2">
                                        <span>{container.title}</span>
                                        {container.nextReviewDate && new Date(container.nextReviewDate).getTime() < Date.now() && (
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">EXPIRED</span>
                                        )}
                                        {container.nextReviewDate && new Date(container.nextReviewDate).getTime() >= Date.now() && new Date(container.nextReviewDate).getTime() < Date.now() + 90 * 24 * 60 * 60 * 1000 && (
                                            <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">EXPIRING SOON</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-500">{container.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 object-contain rounded text-xs font-medium">
                                        {container.category || 'UNTITLED'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    {container.owner?.name || <span className="text-slate-400 italic">Unassigned</span>}
                                    {container.reviewCycleMonths && <div className="text-xs text-slate-500 mt-1">Review: Every {container.reviewCycleMonths} mo</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {container._count.versions}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link href={`/admin/policies/${container.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Manage Versions">
                                            <Edit size={18} />
                                        </Link>
                                        <form action={deletePolicyContainer}>
                                            <input type="hidden" name="id" value={container.id} />
                                            <DeleteContainerButton />
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
