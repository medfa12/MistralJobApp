export type MistralModel =
  | 'mistral-small-latest'
  | 'mistral-medium-latest'
  | 'mistral-large-latest'
  | 'magistral-small-latest'
  | 'magistral-medium-latest';

export type MessageContent = 
  | string 
  | Array<{
      type: 'text' | 'image_url' | 'document_url';
      text?: string;
      image_url?: string;
      document_url?: string;
    }>;

export interface Attachment {
  id?: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  createdAt?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
  attachments?: Attachment[];
}

export interface ChatBody {
  inputCode?: string;
  messages?: Message[];
  model: MistralModel;
  apiKey?: string | undefined | null;
}
