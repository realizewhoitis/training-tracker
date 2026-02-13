'use client';

import { useState } from 'react';
import { AlertTriangle, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ExpirationData {
    expirationID: number;
    Expiration: Date | string | null;
    certificate: {
        certificateName: string | null;
    };
    employee: {
        empId: number;
        empName: string | null;
    };
}

interface ExpirationTabsProps {
    upcoming: ExpirationData[];
    expired: ExpirationData[];
}

export default function ExpirationTabs({ upcoming, expired }: ExpirationTabsProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'expired'>('upcoming');

    // Helper to calculate days remaining or days overdue
    const getDaysDiff = (date: Date | string | null) => {
        if (!date) return 0;
        const now = new Date();
        const expDate = new Date(date);
        const diffTime = expDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const currentList = activeTab === 'upcoming' ? upcoming : expired;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'upcoming'
                                ? 'border-amber-500 text-amber-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <span className="flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Upcoming ({upcoming.length})
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('expired')}
                        className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'expired'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <span className="flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Expired ({expired.length})
                        </span>
                    </button>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
                <div className="space-y-4">
                    {currentList.length === 0 ? (
                        <div className="text-center py-8">
                            <div className={`p-3 rounded-full inline-block mb-3 ${activeTab === 'upcoming' ? 'bg-amber-50 text-amber-200' : 'bg-green-50 text-green-200'}`}>
                                <Calendar size={24} />
                            </div>
                            <p className="text-slate-500">
                                {activeTab === 'upcoming'
                                    ? 'No upcoming expirations in the next 30 days.'
                                    : 'No expired certificates found for active employees.'}
                            </p>
                        </div>
                    ) : (
                        currentList.map((exp) => {
                            const days = getDaysDiff(exp.Expiration);
                            const isOverdue = days < 0;

                            return (
                                <div key={exp.expirationID} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors -mx-2 px-2 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800">{exp.certificate.certificateName}</p>
                                        <Link href={`/employees/${exp.employee.empId}`} className="text-sm text-slate-500 hover:text-blue-600 hover:underline">
                                            {exp.employee.empName}
                                        </Link>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                            {isOverdue ? `${Math.abs(days)} days overdue` : `${days} days left`}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {exp.Expiration ? new Date(exp.Expiration).toLocaleDateString() : 'No Date'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link href="/reports" className="text-xs text-slate-500 hover:text-blue-600 font-medium">
                    View Full Report
                </Link>
            </div>
        </div>
    );
}
