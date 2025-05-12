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
    console.log('Inicializando banco de dados');
    await this.db.initialize();
    console.log('Banco de dados inicializado com sucesso');
  }
  
  async addMessage(role: 'system' | 'user' | 'assistant', content: string): Promise<void> {
    await this.db.addMessage(role, content);
  }
  
  async getConversationHistory(): Promise<ConversationMessage[]> {
    return await this.db.getConversationHistory();
  }
  
  async close(): Promise<void> {
    console.log('Fechando conexão com o banco de dados');
    await this.db.close();
    console.log('Conexão com o banco de dados fechada');
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
}