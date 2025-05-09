import { ConversationDB } from '../utils/dbUtils';
import { v4 as uuidv4 } from 'uuid';
import { createSpinner } from '../styles/prettierLogs';

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
    const spinner = createSpinner('Inicializando banco de dados');
    spinner.start();
    
    await this.db.initialize();
    
    spinner.succeed('Banco de dados inicializado com sucesso');
  }
  
  async addMessage(role: 'system' | 'user' | 'assistant', content: string): Promise<void> {
    await this.db.addMessage(role, content);
  }
  
  async getConversationHistory(): Promise<ConversationMessage[]> {
    return await this.db.getConversationHistory();
  }
  
  async close(): Promise<void> {
    const spinner = createSpinner('Fechando conexão com o banco de dados');
    spinner.start();
    
    await this.db.close();
    
    spinner.succeed('Conexão com o banco de dados fechada');
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
}