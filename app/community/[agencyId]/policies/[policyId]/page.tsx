import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function CommunityPolicyViewerPage({ params }: { params: Promise<{ agencyId: string, policyId: string }> }) {
    const p = await params;
    const containerId = parseInt(p.policyId);

    if (isNaN(containerId)) return notFound();

    const prisma = await getTenantPrisma() as any;

    const agency = await prisma.agency.findUnique({
        where: { id: p.agencyId }
    });

    if (!agency) return notFound();

    const container = await prisma.policyContainer.findUnique({
        where: { id: containerId },
        include: {
            versions: {
                where: { status: 'PUBLISHED' },
                orderBy: { publishedAt: 'desc' },
                take: 1
            }
        }
    });

    if (!container || !container.isPublic || container.agencyId !== agency.id) {
        return notFound();
    }

    const version = container.versions[0];
    if (!version) return notFound();

    return (
        <div className="min-h-screen bg-slate-50 font-sans print:bg-white flex flex-col items-center">

            {/* Top Navigation Bar */}
            <div className="w-full bg-indigo-900 border-b-4 border-indigo-700 p-4 text-white print:hidden">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href={`/community/${agency.id}/policies`} className="flex items-center text-indigo-200 hover:text-white transition-colors font-medium">
                        <ArrowLeft className="mr-2" size={20} />
                        Back to Transparency Portal
                    </Link>
                    <div className="flex items-center text-indigo-50 font-bold tracking-tight">
                        <ShieldCheck size={24} className="mr-2 text-indigo-300" />
                        {agency.name}
                    </div>
                </div>
            </div>

            {/* Document Header */}
            <div className="max-w-4xl mx-auto w-full px-6 pt-12 pb-8 text-center print:pt-4">
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-4">
                    {version.title || container.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-500 uppercase tracking-widest mt-6">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
                        {container.category || 'POLICY'}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Effective: {new Date(version.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        v{version.versionNumber}.0
                    </span>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto w-full px-4 md:px-6 pb-20">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">

                    {/* Print Button Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-end print:hidden">
                        <button onClick={() => window.print()} className="flex items-center text-slate-500 hover:text-indigo-600 font-medium text-sm transition-colors">
                            <Printer className="mr-2" size={16} />
                            Print Official Copy
                        </button>
                    </div>

                    <div className={`p-8 md:p-12 min-h-[60vh] relative ${version.mediaUrl ? 'bg-slate-100 p-0 md:p-0' : ''}`}>
                        {/* Watermark */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] z-0 print:opacity-[0.05]">
                            <ShieldCheck size={400} />
                        </div>

                        {version.mediaUrl ? (
                            <iframe
                                src={`${version.mediaUrl}#toolbar=0&navpanes=0`}
                                className="w-full h-screen min-h-[800px] border-0 rounded-b-2xl"
                                title={version.title || 'Policy Document'}
                            />
                        ) : (
                            <div
                                className="prose prose-slate prose-lg max-w-none relative z-10 
                                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-800
                                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                                prose-p:leading-relaxed prose-p:text-slate-600
                                prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                                prose-ul:my-6 prose-li:my-2
                                prose-strong:text-slate-800"
                                dangerouslySetInnerHTML={{ __html: version.content || '' }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="mt-8 text-center text-slate-400 text-xs px-8 leading-relaxed max-w-2xl mx-auto print:hidden">
                    This document is an official publication of {agency.name} and is provided for public transparency.
                    Unless otherwise noted, the contents are considered active administrative directives.
                </div>
            </div>
        </div>
    );
}
