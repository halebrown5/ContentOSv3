import React from 'react';
import { Agent } from '../types';
import { IconArrowRight, IconPlus, IconCpu, IconBarChart, IconFileText, IconSparkles, IconLayout, IconDatabase, IconMagic } from './Icons';

interface DashboardProps {
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  onViewInsights: () => void;
  onCreateAgent: () => void;
}

// Icon mapper helper
const getAgentIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('strat')) return <IconLayout className="w-6 h-6 text-white group-hover:text-black transition-colors" />;
    if (r.includes('creat')) return <IconSparkles className="w-6 h-6 text-white group-hover:text-black transition-colors" />;
    if (r.includes('analy')) return <IconBarChart className="w-6 h-6 text-white group-hover:text-black transition-colors" />;
    if (r.includes('util')) return <IconMagic className="w-6 h-6 text-white group-hover:text-black transition-colors" />;
    return <IconCpu className="w-6 h-6 text-white group-hover:text-black transition-colors" />;
};

export const Dashboard: React.FC<DashboardProps> = ({ agents, onSelectAgent, onViewInsights, onCreateAgent }) => {
  return (
    <div className="p-8 h-full overflow-y-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center justify-center text-center mt-12 mb-20 animate-fade-in">
             <div className="mb-8 flex items-center justify-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#00FF66] flex items-center justify-center border-4 border-white pump-shadow-white rotate-3">
                         <span className="font-condensed font-black text-black text-6xl italic leading-none">P</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-6xl font-condensed font-black text-white uppercase leading-none tracking-tighter">Pump</span>
                        <span className="text-xl font-mono font-bold text-[#00FF66] tracking-widest">CONTENT OS</span>
                    </div>
                </div>
             </div>
             
             <p className="text-gray-400 text-xl font-medium mb-10 max-w-xl">
                The Robin Hood of Cloud. <br/>
                <span className="text-white font-bold">Bold strategies. Zero friction.</span>
             </p>

             <button 
                onClick={onViewInsights}
                className="group relative px-10 py-5 bg-[#000000] border-2 border-[#00FF66] hover:bg-[#00FF66] transition-all pump-shadow"
             >
                <span className="relative z-10 flex items-center gap-4 text-white group-hover:text-black font-condensed font-black text-xl uppercase tracking-wider">
                    <IconBarChart className="w-6 h-6" />
                    View Social Media Insights
                </span>
             </button>
        </div>

        {/* AGENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
            {/* Create New Card */}
            <div 
                onClick={onCreateAgent}
                className="group cursor-pointer bg-[#000000] border-2 border-dashed border-[#333333] hover:border-[#00FF66] p-8 flex flex-col items-center justify-center min-h-[250px] transition-all duration-300"
            >
                <div className="w-16 h-16 bg-[#121212] group-hover:bg-[#00FF66] flex items-center justify-center transition-colors mb-6 border-2 border-[#333333] group-hover:border-black">
                    <IconPlus className="w-8 h-8 text-gray-500 group-hover:text-black" />
                </div>
                <h3 className="text-white font-condensed font-black text-2xl uppercase mb-2">Create Agent</h3>
                <p className="text-sm font-mono text-gray-500">Build your own workflow</p>
            </div>

            {agents.map((agent) => (
                <div 
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className="group relative bg-[#000000] border-2 border-[#333333] hover:border-[#00FF66] p-8 cursor-pointer transition-all duration-200 hover:pump-shadow hover:-translate-y-1"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-[#121212] flex items-center justify-center border-2 border-[#333333] group-hover:bg-[#00FF66] group-hover:border-black transition-colors">
                            {getAgentIcon(agent.role)}
                        </div>
                        <div className="px-3 py-1 bg-[#121212] border border-[#333333] text-xs text-gray-400 font-bold uppercase tracking-widest group-hover:bg-[#00FF66] group-hover:text-black group-hover:border-black transition-colors">
                            {agent.category}
                        </div>
                    </div>
                    
                    <h3 className="text-3xl font-condensed font-black text-white mb-3 uppercase tracking-tight leading-none">{agent.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium">
                        {agent.description}
                    </p>

                    <div className="flex items-center text-sm font-bold text-[#00FF66] uppercase tracking-wider group-hover:text-white transition-colors">
                        Launch Agent 
                        <IconArrowRight className="w-4 h-4 ml-2 opacity-100 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};