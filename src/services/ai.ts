import { GoogleGenAI, Type } from '@google/genai';
import { knowledgeBase, KBArticle } from '../data/kb';

// Initialize AI using the environment variable injected by AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PersonaInsights {
  persona: string;
  sentiment: string;
  requiresEscalation: boolean;
  reasoning: string;
}

/**
 * Phase 3: Persona Detector
 * Uses Gemini 3 Flash Preview to analyze the user's message and determine their persona, sentiment, and escalation needs.
 */
export async function detectPersona(message: string): Promise<PersonaInsights> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following customer message. Determine their persona (e.g., Technical, Beginner, Frustrated, Neutral, Urgent), their sentiment, and if it requires immediate human escalation (e.g., threats, extreme anger, legal threats, or explicit requests for a human).\n\nMessage: "${message}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          persona: { type: Type.STRING, description: 'The user persona, e.g., Technical, Beginner, Frustrated, Neutral, Urgent' },
          sentiment: { type: Type.STRING, description: 'The user sentiment, e.g., Positive, Negative, Neutral, Angry' },
          requiresEscalation: { type: Type.BOOLEAN, description: 'True if the message requires immediate human escalation' },
          reasoning: { type: Type.STRING, description: 'Brief reasoning for the classification' }
        },
        required: ['persona', 'sentiment', 'requiresEscalation', 'reasoning']
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}') as PersonaInsights;
  } catch (e) {
    console.error("Failed to parse persona JSON", e);
    return { persona: 'Neutral', sentiment: 'Neutral', requiresEscalation: false, reasoning: 'Fallback due to parsing error' };
  }
}

/**
 * Phase 4: KB Retriever
 * Keyword scoring logic to find the most relevant Knowledge Base article.
 */
export function retrieveKB(message: string): KBArticle | null {
  const lowerMsg = message.toLowerCase();
  
  const scored = knowledgeBase.map(entry => {
    let score = 0;
    entry.keywords.forEach(kw => {
      if (lowerMsg.includes(kw)) score++;
    });
    return { ...entry, score };
  });
  
  // Sort by highest score
  scored.sort((a, b) => b.score - a.score);
  
  // Return the top match if it has at least 1 keyword match
  return scored[0].score > 0 ? scored[0] : null;
}

/**
 * Phase 5 & 6: Response Generator & Escalation
 * Generates a response adapting to the persona and using the retrieved KB context.
 */
export async function generateResponse(
  message: string, 
  personaInsights: PersonaInsights, 
  kbContext: KBArticle | null,
  chatHistory: { role: string, content: string }[]
): Promise<string> {
  
  const historyText = chatHistory.map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`).join('\n');
  
  const systemInstruction = `You are a helpful customer support agent. 
Your current customer has the following persona: ${personaInsights.persona} and sentiment: ${personaInsights.sentiment}.
Adapt your tone to match their persona:
- If they are technical, use technical terms and be concise.
- If they are a beginner, be simple, encouraging, and avoid jargon.
- If they are frustrated or angry, be highly empathetic, apologetic, and reassuring.

${kbContext ? `Use the following knowledge base article to answer their question:\nTitle: ${kbContext.title}\nContent: ${kbContext.content}` : 'No relevant knowledge base articles found. Do your best to answer generally or offer to connect them to support.'}

${personaInsights.requiresEscalation ? 'IMPORTANT: This user requires human escalation. Acknowledge their frustration/urgency and inform them that you are transferring them to a human agent immediately.' : ''}

Chat History for context:
${historyText}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: { systemInstruction }
  });
  
  return response.text || "I'm sorry, I couldn't process that request.";
}

/**
 * Phase 5: Escalation Logic - Handoff Summary Generator
 * Generates a summary for the human agent when escalation is triggered.
 */
export async function generateEscalationSummary(chatHistory: { role: string, content: string }[]): Promise<string> {
  const historyText = chatHistory.map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize this chat log for a human support agent who is taking over the conversation. Include the user's main issue, their emotional state, and what has been discussed or attempted so far.\n\nChat Log:\n${historyText}`
  });
  
  return response.text || "Summary generation failed.";
}
