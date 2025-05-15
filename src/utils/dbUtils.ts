import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class ConversationDB {
  private db: Database | null = null;
  private sessionId: string;
  private readonly dbDir = './db';
  private readonly dbPath: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.dbPath = path.join(this.dbDir, 'conversations.db');
  }

  async initialize(): Promise<void> {
    // Ensure the db directory exists
    if (!fs.existsSync(this.dbDir)) {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }

    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);
  }

  async addMessage(role: 'system' | 'user' | 'assistant', content: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database não inicializado');
    }

    await this.db.run(
      'INSERT INTO conversations (session_id, role, content, timestamp) VALUES (?, ?, ?, ?)',
      [this.sessionId, role, content, Date.now()]
    );
  }

  async getConversationHistory(): Promise<Message[]> {
    if (!this.db) {
      throw new Error('Database não inicializado');
    }

    return this.db.all<Message[]>(
      'SELECT role, content, timestamp FROM conversations WHERE session_id = ? ORDER BY timestamp ASC',
      [this.sessionId]
    );
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}