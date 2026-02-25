import { auth } from '@/auth';
import { getTenantPrisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Users, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import RosterChecklist from './RosterChecklist';

export default async function VirtualRosterPage() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userPermissions = (session?.user as any)?.permissions || [];

    if (userRole !== 'ADMIN' && userRole !== 'SUPERUSER' && userRole !== 'TRAINER') {
        return (
            <div className="p-10 flex flex-col items-center justify-center h-[50vh] text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
                <p className="text-slate-500 mt-2">You do not have permission to manage training rosters.</p>
                <Link href="/training" className="mt-6 text-blue-600 hover:text-blue-800 font-medium hover:underline">
                    Return to Training
                </Link>
            </div>
        );
    }

    const availableTrainings = await (await getTenantPrisma()).training.findMany({
        orderBy: { TrainingName: 'asc' }
    });

    const activeEmployees = await (await getTenantPrisma()).employee.findMany({
        where: { departed: false },
        include: { shift: true },
        orderBy: [
            { shift: { name: 'asc' } },
            { empName: 'asc' }
        ]
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center space-x-4">
                <Link
                    href="/training"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                        <Users className="w-8 h-8 mr-3 text-blue-600" />
                        Virtual Sign-In Roster
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Batch-log an entire training event for multiple employees instantly.
                    </p>
                </div>
            </div>

            <RosterChecklist
                trainings={availableTrainings}
                employees={activeEmployees}
                userPermissions={userPermissions}
            />
        </div>
    );
}
