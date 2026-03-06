import { getTenantPrisma } from '@/lib/prisma';
import { FileText, FolderPlus, Edit } from 'lucide-react';
import { createPolicyContainer, deletePolicyContainer } from './actions';
import AdminPolicyListClient from './AdminPolicyListClient';

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

            <AdminPolicyListClient
                initialContainers={containers}
                admins={admins}
                deletePolicyContainerAction={deletePolicyContainer}
            />
        </div>
    );
}
