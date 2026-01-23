
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AuditPage() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/");

    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
        include: { user: true }
    });

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">System Audit Logs</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Resource</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{log.timestamp.toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-blue-600">{log.action}</td>
                                <td className="px-6 py-4">{log.user?.name || `User #${log.userId}`}</td>
                                <td className="px-6 py-4">{log.resource}</td>
                                <td className="px-6 py-4 text-gray-400 font-mono">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
