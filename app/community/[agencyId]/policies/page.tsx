import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import CommunityPolicyListClient from './CommunityPolicyListClient';

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

                <CommunityPolicyListClient
                    initialContainers={publicContainers}
                    agency={agency}
                />
            </main>
        </div>
    );
}
