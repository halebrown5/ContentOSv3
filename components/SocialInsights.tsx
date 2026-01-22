import React from 'react';
import { IconBarChart, IconSparkles } from './Icons';

// Simple SVG Chart Components to avoid external libraries
const SparkLine = ({ data, color = '#00FF66' }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const height = 50;
    const width = 100;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="50" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <polyline fill="none" stroke={color} strokeWidth="3" points={points} strokeLinejoin="round" strokeLinecap="square" />
        </svg>
    );
};

const BarChart = ({ data }: { data: { label: string, value: number }[] }) => {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="flex items-end justify-between h-40 gap-4">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div 
                        className="w-full bg-[#333333] hover:bg-[#00FF66] transition-all relative border border-black"
                        style={{ height: `${(d.value / max) * 100}%` }}
                    >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#00FF66] text-xs font-bold font-mono px-2 py-1 border border-[#00FF66] opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.value}
                        </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 mt-2 uppercase">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

export const SocialInsights = () => {
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
        <div className="p-8 space-y-8 animate-fade-in h-full overflow-y-auto">
            <header className="mb-8 border-b-2 border-[#333333] pb-6">
                <h2 className="text-4xl font-condensed font-black text-white tracking-tighter flex items-center gap-4 uppercase">
                    Social Insights
                    <span className="px-3 py-1 bg-[#BD00FF] text-white text-sm font-bold border-2 border-white pump-shadow-white-sm">LIVE</span>
                </h2>
                <p className="text-gray-400 mt-2 font-medium">Real-time content performance overview.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-[#000000] border-2 border-[#333333] p-8 hover:border-[#00FF66] transition-colors pump-shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">{m.label}</div>
                                <div className="text-4xl font-condensed font-black text-white mt-1">{m.value}</div>
                            </div>
                            <span className="text-black bg-[#00FF66] text-xs font-mono font-bold px-2 py-1 border border-white">{m.trend}</span>
                        </div>
                        <SparkLine data={m.history} />
                    </div>
                ))}
            </div>

            {/* Main Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#121212] border-2 border-[#333333] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-condensed font-black text-white uppercase flex items-center gap-2">
                            <IconBarChart className="w-6 h-6 text-[#00FF66]" />
                            Weekly Output
                        </h3>
                    </div>
                    <BarChart data={growthData} />
                </div>

                <div className="relative p-8 bg-[#000000] border-2 border-[#333333] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <IconSparkles className="w-48 h-48 text-[#00FF66]" />
                    </div>
                    <h3 className="text-2xl font-condensed font-black text-white uppercase mb-6 relative z-10">AI Insight</h3>
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="bg-[#00FF66] w-2 h-full min-h-[100px]"></div>
                        <div className="text-lg text-gray-300 font-medium leading-relaxed">
                            <p className="mb-4">Based on current trends, your LinkedIn carousels are outperforming text posts by <span className="text-[#00FF66] font-bold border-b-2 border-[#00FF66]">45%</span>.</p>
                            <p><strong>Recommendation:</strong> Shift 2 blog posts this week into visual carousels using the <em>Carousel Maker</em> agent.</p>
                        </div>
                    </div>
                    <button className="mt-8 w-full py-3 bg-[#121212] hover:bg-[#00FF66] hover:text-black border-2 border-[#333333] hover:border-black text-sm font-bold uppercase tracking-widest text-[#00FF66] transition-colors relative z-10">
                        Ask Data Assistant
                    </button>
                </div>
            </div>
        </div>
    );
};