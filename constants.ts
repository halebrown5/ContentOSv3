import { Agent } from './types';

export const COLORS = {
  bg: '#000000',      // Void Black
  surface: '#121212', // Slightly off-black for contrast
  primary: '#00FF66', // New Pump Neon
  accent: '#FFD600',  // Stackable Yellow/Orange for secondary
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  border: '#333333',
};

export const INITIAL_AGENTS: Agent[] = [
  // --- CORE STRATEGY & VERIFICATION ---
  {
    id: 'data-verifier-agent',
    name: 'Data Layer Verifier',
    role: 'Editor-in-Chief',
    description: 'Cross-references drafts against the system Data Layer and Brand DNA.',
    category: 'Analysis',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `You are the Editor-in-Chief. Verify the input draft against the provided Context and Brand DNA.
    Output JSON:
    {
      "verified_claims": ["..."],
      "hallucinations_flagged": ["..."],
      "refined_draft": "...",
      "change_log": ["Changed X to Y based on data..."]
    }`,
    inputs: [
      { id: 'draft', label: 'Draft Content', type: 'textarea' }
    ]
  },
  {
    id: 'analytics-report-agent',
    name: 'Analytics Analyst',
    role: 'Data Scientist',
    description: 'Synthesizes raw numbers into Win/Loss analysis and strategic directives.',
    category: 'Analysis',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Analyze the provided raw metrics. Output a high-level executive summary: What won, what lost, and what we should do next week.',
    inputs: [
      { id: 'metrics', label: 'Raw Metrics (Text/CSV)', type: 'textarea' }
    ]
  },
  {
    id: 'accuracy-agent',
    name: 'Accuracy Verifier',
    role: 'Fact-Checker',
    description: 'Compares a draft against a specific "Source of Truth" document.',
    category: 'Analysis',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Compare the Draft against the Source Document. Flag any discrepancies, exaggerations, or missing context.',
    inputs: [
      { id: 'draft', label: 'Draft', type: 'textarea' },
      { id: 'source_doc', label: 'Source of Truth', type: 'textarea' }
    ]
  },

  // --- SOCIAL WRITING & ROLLOUT ---
  {
    id: 'social-rollout-agent',
    name: 'Social Rollout',
    role: 'Campaign Manager',
    description: 'Converts long-form content into a multi-channel launch package.',
    category: 'Strategy',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create a distribution plan.
    Output JSON:
    {
      "channels": [
        { "name": "LinkedIn", "posts": [{ "type": "Main", "content": "..." }] },
        { "name": "X", "posts": [{ "type": "Thread", "content": "..." }] },
        { "name": "Newsletter", "subject": "...", "body": "..." }
      ]
    }`,
    inputs: [
      { id: 'content', label: 'Source Content', type: 'textarea' }
    ]
  },
  {
    id: 'individual-post-creator',
    name: 'Post Deep-Dive',
    role: 'Specialist',
    description: 'Creates one high-impact, standalone post for a specific platform.',
    category: 'Creation',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Write a high-impact social media post for the specified platform. Focus on a strong hook and clear value.',
    inputs: [
      { id: 'platform', label: 'Platform', type: 'select', options: ['LinkedIn', 'X (Twitter)', 'Instagram Caption'] },
      { id: 'topic', label: 'Topic/Angle', type: 'textarea' }
    ]
  },
  {
    id: 'caption-writing-agent',
    name: 'Caption Writer',
    role: 'Copywriter',
    description: 'Generates professional "operator-to-operator" captions.',
    category: 'Creation',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Write a professional, concise caption. No fluff. Operator-to-operator tone.',
    inputs: [
      { id: 'context', label: 'Image/Post Context', type: 'textarea' }
    ]
  },
  {
    id: 'caption-rewriter-agent',
    name: 'Caption Rewriter',
    role: 'Editor',
    description: 'Rewrites a draft into 4 distinct tonal variants.',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Rewrite the input into 4 tones. Output JSON:
    {
      "variants": [
        { "tone": "Contrarian", "content": "..." },
        { "tone": "Pragmatist", "content": "..." },
        { "tone": "Visionary", "content": "..." },
        { "tone": "Scribe", "content": "..." }
      ]
    }`,
    inputs: [
      { id: 'draft', label: 'Original Draft', type: 'textarea' }
    ]
  },

  // --- X (TWITTER) STRATEGY ---
  {
    id: 'x-thread-agent',
    name: 'X Thread Architect',
    role: 'Viral Engineer',
    description: 'Transforms content into viral thread concepts (Contrarian, How-To, Future).',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create 4 thread concepts. Output JSON:
    {
      "concepts": [
        { "type": "Contrarian", "hook": "...", "outline": "..." },
        { "type": "How-To", "hook": "...", "outline": "..." },
        { "type": "Future", "hook": "...", "outline": "..." },
        { "type": "Deep Dive", "hook": "...", "outline": "..." }
      ]
    }`,
    inputs: [
      { id: 'topic', label: 'Topic', type: 'textarea' }
    ]
  },
  {
    id: 'x-long-form-agent',
    name: 'X Long Form',
    role: 'Essayist',
    description: 'Converts content into a single, cohesive long-form post for scroll-pause retention.',
    category: 'Creation',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Write a long-form X post (approx 500 words). focus on formatting, line breaks, and a compelling narrative arc.',
    inputs: [
      { id: 'topic', label: 'Topic/Notes', type: 'textarea' }
    ]
  },

  // --- VISUAL STORYTELLING ---
  {
    id: 'insights-carousel-agent',
    name: 'Insights Carousel',
    role: 'Educator',
    description: 'Transforms complex insights into a 5-7 slide executive storyboard.',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create a slide-by-slide storyboard. Output JSON:
    { "slides": [{ "slide": 1, "headline": "...", "body": "...", "visual_cue": "..." }] }`,
    inputs: [
      { id: 'insight', label: 'Core Insight', type: 'textarea' }
    ]
  },
  {
    id: 'case-study-carousel-agent',
    name: 'Case Study Architect',
    role: 'Proof Builder',
    description: 'Turns project outcomes into a narrative storyboard (Problem -> Approach -> Outcome).',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create a Case Study carousel. Output JSON with slides following Problem -> Solution -> Result structure.`,
    inputs: [
      { id: 'case_details', label: 'Project Details', type: 'textarea' }
    ]
  },
  {
    id: 'video-storyboard-agent',
    name: 'Video Storyboard',
    role: 'Director',
    description: 'Scripts short-form video clips with visual direction.',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Create a video script. Output JSON:
    { "scenes": [{ "time": "0-5s", "visual": "...", "audio": "..." }] }`,
    inputs: [
      { id: 'concept', label: 'Video Idea', type: 'textarea' }
    ]
  },
  {
    id: 'poll-generator-agent',
    name: 'Poll Generator',
    role: 'Engager',
    description: 'Creates high-signal LinkedIn polls based on psychological patterns.',
    category: 'Creation',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Generate 3 poll ideas. Output JSON:
    { "polls": [{ "question": "...", "options": ["...", "..."], "psychology": "Risk Assessment" }] }`,
    inputs: [
      { id: 'topic', label: 'Topic', type: 'textarea' }
    ]
  },

  // --- EXTRACTION & REPURPOSING ---
  {
    id: 'quote-extractor-verbatim',
    name: 'Quote Extractor',
    role: 'Archivist',
    description: 'Extracts exact, word-for-word quotes from transcripts.',
    category: 'Utility',
    outputType: 'json',
    memoryLog: [],
    systemPrompt: `Extract the top 5 IMPACTFUL verbatim quotes. Output JSON: { "quotes": ["..."] }`,
    inputs: [
      { id: 'transcript', label: 'Transcript', type: 'textarea' }
    ]
  },
  {
    id: 'youtube-substack-agent',
    name: 'Repurposer Pro',
    role: 'Signal Hunter',
    description: 'Scans transcripts to identify viral hooks and repurpose them.',
    category: 'Strategy',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Find the viral hooks in this transcript. Repurpose the best one into a social post.',
    inputs: [
      { id: 'transcript', label: 'Transcript', type: 'textarea' }
    ]
  },
  {
    id: 'research-signal-agent',
    name: 'Research Signal',
    role: 'Distiller',
    description: 'Turns dense PDF reports into "teaser" posts.',
    category: 'Strategy',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Summarize this research paper into a compelling social media teaser that drives curiosity.',
    inputs: [
      { id: 'text', label: 'Research Text', type: 'textarea' }
    ]
  },

  // --- MEDIA GENERATION ---
  {
    id: 'quote-card-architect',
    name: 'Quote Card Architect',
    role: 'Brand Designer',
    description: 'Generates a 1:1 square image with the Gruve aesthetic (Agate/Emerald).',
    category: 'Utility',
    outputType: 'image',
    memoryLog: [],
    systemPrompt: '', // Handled via image model directly
    inputs: [
      { id: 'quote', label: 'Quote Text', type: 'textarea' },
      { id: 'author', label: 'Author', type: 'text' }
    ]
  },
  {
    id: 'advanced-image-agent',
    name: 'Image Generator',
    role: 'Artist',
    description: 'Generates high-fidelity, modern tech-aesthetic images.',
    category: 'Creation',
    outputType: 'image',
    memoryLog: [],
    systemPrompt: '',
    inputs: [
      { id: 'prompt', label: 'Image Prompt', type: 'textarea' }
    ]
  },
  {
    id: 'image-prompt-engineer',
    name: 'Prompt Engineer',
    role: 'Translator',
    description: 'Converts a visual concept into a technical Midjourney prompt.',
    category: 'Utility',
    outputType: 'text',
    memoryLog: [],
    systemPrompt: 'Convert the user concept into a highly detailed, technical image generation prompt (lighting, camera, style).',
    inputs: [
      { id: 'concept', label: 'Visual Concept', type: 'textarea' }
    ]
  },
  {
    id: 'text-to-speech-agent',
    name: 'Voice Generator',
    role: 'Narrator',
    description: 'Converts text scripts into high-quality audio.',
    category: 'Creation',
    outputType: 'audio',
    memoryLog: [],
    systemPrompt: '',
    inputs: [
      { id: 'script', label: 'Script', type: 'textarea' },
      { id: 'voice', label: 'Voice (Male/Female)', type: 'select', options: ['Kore', 'Fenrir', 'Puck', 'Zephyr'] }
    ]
  }
];