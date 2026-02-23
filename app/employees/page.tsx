
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '@/lib/prisma';
import { User, UserPlus as UserSize } from 'lucide-react';
import Link from 'next/link';
import Search from './Search';
import FilterButton from './FilterButton';
import EmployeeTable from './EmployeeTable';

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

    const activeShifts = await prisma.shift.findMany({
        orderBy: { name: 'asc' }
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
        </div>
            </div >

        <EmployeeTable
            employees={employees}
            shifts={activeShifts}
            sort={sort}
            order={order}
            query={query}
            showDeparted={showDeparted}
        />
        </div >
    );
}
