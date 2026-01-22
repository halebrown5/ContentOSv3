import { Agent } from './types';

export const COLORS = {
  bg: '#0A0A0B',      // Deep Black
  surface: '#18181B', // Zinc-900 like
  primary: '#00FF66', // Neon Green
  accent: '#BD00FF',  // Purple
  text: '#E5E5E5',
  textMuted: '#A1A1AA',
  border: '#27272A',
};

export const INITIAL_AGENTS: Agent[] = [
  // --- STRATEGY ---
  {
    id: 'social-rollout',
    name: 'Social Rollout Architect',
    role: 'Strategist',
    description: 'Converts long-form content (blogs/whitepapers) into a multi-channel distribution plan.',
    category: 'Strategy',
    outputType: 'json',
    memoryLog: ['Prefer punchy, short hooks for X.', 'Always include 3 relevant hashtags for LinkedIn.'],
    systemPrompt: `You are an expert Social Media Strategist. Your goal is to take a long-form content piece and break it down into a distribution plan.
    Output must be valid JSON with the following structure:
    {
      "channels": [
        { "name": "LinkedIn", "posts": [{ "type": "Carousel|Text", "content": "..." }] },
        { "name": "X (Twitter)", "posts": [{ "type": "Thread", "content": "..." }] },
        { "name": "Newsletter", "subject": "...", "body": "..." }
      ]
    }
    Adhere to the user's memory log for tone and style preferences.`,
    inputs: [
      { id: 'content', label: 'Source Content', type: 'textarea', placeholder: 'Paste blog post or upload transcript...' },
      { id: 'goal', label: 'Campaign Goal', type: 'select', options: ['Traffic', 'Engagement', 'Brand Awareness'] }
    ]
  },
  {
    id: 'competitor-analyst',
    name: 'Competitor Intel',
    role: 'Analyst',
    description: 'Analyzes competitor text/claims and provides a counter-strategy matrix.',
    category: 'Strategy',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Analyze the provided competitor content. Identify weaknesses, gaps, and opportunities. Output a strategic directive on how to counter this narrative.',
    inputs: [
      { id: 'competitor_content', label: 'Competitor Content', type: 'textarea', placeholder: 'Paste competitor copy...' }
    ]
  },
  {
    id: 'persona-simulator',
    name: 'Audience Simulator',
    role: 'Strategist',
    description: 'Simulates a specific audience persona reacting to your draft.',
    category: 'Strategy',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'You are acting as the specific target audience defined by the user. Critique the input content brutally but constructively from that perspective.',
    inputs: [
      { id: 'persona', label: 'Target Persona', type: 'text', placeholder: 'e.g., CTO of a Series B startup' },
      { id: 'draft', label: 'Content Draft', type: 'textarea', placeholder: 'Your content here...' }
    ]
  },

  // --- CREATION ---
  {
    id: 'thread-architect',
    name: 'X Thread Architect',
    role: 'Creator',
    description: 'Turns topics or unstructured notes into viral-style X threads.',
    category: 'Creation',
    outputType: 'text',
    memoryLog: ['Use "🧵" to start.', 'No hashtags in the middle of sentences.'],
    systemPrompt: 'Convert the input into a high-engagement Twitter/X thread. Hook in the first tweet. Value in the middle. CTA at the end. One idea per tweet.',
    inputs: [
      { id: 'topic', label: 'Topic / Notes', type: 'textarea', placeholder: 'What is this thread about?' }
    ]
  },
  {
    id: 'linkedin-carousel',
    name: 'LinkedIn Carousel Maker',
    role: 'Creator',
    description: 'Generates slide-by-slide copy for PDF carousels.',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create a LinkedIn Carousel script.
    Output JSON format:
    {
      "slides": [
        { "slide_number": 1, "headline": "...", "body": "...", "visual_cue": "..." }
      ]
    }`,
    inputs: [
      { id: 'topic', label: 'Carousel Topic', type: 'text', placeholder: 'e.g. 5 Ways to Scale AI' },
      { id: 'points', label: 'Key Points', type: 'textarea', placeholder: 'List the main takeaways...' }
    ]
  },
  {
    id: 'video-storyboard',
    name: 'Video Storyboarder',
    role: 'Creator',
    description: 'Generates scene-by-scene scripts for short-form video.',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create a video storyboard.
    Output JSON format:
    {
      "scenes": [
        { "time": "0:00-0:05", "visual": "...", "audio": "..." }
      ]
    }`,
    inputs: [
      { id: 'concept', label: 'Video Concept', type: 'textarea', placeholder: 'Describe the video idea...' }
    ]
  },
  {
    id: 'email-sequence',
    name: 'Email Sequence Builder',
    role: 'Creator',
    description: 'Writes a 3-part nurture sequence based on a value proposition.',
    category: 'Creation',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Write a 3-email sequence (Welcome, Value, Soft Sell). Keep subject lines under 50 chars. Tone: Professional but conversational.',
    inputs: [
      { id: 'value_prop', label: 'Value Proposition', type: 'textarea', placeholder: 'What are we offering?' }
    ]
  },
  {
    id: 'hook-generator',
    name: 'Viral Hook Generator',
    role: 'Creator',
    description: 'Generates 10 variations of a hook for a given piece of content.',
    category: 'Creation',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Generate 10 viral hooks for the following content. Use psychological triggers like Curiosity, Fear of Missing Out, and Specificity.',
    inputs: [
      { id: 'context', label: 'Content Context', type: 'textarea', placeholder: 'Summary of the content...' }
    ]
  },

  // --- ANALYSIS ---
  {
    id: 'data-verifier',
    name: 'Data Verifier',
    role: 'Auditor',
    description: 'Cross-checks claims in a text against logic and common knowledge rules.',
    category: 'Analysis',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Analyze the text for factual claims. Flag any stats that seem exaggerated or lack context. Provide a confidence score for each claim.',
    inputs: [
      { id: 'text_to_verify', label: 'Text to Verify', type: 'textarea', placeholder: 'Paste text here...' }
    ]
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment & Tone Check',
    role: 'Auditor',
    description: 'Analyzes the emotional tone of a draft to ensure it matches brand voice.',
    category: 'Analysis',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Analyze the sentiment. Output JSON:
    {
      "overall_sentiment": "Positive|Neutral|Negative",
      "tone_keywords": ["Professional", "Urgent"],
      "suggestions": "..."
    }`,
    inputs: [
      { id: 'draft', label: 'Draft Text', type: 'textarea', placeholder: 'Paste draft...' }
    ]
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Meta Optimizer',
    role: 'Analyst',
    description: 'Generates optimized title tags, meta descriptions, and slug ideas.',
    category: 'Analysis',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Generate SEO metadata. Output JSON:
    {
      "title_tags": ["...", "..."],
      "meta_descriptions": ["...", "..."],
      "keywords_found": ["..."]
    }`,
    inputs: [
      { id: 'content', label: 'Page Content', type: 'textarea' },
      { id: 'keyword', label: 'Target Keyword', type: 'text' }
    ]
  },

  // --- UTILITY ---
  {
    id: 'quote-extractor',
    name: 'Verbatim Quote Extractor',
    role: 'Utility',
    description: 'Extracts powerful verbatim quotes from raw transcripts.',
    category: 'Utility',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Extract the top 5 most impactful quotes. Output JSON:
    { "quotes": [ { "text": "...", "timestamp": "..." } ] }`,
    inputs: [
      { id: 'transcript', label: 'Transcript', type: 'textarea' }
    ]
  },
  {
    id: 'jargon-buster',
    name: 'Jargon Buster',
    role: 'Utility',
    description: 'Rewrites complex corporate speak into clear, simple English.',
    category: 'Utility',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Rewrite the following text to be understood by a 5th grader. Remove all corporate jargon.',
    inputs: [
      { id: 'text', label: 'Complex Text', type: 'textarea' }
    ]
  },
  {
    id: 'alt-text',
    name: 'Alt Text Writer',
    role: 'Utility',
    description: 'Generates descriptive alt text for images (Simulated via description input or image upload).',
    category: 'Utility',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Write descriptive, SEO-friendly alt text for an image described as follows:',
    inputs: [
      { id: 'image_desc', label: 'Image Description', type: 'textarea', placeholder: 'Describe the image visually...' }
    ]
  },
  {
    id: 'emoji-fier',
    name: 'Emojifier',
    role: 'Utility',
    description: 'Adds relevant emojis to text to increase visual engagement.',
    category: 'Utility',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Add relevant emojis to the text. Do not overdo it. Keep it professional but engaging.',
    inputs: [
      { id: 'text', label: 'Plain Text', type: 'textarea' }
    ]
  }
];