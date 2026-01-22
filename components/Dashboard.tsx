import React from 'react';
import { IconBarChart, IconSparkles } from './Icons';

// Simple SVG Chart Components to avoid external libraries
const SparkLine = ({ data, color = '#00FF66' }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 40;
    const width = 100;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        </svg>
    );
};

const BarChart = ({ data }: { data: { label: string, value: number }[] }) => {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="flex items-end justify-between h-32 gap-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                    <div 
                        className="w-full bg-[#18181B] hover:bg-[#00FF66] transition-all rounded-t relative"
                        style={{ height: `${(d.value / max) * 100}%` }}
                    >
                         <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#00FF66] text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.value}
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

export const Dashboard = () => {
    // Mock Data
    const metrics = [
        { label: 'Total Impressions', value: '1.2M', trend: '+12%', history: [10, 15, 13, 20, 25, 22, 30] },
        { label: 'Engagement Rate', value: '4.8%', trend: '+0.5%', history: [3, 3.5, 4, 3.8, 4.2, 4.5, 4.8] },
        { label: 'AI Operations', value: '843', trend: '+156%', history: [10, 50, 100, 200, 400, 600, 843] },
    ];

    const growthData = [
        { label: 'Mon', value: 450 },
        { label: 'Tue', value: 620 },
        { label: 'Wed', value: 580 },
        { label: 'Thu', value: 810 },
        { label: 'Fri', value: 950 },
        { label: 'Sat', value: 400 },
        { label: 'Sun', value: 380 },
    ];

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
                <p className="text-gray-400">Real-time content performance overview.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl hover:border-[#00FF66]/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-gray-400 text-sm font-medium">{m.label}</div>
                                <div className="text-2xl font-bold text-white mt-1">{m.value}</div>
                            </div>
                            <span className="text-[#00FF66] text-xs bg-[#00FF66]/10 px-2 py-1 rounded font-mono">{m.trend}</span>
                        </div>
                        <SparkLine data={m.history} />
                    </div>
                ))}
            </div>

            {/* Main Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <IconBarChart className="w-5 h-5 text-[#00FF66]" />
                            Weekly Output
                        </h3>
                    </div>
                    <BarChart data={growthData} />
                </div>

                <div className="relative p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-[#18181B] to-[#0A0A0B] border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <IconSparkles className="w-32 h-32 text-[#00FF66]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-4">AI Insight</h3>
                    <div className="flex items-start gap-4">
                        <div className="bg-[#00FF66] w-1 h-full min-h-[80px] rounded-full"></div>
                        <div className="text-sm text-gray-300 leading-relaxed">
                            <p className="mb-2">Based on current trends, your LinkedIn carousels are outperforming text posts by <span className="text-[#00FF66]">45%</span>.</p>
                            <p><strong>Recommendation:</strong> Shift 2 blog posts this week into visual carousels using the <em>Carousel Maker</em> agent.</p>
                        </div>
                    </div>
                    <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-[#00FF66] transition-colors">
                        Ask Data Assistant
                    </button>
                </div>
            </div>
        </div>
    );
};