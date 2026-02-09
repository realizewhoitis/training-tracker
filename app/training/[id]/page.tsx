import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, UserPlus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { addAttendee, removeAttendee } from '@/app/actions/training';
import LogAttendanceSidebar from '@/app/components/training/LogAttendanceSidebar';

export default async function TrainingDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const trainingId = parseInt(params.id);
    if (isNaN(trainingId)) return notFound();

    const training = await prisma.training.findUnique({
        where: { TrainingID: trainingId },
        include: {
            attendances: {
                include: { employee: true },
                orderBy: { attendanceDate: 'desc' }
            }
        }
    });

    if (!training) return notFound();

    // Fetch active employees for the dropdown
    const employees = await prisma.employee.findMany({
        where: { departed: false },
        orderBy: { empName: 'asc' }
    });

    const totalHours = training.attendances.reduce((acc, curr) => acc + (curr.attendanceHours || 0), 0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/training" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {training.category || 'Uncategorized'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">{training.TrainingName}</h1>
                </div>
                <div className="flex gap-4 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <span className="font-semibold">{training.attendances.length}</span> Attendees
                    </div>
                    <div className="w-px bg-slate-200 h-full"></div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-green-500" />
                        <span className="font-semibold">{totalHours.toFixed(1)}</span> Total Hours
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Attendance List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                        Attendance History
                    </h2>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {training.attendances.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 italic">
                                No attendance records found. Add one on the right.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-600">Employee</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Hours</th>
                                        <th className="px-4 py-3 font-medium text-slate-600">Note</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {training.attendances.map((att) => (
                                        <tr key={att.attendanceID} className="hover:bg-slate-50 group">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                <Link href={`/employees/${att.employeeID}`} className="hover:underline hover:text-blue-600">
                                                    {att.employee.empName}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {att.attendanceDate ? new Date(att.attendanceDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 font-mono">
                                                {att.attendanceHours}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]" title={att.attendanceNote || ''}>
                                                {att.attendanceNote}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <form action={async () => {
                                                    'use server';
                                                    await removeAttendee(att.attendanceID, trainingId);
                                                }}>
                                                    <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" title="Delete Attendance">
                                                        <Trash2 size={16} />
                                                        <span className="sr-only">Delete</span>
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Sidebar: Add Attendee */}
                {/* Sidebar: Add Attendee */}
                <div className="space-y-4">
                    <LogAttendanceSidebar trainingId={trainingId} employees={employees} />
                </div>
            </div>
        </div>
    );
}
