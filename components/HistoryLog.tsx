import React, { useState } from 'react';
import { HistoryItem, Agent } from '../types';
import { IconSearch, IconCpu, IconTrash, IconRefresh, IconSave, IconDatabase } from './Icons';

interface HistoryLogProps {
    history: HistoryItem[];
    agents: Agent[];
    onRestore: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history, agents, onRestore, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAgentId, setFilterAgentId] = useState<string>('all');

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.output.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.agentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAgent = filterAgentId === 'all' || item.agentId === filterAgentId;
        return matchesSearch && matchesAgent;
    });

    const formatTimestamp = (ts: number) => {
        return new Date(ts).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-8 h-full flex flex-col max-w-7xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#333333] pb-6">
                <div>
                    <h2 className="text-4xl font-condensed font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        History Log
                        <span className="px-2 py-1 bg-[#00FF66] text-black text-xs font-bold uppercase tracking-widest border border-white">ARCHIVE</span>
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">Resurrect past sessions or review data snapshots.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00FF66]" />
                        <input 
                            type="text" 
                            placeholder="SEARCH LOGS..." 
                            className="bg-[#121212] border-2 border-[#333333] pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-colors w-64 font-mono uppercase placeholder-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="bg-[#121212] border-2 border-[#333333] px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-colors font-mono uppercase"
                        value={filterAgentId}
                        onChange={(e) => setFilterAgentId(e.target.value)}
                    >
                        <option value="all">ALL AGENTS</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name.toUpperCase()}</option>)}
                        <option value="data-layer">DATA SNAPSHOTS</option>
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-20 text-gray-600 border-2 border-dashed border-[#333333]">
                        <IconSave className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="font-condensed font-bold text-2xl uppercase">NO HISTORY FOUND</p>
                        <p className="text-sm font-mono">Save a session to see it here.</p>
                    </div>
                ) : (
                    filteredHistory.map(item => (
                        <div key={item.id} className="bg-[#000000] border-2 border-[#333333] p-6 hover:border-[#00FF66] transition-colors group relative pump-shadow-sm hover:pump-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex items-center justify-center border-2 border-white ${item.type === 'data_snapshot' ? 'bg-[#BD00FF] text-white' : 'bg-[#00FF66] text-black'}`}>
                                        {item.type === 'data_snapshot' ? <IconDatabase className="w-6 h-6" /> : <IconCpu className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-condensed font-black text-2xl text-white uppercase leading-none">{item.agentName}</h3>
                                        <div className="text-xs text-gray-500 font-mono mt-1">{formatTimestamp(item.timestamp)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {item.type !== 'data_snapshot' && (
                                        <button 
                                            onClick={() => onRestore(item)}
                                            className="px-4 py-2 bg-[#121212] border border-[#333333] hover:bg-[#00FF66] hover:text-black hover:border-black text-gray-300 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                                        >
                                            <IconRefresh className="w-4 h-4" /> Resume
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 border border-[#333333] hover:bg-red-600 hover:text-white hover:border-red-600 text-gray-500 transition-colors"
                                    >
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Preview */}
                            <div className="bg-[#121212] border border-[#333333] p-4 mb-4">
                                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap line-clamp-3">
                                    {item.output}
                                </pre>
                            </div>

                            {/* Inputs Used Tags */}
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(item.inputs).map(([key, val]) => (
                                    <span key={key} className="text-[10px] bg-black border border-[#333333] text-gray-500 px-2 py-1 uppercase font-mono max-w-[250px] truncate">
                                        <span className="text-[#00FF66] font-bold mr-1">{key}:</span> {val}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-6 text-center text-xs text-gray-600 font-mono uppercase tracking-widest">
                Storage Limit: {history.length}/15 Sessions
            </div>
        </div>
    );
};