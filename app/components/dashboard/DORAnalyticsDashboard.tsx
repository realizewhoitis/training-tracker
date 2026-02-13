'use client';

import { useState } from 'react';
import { Layers, Radio, Phone } from 'lucide-react';
import DailyScoreChart from '../charts/DailyScoreChart';
import CategoryRadarChart from '../charts/CategoryRadarChart';
import { Clock, CheckCircle } from 'lucide-react';

interface DailyScoreData {
    date: string;
    score: number;
}

interface RadarData {
    category: string;
    score: number;
    fullMark: number;
}

interface AnalyticsSet {
    daily: DailyScoreData[];
    radar: RadarData[];
}

interface DORAnalyticsDashboardProps {
    all: AnalyticsSet;
    radio: AnalyticsSet;
    callTaking: AnalyticsSet;
}

type TabType = 'all' | 'radio' | 'callTaking';

export default function DORAnalyticsDashboard({ all, radio, callTaking }: DORAnalyticsDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const getActiveData = () => {
        switch (activeTab) {
            case 'radio': return { data: radio, color: '#0891b2', label: 'Radio' }; // Cyan-600
            case 'callTaking': return { data: callTaking, color: '#d97706', label: 'Call Taking' }; // Amber-600
            default: return { data: all, color: '#2563eb', label: 'All Reports' }; // Blue-600 (default)
        }
    };

    const { data, color, label } = getActiveData();

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <div className="bg-slate-100 p-1 rounded-lg inline-flex shadow-inner">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'all'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Layers className="w-4 h-4 mr-2" />
                        All Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('radio')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'radio'
                                ? 'bg-white text-cyan-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Radio className="w-4 h-4 mr-2" />
                        Radio
                    </button>
                    <button
                        onClick={() => setActiveTab('callTaking')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${activeTab === 'callTaking'
                                ? 'bg-white text-amber-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Taking
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-300">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2" style={{ color }} />
                        Daily Performance Trend ({label})
                    </h2>
                    {data.daily.length > 0 ? (
                        <DailyScoreChart data={data.daily} color={color} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                            No data available for this category
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-300">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" style={{ color }} />
                        Performance by Category ({label})
                    </h2>
                    {data.radar.length > 0 ? (
                        <CategoryRadarChart data={data.radar} color={color} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                            No data available for this category
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
