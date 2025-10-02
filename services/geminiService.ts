

import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';
import { Contact, Order, Lead, Activity, KnowledgeBaseArticle } from '../types';

// Per guidelines, initialize with a named parameter for apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

const geminiService = {
  startChatSession: (contact: Contact, orders: Order[], articles: KnowledgeBaseArticle[]) => {
    const formattedArticles = articles.map(a => `Article Title: ${a.title}\nArticle Content: ${a.content}`).join('\n\n---\n\n');

    const systemInstruction = `
      You are a helpful AI assistant for a customer named ${contact.name}.
      The customer's contact details are: ${JSON.stringify(contact)}.
      Their order history is: ${JSON.stringify(orders)}.

      Your primary goal is to answer the customer's questions using the provided Knowledge Base articles.
      When you find an answer in an article, state the information clearly and mention the article title it came from.
      
      If you CANNOT find an answer in the knowledge base, and ONLY in that case, apologize and offer to create a support ticket for them. Do not invent answers.

      Here is the knowledge base:
      ${formattedArticles}
    `;
    // Per guidelines, use ai.chats.create
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
  },

  sendMessageStream: async function* (message: string): AsyncGenerator<string> {
    if (!chat) {
      throw new Error("Chat session not initialized. Call startChatSession first.");
    }
    // Per guidelines, use chat.sendMessageStream
    const responseStream = await chat.sendMessageStream({ message });
    for await (const chunk of responseStream) {
      // Per guidelines, use chunk.text
      yield chunk.text;
    }
  },

  getLeadInsights: async (lead: Lead, allLeads: Lead[], industry: string): Promise<{ likelihoodToClose: number; reasoning: string; nextBestAction: string; }> => {
    const prompt = `
      Analyze the following sales lead for the ${industry} industry and provide insights.
      Current Lead: ${JSON.stringify(lead)}
      
      Here are all other leads in the pipeline for context (do not mention them in the response, just use for context):
      ${JSON.stringify(allLeads)}

      Based on this information, provide:
      1. A "likelihoodToClose" score (an integer between 0 and 100).
      2. A brief "reasoning" for the score (2-3 sentences).
      3. A "nextBestAction" for the sales representative to take.
    `;

    // Per guidelines, use ai.models.generateContent for single-turn requests.
    // Use responseSchema for JSON output.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            likelihoodToClose: { type: Type.INTEGER, description: 'An integer between 0 and 100.' },
            reasoning: { type: Type.STRING, description: 'Brief reasoning for the score.' },
            nextBestAction: { type: Type.STRING, description: 'The suggested next action.' }
          },
          required: ['likelihoodToClose', 'reasoning', 'nextBestAction']
        }
      }
    });

    // Per guidelines, access text and parse.
    const jsonString = response.text;
    return JSON.parse(jsonString);
  },

  generateEmailDraft: async (prompt: string, tone: string, contact: Contact): Promise<{ subject: string; body: string; }> => {
    const fullPrompt = `
      Generate a draft for an email to a contact named ${contact.name}.
      The purpose of the email is: "${prompt}".
      The desired tone is: ${tone}.
      
      The contact's details are:
      ${JSON.stringify(contact, null, 2)}

      Please provide a JSON object with a "subject" and a "body" for the email. The body should be a single string with newline characters (\\n) for paragraphs.
    `;

    // Use responseSchema for JSON output.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: 'The email subject line.' },
            body: { type: Type.STRING, description: 'The email body content.' }
          },
          required: ['subject', 'body']
        }
      }
    });
    
    // Per guidelines, access text and parse.
    const jsonString = response.text;
    return JSON.parse(jsonString);
  },
  
  getActivitySummary: async (contactName: string, activities: Activity[]): Promise<string> => {
    const formattedActivities = activities
      .map(act => `On ${new Date(act.createdAt).toLocaleDateString()}, a/an ${act.type} was logged by user ${act.createdBy}: "${act.content}"`)
      .join('\n');

    const prompt = `
      Based on the following activity history for a contact named ${contactName}, provide a concise, one-paragraph summary. 
      Focus on the key interactions, the overall sentiment, and the current status of the relationship. Do not list the activities one by one. Synthesize the information.

      Activity History:
      ${formattedActivities}

      Summary:
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  },
};

export { geminiService };