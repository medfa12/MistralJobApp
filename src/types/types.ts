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
  toolCall?: ToolCall;
  inspectedCodeAttachment?: InspectedCodeAttachment;
}

export interface ChatBody {
  inputCode?: string;
  messages?: Message[];
  model: MistralModel;
  apiKey?: string | undefined | null;
  projectId?: string;
  libraryId?: string;
}

// Artifact Types
export type ArtifactType = 'react' | 'html' | 'javascript' | 'vue' | 'markdown' | 'document';
export type ArtifactOperation = 'create' | 'edit' | 'delete' | 'revert';

export interface ArtifactVersion {
  code: string;
  timestamp: string;
  description?: string;
  language?: string;
}

export interface ArtifactData {
  identifier: string;      // Unique ID for the artifact
  type: ArtifactType;      // Type of artifact
  title: string;           // Display title
  code: string;            // The actual code (for documents, this is markdown)
  language?: string;       // Code language for syntax highlighting
  createdAt: string;       // ISO timestamp
  updatedAt?: string;      // ISO timestamp for updates
  versions?: ArtifactVersion[]; // Version history
  currentVersion?: number; // Index of current version
  aiModifiedSections?: string[]; // For documents: sections recently modified by AI
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

export interface ToolCall {
  operation: ArtifactOperation;
  artifactType?: ArtifactType;
  artifactTitle?: string;
  revertToVersion?: number;
}

export interface ToolCallData {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
