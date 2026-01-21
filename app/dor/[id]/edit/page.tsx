
import { auth } from '@/auth';
import { getDOR, getTrainees } from '@/app/actions/dor-submission';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import DORForm from '@/app/dor/new/DORForm';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function DOREditPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.email) redirect('/login');

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser || (currentUser as any).role !== 'ADMIN') {
        // Strict Admin check
        redirect('/dashboard');
    }

    const dor: any = await getDOR(parseInt(params.id));
    if (!dor) notFound();

    const trainees = await getTrainees();

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Edit Report</h1>
                <p className="text-slate-500">Editing DOR #{dor.id} for {dor.trainee.empName}</p>
            </div>

            <DORForm
                template={dor.template}
                trainees={trainees}
                initialData={dor}
            />
        </div>
    );
}
