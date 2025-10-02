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
  artifact?: ArtifactData;
}

export interface ChatBody {
  inputCode?: string;
  messages?: Message[];
  model: MistralModel;
  apiKey?: string | undefined | null;
}

// Artifact Types
export type ArtifactType = 'react' | 'html' | 'javascript' | 'vue';

export interface ArtifactData {
  identifier: string;      // Unique ID for the artifact
  type: ArtifactType;      // Type of artifact
  title: string;           // Display title
  code: string;            // The actual code
  language?: string;       // Code language for syntax highlighting
  createdAt: string;       // ISO timestamp
  updatedAt?: string;      // ISO timestamp for updates
}

export interface InspectedCodeAttachment {
  type: 'inspected-code';
  elementTag: string;      // HTML tag name (button, div, etc.)
  elementId?: string;      // Element ID if available
  elementClasses?: string; // Element classes
  code: string;            // Extracted HTML/JSX
  styles?: string;         // Computed styles
  sourceArtifactId: string; // Which artifact this came from
}
