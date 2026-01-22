import React, { useState } from 'react';
import { Agent } from '../types';
import { IconX, IconCpu } from './Icons';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (agent: Agent) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    systemPrompt: '',
    category: 'Strategy',
    outputType: 'text'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.systemPrompt) return;

    const newAgent: Agent = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      role: formData.role || 'Assistant',
      description: formData.description || 'Custom AI Agent',
      systemPrompt: formData.systemPrompt,
      category: formData.category as any,
      outputType: formData.outputType as any,
      memoryLog: [],
      inputs: [
        {
          id: 'custom_input',
          label: 'Task Context',
          type: 'textarea',
          placeholder: 'Enter the data or context for this task...'
        }
      ]
    };

    onCreate(newAgent);
    setFormData({
      name: '',
      role: '',
      description: '',
      systemPrompt: '',
      category: 'Strategy',
      outputType: 'text'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#000000] border-2 border-[#00FF66] w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,255,102,0.2)]">
        <div className="flex items-center justify-between p-6 border-b-2 border-[#333333] bg-[#121212]">
          <h2 className="text-white font-condensed font-black text-2xl uppercase flex items-center gap-3">
            <IconCpu className="text-[#00FF66] w-6 h-6" />
            Create New Agent
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-[#000000]">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">NAME</label>
              <input 
                autoFocus
                className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] font-bold"
                placeholder="e.g. Email Rewriter"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">ROLE</label>
              <input 
                className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] font-bold"
                placeholder="e.g. Editor"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">DESCRIPTION</label>
            <input 
              className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] font-medium"
              placeholder="Short description of what this agent does..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div>
              <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">CATEGORY</label>
              <select 
                className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] font-bold uppercase"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Strategy">Strategy</option>
                <option value="Creation">Creation</option>
                <option value="Analysis">Analysis</option>
                <option value="Utility">Utility</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">OUTPUT</label>
              <select 
                className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] font-bold uppercase"
                value={formData.outputType}
                onChange={e => setFormData({...formData, outputType: e.target.value})}
              >
                <option value="text">Text (Markdown)</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#00FF66] mb-2 uppercase tracking-widest">SYSTEM PROMPT</label>
            <textarea 
              className="w-full bg-[#121212] border-2 border-[#333333] p-3 text-sm text-white focus:outline-none focus:border-[#00FF66] font-mono h-32"
              placeholder="You are an expert at..."
              value={formData.systemPrompt}
              onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
              required
            />
            <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase">
              Instructions that define how the agent behaves.
            </p>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t-2 border-[#333333]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 border-2 border-transparent text-sm text-gray-400 hover:text-white font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-[#00FF66] text-black font-condensed font-black text-lg uppercase hover:bg-white transition-colors border-2 border-black pump-shadow-white-sm"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};