// src/app/models/chat.model.ts
export interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface Etudiant {
  apogee: string;
  nom: string;
  prenom: string;
  filiere: string;
  niveau: string;
  note: number;
}
