import React, { useRef, useState, useEffect } from 'react';
import { Agent, BrandContext } from '../types';
import { IconX, IconSettings, IconDatabase, IconUpload, IconSparkles } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    agents: Agent[];
    onReset: () => void;
    onImport: (agents: Agent[]) => void;
    brandContext: BrandContext;
    onSaveBrand: (ctx: BrandContext) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, agents, onReset, onImport, brandContext, onSaveBrand 
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [localBrand, setLocalBrand] = useState<BrandContext>(brandContext);
    const [activeTab, setActiveTab] = useState<'brand' | 'system'>('brand');

    useEffect(() => {
        setLocalBrand(brandContext);
    }, [brandContext, isOpen]);

    if (!isOpen) return null;

    const handleSaveBrand = () => {
        onSaveBrand(localBrand);
        onClose();
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agents, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pump_os_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (Array.isArray(parsed)) {
                    onImport(parsed);
                    onClose();
                } else {
                    alert("Invalid backup file format.");
                }
            } catch (err) {
                alert("Failed to parse JSON.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#000000] border-2 border-[#00FF66] w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,255,102,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b-2 border-[#333333] bg-[#121212]">
                    <h2 className="text-white font-condensed font-black text-2xl uppercase flex items-center gap-3 tracking-wide">
                        <IconSettings className="text-[#00FF66] w-6 h-6" />
                        Settings
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <IconX className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex border-b-2 border-[#333333]">
                    <button 
                        onClick={() => setActiveTab('brand')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'brand' ? 'bg-[#00FF66] text-black' : 'bg-black text-gray-500 hover:text-white hover:bg-[#121212]'}`}
                    >
                        Brand DNA
                    </button>
                    <button 
                        onClick={() => setActiveTab('system')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'system' ? 'bg-[#00FF66] text-black' : 'bg-black text-gray-500 hover:text-white hover:bg-[#121212]'}`}
                    >
                        System Data
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar bg-[#000000]">
                    
                    {/* TAB: BRAND DNA */}
                    {activeTab === 'brand' && (
                        <div className="space-y-6">
                            <div className="bg-[#121212] p-4 border border-[#333333]">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-black border border-[#333333]">
                                        <IconSparkles className="w-5 h-5 text-[#BD00FF]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Global Brand Context</h3>
                                        <p className="text-xs text-gray-500 mt-1 font-medium">
                                            This context is injected into <span className="text-[#00FF66] font-bold">every agent</span>. 
                                            Define your company's core identity here.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">COMPANY NAME</label>
                                    <input 
                                        className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-colors font-bold"
                                        placeholder="e.g. Pump Industries"
                                        value={localBrand.name}
                                        onChange={e => setLocalBrand({...localBrand, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">INDUSTRY / NICHE</label>
                                    <input 
                                        className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-colors font-bold"
                                        placeholder="e.g. B2B SaaS for Enterprise"
                                        value={localBrand.industry}
                                        onChange={e => setLocalBrand({...localBrand, industry: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">TARGET AUDIENCE</label>
                                    <textarea 
                                        className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-colors h-24 resize-none font-medium"
                                        placeholder="Who are we talking to? Be specific."
                                        value={localBrand.targetAudience}
                                        onChange={e => setLocalBrand({...localBrand, targetAudience: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">TONE OF VOICE</label>
                                    <textarea 
                                        className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-colors h-24 resize-none font-medium"
                                        placeholder="e.g. Professional, Witty, Authoritative, Concise..."
                                        value={localBrand.toneVoice}
                                        onChange={e => setLocalBrand({...localBrand, toneVoice: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveBrand}
                                className="w-full py-4 bg-[#00FF66] text-black font-condensed font-black text-xl uppercase hover:bg-white transition-colors border-2 border-black pump-shadow-white"
                            >
                                Save Brand DNA
                            </button>
                        </div>
                    )}

                    {/* TAB: SYSTEM */}
                    {activeTab === 'system' && (
                        <div className="space-y-8">
                            {/* Data Management */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Backup & Restore</h3>
                                
                                <button onClick={handleExport} className="w-full flex items-center justify-between p-4 bg-[#121212] border-2 border-[#333333] hover:border-[#00FF66] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black border border-[#333333] text-gray-400 group-hover:text-[#00FF66] transition-colors">
                                            <IconDatabase className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm text-white font-bold uppercase">Export System Data</div>
                                            <div className="text-xs text-gray-500 font-mono">Backup your agents & memory logs.</div>
                                        </div>
                                    </div>
                                </button>

                                <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-[#121212] border-2 border-[#333333] hover:border-[#BD00FF] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black border border-[#333333] text-gray-400 group-hover:text-[#BD00FF] transition-colors">
                                            <IconUpload className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm text-white font-bold uppercase">Import Configuration</div>
                                            <div className="text-xs text-gray-500 font-mono">Restore from a JSON backup file.</div>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileRef} className="hidden" accept=".json" onChange={handleImport} />
                                </button>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-6 border-t-2 border-[#333333]">
                                <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
                                <button onClick={onReset} className="w-full py-3 border-2 border-red-900 text-red-500 font-bold uppercase hover:bg-red-900/20 rounded-none text-sm transition-colors">
                                    Factory Reset All Agents
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-[#121212] border-t-2 border-[#333333] text-center shrink-0">
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest">Pump OS v2.4.1 • Powered by Gemini 3 Flash</p>
                </div>
            </div>
        </div>
    );
};