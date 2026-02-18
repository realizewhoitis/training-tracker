
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditEmployeeForm from './EditEmployeeForm';
import { getShifts } from '@/app/actions/shift-actions';
import { UserCog } from 'lucide-react';
import Link from 'next/link';

export default async function EditEmployeePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const employeeId = parseInt(params.id);

    const employee = await prisma.employee.findUnique({
        where: { empId: employeeId }
    });

    const shifts = await getShifts();

    if (!employee) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserCog size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Edit Employee Profile</h1>
                    <p className="text-slate-500">Update details for {employee.empName}</p>
                </div>
            </div>

            <EditEmployeeForm employee={employee} shifts={shifts} />
        </div>
    );
}
