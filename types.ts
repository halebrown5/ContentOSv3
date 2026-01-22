export type InputType = 'text' | 'textarea' | 'file' | 'select';

export interface AgentInput {
  id: string;
  label: string;
  type: InputType;
  options?: string[]; // For select
  placeholder?: string;
  accept?: string; // For file
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  inputs: AgentInput[];
  outputType: 'text' | 'json' | 'image' | 'audio';
  memoryLog: string[]; // User-defined rules accumulated over time
  category: 'Strategy' | 'Creation' | 'Analysis' | 'Utility';
}

export interface UploadedFile {
  name: string;
  content: string;
  type: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  type?: 'text' | 'json_render' | 'image' | 'analysis';
  metadata?: any;
}

export interface Session {
  id: string;
  agentId: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export interface AnalyticsData {
  metric: string;
  value: number;
  trend: number; // percentage
  history: number[]; // simple array for sparklines
}