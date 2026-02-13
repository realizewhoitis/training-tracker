
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FilePlus, Edit, CheckCircle } from 'lucide-react';
import { createTemplate } from '@/app/actions/form-builder';

export default async function FormsDashboard() {
    const templates = await prisma.formTemplate.findMany({
        orderBy: { updatedAt: 'desc' }
    });

    async function handleCreate(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        if (title) {
            await createTemplate(title);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Form Templates</h1>
                    <p className="text-slate-500 mb-2">Manage Daily Observation Report structures</p>
                    <Link
                        href="/admin/forms/submissions"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                        View All Submissions &rarr;
                    </Link>
                </div>
                <form action={handleCreate} className="flex gap-2">
                    <input
                        type="text"
                        name="title"
                        placeholder="New Template Name..."
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-64"
                        required
                    />
                    <button type="submit" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                        <FilePlus size={18} className="mr-2" />
                        Create
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{template.title}</h3>
                                <p className="text-xs text-slate-400">Ver. {template.version}</p>
                            </div>
                            {template.isPublished ? (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                                    <CheckCircle size={12} className="mr-1" /> Published
                                </span>
                            ) : (
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">Draft</span>
                            )}
                        </div>
                        <div className="text-sm text-slate-500 mb-6">
                            Last updated {template.updatedAt.toLocaleDateString()}
                        </div>
                        <Link
                            href={`/admin/forms/builder/${template.id}`}
                            className="block w-full text-center py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                        >
                            <span className="flex items-center justify-center">
                                <Edit size={16} className="mr-2" />
                                {template.isPublished ? 'View Template' : 'Edit Builder'}
                            </span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
