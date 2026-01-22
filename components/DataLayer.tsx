import React, { useState } from 'react';
import { IconUpload, IconFileText, IconCpu } from './Icons';
import { analyzeDataFiles } from '../services/geminiService';
import { UploadedFile } from '../types';

interface DataLayerProps {
    files: UploadedFile[];
    onFileUpload: (files: UploadedFile[]) => void;
}

export const DataLayer: React.FC<DataLayerProps> = ({ files, onFileUpload }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Data Layer</h2>
                <p className="text-gray-400">Upload CSV/Text logs for cross-file AI correlation.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow">
                {/* Upload Section */}
                <div className="col-span-1 space-y-4">
                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-[#00FF66] transition-colors cursor-pointer relative group">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                        <IconUpload className="w-10 h-10 text-gray-500 mx-auto mb-2 group-hover:text-[#00FF66]" />
                        <p className="text-sm text-gray-400">Drop CSVs or click to upload</p>
                    </div>

                    <div className="space-y-2">
                        {files.length === 0 && <p className="text-xs text-gray-500 italic">No files uploaded yet.</p>}
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg text-sm text-gray-300">
                                <IconFileText className="w-4 h-4 text-[#00FF66]" />
                                <span className="truncate">{f.name}</span>
                            </div>
                        ))}
                    </div>

                    {files.length > 0 && (
                        <button 
                            onClick={runAnalysis}
                            disabled={loading}
                            className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-lg hover:bg-[#33ff85] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <IconCpu className="w-5 h-5" />
                                    Run Directive
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Analysis Output */}
                <div className="col-span-1 md:col-span-2 bg-[#18181B] border border-white/5 rounded-2xl p-6 overflow-auto">
                    {analysis ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <h3 className="text-[#00FF66] font-mono uppercase mb-4">Strategic Directive</h3>
                            {/* @ts-ignore */}
                            <div dangerouslySetInnerHTML={{ __html: window.marked ? window.marked.parse(analysis) : analysis }} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <IconCpu className="w-16 h-16 opacity-20 mb-4" />
                            <p>Awaiting data streams...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};