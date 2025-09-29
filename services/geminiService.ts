
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage, Contact, Order } from '../types';

// Assume API_KEY is always available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

let chat: Chat | null = null;

const initializeChat = (contact: Contact, orders: Order[]) => {
    const systemInstruction = `
        You are VersaBot, a helpful and friendly AI assistant for VersaCRM. 
        You are speaking to ${contact.name}.
        Your goal is to answer their questions based ONLY on the information provided below.
        Do not make up information. If you don't know the answer, say "I'm sorry, I don't have access to that information. For more help, please contact our support team."
        Keep your answers concise and clear.

        Here is the client's information:
        - Name: ${contact.name}
        - Email: ${contact.email}
        - Account Status: ${contact.status}
        - Member Since: ${new Date(contact.createdAt).toLocaleDateString()}
        - Current Account Balance: $${contact.billingInfo.accountBalance.toFixed(2)}
        - Next Billing Date: ${contact.billingInfo.nextBillingDate ? new Date(contact.billingInfo.nextBillingDate).toLocaleDateString() : 'N/A'}

        Here is the client's full billing history:
        ${orders.map(o => `- Order ID #${o.id}: Total was ${o.total} on ${new Date(o.orderDate).toLocaleDateString()}. The status of this order is ${o.status}.`).join('\n')}
    `;

    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction
        },
    });
}

export const geminiService = {
  startChatSession: (contact: Contact, orders: Order[]) => {
      initializeChat(contact, orders);
  },

  sendMessageStream: async function* (message: string) {
    if (!chat) {
      yield "Chat session not initialized. Please refresh the page.";
      return;
    }
    
    // The library manages history internally, but we can pass it if needed for context.
    // For this implementation, we rely on the session's internal history.

    try {
      const result = await chat.sendMessageStream({ message });
      for await (const chunk of result) {
        yield chunk.text;
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      yield "Sorry, I encountered an error. Please try again.";
    }
  },
};
