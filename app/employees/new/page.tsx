
import { getTenantPrisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserPlus, Save, X, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import AddShift from '../components/AddShift';
import { getShifts } from '@/app/actions/shift-actions';

export default async function NewEmployeePage() {

    const shifts = await getShifts();

    async function createEmployee(formData: FormData) {
        'use server';

        const empName = formData.get('empName') as string;
        const empIdRaw = formData.get('empId') as string;
        const empId = empIdRaw ? parseInt(empIdRaw) : undefined;
        const shiftIdRaw = formData.get('shiftId') as string;
        const shiftId = shiftIdRaw ? parseInt(shiftIdRaw) : undefined;

        // Simple validation
        if (!empName) return;

        try {
            await (await getTenantPrisma()).employee.create({
                data: {
                    empName: empName,
                    departed: false,
                    ...(empId && { empId: empId }),
                    ...(shiftId && { shiftId: shiftId })
                }
            });
        } catch (error) {
            console.error('Failed to create employee:', error);
            // In a real app we'd return an error to the form, but for now just redirect
            // or maybe throw to show error boundary?
            throw new Error('Failed to create employee. ID might be taken.');
        }

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
                </div>

                <div>
                    <label htmlFor="shiftId" className="block text-sm font-medium text-slate-700 mb-1">
                        Shift Assignment <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <CalendarClock size={18} />
                        </div>
                        <select
                            id="shiftId"
                            name="shiftId"
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="">No Shift Assigned</option>
                            {shifts.map((shift: { id: number; name: string }) => (
                                <option key={shift.id} value={shift.id}>{shift.name}</option>
                            ))}
                        </select>
                        <AddShift />
                    </div>
                </div>

                <div>
                    <label htmlFor="empId" className="block text-sm font-medium text-slate-700 mb-1">
                        Employee ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="text-xs font-bold">#</span>
                        </div>
                        <input
                            type="number"
                            id="empId"
                            name="empId"
                            placeholder="Auto-assigned if left blank"
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Leave blank to automatically assign the next available ID.
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
