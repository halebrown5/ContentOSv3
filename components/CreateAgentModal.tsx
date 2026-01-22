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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl w-full max-w-lg shadow-[0_0_30px_rgba(0,255,102,0.1)]">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-bold flex items-center gap-2">
            <IconCpu className="text-[#00FF66] w-5 h-5" />
            Create New Agent
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#00FF66] mb-1">NAME</label>
              <input 
                autoFocus
                className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                placeholder="e.g. Email Rewriter"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#00FF66] mb-1">ROLE</label>
              <input 
                className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                placeholder="e.g. Editor"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#00FF66] mb-1">DESCRIPTION</label>
            <input 
              className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#00FF66]"
              placeholder="Short description of what this agent does..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-[#00FF66] mb-1">CATEGORY</label>
              <select 
                className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#00FF66]"
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
              <label className="block text-xs font-bold text-[#00FF66] mb-1">OUTPUT</label>
              <select 
                className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                value={formData.outputType}
                onChange={e => setFormData({...formData, outputType: e.target.value})}
              >
                <option value="text">Text (Markdown)</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#00FF66] mb-1">SYSTEM PROMPT</label>
            <textarea 
              className="w-full bg-[#18181B] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#00FF66] font-mono h-32"
              placeholder="You are an expert at..."
              value={formData.systemPrompt}
              onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
              required
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Instructions that define how the agent behaves.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#00FF66] text-black font-bold rounded-lg text-sm hover:bg-[#33ff85] transition-colors"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};