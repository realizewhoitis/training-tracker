
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import FormSubmissionsTable from '@/app/components/admin/FormSubmissionsTable';

export const dynamic = 'force-dynamic';

export default async function AdminFormSubmissionsPage() {
    const session = await auth();
    // @ts-ignore
    const userRole = session?.user?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPERUSER' && userRole !== 'TRAINER') {
        redirect('/dashboard');
    }

    const submissions = await prisma.formResponse.findMany({
        orderBy: { date: 'desc' },
        include: {
            trainee: true,
            trainer: true,
            template: true
        }
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 mb-1">
                        <Link href="/admin/forms" className="hover:text-blue-600 flex items-center">
                            <ArrowLeft size={16} className="mr-1" /> Back to Templates
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">All Form Submissions</h1>
                    <p className="text-slate-500">Manage, review, and audit all submitted Daily Observation Reports.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
                    Total: {submissions.length}
                </div>
            </div>

            <FormSubmissionsTable submissions={submissions} />
        </div>
    );
}
