
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserPlus, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function NewEmployeePage() {

    async function createEmployee(formData: FormData) {
        'use server';

        const empName = formData.get('empName') as string;
        // Simple validation
        if (!empName) return;

        await prisma.employee.create({
            data: {
                empName: empName,
                departed: false
            }
        });

        redirect('/employees');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Add New Employee</h1>
                    <p className="text-slate-500">Onboard a new team member</p>
                </div>
                <Link href="/employees" className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                    <X size={24} />
                </Link>
            </div>

            <form action={createEmployee} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">

                <div>
                    <label htmlFor="empName" className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <UserPlus size={18} />
                        </div>
                        <input
                            type="text"
                            id="empName"
                            name="empName"
                            required
                            placeholder="e.g. John Doe"
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        The Employee ID will be automatically assigned.
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <Link
                        href="/employees"
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <Save size={18} className="mr-2" />
                        Create Employee
                    </button>
                </div>
            </form>
        </div>
    );
}
