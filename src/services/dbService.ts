import { ConversationDB } from '../utils/dbUtils';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class DatabaseService {
  private db: ConversationDB;
  private sessionId: string;
  
  constructor(sessionId?: string) {
    this.sessionId = sessionId || uuidv4();
    this.db = new ConversationDB(this.sessionId);
  }
  
  async initialize(): Promise<void> {
    await this.db.initialize();
  }
  
  async addMessage(role: 'system' | 'user' | 'assistant', content: string): Promise<void> {
    await this.db.addMessage(role, content);
  }
  
  async getConversationHistory(): Promise<ConversationMessage[]> {
    return await this.db.getConversationHistory();
  }
  
  async close(): Promise<void> {
    await this.db.close();
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
}