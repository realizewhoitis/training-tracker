'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, User, Users, ChevronRight, GraduationCap } from 'lucide-react';

interface DORHistoryProps {
    employeeName: string;
    receivedDORs: any[];
    authoredDORs: any[];
}

export default function DORHistoryWithAggregates({ employeeName, receivedDORs, authoredDORs }: DORHistoryProps) {
    const [activeTab, setActiveTab] = useState<'received' | 'written' | 'relationships'>('received');

    // Aggregate Relationships
    const trainers = receivedDORs.reduce((acc: any, dor: any) => {
        const key = `${dor.trainer.name}-${dor.template.title}`;
        if (!acc[key]) {
            acc[key] = {
                name: dor.trainer.name,
                position: dor.template.title,
                count: 0,
                lastDate: dor.date
            };
        }
        acc[key].count++;
        if (new Date(dor.date) > new Date(acc[key].lastDate)) {
            acc[key].lastDate = dor.date;
        }
        return acc;
    }, {});

    const trainees = authoredDORs.reduce((acc: any, dor: any) => {
        const key = `${dor.trainee.empName}-${dor.template.title}`;
        if (!acc[key]) {
            acc[key] = {
                name: dor.trainee.empName,
                position: dor.template.title,
                count: 0,
                lastDate: dor.date,
                empId: dor.trainee.empId
            };
        }
        acc[key].count++;
        if (new Date(dor.date) > new Date(acc[key].lastDate)) {
            acc[key].lastDate = dor.date;
        }
        return acc;
    }, {});

    const trainerList = Object.values(trainers).sort((a: any, b: any) => b.count - a.count);
    const traineeList = Object.values(trainees).sort((a: any, b: any) => b.count - a.count);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'received'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        DORs Received ({receivedDORs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('written')}
                        className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'written'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <GraduationCap className="w-4 h-4 mr-2" />
                        DORs Written ({authoredDORs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('relationships')}
                        className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center ${activeTab === 'relationships'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Relationships
                    </button>
                </nav>
            </div>

            <div className="p-6">
                {activeTab === 'received' && (
                    <div className="space-y-4">
                        {receivedDORs.length === 0 ? (
                            <p className="text-slate-500 text-center italic py-4">No DORs received.</p>
                        ) : (
                            receivedDORs.map((dor) => (
                                <div key={dor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-white hover:shadow-sm hover:ring-1 ring-slate-200 transition-all">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-md text-blue-600 shadow-sm">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{dor.template.title}</p>
                                            <p className="text-xs text-slate-500">
                                                Trainer: {dor.trainer.name} • {new Date(dor.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/dor/${dor.id}`} className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-full transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'written' && (
                    <div className="space-y-4">
                        {authoredDORs.length === 0 ? (
                            <p className="text-slate-500 text-center italic py-4">No DORs written.</p>
                        ) : (
                            authoredDORs.map((dor) => (
                                <div key={dor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-white hover:shadow-sm hover:ring-1 ring-slate-200 transition-all">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-md text-purple-600 shadow-sm">
                                            <GraduationCap size={16} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{dor.template.title}</p>
                                            <p className="text-xs text-slate-500">
                                                Trainee: {dor.trainee.empName} • {new Date(dor.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/dor/${dor.id}`} className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-full transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'relationships' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                                <User className="w-4 h-4 mr-2 text-blue-500" />
                                Trained By (Trainers)
                            </h4>
                            {trainerList.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No training data available.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {trainerList.map((t: any, idx: number) => (
                                        <li key={idx} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-slate-900">{t.name}</p>
                                                <p className="text-xs text-slate-500">{t.position}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-slate-700">{t.count}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">DORs</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                                <Users className="w-4 h-4 mr-2 text-purple-500" />
                                Has Trained (Trainees)
                            </h4>
                            {traineeList.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No trainees evaluated yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {traineeList.map((t: any, idx: number) => (
                                        <li key={idx} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <Link href={`/employees/${t.empId}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                                                    {t.name}
                                                </Link>
                                                <p className="text-xs text-slate-500">{t.position}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-slate-700">{t.count}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">DORs</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
