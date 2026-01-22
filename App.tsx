import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_AGENTS, COLORS } from './constants';
import { Agent, Session, ChatMessage, UploadedFile, BrandContext, HistoryItem, DataLayerAnalysis } from './types';
import { generateAgentResponse, mapInputToFields, commitToMemory, refineMemory } from './services/geminiService';
import { SmartRenderer } from './components/SmartRenderer';
import { Dashboard } from './components/Dashboard';
import { SocialInsights } from './components/SocialInsights';
import { DataLayer } from './components/DataLayer';
import { HistoryLog } from './components/HistoryLog';
import { CreateAgentModal } from './components/CreateAgentModal';
import { SettingsModal } from './components/SettingsModal';
import { IconCpu, IconDatabase, IconFileText, IconSettings, IconSend, IconSparkles, IconHistory, IconBarChart, IconPlus, IconPaperclip, IconMagic, IconLayout, IconHome, IconSave } from './components/Icons';

type ViewMode = 'dashboard' | 'generator' | 'data' | 'insights' | 'history';

function App() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(INITIAL_AGENTS[0].id);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Settings State
  const [showAgentSettings, setShowAgentSettings] = useState(false); // Local (Right Panel)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false); // Global (Modal)
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Global File State
  const [globalFiles, setGlobalFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Brand Context State
  const [brandContext, setBrandContext] = useState<BrandContext>({
      name: '',
      industry: '',
      targetAudience: '',
      toneVoice: ''
  });

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Load state from local storage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('pump_agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
    
    const savedBrand = localStorage.getItem('pump_brand_context');
    if (savedBrand) {
        setBrandContext(JSON.parse(savedBrand));
    }

    const savedHistory = localStorage.getItem('pump_history');
    if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch(e) {}
    }
  }, []);

  // Save agents to local storage when changed
  useEffect(() => {
    localStorage.setItem('pump_agents', JSON.stringify(agents));
  }, [agents]);

  // Save History
  useEffect(() => {
    localStorage.setItem('pump_history', JSON.stringify(history));
  }, [history]);

  const handleSaveBrand = (ctx: BrandContext) => {
      setBrandContext(ctx);
      localStorage.setItem('pump_brand_context', JSON.stringify(ctx));
  };

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  // --- HISTORY MANAGEMENT ---
  const handleSaveSession = () => {
    if (!session || !session.messages.length) return;
    
    const lastMsg = session.messages[session.messages.length - 1];
    const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        inputs: inputs,
        output: lastMsg.content,
        type: 'chat'
    };

    setHistory(prev => {
        const updated = [newItem, ...prev];
        return updated.slice(0, 15); // Max 15 items
    });
    alert("Session Saved to History Log");
  };

  const handleRestoreSession = (item: HistoryItem) => {
      setSelectedAgentId(item.agentId);
      setInputs(item.inputs);
      const restoredMsg: ChatMessage = {
          role: 'model',
          content: item.output,
          timestamp: item.timestamp,
          type: item.type === 'chat' && item.output.startsWith('{') ? 'json_render' : 'text'
      };
      
      const agent = agents.find(a => a.id === item.agentId);
      if (agent) {
         if (agent.outputType === 'json') restoredMsg.type = 'json_render';
         if (agent.outputType === 'image') restoredMsg.type = 'image';
      }

      setSession({
          id: Date.now().toString(),
          agentId: item.agentId,
          messages: [restoredMsg],
          lastUpdated: Date.now()
      });
      setCurrentView('generator');
  };

  const handleSaveDataSnapshot = (analysis: DataLayerAnalysis) => {
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          agentId: 'data-layer',
          agentName: 'Data Layer Snapshot',
          inputs: { 'Source': 'Data Layer Analysis' },
          output: JSON.stringify(analysis, null, 2),
          type: 'data_snapshot'
      };
       setHistory(prev => {
        const updated = [newItem, ...prev];
        return updated.slice(0, 15); // Max 15 items
    });
    alert("Snapshot Saved to History Log");
  };

  const handleDeleteHistory = (id: string) => {
      setHistory(prev => prev.filter(i => i.id !== id));
  };

  // --- File Handling ---
  const handleGlobalFileUpload = (files: UploadedFile[]) => {
      setGlobalFiles(prev => [...prev, ...files]);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                          handleGlobalFileUpload(newFiles);
                      }
                  }
              };
              reader.readAsText(file);
          });
      }
  };

  const removeFile = (idxToRemove: number) => {
      setGlobalFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };
  // ---------------------

  const handleAutoMap = async () => {
    const rawText = inputs['paste_dump'] || ''; 
    const firstKey = activeAgent.inputs.find(i => i.type === 'textarea')?.id;
    if (!firstKey || !inputs[firstKey]) return;

    setLoading(true);
    const mapped = await mapInputToFields(inputs[firstKey], activeAgent.inputs.map(i => ({id: i.id, label: i.label})));
    setInputs(prev => ({...prev, ...mapped}));
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const response = await generateAgentResponse(activeAgent, inputs, globalFiles, brandContext);
    
    let msgType: ChatMessage['type'] = 'text';
    if (activeAgent.outputType === 'json') msgType = 'json_render';
    if (activeAgent.outputType === 'image') msgType = 'image';
    if (activeAgent.outputType === 'audio') msgType = 'text'; 

    const newMsg: ChatMessage = {
      role: 'model',
      content: response,
      timestamp: Date.now(),
      type: msgType
    };

    setSession({
      id: Date.now().toString(),
      agentId: activeAgent.id,
      messages: [newMsg],
      lastUpdated: Date.now()
    });
    setLoading(false);
  };

  const handleRefine = async () => {
    if (!session || !refinementInput) return;
    setLoading(true);
    
    const newInputs = { 
        ...inputs, 
        refinement_instruction: refinementInput, 
        previous_output: session.messages[session.messages.length - 1].content 
    };
    
    const response = await generateAgentResponse(activeAgent, newInputs, globalFiles, brandContext);
    
    setSession(prev => ({
      ...prev!,
      messages: [
          ...prev!.messages, 
          { role: 'user', content: refinementInput, timestamp: Date.now() }, 
          { role: 'model', content: response, timestamp: Date.now() }
      ]
    }));
    setRefinementInput('');
    setLoading(false);
  };

  // --- MEMORY / LEARNING ---
  const handleCommitMemory = async () => {
    if (!session || session.messages.length < 2) return;
    setLoading(true);
    const lastMsg = session.messages[session.messages.length - 1].content;
    const userFeedback = session.messages[session.messages.length - 2].content; 
    
    const newRule = await commitToMemory(activeAgent.memoryLog, lastMsg, userFeedback);
    
    const updatedAgents = agents.map(a => {
        if (a.id === activeAgent.id) {
            return { ...a, memoryLog: [...a.memoryLog, newRule] };
        }
        return a;
    });
    setAgents(updatedAgents);
    setLoading(false);
    alert(`Memory Updated: "${newRule}"`);
  };

  const handleManualAddMemory = async (ruleRaw: string) => {
    setLoading(true);
    const refined = await refineMemory(ruleRaw);
    const updatedAgents = agents.map(a => {
        if (a.id === activeAgent.id) {
            return { ...a, memoryLog: [...a.memoryLog, refined] };
        }
        return a;
    });
    setAgents(updatedAgents);
    setLoading(false);
  };

  const handleDeleteMemory = (index: number) => {
    const updatedAgents = agents.map(a => {
        if (a.id === activeAgent.id) {
            const newLog = [...a.memoryLog];
            newLog.splice(index, 1);
            return { ...a, memoryLog: newLog };
        }
        return a;
    });
    setAgents(updatedAgents);
  };

  const handleUpdateSystemPrompt = (val: string) => {
    const updatedAgents = agents.map(a => {
        if (a.id === activeAgent.id) {
            return { ...a, systemPrompt: val };
        }
        return a;
    });
    setAgents(updatedAgents);
  };

  const handleCreateAgent = (newAgent: Agent) => {
    const updatedAgents = [...agents, newAgent];
    setAgents(updatedAgents);
    setSelectedAgentId(newAgent.id);
    setCurrentView('generator');
    setShowCreateModal(false);
  };

  const handleResetAgents = () => {
      if (confirm('Are you sure you want to reset all agents to default? This cannot be undone.')) {
          setAgents(INITIAL_AGENTS);
          localStorage.removeItem('pump_agents');
          setShowGlobalSettings(false);
      }
  };

  const handleImportAgents = (importedAgents: Agent[]) => {
      setAgents(importedAgents);
      alert('System configuration restored successfully.');
  };

  return (
    <div className="flex h-screen w-full bg-[#000000] text-white overflow-hidden font-sans selection:bg-[#00FF66] selection:text-black">
      
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        className="hidden" 
        onChange={onFileInputChange} 
      />

      <CreateAgentModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreateAgent}
      />

      <SettingsModal 
        isOpen={showGlobalSettings} 
        onClose={() => setShowGlobalSettings(false)} 
        agents={agents}
        onReset={handleResetAgents}
        onImport={handleImportAgents}
        brandContext={brandContext}
        onSaveBrand={handleSaveBrand}
      />

      {/* SIDEBAR - PUMP AESTHETIC */}
      <aside className={`border-r-2 border-[#333333] bg-[#000000] flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-24'} z-20`}>
        <div className="h-24 flex items-center px-6 border-b-2 border-[#333333]">
          <div className="w-12 h-12 bg-[#00FF66] flex items-center justify-center mr-3 shrink-0 cursor-pointer border-2 border-white hover:pump-shadow-white-sm transition-all" onClick={() => setSidebarOpen(!sidebarOpen)}>
             <span className="font-condensed font-black text-black text-3xl italic">P</span>
          </div>
          {sidebarOpen && (
              <div className="flex flex-col">
                  <span className="font-condensed font-black tracking-tighter text-2xl uppercase leading-none">PUMP</span>
                  <span className="text-[10px] font-mono text-[#00FF66] tracking-widest">CONTENT OS</span>
              </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-8 space-y-3 px-4">
             {['dashboard', 'insights', 'data', 'generator', 'history'].map((view) => (
                 <button 
                    key={view}
                    onClick={() => setCurrentView(view as ViewMode)} 
                    className={`w-full flex items-center px-4 py-3 border-2 transition-all ${currentView === view ? 'bg-[#00FF66] text-black border-white pump-shadow-white-sm' : 'border-transparent text-gray-400 hover:text-white hover:border-[#333333]'}`}
                >
                    {view === 'dashboard' && <IconHome className="w-5 h-5 mr-3 shrink-0" />}
                    {view === 'insights' && <IconBarChart className="w-5 h-5 mr-3 shrink-0" />}
                    {view === 'data' && <IconDatabase className="w-5 h-5 mr-3 shrink-0" />}
                    {view === 'generator' && <IconCpu className="w-5 h-5 mr-3 shrink-0" />}
                    {view === 'history' && <IconHistory className="w-5 h-5 mr-3 shrink-0" />}
                    {sidebarOpen && <span className="font-condensed font-bold uppercase text-lg tracking-tight">{view === 'generator' ? 'Agent Engine' : view}</span>}
                </button>
             ))}

            {sidebarOpen && (
              <div className="mt-12 px-2 flex items-center justify-between mb-4 border-b border-[#333333] pb-2">
                <span className="text-xs font-mono font-bold text-[#00FF66] uppercase tracking-widest">Active Agents</span>
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="text-white hover:text-[#00FF66] transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="space-y-2">
                {agents.map(agent => (
                    <button 
                        key={agent.id}
                        onClick={() => { setSelectedAgentId(agent.id); setCurrentView('generator'); }}
                        className={`w-full text-left px-4 py-3 text-sm border-2 transition-all flex items-center ${activeAgent.id === agent.id && currentView === 'generator' ? 'bg-[#121212] border-[#00FF66] text-[#00FF66]' : 'border-transparent text-gray-500 hover:text-white hover:bg-[#121212]'}`}
                    >
                        <span className={`w-3 h-3 mr-3 shrink-0 ${activeAgent.id === agent.id ? 'bg-[#00FF66]' : 'bg-[#333333]'}`}></span>
                        {sidebarOpen && <span className="truncate font-bold uppercase tracking-tight">{agent.name}</span>}
                    </button>
                ))}
            </div>
        </nav>
        
        <div className="p-6 border-t-2 border-[#333333]">
             <button 
                onClick={() => setShowGlobalSettings(true)}
                className="flex items-center text-gray-500 hover:text-white transition-colors"
            >
                <IconSettings className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="font-condensed font-bold uppercase text-lg tracking-tight">Settings</span>}
             </button>
        </div>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#000000]">
        
        {/* VIEW: HOME (Agent Grid) */}
        {currentView === 'dashboard' && (
            <Dashboard 
                agents={agents}
                onSelectAgent={(id) => { setSelectedAgentId(id); setCurrentView('generator'); }}
                onViewInsights={() => setCurrentView('insights')}
                onCreateAgent={() => setShowCreateModal(true)}
            />
        )}

        {/* VIEW: ANALYTICS (Social Insights) */}
        {currentView === 'insights' && <SocialInsights />}

        {/* VIEW: DATA */}
        {currentView === 'data' && (
            <DataLayer 
                files={globalFiles} 
                onFileUpload={handleGlobalFileUpload} 
                onSaveSnapshot={handleSaveDataSnapshot}
            />
        )}

        {/* VIEW: HISTORY */}
        {currentView === 'history' && (
            <HistoryLog 
                history={history}
                agents={agents}
                onRestore={handleRestoreSession}
                onDelete={handleDeleteHistory}
            />
        )}

        {/* VIEW: GENERATOR (Core) */}
        {currentView === 'generator' && (
            <div className="flex flex-1 h-full overflow-hidden p-6 gap-8">
                
                {/* Left Panel: Configuration Card */}
                <div className="w-[450px] flex flex-col bg-[#000000] border-2 border-[#333333] z-10 pump-shadow-sm">
                    <div className="p-6 border-b-2 border-[#333333] bg-[#121212]">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-condensed font-black text-white uppercase tracking-tighter leading-none mb-2">
                                    {activeAgent.name}
                                </h1>
                                <p className="text-xs font-mono text-gray-400">{activeAgent.description}</p>
                            </div>
                            <button onClick={() => setShowAgentSettings(!showAgentSettings)} className="text-gray-500 hover:text-[#00FF66] transition-colors p-2">
                                <IconLayout className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#000000]">
                         {showAgentSettings && (
                            <div className="p-4 bg-[#121212] border-2 border-[#00FF66] mb-4 space-y-4">
                                <div>
                                    <label className="text-xs font-black text-[#00FF66] uppercase tracking-widest mb-2 block">System Prompt</label>
                                    <textarea 
                                        className="w-full text-xs text-gray-300 font-mono bg-black p-3 border border-[#333333] h-24 overflow-y-auto resize-none focus:outline-none focus:border-[#00FF66] transition-colors"
                                        value={activeAgent.systemPrompt}
                                        onChange={(e) => handleUpdateSystemPrompt(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                     <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-black text-[#00FF66] uppercase tracking-widest">Memory</label>
                                        <button 
                                            onClick={() => {
                                                const rule = prompt("Enter a new rule manually:");
                                                if (rule) handleManualAddMemory(rule);
                                            }}
                                            className="text-[10px] bg-[#333333] hover:bg-white hover:text-black px-2 py-1 text-white font-bold uppercase"
                                        >
                                            + Rule
                                        </button>
                                     </div>
                                     
                                     {activeAgent.memoryLog.length === 0 ? (
                                         <div className="text-xs text-gray-600 italic py-2 border border-dashed border-[#333333] text-center">No rules learned yet.</div>
                                     ) : (
                                         <div className="space-y-2 max-h-40 overflow-y-auto">
                                             {activeAgent.memoryLog.map((rule, idx) => (
                                                 <div key={idx} className="flex gap-2 items-start text-xs bg-[#121212] p-2 border border-[#333333] group hover:border-white">
                                                     <span className="text-gray-300 flex-1 font-mono">{rule}</span>
                                                     <button 
                                                        onClick={() => handleDeleteMemory(idx)}
                                                        className="text-gray-600 hover:text-red-500 font-bold"
                                                     >
                                                         ×
                                                     </button>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-b border-[#333333] pb-2">
                             <h3 className="text-sm font-black text-white uppercase tracking-widest">Parameters</h3>
                             <button onClick={handleAutoMap} className="text-xs flex items-center gap-1 text-[#00FF66] font-bold uppercase hover:underline">
                                <IconSparkles className="w-3 h-3" /> Auto-Fill
                            </button>
                        </div>
                        
                        {activeAgent.inputs.map(input => (
                            <div key={input.id} className="group">
                                <label className="text-xs font-bold text-gray-500 mb-2 block group-focus-within:text-white uppercase tracking-wider transition-colors">{input.label}</label>
                                {input.type === 'textarea' ? (
                                    <div className="relative">
                                        <textarea 
                                            className="w-full bg-[#121212] border-2 border-[#333333] p-4 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00FF66] focus:bg-black transition-all h-40 resize-none font-mono"
                                            placeholder={input.placeholder}
                                            value={inputs[input.id] || ''}
                                            onChange={(e) => handleInputChange(input.id, e.target.value)}
                                        />
                                    </div>
                                ) : input.type === 'select' ? (
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] transition-all appearance-none font-bold uppercase"
                                            value={inputs[input.id] || ''}
                                            onChange={(e) => handleInputChange(input.id, e.target.value)}
                                        >
                                            <option value="">Select option...</option>
                                            {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">▼</div>
                                    </div>
                                ) : (
                                    <input 
                                        type={input.type} 
                                        className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#00FF66] focus:bg-black transition-all font-mono"
                                        placeholder={input.placeholder}
                                        value={inputs[input.id] || ''}
                                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t-2 border-[#333333] bg-[#000000]">
                        <button 
                            onClick={handleGenerate} 
                            disabled={loading}
                            className="w-full bg-[#00FF66] hover:bg-white text-black font-condensed font-black text-xl uppercase py-4 px-4 transition-all transform active:translate-y-1 flex items-center justify-center gap-2 pump-shadow-white disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none border-2 border-black"
                        >
                            {loading ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <IconCpu className="w-5 h-5" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Output & Interaction */}
                <div className="flex-1 flex flex-col relative z-0">
                    <div className="flex-1 overflow-y-auto pb-32 space-y-8 pr-4">
                         {/* Header with Save Button for the Chat Interface */}
                        {session && (
                            <div className="flex justify-end mb-4">
                                <button 
                                    onClick={handleSaveSession}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-white hover:text-black border border-[#333333] text-xs font-bold uppercase tracking-widest text-gray-300 transition-colors"
                                >
                                    <IconSave className="w-4 h-4" />
                                    Save Session
                                </button>
                            </div>
                        )}

                        {!session ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-6">
                                <div className="w-32 h-32 bg-[#121212] border-2 border-[#333333] flex items-center justify-center pump-shadow-sm rotate-3">
                                    <IconCpu className="w-16 h-16 text-[#00FF66]" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-condensed font-black text-3xl uppercase mb-2">Agent Ready</h3>
                                    <p className="text-sm font-mono text-gray-500">Configure inputs to begin.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {session.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                        <div className={`max-w-4xl p-6 border-2 ${msg.role === 'user' ? 'bg-[#00FF66] text-black border-black pump-shadow-white-sm' : 'bg-[#000000] text-white border-[#333333] pump-shadow-sm'}`}>
                                            {msg.role === 'model' && (
                                                <div className="flex items-center gap-3 mb-4 border-b-2 border-[#333333] pb-3">
                                                    <div className="w-6 h-6 bg-[#00FF66] flex items-center justify-center border border-black">
                                                        <IconCpu className="w-4 h-4 text-black" />
                                                    </div>
                                                    <span className="text-sm font-black text-[#00FF66] uppercase tracking-widest">Generated Output</span>
                                                </div>
                                            )}
                                            
                                            <SmartRenderer content={msg.content} />
                                            
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Chat Input & Context Bar */}
                    <div className="absolute bottom-0 left-0 right-4">
                         <div className="bg-[#000000] border-2 border-[#333333] p-4 flex flex-col gap-3 pump-shadow">
                            
                            {/* DYNAMIC Context Pills */}
                            {globalFiles.length > 0 && (
                                <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar pb-2">
                                    {globalFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-[#121212] px-3 py-1 border border-[#333333] text-xs text-white font-mono whitespace-nowrap group hover:border-[#00FF66]">
                                            <IconFileText className="w-3 h-3 text-[#00FF66]" />
                                            <span>{file.name}</span>
                                            <button 
                                                onClick={() => removeFile(idx)}
                                                className="hover:text-red-500 ml-2 font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-[#121212] border border-[#333333] p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF66] font-mono"
                                    placeholder={session ? "Refine this result... (e.g. 'Make it punchier')" : "Generate output first..."}
                                    value={refinementInput}
                                    onChange={(e) => setRefinementInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                    disabled={!session || loading}
                                />
                                
                                <div className="flex items-center gap-2 pl-3">
                                    <button 
                                        className="p-3 bg-[#121212] border border-[#333333] hover:bg-[#00FF66] hover:text-black hover:border-black transition-colors" 
                                        title="Upload Reference"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IconPaperclip className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-3 bg-[#121212] border border-[#333333] hover:bg-[#BD00FF] hover:text-white hover:border-white transition-colors" 
                                        title="Commit to Memory"
                                        onClick={handleCommitMemory}
                                    >
                                        <IconMagic className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;