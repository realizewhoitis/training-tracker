
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { User, UserPlus as UserSize } from 'lucide-react';
import Link from 'next/link';
import Search from './Search';
import FilterButton from './FilterButton';

export default async function EmployeesPage(props: {
    searchParams?: Promise<{
        query?: string;
        showDeparted?: string;
        sort?: string;
        order?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const showDeparted = searchParams?.showDeparted === 'true';
    const sort = searchParams?.sort || 'name';
    const order = searchParams?.order === 'desc' ? 'desc' : 'asc';
    const isIdSearch = !isNaN(parseInt(query));

    let orderBy: any = { empName: order };
    if (sort === 'id') orderBy = { empId: order };
    if (sort === 'role') orderBy = { user: { role: order } };
    if (sort === 'shift') orderBy = { shift: { name: order } };

    const employees = await prisma.employee.findMany({
        orderBy: orderBy,
        where: {
            departed: showDeparted ? undefined : false,
            OR: query ? [
                // @ts-ignore - 'mode' is not supported in SQLite (local) but works in Postgres (prod)
                { empName: { contains: query, mode: 'insensitive' } },
                ...(isIdSearch ? [{ empId: parseInt(query) }] : [])
            ] : undefined
        },
        include: {
            user: true,
            shift: true,
            _count: {
                select: { attendances: true, expirations: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Employees</h1>
                    <p className="text-slate-500">Manage your team and view their training status</p>
                </div>

                <div className="flex space-x-3 w-full md:w-auto">
                    <Search placeholder="Search employees..." />
                    <FilterButton />
                    <Link
                        href="/employees/new"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
                    >
                        <UserSize className="w-4 h-4" />
                        <span>Add Employee</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">
                                    <Link href={`/employees?sort=name&order=${sort === 'name' && order === 'asc' ? 'desc' : 'asc'}&query=${query}&showDeparted=${showDeparted}`} className="flex items-center hover:text-blue-600">
                                        Name {sort === 'name' && (order === 'asc' ? '↑' : '↓')}
                                    </Link>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">
                                    <Link href={`/employees?sort=id&order=${sort === 'id' && order === 'asc' ? 'desc' : 'asc'}&query=${query}&showDeparted=${showDeparted}`} className="flex items-center hover:text-blue-600">
                                        ID {sort === 'id' && (order === 'asc' ? '↑' : '↓')}
                                    </Link>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">
                                    <Link href={`/employees?sort=role&order=${sort === 'role' && order === 'asc' ? 'desc' : 'asc'}&query=${query}&showDeparted=${showDeparted}`} className="flex items-center hover:text-blue-600">
                                        Role {sort === 'role' && (order === 'asc' ? '↑' : '↓')}
                                    </Link>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">
                                    <Link href={`/employees?sort=shift&order=${sort === 'shift' && order === 'asc' ? 'desc' : 'asc'}&query=${query}&showDeparted=${showDeparted}`} className="flex items-center hover:text-blue-600">
                                        Shift {sort === 'shift' && (order === 'asc' ? '↑' : '↓')}
                                    </Link>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Training Log</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Active Certs</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((employee: any) => (
                                <tr key={employee.empId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/employees/${employee.empId}`} className="flex items-center space-x-3 group">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
                                                <User size={16} />
                                            </div>
                                            <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{employee.empName}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">#{employee.empId}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${employee.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                employee.user?.role === 'SUPERVISOR' ? 'bg-amber-100 text-amber-800' :
                                                    employee.user?.role === 'TRAINER' ? 'bg-teal-100 text-teal-800' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {employee.user?.role || 'TRAINEE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {employee.shift ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {employee.shift.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!employee.departed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {!employee.departed ? 'Active' : 'Departed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {employee._count.attendances} records
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {/* Approximation based on expirations, logic to refine later */}
                                        {employee._count.expirations}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/employees/${employee.empId}`}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
