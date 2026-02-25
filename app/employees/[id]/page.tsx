
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTenantPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getTraineeProgress, getCategoryStrengths } from '@/app/actions/analytics';
import ScoreTrendChart from '@/app/components/charts/ScoreTrendChart';
import CategoryRadarChart from '@/app/components/charts/CategoryRadarChart';
import { User, BookOpen, Award, CheckCircle, Package, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import ExpirationRow from './ExpirationRow';
import DORHistoryWithAggregates from '@/app/components/employee/DORHistoryWithAggregates';
import { auth } from '@/auth';
import { PERMISSIONS } from '@/lib/permissions';
import ProfileActions from '@/app/employees/[id]/components/ProfileActions';

export default async function EmployeeDetailPage(props: {
    params: Promise<{ id: string }>,
    searchParams?: Promise<{ history?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const employeeId = parseInt(params.id);
    const showAllHistory = searchParams?.history === 'all';

    const session = await auth();
    const canManageUsers = (session?.user as any)?.permissions?.includes(PERMISSIONS.MANAGE_USERS) || false;

    const roleTemplates = await (await getTenantPrisma()).roleTemplate.findMany();
    const availableRoles = ['ADMIN', 'SUPERUSER', 'SUPERVISOR', 'TRAINER', 'TRAINEE', ...roleTemplates.map(rt => rt.roleName)].filter((value, index, self) => self.indexOf(value) === index).sort();

    const employee = await (await getTenantPrisma()).employee.findUnique({
        where: { empId: employeeId },
        include: {
            attendances: {
                include: { training: true },
                // We'll sort in JS to handle nulls reliably
                // orderBy: { attendanceDate: 'desc' } 
            },
            expirations: {
                include: { certificate: true }
            },
            policyAcknowledgments: {
                include: { policy: true }
            },
            assetAssignments: {
                where: { returnedAt: null },
                include: { asset: true }
            },
            // @ts-ignore
            flags: {
                where: { status: 'OPEN' }
            },
            // 1. DORs Received (as Trainee)
            formResponses: {
                orderBy: { date: 'desc' },
                include: {
                    template: true,
                    trainer: true
                }
            },
            // 2. DORs Written (as Trainer - linked via User)
            user: {
                include: {
                    authoredTrainerResponses: {
                        orderBy: { date: 'desc' },
                        include: {
                            template: true,
                            trainee: true
                        }
                    }
                }
            },
            shift: true
        }
    });

    if (!employee) {
        notFound();
    }

    // Fetch Analytics Data
    const progressData = await getTraineeProgress(employee.empId);
    const radarData = await getCategoryStrengths(employee.empId);

    // Sort: Newest first, NULLs last
    const sortedAttendances = [...employee.attendances].sort((a, b) => {
        if (!a.attendanceDate) return 1;
        if (!b.attendanceDate) return -1;
        return new Date(b.attendanceDate).getTime() - new Date(a.attendanceDate).getTime();
    });

    const displayedAttendances = showAllHistory ? sortedAttendances : sortedAttendances.slice(0, 5);

    // Calculate training hours
    const totalHours = employee.attendances.reduce((acc: number, curr: any) => acc + (curr.attendanceHours || 0), 0);

    return (
        <div className="space-y-6">
            {/* @ts-ignore */}
            {employee.flags && employee.flags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center">
                        Intervention Required
                    </h3>
                    <div className="space-y-2">
                        {/* @ts-ignore */}
                        {employee.flags.map((flag: any) => (
                            <div key={flag.id} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-red-100">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase mt-0.5 ${flag.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {flag.severity}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{flag.type}</p>
                                    <p className="text-sm text-gray-600">{flag.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{employee.empName}</h1>
                        <p className="text-slate-500">Employee ID: #{employee.empId}</p>
                    </div>
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Performance Trend</h2>
                        <ScoreTrendChart data={progressData} />
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Category Breakdown</h2>
                        <CategoryRadarChart data={radarData} />
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${!employee.departed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {!employee.departed ? 'Active Status' : 'Departed'}
                    </span>
                    <div className="flex flex-col items-end gap-2 mt-2">
                        {employee.user?.role && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">User Role:</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    {employee.user.role}
                                </span>
                            </div>
                        )}
                        {employee.shift && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Assigned Shift:</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {employee.shift.name}
                                </span>
                            </div>
                        )}
                    </div>


                    <div className="flex gap-2 w-full justify-end mt-2">
                        <Link
                            href={`/employees/${employee.empId}/edit`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center px-2 py-1"
                        >
                            Edit Profile
                        </Link>
                        {!employee.user && canManageUsers && (
                            <ProfileActions
                                employeeId={employee.empId}
                                employeeName={employee.empName || 'Employee'}
                                availableRoles={availableRoles}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Stats & Policies */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <BookOpen size={18} className="mr-2 text-indigo-500" /> Training Summary
                        </h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-600">Total Hours</span>
                            <span className="font-bold text-slate-800 text-xl">{totalHours.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">Sessions Logged</span>
                            <span className="font-bold text-slate-800 text-xl">{employee.attendances.length}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <CheckCircle size={18} className="mr-2 text-green-500" /> Policy Status
                        </h3>
                        <div className="space-y-3">
                            {employee.policyAcknowledgments.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No policies acknowledged.</p>
                            ) : (
                                employee.policyAcknowledgments.map((ack: any) => (
                                    <div key={ack.id} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-700 truncate w-32">{ack.policy.title}</span>
                                        <span className="text-green-600 text-xs">{ack.acknowledgedAt.toLocaleDateString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <Package size={18} className="mr-2 text-blue-500" /> Assigned Equipment
                        </h3>
                        <div className="space-y-3">
                            {employee.assetAssignments.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No assets assigned.</p>
                            ) : (
                                employee.assetAssignments.map((assign: any) => (
                                    <div key={assign.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-slate-800">{assign.asset.name}</p>
                                            <p className="text-xs text-slate-500">{assign.asset.assetTag || 'No Tag'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-slate-400 block">{assign.assignedAt.toLocaleDateString()}</span>
                                            <Link href={`/inventory/${assign.assetId}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Training Log & Certs */}
                <div className="md:col-span-2 space-y-6">

                    {/* Certificate Expirations */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <Award size={18} className="mr-2 text-amber-500" /> Certificates & Expirations ({employee.expirations.length})
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                                        <th className="pb-2">Certificate</th>
                                        <th className="pb-2">Expires</th>
                                        <th className="pb-2 text-right">Document</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-50">
                                    {employee.expirations.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-center text-slate-500 italic block">
                                                No certificates on file.
                                            </td>
                                        </tr>
                                    ) : (
                                        employee.expirations.map((exp: any) => (
                                            <ExpirationRow key={exp.expirationID} expiration={exp} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Training Log */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">
                            {showAllHistory ? 'Training History' : 'Recent Training Activity'}
                        </h3>
                        <div className="space-y-4">
                            {displayedAttendances.map((log: any) => (
                                <div key={log.attendanceID} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-slate-800">{log.training.TrainingName}</p>
                                        <p className="text-xs text-slate-400">{log.attendanceDate ? log.attendanceDate.toLocaleDateString() : 'No Date'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-slate-700">{log.attendanceHours} hrs</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            {showAllHistory ? (
                                <Link
                                    href={`/employees/${employeeId}`}
                                    className="text-slate-500 text-sm font-medium hover:underline"
                                    scroll={false}
                                >
                                    Show Less
                                </Link>
                            ) : (
                                <Link
                                    href={`/employees/${employeeId}?history=all`}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                    scroll={false}
                                >
                                    View All History
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DOR History & Relationships */}
            <DORHistoryWithAggregates
                employeeName={employee.empName || 'Employee'}
                receivedDORs={employee.formResponses || []}
                authoredDORs={employee.user?.authoredTrainerResponses || []}
            />
        </div>
    );
}
