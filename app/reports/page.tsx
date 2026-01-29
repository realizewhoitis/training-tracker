
import { FileText, Download } from 'lucide-react';

export default async function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
                    <p className="text-slate-500">Generate and view system reports</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Report Card 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Employee Roster</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Complete list of all active employees and their current status.
                    </p>
                    <a href="/api/reports?type=roster" className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <Download size={16} className="mr-1" /> Download CSV
                    </a>
                </div>

                {/* Report Card 2 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Expiration Report</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        List of all certificates expiring within the next 90 days.
                    </p>
                    <a href="/api/reports?type=expirations" className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <Download size={16} className="mr-1" /> Download CSV
                    </a>
                </div>

                {/* Report Card 3 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Training Summary</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Total training hours logged per employee for the current year.
                    </p>
                    <a href="/api/reports?type=training" className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <Download size={16} className="mr-1" /> Download CSV
                    </a>
                </div>
            </div>


        </div>
    );
}
