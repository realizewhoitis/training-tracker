import { getTenantPrisma } from '@/lib/prisma';
import { ShieldCheck, FolderPlus, Edit } from 'lucide-react';
import { createStandard, deleteStandard } from './actions';
import { DeleteStandardButton } from './DeleteStandardButton';
import Link from 'next/link';

export default async function AdminAccreditationPage() {
    const standards = await ((await getTenantPrisma()) as any).accreditationStandard.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { requirements: true } } }
    });

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                        <ShieldCheck className="mr-3 text-indigo-600" />
                        Accreditation Frameworks
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Manage external compliance standards (e.g. CALEA, HIPAA) and their clauses.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href="/admin/accreditation/gap-analysis"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        View Gap Analysis ➔
                    </Link>
                </div>
            </div>

            {/* Create Standard Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <FolderPlus className="w-5 h-5 mr-2 text-indigo-500" />
                    Add New Framework
                </h3>
                <form action={createStandard} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Standard Name</label>
                        <input name="name" type="text" placeholder="e.g. CALEA 6th Edition" required className="w-full rounded-md border-slate-300 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <input name="description" type="text" placeholder="Summary of this accreditation mandate..." className="w-full rounded-md border-slate-300 text-sm" />
                    </div>
                    <div className="md:col-span-1">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
                            Create Framework
                        </button>
                    </div>
                </form>
            </div>

            {/* Frameworks Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Framework Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Total Requirements</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {standards.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                    No loaded frameworks. Create one above to begin mapping policies.
                                </td>
                            </tr>
                        ) : standards.map((standard: any) => (
                            <tr key={standard.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{standard.name}</div>
                                    <div className="text-sm text-slate-500">{standard.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {standard._count.requirements} rules
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link href={`/admin/accreditation/${standard.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Manage Requirements">
                                            <Edit size={18} />
                                        </Link>
                                        <form action={deleteStandard}>
                                            <input type="hidden" name="id" value={standard.id} />
                                            <DeleteStandardButton />
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
