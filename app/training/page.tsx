/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getSettings } from '@/app/admin/settings/actions';
import { BookOpen, Search, Filter, Plus, ClipboardList, FileUp, Calendar, Award, CheckCircle, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ExportCsvButton from '@/app/components/ExportCsvButton';

export default async function TrainingPage({
    searchParams,
}: {
    searchParams?: {
        roster_success?: string;
    };
}) {
    const trainings = await prisma.training.findMany({
        orderBy: { TrainingName: 'asc' },
        include: {
            _count: {
                select: { attendances: true }
            }
        }
    });

    const session = await auth();
    if (!session) {
        redirect('/auth/login');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session.user as any)?.role;
    const showRosterSuccess = searchParams?.roster_success === 'true';

    const exportData = trainings.map((t: any) => ({
        ID: t.TrainingID,
        Name: t.TrainingName,
        Category: t.category || 'General',
        TotalSessionsLogged: t._count.attendances
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Training Events</h1>
                    <p className="text-slate-500">View available training courses and activity logs</p>
                </div>

                <div className="flex space-x-3">
                    <ExportCsvButton data={exportData} filename="training_events" label="Export CSV" />
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search training..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <div className="h-8 w-px bg-slate-200 mx-2"></div>
                    <Link
                        href="/training/log"
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
                    >
                        <ClipboardList className="w-4 h-4" />
                        <span>Bulk Log</span>
                    </Link>
                    {(userRole === 'ADMIN' || userRole === 'SUPERUSER' || userRole === 'TRAINER') && (
                        <>
                            <Link
                                href="/training/roster"
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-sm"
                            >
                                <Users className="w-4 h-4" />
                                <span>Virtual Sign-In</span>
                            </Link>
                            <Link
                                href="/training/new"
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                            >
                                <FileUp className="w-4 h-4" />
                                <span>Add Training Event</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {showRosterSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium">Roster successfully updated!</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Course Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Category</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Total Sessions Logged</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {trainings.map((training: any) => (
                            <tr key={training.TrainingID} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <BookOpen size={16} />
                                        </div>
                                        <span className="font-medium text-slate-900">{training.TrainingName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {training.category || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">#{training.TrainingID}</td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    {training._count.attendances} sessions
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={`/training/${training.TrainingID}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View Logs
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
