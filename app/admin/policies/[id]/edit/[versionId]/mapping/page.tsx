import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { MappingWorkbenchClient } from './MappingWorkbenchClient';

export default async function PolicyMappingWorkbench({ params }: { params: Promise<{ id: string, versionId: string }> }) {
    const p = await params;
    const containerId = parseInt(p.id);
    const versionId = parseInt(p.versionId);

    if (isNaN(containerId) || isNaN(versionId)) return notFound();

    const prisma = await getTenantPrisma() as any;

    const version = await prisma.policyVersion.findUnique({
        where: { id: versionId },
        include: { mappings: { include: { requirement: { include: { standard: true } } } } }
    });

    if (!version) return notFound();

    const standards = await prisma.accreditationStandard.findMany({
        include: { requirements: true }
    });

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 h-screen flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center space-x-4">
                    <Link href={`/admin/policies/${containerId}/edit/${versionId}`} className="text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                        <BookOpen className="mr-3 text-indigo-600" />
                        Accreditation Mapping Workbench
                    </h1>
                </div>
            </div>

            <MappingWorkbenchClient version={version} standards={standards} />
        </div>
    );
}
