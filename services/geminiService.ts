import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Agent, UploadedFile, DataLayerAnalysis, BrandContext } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in process.env");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// --- AUDIO HELPERS ---
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

// Gemini 2.5 Flash TTS returns raw PCM (24kHz, 1 channel, 16-bit). 
// Browsers need a WAV header to play it in an <audio> tag.
const pcmToWav = (base64Pcm: string, sampleRate = 24000) => {
    const pcmData = base64ToUint8Array(base64Pcm);
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true); // ChunkSize
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, byteRate, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true); // Subchunk2Size

    const wavBytes = new Uint8Array(wavHeader.byteLength + pcmData.length);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(pcmData, 44);

    return uint8ArrayToBase64(wavBytes);
};
// ---------------------

export const generateAgentResponse = async (
  agent: Agent,
  inputValues: Record<string, string>,
  files: UploadedFile[] = [],
  brandContext?: BrandContext
): Promise<string> => {
  const ai = getClient();
  
  // --- IMAGE GENERATION ---
  if (agent.outputType === 'image') {
    const promptText = agent.id === 'quote-card-architect' 
        ? `Create a modern, high-aesthetic quote card. Dark background (agate/black), neon emerald accents. Text: "${inputValues['quote']}" - ${inputValues['author']}. Minimalist, typographic design.`
        : inputValues['prompt'];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: promptText }]
            },
            config: {
                // responseMimeType is not supported for nano banana
            }
        });
        
        // Extract Image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return "Error: No image returned from model.";
    } catch (e) {
        console.error("Image Gen Error", e);
        return "Error generating image.";
    }
  }

  // --- AUDIO GENERATION ---
  if (agent.outputType === 'audio') {
    const textToSay = inputValues['script'];
    const voiceName = inputValues['voice'] || 'Kore';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: textToSay }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            }
        });

        // Extract Audio
        const base64Pcm = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Pcm) {
            // Convert Raw PCM to WAV so browser can play it
            const wavBase64 = pcmToWav(base64Pcm);
            return `data:audio/wav;base64,${wavBase64}`;
        }
        return "Error: No audio returned.";
    } catch (e) {
        console.error("Audio Gen Error", e);
        return "Error generating audio.";
    }
  }

  // --- TEXT / JSON GENERATION ---
  const modelId = 'gemini-3-flash-preview';

  // Construct the Brand DNA Context
  let brandSection = '';
  if (brandContext && brandContext.name) {
      brandSection = `
      GLOBAL BRAND CONTEXT (You MUST align with this):
      - Company Name: ${brandContext.name}
      - Industry: ${brandContext.industry}
      - Target Audience: ${brandContext.targetAudience}
      - Tone of Voice: ${brandContext.toneVoice}
      `;
  }

  // Construct the prompt with Inputs
  let userPrompt = `Input Data:\n`;
  for (const [key, value] of Object.entries(inputValues)) {
    userPrompt += `${key}: ${value}\n`;
  }

  // Append File Context
  if (files.length > 0) {
    userPrompt += `\n\nAttached Context Files:\n`;
    files.forEach(file => {
      userPrompt += `--- START FILE: ${file.name} ---\n${file.content}\n--- END FILE ---\n`;
    });
  }

  const memoryContext = agent.memoryLog.length > 0 
    ? `\n\nTake into account these learned preferences (Memory Log):\n- ${agent.memoryLog.join('\n- ')}` 
    : '';

  const fullPrompt = `${agent.systemPrompt}\n${brandSection}\n${memoryContext}\n\n${userPrompt}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        responseMimeType: agent.outputType === 'json' ? 'application/json' : 'text/plain',
        temperature: 0.7,
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error generating content: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const mapInputToFields = async (rawText: string, fields: {id: string, label: string}[]) : Promise<Record<string, string>> => {
    const ai = getClient();
    const prompt = `
    I have a raw text blob and a list of target fields. 
    Map the relevant parts of the text to the fields. 
    Return ONLY a valid JSON object where keys are field IDs and values are the extracted content.
    
    Target Fields: ${JSON.stringify(fields)}
    
    Raw Text:
    "${rawText}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Mapping error", e);
        return {};
    }
}

export const analyzeDataFiles = async (files: UploadedFile[]) : Promise<DataLayerAnalysis | null> => {
    const ai = getClient();
    
    const fileContext = files.map(f => `Filename: ${f.name}\nContent:\n${f.content.substring(0, 20000)}...`).join('\n---\n');

    const prompt = `
    You are a Senior Performance Analyst. Analyze the following datasets.
    
    Identify:
    1. Winning content formats (what works best).
    2. Key strategic insights (correlations, outliers).
    3. A clear strategic directive for the team.
    4. A concise memory summary of these findings for future AI context.
    
    Return strict JSON with this schema:
    {
      "winning_formats": ["Format 1", "Format 2"],
      "insights": ["Insight 1", "Insight 2"],
      "strategic_directive": "Markdown formatted text...",
      "memory_summary": "Concise text block..."
    }

    Datasets:
    ${fileContext}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || 'null');
    } catch (e) {
        console.error("Analysis failed", e);
        return null;
    }
}

export const commitToMemory = async (currentMemory: string[], interaction: string, feedback: string): Promise<string> => {
    const ai = getClient();
    const prompt = `
    The user is providing feedback on an AI agent's output.
    Current Memory Log: ${JSON.stringify(currentMemory)}
    
    Interaction Summary: ${interaction.substring(0, 500)}...
    User Feedback: "${feedback}"
    
    Create a single, concise rule (max 15 words) that summarizes this feedback to improve future outputs.
    Return ONLY the rule as a plain string.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text?.trim() || feedback;
    } catch (e) {
        return feedback;
    }
}

export const refineMemory = async (rawRule: string): Promise<string> => {
    const ai = getClient();
    const prompt = `Refine this user-provided rule into a concise system instruction (max 15 words): "${rawRule}"`;
    try {
        const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: prompt
        });
        return response.text?.trim() || rawRule;
    } catch(e) {
        return rawRule;
    }
}