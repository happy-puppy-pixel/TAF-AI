import { Injectable, signal } from '@angular/core';
import { ChatSession, Message } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  sessions = signal<ChatSession[]>([]);
  activeSessionId = signal<string | null>(null);

  get activeSession(): ChatSession | undefined {
    return this.sessions().find(s => s.id === this.activeSessionId());
  }

  createSession(): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      messages: [],
      createdAt: new Date()
    };
    this.sessions.update(s => [session, ...s]);
    this.activeSessionId.set(session.id);
    return session;
  }

  setActive(id: string) {
    this.activeSessionId.set(id);
  }

  deleteSession(id: string) {
    this.sessions.update(s => s.filter(x => x.id !== id));
    if (this.activeSessionId() === id) {
      const remaining = this.sessions();
      this.activeSessionId.set(remaining.length ? remaining[0].id : null);
    }
  }

  addMessage(sessionId: string, message: Message) {
    this.sessions.update(sessions =>
      sessions.map(s => {
        if (s.id !== sessionId) return s;
        // Auto-title from first user message
        const title = s.messages.length === 0 && message.role === 'user'
          ? message.text.substring(0, 40) + (message.text.length > 40 ? '...' : '')
          : s.title;
        return { ...s, title, messages: [...s.messages, message] };
      })
    );
  }

  appendToLastAiMessage(sessionId: string, chunk: string) {
    this.sessions.update(sessions =>
      sessions.map(s => {
        if (s.id !== sessionId) return s;
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.role === 'ai') {
          msgs[msgs.length - 1] = { ...last, text: last.text + chunk, isTyping: false };
        }
        return { ...s, messages: msgs };
      })
    );
  }

  updateLastAiTyping(sessionId: string, typing: boolean) {
    this.sessions.update(sessions =>
      sessions.map(s => {
        if (s.id !== sessionId) return s;
        const msgs = [...s.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.role === 'ai') {
          msgs[msgs.length - 1] = { ...last, isTyping: typing };
        }
        return { ...s, messages: msgs };
      })
    );
  }

  todaySessions(): ChatSession[] {
    const today = new Date();
    return this.sessions().filter(s => {
      const d = new Date(s.createdAt);
      return d.toDateString() === today.toDateString();
    });
  }

  olderSessions(): ChatSession[] {
    const today = new Date();
    return this.sessions().filter(s => {
      const d = new Date(s.createdAt);
      return d.toDateString() !== today.toDateString();
    });
  }
}
