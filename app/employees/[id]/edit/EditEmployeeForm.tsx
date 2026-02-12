'use client';

import { updateEmployee } from '@/app/actions/employee-actions';
import { Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface EditEmployeeFormProps {
    employee: {
        empId: number;
        empName: string | null;
        departed: boolean;
    };
}

export default function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
    const updateAction = updateEmployee.bind(null, employee.empId);

    return (
        <form action={updateAction} className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">

                {/* Employee Name */}
                <div>
                    <label htmlFor="empName" className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="empName"
                        name="empName"
                        defaultValue={employee.empName || ''}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Employee ID */}
                <div className="pt-4 border-t border-slate-100">
                    <label htmlFor="empId" className="block text-sm font-medium text-slate-700 mb-1">
                        Employee ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="text-xs font-bold">#</span>
                        </div>
                        <input
                            type="number"
                            id="empId"
                            name="empId"
                            defaultValue={employee.empId}
                            required
                            className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 flex items-start">
                        <AlertTriangle size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>
                            Warning: Changing the ID will update all associated records (Attendance, Certificates, etc.). Ensure the new ID is unique.
                        </span>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="departed" className="block text-sm font-medium text-slate-700">
                                Departed / Inactive
                            </label>
                            <p className="text-xs text-slate-500">
                                Mark this employee as no longer active. They will be hidden from default lists.
                            </p>
                        </div>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="departed"
                                id="departed"
                                defaultChecked={employee.departed}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600 border-slate-300 right-6"
                            />
                            {/* Simple toggle styling via Tailwind peer/checked would be better, but standard checkbox is safer for simple form submission without JS state handling logic complexity */}
                            <input
                                type="checkbox"
                                name="departed_visual"
                                id="departed_visual"
                                defaultChecked={employee.departed}
                                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                aria-label="Toggle Departed Status"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
                    <Link
                        href={`/employees/${employee.empId}`}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                    >
                        <Save size={18} className="mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    );
}
