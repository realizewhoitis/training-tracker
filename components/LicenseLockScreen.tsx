import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function LicenseLockScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="rounded-full bg-red-100 p-6">
                <ShieldAlert className="w-16 h-16 text-red-600" />
            </div>
            <div className="max-w-md space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">License Expired or Invalid</h1>
                <p className="text-slate-600">
                    The license for this Orbit 911 instance is not active. Please contact your system administrator or update the license key.
                </p>
            </div>

            <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-sm text-slate-500 max-w-sm">
                <p>System ID: {process.env.HOSTNAME || 'LOCAL-NODE'}</p>
                <p>Status: SUSPENDED</p>
            </div>

            <div className="pt-4">
                <Link
                    href="/admin/settings"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    Update License Key
                </Link>
            </div>

            <p className="text-xs text-slate-400 mt-8">
                Orbit 911 Commercial Edition
            </p>
        </div>
    );
}
