import React, { useState, useEffect } from 'react';
import { INITIAL_AGENTS, COLORS } from './constants';
import { Agent, Session, ChatMessage } from './types';
import { generateAgentResponse, mapInputToFields, commitToMemory } from './services/geminiService';
import { SmartRenderer } from './components/SmartRenderer';
import { Dashboard } from './components/Dashboard';
import { DataLayer } from './components/DataLayer';
import { CreateAgentModal } from './components/CreateAgentModal';
import { IconCpu, IconDatabase, IconFileText, IconSettings, IconSend, IconSparkles, IconHistory, IconBarChart, IconPlus, IconPaperclip, IconMagic, IconLayout } from './components/Icons';

type ViewMode = 'dashboard' | 'generator' | 'data';

function App() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(INITIAL_AGENTS[0].id);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Load state from local storage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('pump_agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
  }, []);

  // Save agents to local storage when changed (e.g. memory update)
  useEffect(() => {
    localStorage.setItem('pump_agents', JSON.stringify(agents));
  }, [agents]);

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

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
    const response = await generateAgentResponse(activeAgent, inputs);
    
    const newMsg: ChatMessage = {
      role: 'model',
      content: response,
      timestamp: Date.now(),
      type: activeAgent.outputType === 'json' ? 'json_render' : 'text'
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
    
    // In a real chat, we'd append to history. simplified here.
    const newInputs = { ...inputs, refinement_instruction: refinementInput, previous_output: session.messages[session.messages.length - 1].content };
    const response = await generateAgentResponse(activeAgent, newInputs);
    
    setSession(prev => ({
      ...prev!,
      messages: [...prev!.messages, { role: 'user', content: refinementInput, timestamp: Date.now() }, { role: 'model', content: response, timestamp: Date.now() }]
    }));
    setRefinementInput('');
    setLoading(false);
  };

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

  const handleCreateAgent = (newAgent: Agent) => {
    const updatedAgents = [...agents, newAgent];
    setAgents(updatedAgents);
    setSelectedAgentId(newAgent.id);
    setCurrentView('generator');
    setShowCreateModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-[#E5E5E5] overflow-hidden font-sans selection:bg-[#00FF66] selection:text-black">
      
      <CreateAgentModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreateAgent}
      />

      {/* SIDEBAR */}
      <aside className={`border-r border-white/5 bg-[#0A0A0B] flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-20`}>
        <div className="h-20 flex items-center px-6">
          <div className="w-10 h-10 rounded-xl bg-[#00FF66] flex items-center justify-center mr-3 shrink-0 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:scale-105 transition-transform" onClick={() => setSidebarOpen(!sidebarOpen)}>
             <span className="font-black text-black text-xl">P</span>
          </div>
          {sidebarOpen && <span className="font-bold tracking-tight text-xl">Pump OS</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
             <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'text-black bg-[#00FF66]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <IconBarChart className="w-5 h-5 mr-3 shrink-0" />
                {sidebarOpen && <span className="font-medium">Dashboard</span>}
            </button>
            <button onClick={() => setCurrentView('data')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'data' ? 'text-black bg-[#00FF66]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <IconDatabase className="w-5 h-5 mr-3 shrink-0" />
                {sidebarOpen && <span className="font-medium">Data Layer</span>}
            </button>
            <button onClick={() => setCurrentView('generator')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${currentView === 'generator' ? 'text-black bg-[#00FF66]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <IconCpu className="w-5 h-5 mr-3 shrink-0" />
                {sidebarOpen && <span className="font-medium">Agent Engine</span>}
            </button>

            {sidebarOpen && (
              <div className="mt-10 px-4 flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Agents</span>
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="text-gray-500 hover:text-[#00FF66] transition-colors bg-white/5 p-1 rounded hover:bg-white/10"
                  title="Create New Agent"
                >
                  <IconPlus className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="space-y-1">
                {agents.map(agent => (
                    <button 
                        key={agent.id}
                        onClick={() => { setSelectedAgentId(agent.id); setCurrentView('generator'); }}
                        className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all flex items-center ${activeAgent.id === agent.id && currentView === 'generator' ? 'bg-white/10 text-white border border-white/5 shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                    >
                        <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${activeAgent.id === agent.id ? 'bg-[#00FF66] neon-glow' : 'bg-gray-700'}`}></span>
                        {sidebarOpen && <span className="truncate">{agent.name}</span>}
                    </button>
                ))}
            </div>
        </nav>
        
        <div className="p-6 border-t border-white/5">
             <button className="flex items-center text-gray-500 hover:text-white transition-colors">
                <IconSettings className="w-5 h-5 mr-3" />
                {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
             </button>
        </div>
      </aside>

      {/* MAIN CONTENT Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(189,0,255,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,255,102,0.05),transparent_40%)] pointer-events-none"></div>
        
        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && <Dashboard />}

        {/* VIEW: DATA */}
        {currentView === 'data' && <DataLayer />}

        {/* VIEW: GENERATOR (Core) */}
        {currentView === 'generator' && (
            <div className="flex flex-1 h-full overflow-hidden p-6 gap-6">
                
                {/* Left Panel: Configuration Card */}
                <div className="w-[400px] flex flex-col glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl z-10">
                    <div className="p-6 border-b border-white/5 bg-[#0A0A0B]/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                    {activeAgent.name}
                                    <span className="px-2 py-0.5 rounded-full bg-[#00FF66]/10 text-[#00FF66] text-[10px] font-mono border border-[#00FF66]/20">v2.1</span>
                                </h1>
                                <p className="text-xs text-gray-400 leading-relaxed">{activeAgent.description}</p>
                            </div>
                            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-[#00FF66] transition-colors bg-white/5 p-2 rounded-lg">
                                <IconLayout className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0A0B]/30">
                         {showSettings && (
                            <div className="p-4 bg-[#18181B] rounded-xl border border-white/5 animate-fade-in mb-4">
                                <label className="text-[10px] text-[#00FF66] font-bold block mb-2 tracking-wider">SYSTEM PROMPT</label>
                                <div className="text-xs text-gray-400 font-mono bg-black/50 p-3 rounded-lg border border-white/5 h-24 overflow-y-auto">
                                    {activeAgent.systemPrompt}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Input Context</h3>
                             <button onClick={handleAutoMap} className="text-[10px] flex items-center gap-1 text-[#BD00FF] hover:text-[#d466ff] transition-colors">
                                <IconSparkles className="w-3 h-3" /> Auto-Fill
                            </button>
                        </div>
                        
                        {activeAgent.inputs.map(input => (
                            <div key={input.id} className="group">
                                <label className="text-xs font-medium text-gray-300 mb-2 block ml-1 group-focus-within:text-[#00FF66] transition-colors">{input.label}</label>
                                {input.type === 'textarea' ? (
                                    <div className="relative">
                                        <textarea 
                                            className="w-full bg-[#18181B] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/20 transition-all h-40 resize-none shadow-inner"
                                            placeholder={input.placeholder}
                                            value={inputs[input.id] || ''}
                                            onChange={(e) => handleInputChange(input.id, e.target.value)}
                                        />
                                        <div className="absolute bottom-3 right-3 text-gray-600 pointer-events-none">
                                            <IconFileText className="w-4 h-4" />
                                        </div>
                                    </div>
                                ) : input.type === 'select' ? (
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-[#18181B] border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/20 transition-all appearance-none"
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
                                        className="w-full bg-[#18181B] border border-white/5 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/20 transition-all"
                                        placeholder={input.placeholder}
                                        value={inputs[input.id] || ''}
                                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-white/5 bg-[#0A0A0B]/50">
                        <button 
                            onClick={handleGenerate} 
                            disabled={loading}
                            className="w-full bg-[#E5E5E5] hover:bg-white text-black font-bold py-3.5 px-4 rounded-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <IconSparkles className="w-5 h-5 text-[#BD00FF] group-hover:rotate-12 transition-transform" />
                                    Generate Content
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Output & Interaction */}
                <div className="flex-1 flex flex-col relative z-0">
                    <div className="flex-1 overflow-y-auto pb-32 space-y-6 pr-4">
                        {!session ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                <div className="w-24 h-24 rounded-3xl bg-[#18181B] border border-white/5 flex items-center justify-center shadow-2xl rotate-3 transform hover:rotate-0 transition-all duration-500">
                                    <IconCpu className="w-10 h-10 text-[#00FF66] opacity-80" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-white font-medium mb-1">Agent Ready</h3>
                                    <p className="text-sm">Configure inputs on the left to start.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {session.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                        <div className={`max-w-4xl rounded-3xl p-6 shadow-xl ${msg.role === 'user' ? 'bg-[#00FF66] text-black rounded-br-sm' : 'glass-panel rounded-bl-sm border border-white/5'}`}>
                                            {msg.role === 'model' && (
                                                <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                                    <div className="w-6 h-6 rounded-lg bg-[#00FF66] flex items-center justify-center shadow-[0_0_10px_rgba(0,255,102,0.4)]">
                                                        <IconCpu className="w-3.5 h-3.5 text-black" />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#00FF66] uppercase tracking-wider">Generated Output</span>
                                                </div>
                                            )}
                                            
                                            <SmartRenderer content={msg.content} />
                                            
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* New "Option 2" Style Refinement Bar */}
                    <div className="absolute bottom-0 left-0 right-4">
                         <div className="bg-[#18181B] border border-white/5 rounded-3xl p-3 shadow-2xl flex flex-col gap-3 backdrop-blur-xl">
                            {/* Context Pills (Visual only for now, mimicking 'Option 2') */}
                            {session && (
                                <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-2 bg-[#27272A] px-3 py-1.5 rounded-full border border-white/5 text-xs text-gray-300 whitespace-nowrap">
                                        <IconFileText className="w-3 h-3 text-[#BD00FF]" />
                                        <span>previous-context.pdf</span>
                                        <button className="hover:text-white ml-1">×</button>
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#27272A] px-3 py-1.5 rounded-full border border-white/5 text-xs text-gray-300 whitespace-nowrap">
                                        <IconBarChart className="w-3 h-3 text-[#00FF66]" />
                                        <span>analytics-data.csv</span>
                                        <button className="hover:text-white ml-1">×</button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pl-3 pr-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none py-2"
                                    placeholder={session ? "Refine this result... (e.g. 'Make it punchier')" : "Generate output first..."}
                                    value={refinementInput}
                                    onChange={(e) => setRefinementInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                    disabled={!session || loading}
                                />
                                
                                <div className="flex items-center gap-1 border-l border-white/5 pl-3">
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Upload Reference">
                                        <IconPaperclip className="w-4 h-4" />
                                    </button>
                                    <button 
                                        className="p-2 text-gray-400 hover:text-[#BD00FF] hover:bg-[#BD00FF]/10 rounded-lg transition-colors" 
                                        title="Enhance Prompt"
                                        onClick={handleCommitMemory}
                                    >
                                        <IconMagic className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-full border border-white/10">
                                        <IconSparkles className="w-3 h-3 text-[#00FF66]" />
                                        <span className="text-[10px] font-bold text-white">Gemini 3 Flash</span>
                                    </div>
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