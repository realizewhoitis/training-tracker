
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { Package, Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default async function InventoryPage({
    searchParams
}: {
    searchParams: { q?: string; status?: string }
}) {
    const query = searchParams.q || '';
    const statusFilter = searchParams.status || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereCondition: any = {};

    if (query) {
        whereCondition.OR = [
            { name: { contains: query } },
            { serialNumber: { contains: query } },
            { assetTag: { contains: query } }
        ];
    }

    if (statusFilter) {
        whereCondition.status = statusFilter;
    }

    const assets = await prisma.asset.findMany({
        where: whereCondition,
        include: {
            category: true,
            assignments: {
                where: { returnedAt: null },
                include: { employee: true }
            }
        },
        orderBy: { id: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Inventory</h1>
                    <p className="text-slate-500">Track equipment and assignments</p>
                </div>

                <div className="flex space-x-3">
                    <Link
                        href="/inventory/new"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm ring-1 ring-blue-700"
                    >
                        <Plus size={16} />
                        <span>Add Asset</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <form>
                        <input
                            name="q"
                            defaultValue={query}
                            placeholder="Search by name, serial, or tag..."
                            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </form>
                </div>
                <div className="flex items-center space-x-2">
                    <Filter size={16} className="text-slate-400" />
                    <select className="border-none bg-transparent text-sm font-medium text-slate-600 focus:ring-0">
                        <option value="">All Statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>
                </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset: any) => {
                    const isAssigned = asset.assignments.length > 0;
                    const assignee = isAssigned ? asset.assignments[0].employee : null;

                    return (
                        <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' :
                                            asset.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-600' :
                                                'bg-amber-100 text-amber-600'
                                            }`}>
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                                            <p className="text-xs text-slate-500">{asset.category.name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${asset.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' :
                                        asset.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-700' :
                                            'bg-amber-50 text-amber-700'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Serial:</span>
                                        <span className="font-mono">{asset.serialNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Tag:</span>
                                        <span className="font-mono">{asset.assetTag || 'N/A'}</span>
                                    </div>
                                </div>

                                {isAssigned && assignee && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-500 border border-slate-200 text-xs font-bold">
                                            {assignee.empName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Assigned to</p>
                                            <p className="text-sm font-medium text-slate-800">{assignee.empName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                                <Link href={`/inventory/${asset.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {assets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p>No assets found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
