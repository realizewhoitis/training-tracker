import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { createRequirement, deleteRequirement } from '../actions';
import { DeleteRequirementButton } from './DeleteRequirementButton';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function StandardDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const p = await params;
    const standardId = parseInt(p.id);

    if (isNaN(standardId)) return notFound();

    const prisma = await getTenantPrisma() as any;

    const standard = await prisma.accreditationStandard.findUnique({
        where: { id: standardId },
        include: {
            requirements: {
                orderBy: { clauseNumber: 'asc' } // Simple text sort for now
            }
        }
    });

    if (!standard) return notFound();

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-2">
                <Link href={'/admin/accreditation'} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                    <span className="sr-only">Back</span>
                </Link>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                    <BookOpen className="mr-3 text-indigo-600" />
                    {standard.name}
                </h1>
            </div>
            <p className="text-slate-500 ml-10 text-sm">{standard.description}</p>

            <hr className="border-slate-200" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add New Requirement Form */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky top-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <PlusCircle className="w-5 h-5 mr-2 text-indigo-500" />
                            Add Requirement
                        </h3>
                        <form action={createRequirement} className="space-y-4">
                            <input type="hidden" name="standardId" value={standard.id} />

                            <div>
                                <label htmlFor="clauseNumber" className="block text-xs font-medium text-slate-500 mb-1">Clause Number</label>
                                <input id="clauseNumber" name="clauseNumber" type="text" placeholder="e.g. 1.1.2" aria-label="Clause Number" title="Clause Number" required className="w-full rounded-md border-slate-300 text-sm" />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-xs font-medium text-slate-500 mb-1">Requirement Text</label>
                                <textarea id="description" name="description" placeholder="A written directive requires..." aria-label="Requirement Text" title="Requirement Text" required rows={5} className="w-full rounded-md border-slate-300 text-sm resize-none"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors">
                                Save Requirement
                            </button>
                        </form>
                    </div>
                </div>

                {/* Requirements List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center justify-between">
                        <span>Framework Clauses ({standard.requirements.length})</span>
                    </h3>

                    {standard.requirements.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No requirements mapped to this standard yet.</p>
                            <p className="text-sm mt-2 text-slate-400">Use the form to begin building the framework.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {standard.requirements.map((req: any) => (
                                <div key={req.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4">
                                    <div className="bg-indigo-50 text-indigo-800 font-mono font-bold px-3 py-1.5 rounded-md text-sm shrink-0 whitespace-nowrap mt-0.5">
                                        {req.clauseNumber}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 leading-relaxed">{req.description}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center space-x-2">
                                        <Link
                                            href={`/admin/accreditation/${standard.id}/${req.id}`}
                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md transition-colors flex items-center"
                                            title="Manage Evidence Locker"
                                        >
                                            Evidence
                                        </Link>
                                        <form action={deleteRequirement}>
                                            <input type="hidden" name="id" value={req.id} />
                                            <DeleteRequirementButton />
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
