export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface UserFact {
  id: string;
  fact: string;
  userId: string;
  timestamp: any;
  relevanceScore: number;
}
