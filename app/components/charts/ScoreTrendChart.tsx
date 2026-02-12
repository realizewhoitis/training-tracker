'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ScoreTrendProps {
    data: {
        date: string;
        average: number;
        id: number;
    }[];
}

export default function ScoreTrendChart({ data }: ScoreTrendProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                Not enough data to show trends
            </div>
        );
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={12}
                        tickMargin={10}
                    />
                    <YAxis
                        domain={[1, 7]}
                        stroke="#64748b"
                        fontSize={12}
                        label={{ value: 'Daily Score (1-7)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="average"
                        name="Daily Average"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
