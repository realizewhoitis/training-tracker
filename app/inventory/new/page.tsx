
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTenantPrisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Package, Save, X, Tag, Hash, User } from 'lucide-react';
import Link from 'next/link';
import AddCategory from './AddCategory';

export default async function NewAssetPage() {

    const categories = await (await getTenantPrisma()).assetCategory.findMany({
        orderBy: { name: 'asc' }
    });

    const employees = await (await getTenantPrisma()).employee.findMany({
        where: { departed: false },
        orderBy: { empName: 'asc' }
    });

    async function createAsset(formData: FormData) {
        'use server';

        const name = formData.get('name') as string;
        const categoryId = parseInt(formData.get('categoryId') as string);
        const serialNumber = formData.get('serialNumber') as string;
        const assetTag = formData.get('assetTag') as string;
        const employeeId = formData.get('employeeId') ? parseInt(formData.get('employeeId') as string) : null;

        // Simple validation
        if (!name || isNaN(categoryId)) return;

        if (employeeId) {
            await (await getTenantPrisma()).$transaction(async (tx) => {
                const asset = await tx.asset.create({
                    data: {
                        name,
                        categoryId,
                        serialNumber: serialNumber || null,
                        assetTag: assetTag || null,
                        status: 'ASSIGNED'
                    }
                });

                await tx.assetAssignment.create({
                    data: {
                        assetId: asset.id,
                        employeeId: employeeId,
                        assignedAt: new Date(),
                    }
                });
            });
        } else {
            await (await getTenantPrisma()).asset.create({
                data: {
                    name,
                    categoryId,
                    serialNumber: serialNumber || null,
                    assetTag: assetTag || null,
                    status: 'AVAILABLE'
                }
            });
        }

        redirect('/inventory');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">New Asset</h1>
                    <p className="text-slate-500">Register new equipment into inventory</p>
                </div>
                <Link href="/inventory" className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                    <X size={24} />
                </Link>
            </div>

            <form action={createAsset} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Asset Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Package size={18} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Motorola APX 6000"
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                name="categoryId"
                                required
                                aria-label="Select Category"
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            >
                                <option value="">Select a category...</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <AddCategory />
                        </div>
                    </div>

                    {/* Employee Assignment (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Assign to (Optional)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <User size={18} />
                            </div>
                            <select
                                name="employeeId"
                                aria-label="Assign to Employee"
                                className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            >
                                <option value="">-- Available (No Assignment) --</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.empId} value={emp.empId}>{emp.empName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Serial */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Serial Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Hash size={18} />
                            </div>
                            <input
                                type="text"
                                name="serialNumber"
                                placeholder="Manufacturer Serial"
                                className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Asset Tag */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Asset Tag / Barcode
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Tag size={18} />
                            </div>
                            <input
                                type="text"
                                name="assetTag"
                                placeholder="Internal ID"
                                className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <Link
                        href="/inventory"
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <Save size={18} className="mr-2" />
                        Create Asset
                    </button>
                </div>
            </form>
        </div>
    );
}
