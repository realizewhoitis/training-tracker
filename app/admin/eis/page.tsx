import prisma from '@/lib/prisma';
import { scanForFlags, resolveFlag, dismissFlag } from './actions';
import { AlertTriangle, CheckCircle, ShieldAlert, BadgeCheck, XCircle, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function EISAdminPage({ searchParams }: { searchParams: { q?: string } }) {
    const query = searchParams.q || '';

    const flags = await prisma.eISFlag.findMany({
        where: {
            status: 'OPEN',
            employee: {
                empName: { contains: query }
            }
        },
        include: {
            employee: true
        },
        orderBy: {
            severity: 'asc' // High severity (lexicographically H comes before M... wait. HIGH, MEDIUM, LOW. H < M < L? No. L < M < H. 
            // Actually 'HIGH' < 'LOW'? H vs L. H is before L. 'MEDIUM' M is after H.
            // So 'HIGH', 'MEDIUM', 'LOW' alphabetical is: HIGH, LOW, MEDIUM. Not ideal.
            // Let's sort in JS.
        }
    });

    // Manual sorting to ensure HIGH > MEDIUM > LOW
    const severityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const sortedFlags = flags.sort((a, b) => {
        // @ts-ignore
        return severityOrder[b.severity] - severityOrder[a.severity];
    });

    async function runScan() {
        'use server';
        await scanForFlags();
        revalidatePath('/admin/eis');
    }

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Early Intervention System</h1>
                    <p className="text-gray-500 mt-1">Monitor and resolve risk indicators across the agency.</p>
                </div>
                <form action={runScan}>
                    <button
                        type="submit"
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <RefreshCw size={18} />
                        <span>Run Manual Scan</span>
                    </button>
                </form>
            </div>

            {/* Stats Cards could go here */}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flag List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="font-semibold text-gray-700 flex items-center">
                                <ShieldAlert className="mr-2 text-gray-400" size={20} />
                                Active Risk Flags ({sortedFlags.length})
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {sortedFlags.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
                                    <p>No active flags found. Great job!</p>
                                </div>
                            ) : (
                                sortedFlags.map(flag => (
                                    <div key={flag.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${flag.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                        flag.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {flag.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                                        {flag.type}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        • {new Date(flag.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h4 className="font-medium text-gray-900">
                                                    <Link href={`/employees/${flag.employeeId}`} className="hover:underline text-indigo-600">
                                                        {flag.employee.empName}
                                                    </Link>
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                <form action={async () => {
                                                    'use server';
                                                    await resolveFlag(flag.id, "Manually resolved via dashboard");
                                                }}>
                                                    <button
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg tooltip"
                                                        title="Resolve"
                                                    >
                                                        <BadgeCheck size={20} />
                                                    </button>
                                                </form>
                                                <form action={async () => {
                                                    'use server';
                                                    await dismissFlag(flag.id);
                                                }}>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        title="Dismiss"
                                                    >
                                                        <XCircle size={20} />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Info */}
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span><strong>Performance:</strong> Triggered when 7-day average DOR score drops below 2.5 (Medium) or 2.0 (High).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span><strong>Assets:</strong> Triggered when assigned assets are marked as POOR or DAMAGED.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold">•</span>
                                <span>Flags remain OPEN until manually resolved or dismissed by an admin.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
