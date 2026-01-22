import Link from 'next/link';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import prisma from '@/lib/prisma'; // Server Component

export default async function EISWidget() {
    const flags = await prisma.eISFlag.findMany({
        where: { status: 'OPEN' },
        select: { severity: true }
    });

    const highCount = flags.filter(f => f.severity === 'HIGH').length;
    const mediumCount = flags.filter(f => f.severity === 'MEDIUM').length;

    if (flags.length === 0) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                        <CheckCircle size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Early Intervention</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">No active risk flags detected.</p>
                <Link href="/admin/eis" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    View System &rarr;
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Intervention Required</h3>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                    {flags.length} Active
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-center">
                    <div className="text-2xl font-bold text-red-700">{highCount}</div>
                    <div className="text-xs text-red-600 font-medium">High Risk</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                    <div className="text-2xl font-bold text-amber-700">{mediumCount}</div>
                    <div className="text-xs text-amber-600 font-medium">Medium Risk</div>
                </div>
            </div>

            <Link
                href="/admin/eis"
                className="block w-full text-center py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
                Manage Flags
            </Link>
        </div>
    );
}
