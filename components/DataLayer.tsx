import React, { useState, useEffect } from 'react';
import { IconUpload, IconFileText, IconCpu, IconSparkles, IconBarChart, IconSave } from './Icons';
import { analyzeDataFiles } from '../services/geminiService';
import { UploadedFile, DataLayerAnalysis } from '../types';

interface DataLayerProps {
    files: UploadedFile[];
    onFileUpload: (files: UploadedFile[]) => void;
    onSaveSnapshot: (analysis: DataLayerAnalysis) => void;
}

export const DataLayer: React.FC<DataLayerProps> = ({ files, onFileUpload, onSaveSnapshot }) => {
    const [analysis, setAnalysis] = useState<DataLayerAnalysis | null>(null);
    const [loading, setLoading] = useState(false);

    // Load cached analysis on mount
    useEffect(() => {
        const cached = localStorage.getItem('pump_datalayer_cache');
        if (cached) {
            try {
                setAnalysis(JSON.parse(cached));
            } catch (e) {
                console.error("Failed to parse cached data layer");
            }
        }
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles: UploadedFile[] = [];
            const fileList = Array.from(e.target.files);
            let processedCount = 0;

            fileList.forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        newFiles.push({ 
                            name: file.name, 
                            content: event.target!.result as string,
                            type: file.type || 'text/plain'
                        });
                        processedCount++;
                        if (processedCount === fileList.length) {
                            onFileUpload(newFiles);
                        }
                    }
                };
                reader.readAsText(file);
            });
        }
    };

    const runAnalysis = async () => {
        if (files.length === 0) return;
        setLoading(true);
        const result = await analyzeDataFiles(files);
        if (result) {
            setAnalysis(result);
            localStorage.setItem('pump_datalayer_cache', JSON.stringify(result));
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col overflow-hidden">
            <header className="mb-8 flex justify-between items-end border-b-2 border-[#333333] pb-6">
                <div>
                    <h2 className="text-4xl font-condensed font-black text-white tracking-tighter flex items-center gap-3 uppercase">
                        Data Layer
                        {analysis && <span className="px-2 py-1 bg-[#00FF66] text-black text-xs font-mono font-bold tracking-wider border border-white">ACTIVE</span>}
                    </h2>
                    <p className="text-gray-400 mt-2 font-medium">Cross-reference analytics to generate strategic directives.</p>
                </div>
                {analysis && (
                    <button 
                        onClick={() => onSaveSnapshot(analysis)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#121212] hover:bg-[#00FF66] hover:text-black border-2 border-[#333333] hover:border-black text-sm font-bold uppercase transition-all"
                    >
                        <IconSave className="w-4 h-4" />
                        Save Snapshot
                    </button>
                )}
            </header>

            <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden min-h-0">
                {/* LEFT COL: Upload & Control */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2">
                    <div className="border-2 border-dashed border-[#333333] hover:border-[#00FF66] bg-[#121212] p-8 text-center transition-colors cursor-pointer relative group">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} />
                        <div className="w-16 h-16 bg-black rounded-none flex items-center justify-center mx-auto mb-4 border-2 border-[#333333] group-hover:border-[#00FF66] transition-colors">
                            <IconUpload className="w-6 h-6 text-gray-400 group-hover:text-[#00FF66]" />
                        </div>
                        <p className="text-white font-condensed font-bold uppercase text-lg">Ingest Data</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">CSV, JSON, TXT logs</p>
                    </div>

                    <div className="flex-1 min-h-[150px] bg-[#000000] border-2 border-[#333333] p-4 overflow-y-auto">
                        <h3 className="text-xs font-black text-[#00FF66] uppercase tracking-widest mb-4">Data Streams</h3>
                        {files.length === 0 && <p className="text-xs text-gray-600 italic font-mono">No streams active.</p>}
                        <div className="space-y-3">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 bg-[#121212] p-3 border border-[#333333] group hover:border-white transition-colors">
                                    <IconFileText className="w-4 h-4 text-[#00FF66]" />
                                    <span className="truncate text-xs font-mono text-gray-300 flex-1">{f.name}</span>
                                    <div className="w-1.5 h-1.5 bg-[#00FF66] animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={runAnalysis}
                        disabled={loading || files.length === 0}
                        className="w-full py-4 bg-[#00FF66] hover:bg-white text-black font-condensed font-black text-xl uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 pump-shadow-white border-2 border-black"
                    >
                        {loading ? (
                            <span className="animate-pulse">Analyzing...</span>
                        ) : (
                            <>
                                <IconCpu className="w-5 h-5" />
                                Run Processor
                            </>
                        )}
                    </button>
                </div>

                {/* RIGHT COL: Visualization */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 overflow-hidden">
                    {analysis ? (
                        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
                            
                            {/* TOP ROW: Insights & Formats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Insights */}
                                <div className="bg-[#121212] p-6 border-2 border-[#333333] border-t-[6px] border-t-[#BD00FF]">
                                    <h3 className="flex items-center gap-2 text-white font-condensed font-black text-2xl uppercase mb-6">
                                        <IconSparkles className="w-5 h-5 text-[#BD00FF]" />
                                        Key Insights
                                    </h3>
                                    <ul className="space-y-4">
                                        {analysis.insights.map((insight, idx) => (
                                            <li key={idx} className="flex items-start gap-4 text-sm text-gray-300 font-medium">
                                                <span className="mt-1 w-2 h-2 bg-[#BD00FF] shrink-0"></span>
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Winning Formats */}
                                <div className="bg-[#121212] p-6 border-2 border-[#333333] border-t-[6px] border-t-[#00FF66]">
                                    <h3 className="flex items-center gap-2 text-white font-condensed font-black text-2xl uppercase mb-6">
                                        <IconBarChart className="w-5 h-5 text-[#00FF66]" />
                                        Winning Formats
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.winning_formats.map((fmt, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-black p-4 border border-[#333333]">
                                                <span className="text-sm font-bold text-white uppercase">{fmt}</span>
                                                <span className="text-xs font-mono font-bold text-black bg-[#00FF66] px-2 py-0.5">RANK #{idx + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* DIRECTIVE */}
                            <div className="bg-[#000000] p-8 border-2 border-[#333333] pump-shadow-sm">
                                <h3 className="text-white font-condensed font-black text-2xl uppercase mb-6 border-b-2 border-[#333333] pb-4">Strategic Directive</h3>
                                {/* @ts-ignore */}
                                <div className="prose prose-invert prose-lg max-w-none text-gray-300 font-medium" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(analysis.strategic_directive) : analysis.strategic_directive }} />
                            </div>

                            {/* TERMINAL / MEMORY */}
                            <div className="bg-black border-2 border-[#333333] p-6 font-mono text-xs overflow-hidden">
                                <div className="flex items-center gap-2 mb-4 opacity-50 border-b border-[#333333] pb-2">
                                    <div className="w-3 h-3 bg-red-500 border border-white/20"></div>
                                    <div className="w-3 h-3 bg-yellow-500 border border-white/20"></div>
                                    <div className="w-3 h-3 bg-green-500 border border-white/20"></div>
                                    <span className="ml-2 uppercase tracking-widest">system_memory.log</span>
                                </div>
                                <div className="text-[#00FF66] opacity-90 leading-relaxed whitespace-pre-wrap text-sm">
                                    {`> INGEST_COMPLETE\n> UPDATING_GLOBAL_CONTEXT...\n\n${analysis.memory_summary}`}
                                    <span className="inline-block w-2 h-4 bg-[#00FF66] ml-1 animate-pulse align-middle"></span>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 bg-[#000000] border-2 border-dashed border-[#333333]">
                            <div className="p-6 bg-[#121212] mb-6 border-2 border-[#333333]">
                                <IconCpu className="w-16 h-16 text-gray-500" />
                            </div>
                            <h3 className="text-3xl font-condensed font-black text-white uppercase mb-2">Awaiting Data Streams</h3>
                            <p className="text-md text-gray-500 max-w-md text-center font-medium">
                                Upload CSV analytics or text logs to generate a strategic directive.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};