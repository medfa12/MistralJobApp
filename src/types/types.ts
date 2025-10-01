export type MistralModel =
  | 'mistral-small-latest'
  | 'mistral-medium-latest'
  | 'mistral-large-latest'
  | 'magistral-small-latest'
  | 'magistral-medium-latest';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatBody {
  inputCode?: string; // Deprecated, kept for backward compatibility
  messages?: Message[];
  model: MistralModel;
  apiKey?: string | undefined | null;
}
