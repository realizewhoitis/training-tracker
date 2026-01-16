
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BookOpen, Save, X, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function NewTrainingPage() {

    // Fetch existing categories for suggestion list
    const existingCategories = await prisma.training.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { category: { not: null } }
    });

    async function createTraining(formData: FormData) {
        'use server';

        const trainingName = formData.get('trainingName') as string;
        const category = formData.get('category') as string;

        if (!trainingName) return;

        await prisma.training.create({
            data: {
                TrainingName: trainingName,
                category: category || null
            }
        });

        redirect('/training');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Add Training Module</h1>
                    <p className="text-slate-500">Create a new course or topic</p>
                </div>
                <Link href="/training" className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                    <X size={24} />
                </Link>
            </div>

            <form action={createTraining} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">

                {/* Name Field */}
                <div>
                    <label htmlFor="trainingName" className="block text-sm font-medium text-slate-700 mb-1">
                        Module Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <BookOpen size={18} />
                        </div>
                        <input
                            type="text"
                            id="trainingName"
                            name="trainingName"
                            required
                            placeholder="e.g. CPR Refresher 2026"
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Category Field with Datalist */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                        Category (CEU Bucket)
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Tag size={18} />
                        </div>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            list="category-suggestions"
                            placeholder="Type or select a category..."
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <datalist id="category-suggestions">
                            {existingCategories.map((c: any, i: number) => (
                                c.category ? <option key={i} value={c.category} /> : null
                            ))}
                        </datalist>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Group trainings by type (e.g., Medical, Fire, Law Enforcement) for reporting.
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <Link
                        href="/training"
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <Save size={18} className="mr-2" />
                        Create Module
                    </button>
                </div>
            </form>
        </div>
    );
}
