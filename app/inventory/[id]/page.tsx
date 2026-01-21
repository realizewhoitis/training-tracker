
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Package, Clock, ArrowRightLeft } from 'lucide-react';
import { assignAsset, returnAsset } from '../actions';

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
    const assetId = parseInt(params.id);
    const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
            category: true,
            assignments: {
                include: { employee: true },
                orderBy: { assignedAt: 'desc' }
            }
        }
    });

    if (!asset) notFound();

    const currentAssignment = asset.assignments.find((a: any) => !a.returnedAt);
    const employees = await prisma.employee.findMany({ where: { departed: false }, orderBy: { empName: 'asc' } });

    return (
        <div className="space-y-6">
            {/* Asset Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{asset.name}</h1>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{asset.assetTag || 'No Tag'}</span>
                            <span>•</span>
                            <span>{asset.category.name}</span>
                        </div>
                    </div>
                </div>

                <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wide ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    asset.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {asset.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Actions Column */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <ArrowRightLeft size={18} className="mr-2 text-blue-500" /> Actions
                        </h3>

                        {asset.status === 'AVAILABLE' ? (
                            <form action={assignAsset} className="space-y-4">
                                <input type="hidden" name="assetId" value={asset.id} />
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Assign to Employee</label>
                                    <select name="employeeId" required className="w-full text-sm border-slate-300 rounded-lg">
                                        <option value="">Select Personnel...</option>
                                        {employees.map((e: any) => <option key={e.empId} value={e.empId}>{e.empName}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                                    <textarea name="notes" rows={2} className="w-full text-sm border-slate-300 rounded-lg" placeholder="e.g. For training week"></textarea>
                                </div>
                                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm">
                                    Check Out
                                </button>
                            </form>
                        ) : currentAssignment ? (
                            <form action={returnAsset} className="space-y-4">
                                <input type="hidden" name="assetId" value={asset.id} />
                                <input type="hidden" name="assignmentId" value={currentAssignment.id} />
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                                    <p className="text-xs text-blue-600 mb-1">Currently assigned to:</p>
                                    <p className="text-sm font-bold text-blue-800">{currentAssignment.employee.empName}</p>
                                    <p className="text-xs text-blue-400 mt-1">Since {currentAssignment.assignedAt.toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Condition on Return</label>
                                    <select name="condition" defaultValue={asset.condition} className="w-full text-sm border-slate-300 rounded-lg">
                                        <option value="GOOD">Good</option>
                                        <option value="FAIR">Fair</option>
                                        <option value="POOR">Poor</option>
                                        <option value="DAMAGED">Damaged</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm">
                                    Check In
                                </button>
                            </form>
                        ) : (
                            <p className="text-sm text-amber-600">Asset serves status &apos;{asset.status}&apos; but no active assignment found. Please correct manually.</p>
                        )}
                    </div>

                    {/* Details Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Condition</span>
                            <span className="font-medium text-slate-800">{asset.condition}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Serial Number</span>
                            <span className="font-mono text-slate-800">{asset.serialNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Asset Tag</span>
                            <span className="font-mono text-slate-800">{asset.assetTag || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* History Column */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800 flex items-center">
                            <Clock size={18} className="mr-2 text-slate-400" /> Assignment History
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {asset.assignments.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No assignment history.</div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium text-slate-500">Employee</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Out</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">In</th>
                                        <th className="px-6 py-3 font-medium text-slate-500">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {asset.assignments.map((a: any) => {
                                        const isReturned = !!a.returnedAt;
                                        const duration = isReturned
                                            ? Math.round((new Date(a.returnedAt!).getTime() - new Date(a.assignedAt).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
                                            : 'Active';

                                        return (
                                            <tr key={a.id} className={!isReturned ? 'bg-blue-50/50' : ''}>
                                                <td className="px-6 py-4 font-medium text-slate-800">{a.employee.empName}</td>
                                                <td className="px-6 py-4 text-slate-500">{a.assignedAt.toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {isReturned ? a.returnedAt!.toLocaleDateString() : <span className="text-blue-600 font-medium">--</span>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{duration}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
