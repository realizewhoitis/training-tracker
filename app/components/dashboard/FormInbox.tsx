'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

interface FormInboxProps {
    forms: any[];
    currentUserRole: string;
}

export default function FormInbox({ forms, currentUserRole }: FormInboxProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'REVIEWED': return 'text-green-600 bg-green-50 border-green-200';
            case 'DRAFT': return 'text-slate-500 bg-slate-50 border-slate-200';
            default: return 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return <Clock className="w-4 h-4" />;
            case 'REVIEWED': return <CheckCircle className="w-4 h-4" />;
            case 'DRAFT': return <FileText className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (forms.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-slate-500" />
                    Inbox
                </h2>
                <div className="text-center py-8 text-slate-500">
                    <p>No recent forms found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    {currentUserRole === 'TRAINEE' ? 'My Evaluations' : 'Form Inbox'}
                </h2>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {forms.length} Recent
                </span>
            </div>

            <div className="divide-y divide-slate-100">
                {forms.map((form) => (
                    <div key={form.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg border ${getStatusColor(form.status)}`}>
                                {getStatusIcon(form.status)}
                            </div>

                            <div>
                                <Link href={`/dor/${form.id}`} className="block font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {form.template.title}
                                </Link>
                                <div className="flex items-center text-sm text-slate-500 mt-0.5 space-x-2">
                                    <span>{new Date(form.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>
                                        {currentUserRole === 'TRAINER'
                                            ? `Trainee: ${form.trainee?.empName}`
                                            : `Trainer: ${form.trainer?.name}`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full mr-4 ${form.status === 'REVIEWED' ? 'bg-green-100 text-green-700' :
                                    form.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {form.status}
                            </span>
                            <Link
                                href={`/dor/${form.id}`}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Link href="/dor" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All Forms
                </Link>
            </div>
        </div>
    );
}
