// Simplified chat storage - not using DB yet
// Can be extended later with actual Drizzle integration

export interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
}

export interface IChatStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

// In-memory implementation for now
const conversations = new Map<number, Conversation>();
const messages = new Map<number, Message[]>();
let convId = 1;
let msgId = 1;

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    return conversations.get(id);
  },

  async getAllConversations() {
    return Array.from(conversations.values());
  },

  async createConversation(title: string) {
    const conv: Conversation = { id: convId++, title, createdAt: new Date() };
    conversations.set(conv.id, conv);
    messages.set(conv.id, []);
    return conv;
  },

  async deleteConversation(id: number) {
    conversations.delete(id);
    messages.delete(id);
  },

  async getMessagesByConversation(conversationId: number) {
    return messages.get(conversationId) || [];
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const msg: Message = {
      id: msgId++,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    const convMsgs = messages.get(conversationId) || [];
    convMsgs.push(msg);
    messages.set(conversationId, convMsgs);
    return msg;
  },
};
