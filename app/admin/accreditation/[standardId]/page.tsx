import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BookmarkPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import { createRequirement, deleteRequirement } from '../actions';
import { DeleteRequirementButton } from './DeleteRequirementButton';
import Link from 'next/link';

export default async function StandardRequirementsPage({ params }: { params: Promise<{ standardId: string }> }) {
    const p = await params;
    const standardId = parseInt(p.standardId);
    if (isNaN(standardId)) return notFound();

    const standard = await ((await getTenantPrisma()) as any).accreditationStandard.findUnique({
        where: { id: standardId },
        include: {
            requirements: {
                orderBy: { clauseNumber: 'asc' }
            }
        }
    });

    if (!standard) return notFound();

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-4">
                <Link href="/admin/accreditation" className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                        <ShieldCheck className="mr-3 text-indigo-600" />
                        {standard.name}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {standard.description || 'Manage the individual clauses and standard requirements.'}
                    </p>
                </div>
            </div>

            {/* Create Requirement Form */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <BookmarkPlus className="w-5 h-5 mr-2 text-indigo-500" />
                    Add Standard Requirement
                </h3>
                <form action={createRequirement} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <input type="hidden" name="standardId" value={standard.id} />
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Clause Number</label>
                        <input name="clauseNumber" type="text" placeholder="e.g. 1.1.1" required className="w-full rounded-md border-slate-300 text-sm" />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <input name="description" type="text" placeholder="e.g. Law Enforcement Role & Authority" required className="w-full rounded-md border-slate-300 text-sm" />
                    </div>
                    <div className="md:col-span-1">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
                            Add Requirement
                        </button>
                    </div>
                </form>
            </div>

            {/* Requirements Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/4">Clause</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {standard.requirements.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                    No requirements have been defined for this standard yet.
                                </td>
                            </tr>
                        ) : standard.requirements.map((req: any) => (
                            <tr key={req.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                                    {req.clauseNumber}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {req.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link href={`/admin/accreditation/${standard.id}/${req.id}`} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                            Open Locker
                                        </Link>
                                        <form action={deleteRequirement}>
                                            <input type="hidden" name="id" value={req.id} />
                                            <DeleteRequirementButton />
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
