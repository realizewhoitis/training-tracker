
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { User, BookOpen, Award, CheckCircle, Package, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { saveFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
    const employeeId = parseInt(params.id);

    const employee = await prisma.employee.findUnique({
        where: { empId: employeeId },
        include: {
            attendances: {
                include: { training: true },
                orderBy: { attendanceDate: 'desc' }
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
            }
        }
    });

    if (!employee) {
        notFound();
    }

    // Calculate training hours
    const totalHours = employee.attendances.reduce((acc: number, curr: any) => acc + (curr.attendanceHours || 0), 0);

    async function handleCertUpload(formData: FormData) {
        'use server';

        const expirationId = parseInt(formData.get('expirationId') as string);
        const file = formData.get('file') as File;

        if (!file || file.size === 0) return;

        try {
            // Save file to 'certificates' folder
            const relativePath = await saveFile(file, 'certificates');

            // Update database
            await prisma.expiration.update({
                where: { expirationID: expirationId },
                data: { documentPath: relativePath }
            });

            revalidatePath(`/employees/${employeeId}`);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }

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
                <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${!employee.departed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {!employee.departed ? 'Active Status' : 'Departed'}
                    </span>
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
                            <Award size={18} className="mr-2 text-amber-500" /> Certificates & Expirations
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
                                    {employee.expirations.map((exp: any) => (
                                        <tr key={exp.expirationID}>
                                            <td className="py-2 text-slate-800 font-medium">{exp.certificate.certificateName}</td>
                                            <td className="py-2">
                                                {exp.Expiration ? (
                                                    <span className={new Date(exp.Expiration) < new Date() ? 'text-red-500 font-bold' : 'text-slate-600'}>
                                                        {exp.Expiration.toLocaleDateString()}
                                                    </span>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="py-2 text-right">
                                                {exp.documentPath ? (
                                                    <a
                                                        href={`/api/files/${exp.documentPath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex justify-end items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                    >
                                                        <FileText size={16} className="mr-1" />
                                                        View
                                                    </a>
                                                ) : (
                                                    <form action={handleCertUpload} className="flex justify-end items-center space-x-2">
                                                        <input type="hidden" name="expirationId" value={exp.expirationID.toString()} />
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                name="file"
                                                                id={`file-${exp.expirationID}`}
                                                                className="hidden"
                                                            />
                                                            <label
                                                                htmlFor={`file-${exp.expirationID}`}
                                                                className="cursor-pointer text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 flex items-center"
                                                            >
                                                                <Upload size={12} className="mr-1" /> Choose
                                                            </label>
                                                        </div>
                                                        <button type="submit" className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                                                            Upload
                                                        </button>
                                                    </form>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Training Log */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Recent Training Activity</h3>
                        <div className="space-y-4">
                            {employee.attendances.slice(0, 5).map((log: any) => (
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
                            <button className="text-blue-600 text-sm font-medium hover:underline">View All History</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
