'use client';

import React, { useState } from 'react';
import { FileText, Download, CalendarClock } from 'lucide-react';

export default function ReportsPage() {
    const [includeDeparted, setIncludeDeparted] = useState(false);

    // activeOnly is true if includeDeparted is false
    const activeQuery = `&activeOnly=${!includeDeparted}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
                    <p className="text-slate-500">Generate and view system reports</p>
                </div>

                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-sm font-medium text-slate-600">Include Departed Employees</span>
                    <button
                        onClick={() => setIncludeDeparted(!includeDeparted)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${includeDeparted ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                        role="switch"
                        aria-checked={includeDeparted}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeDeparted ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
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
                    <a href={`/api/reports?type=roster${activeQuery}`} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
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
                    <a href={`/api/reports?type=expirations${activeQuery}`} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
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
                    <a href={`/api/reports?type=training${activeQuery}`} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <Download size={16} className="mr-1" /> Download CSV
                    </a>
                </div>

                {/* Report Card 4 - Shift Roster */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <CalendarClock size={24} />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Shift Roster</h3>
                    <p className="text-sm text-slate-500 mb-4">
                        List of employees grouped by their assigned shift.
                    </p>
                    <a href={`/api/reports?type=shift_roster${activeQuery}`} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <Download size={16} className="mr-1" /> Download CSV
                    </a>
                </div>
            </div>
        </div>
    );
}
