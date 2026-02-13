'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyScoreData {
    date: string;
    score: number;
}

export default function DailyScoreChart({ data, color = '#2563eb' }: { data: DailyScoreData[], color?: string }) {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                    />
                    <YAxis domain={[1, 7]} tickCount={7} />
                    <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: color }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
