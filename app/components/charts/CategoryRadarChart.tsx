'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryRadarProps {
    data: {
        category: string;
        score: number;
        fullMark: number;
    }[];
}

export default function CategoryRadarChart({ data }: CategoryRadarProps) {
    if (!data || data.length < 3) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 text-slate-400 px-8 text-center">
                Need data from at least 3 categories to generate chart
            </div>
        );
    }

    // Custom tick to wrap text
    const renderCustomTick = (props: any) => {
        const { payload, x, y, cx, cy, ...rest } = props;
        const words = payload.value.split(' ');

        return (
            <text
                {...rest}
                y={y + (y - cy) / 10}
                x={x + (x - cx) / 10}
                fontFamily="sans-serif"
                fontSize={11}
                textAnchor="middle"
            >
                {words.map((word: string, i: number) => (
                    <tspan key={i} x={x + (x - cx) / 10} dy={i === 0 ? 0 : 12}>
                        {word}
                    </tspan>
                ))}
            </text>
        );
    };

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="category"
                        tick={renderCustomTick}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 7]} tick={false} axisLine={false} />
                    <Radar
                        name="Average Score"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
