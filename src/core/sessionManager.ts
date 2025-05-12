import { Message } from '../services/apiService';
import { DatabaseService } from '../services/dbService';

export class SessionManager {
  private dbService: DatabaseService;
  private closed: boolean = false;
  
  constructor() {
    this.dbService = new DatabaseService();
  }
  
  async initialize(): Promise<void> {
    if (this.closed) {
      this.closed = false;
      this.dbService = new DatabaseService();
    }
    
    console.log('Inicializando sessão');
    await this.dbService.initialize();
    console.log('Sessão inicializada com sucesso');
    
    await this.dbService.addMessage(
      'system', 
      'You are a programming assistant that helps with coding questions and maintains conversation context.'
    );
  }
  
  async addSystemMessage(content: string): Promise<void> {
    if (this.closed) return;
    await this.dbService.addMessage('system', content);
  }
  
  async addUserMessage(content: string): Promise<void> {
    if (this.closed) return;
    await this.dbService.addMessage('user', content);
  }
  
  async addAssistantMessage(content: string): Promise<void> {
    if (this.closed) return;
    await this.dbService.addMessage('assistant', content);
  }
  
  async getConversationHistory(): Promise<Message[]> {
    if (this.closed) return [];
    
    const history = await this.dbService.getConversationHistory();
    return history.map(msg => ({ 
      role: msg.role, 
      content: msg.content 
    }));
  }
  
  async close(): Promise<void> {
    if (this.closed) return;
    
    console.log('Encerrando sessão');
    await this.dbService.close();
    this.closed = true;
    console.log('Sessão encerrada');
  }
  
  getSessionId(): string {
    return this.dbService.getSessionId();
  }
  
  isClosed(): boolean {
    return this.closed;
  }
}