import { getTenantPrisma } from '@/lib/prisma';
import { ShieldCheck, ArrowLeft, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ComplianceDashboardPage() {
    const prisma = await getTenantPrisma();

    // Fetch all active PUBLISHED policies
    const publishedPolicies = await prisma.policyVersion.findMany({
        where: { status: 'PUBLISHED' },
        include: {
            container: true,
            attestations: { include: { employee: true } }
        },
        orderBy: { publishedAt: 'desc' }
    });

    // Fetch all active employees
    const employees = await prisma.employee.findMany({
        where: { departed: false },
        include: { user: true }
    });

    // For each policy, calculate the compliance metrics
    const complianceData = publishedPolicies.map((policy: any) => {
        let targets = employees;
        if (policy.targetRoles) {
            try {
                const roles = JSON.parse(policy.targetRoles);
                targets = employees.filter((e: any) => e.user && roles.includes(e.user.role));
            } catch { }
        }

        const targetIds = targets.map((t: any) => t.empId);
        const signedIds = policy.attestations.map((a: any) => a.employeeId);

        const signedCount = targetIds.filter((id: any) => signedIds.includes(id)).length;
        const pendingCount = targetIds.length - signedCount;

        const pendingEmployees = targets.filter((t: any) => !signedIds.includes(t.empId));

        const complianceRate = targetIds.length > 0
            ? Math.round((signedCount / targetIds.length) * 100)
            : 100;

        return {
            policy,
            totalTargets: targetIds.length,
            signedCount,
            pendingCount,
            complianceRate,
            pendingEmployees
        };
    });

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex items-center space-x-4 mb-4 border-b border-slate-200 pb-6">
                <Link href="/admin/policies" className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                        <ShieldCheck className="mr-3 text-indigo-600" size={32} />
                        Compliance Audit Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Real-time tracking of signature attestations across all active policies.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 space-y-6">
                {complianceData.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No active published policies exist to track.</p>
                    </div>
                ) : complianceData.map((data: any) => (
                    <div key={data.policy.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                    {data.policy.container.title} - v{data.policy.versionNumber}
                                    <span className={`ml-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${data.policy.enforcementLevel === 3 ? 'bg-red-100 text-red-800' :
                                            data.policy.enforcementLevel === 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                        Level {data.policy.enforcementLevel}
                                    </span>
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Published {data.policy.publishedAt?.toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex items-end space-x-6 text-right">
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Signed</p>
                                    <p className="text-2xl font-bold text-slate-800">
                                        {data.signedCount} <span className="text-lg text-slate-400 font-normal">/ {data.totalTargets}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Compliance</p>
                                    <div className="flex items-center justify-end space-x-2">
                                        <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full ${data.complianceRate === 100 ? 'bg-green-500' : data.complianceRate > 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${data.complianceRate}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-lg font-bold ${data.complianceRate === 100 ? 'text-green-600' : data.complianceRate > 75 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {data.complianceRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.pendingEmployees.length > 0 && (
                            <div className="p-6 bg-white">
                                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                                    Non-Compliant Users ({data.pendingCount})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {data.pendingEmployees.map((emp: any) => (
                                        <div key={emp.empId} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                {emp.empName?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{emp.empName}</p>
                                                <p className="text-xs text-slate-500 truncate">{emp.user?.role || 'No Role'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.pendingEmployees.length === 0 && data.totalTargets > 0 && (
                            <div className="p-6 bg-white flex items-center justify-center text-green-600 font-medium">
                                <ShieldCheck className="w-5 h-5 mr-2" />
                                100% Agency Compliance Reached
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
