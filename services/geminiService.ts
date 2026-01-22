import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Agent } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing in process.env");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAgentResponse = async (
  agent: Agent,
  inputValues: Record<string, string>,
  history: string[] = []
): Promise<string> => {
  const ai = getClient();
  const modelId = 'gemini-3-flash-preview'; // Updated model

  // Construct the prompt
  let userPrompt = `Input Data:\n`;
  for (const [key, value] of Object.entries(inputValues)) {
    userPrompt += `${key}: ${value}\n`;
  }

  const memoryContext = agent.memoryLog.length > 0 
    ? `\n\nTake into account these learned preferences (Memory Log):\n- ${agent.memoryLog.join('\n- ')}` 
    : '';

  const fullPrompt = `${agent.systemPrompt}\n${memoryContext}\n\n${userPrompt}`;

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
            model: 'gemini-3-flash-preview', // Updated model
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Mapping error", e);
        return {};
    }
}

export const analyzeDataFiles = async (fileData: string[]) : Promise<string> => {
    const ai = getClient();
    // In a real app, we would truncate tokens, here we assume small CSV/text samples
    const prompt = `
    Analyze the following datasets (CSV or Text format). 
    Identify correlations, outliers, and key trends.
    Produce a "Strategic Directive" report in Markdown format.
    
    Datasets:
    ${fileData.join('\n---\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Updated model
            contents: prompt
        });
        return response.text || "Analysis failed.";
    } catch (e) {
        return "Error analyzing data.";
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
            model: 'gemini-3-flash-preview', // Updated model
            contents: prompt
        });
        return response.text?.trim() || feedback;
    } catch (e) {
        return feedback;
    }
}