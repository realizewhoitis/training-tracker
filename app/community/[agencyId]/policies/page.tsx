import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';

// No auth required! Public page.
export default async function CommunityPoliciesPage({ params }: { params: Promise<{ agencyId: string }> }) {
    const p = await params;
    const prisma = await getTenantPrisma() as any;

    const agency = await prisma.agency.findUnique({
        where: { id: p.agencyId }
    });

    if (!agency) return notFound();

    // Fetch public policies for this agency
    const publicContainers = await prisma.policyContainer.findMany({
        where: {
            agencyId: agency.id,
            isPublic: true
        },
        include: {
            versions: {
                where: { status: 'PUBLISHED' },
                orderBy: { publishedAt: 'desc' },
                take: 1
            }
        },
        orderBy: { title: 'asc' }
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-16 px-6 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center justify-center text-center flex-col">
                    <ShieldCheck size={64} className="mb-6 opacity-90 drop-shadow-lg text-indigo-200" />
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">{agency.name}</h1>
                        <p className="text-indigo-200 mt-4 text-xl tracking-wide uppercase font-semibold">Public Transparency Portal</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-16 px-6">
                <div className="mb-12 text-slate-700 leading-relaxed text-lg bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <p className="mb-4">Welcome to the official public compliance and standard operating procedures portal for <strong className="text-slate-900">{agency.name}</strong>.</p>
                    <p>We believe in full transparency and accountability with our community. Below you will find our publicly available policies, directives, and operational guidelines.</p>
                </div>

                <div className="space-y-6">
                    {publicContainers.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-slate-300 rounded-3xl text-center text-slate-500 bg-white shadow-sm">
                            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-lg">No public policies have been published yet.</p>
                        </div>
                    ) : publicContainers.map((container: any) => {
                        const publishedVersion = container.versions[0];
                        if (!publishedVersion) return null;

                        return (
                            <div key={container.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 overflow-hidden group">
                                <Link href={`/community/${agency.id}/policies/${container.id}`} className="block p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{container.title}</h2>
                                            <p className="text-slate-500 mt-2 text-base">{container.description}</p>
                                        </div>
                                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shrink-0 ml-4">
                                            {container.category || 'POLICY'}
                                        </span>
                                    </div>
                                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-sm font-medium text-slate-400">
                                            Effective Date: {new Date(publishedVersion.publishedAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-indigo-600 font-bold flex items-center text-sm uppercase tracking-wide group-hover:text-indigo-800">
                                            <FileText size={18} className="mr-2" /> Read Full Document
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
