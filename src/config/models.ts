import { MdBolt, MdCode, MdPsychology, MdWork } from 'react-icons/md';
import { IconType } from 'react-icons';

export type AttachmentType = 'image' | 'audio' | 'document';

export interface AttachmentLimits {
  maxSize: number;
  maxCount: number;
  supportedFormats: string[];
  additionalInfo?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  contextWindow: number;
  maxOutput: number;
  pricing: {
    input: number;
    output: number;
  };
  features: string[];
  icon: IconType;
  color: string;
  version: string;
  apiEndpoint: string;
  supportedAttachments: AttachmentType[];
  attachmentLimits?: Partial<Record<AttachmentType, AttachmentLimits>>;
}

export const MISTRAL_MODELS: Record<string, ModelInfo> = {
  'magistral-medium-latest': {
    id: 'magistral-medium-latest',
    name: 'magistral-medium-latest',
    displayName: 'Magistral Medium',
    description: 'Advanced reasoning with vision support',
    contextWindow: 128000,
    maxOutput: 12288,
    pricing: {
      input: 1.00,
      output: 3.00,
    },
    features: ['Deep reasoning', 'Complex analysis', 'Enhanced thinking', 'Vision capable'],
    icon: MdPsychology,
    color: 'linear-gradient(15.46deg, #8E44AD 26.3%, #AB67DA 86.4%)',
    version: '25.09',
    apiEndpoint: 'magistral-medium-2509',
    supportedAttachments: ['image'],
    attachmentLimits: {
      image: {
        maxSize: 10,
        maxCount: 8,
        supportedFormats: ['PNG', 'JPEG', 'WEBP', 'GIF'],
        additionalInfo: 'Max resolution: 1024x1024'
      }
    }
  },
  'mistral-medium-latest': {
    id: 'mistral-medium-latest',
    name: 'mistral-medium-latest',
    displayName: 'Mistral Medium',
    description: 'Frontier-class multimodal model for general purpose work',
    contextWindow: 128000,
    maxOutput: 16384,
    pricing: {
      input: 1.20,
      output: 3.60,
    },
    features: ['Multimodal', 'Long context', 'High accuracy', 'Great balance of cost and quality'],
    icon: MdBolt,
    color: 'linear-gradient(15.46deg, #FA500F 26.3%, #FF8205 86.4%)',
    version: '25.08',
    apiEndpoint: 'mistral-medium-2508',
    supportedAttachments: ['image', 'document'],
    attachmentLimits: {
      image: {
        maxSize: 10,
        maxCount: 8,
        supportedFormats: ['PNG', 'JPEG', 'WEBP', 'GIF'],
        additionalInfo: 'Max resolution: 1540x1540'
      },
      document: {
        maxSize: 50,
        maxCount: 1,
        supportedFormats: ['PDF'],
        additionalInfo: 'Max 1,000 pages'
      }
    }
  },
  'codestral-latest': {
    id: 'codestral-latest',
    name: 'codestral-latest',
    displayName: 'Codestral',
    description: 'Specialized code model for FIM, completion, and test generation',
    contextWindow: 256000,
    maxOutput: 8192,
    pricing: {
      input: 0.60,
      output: 1.80,
    },
    features: ['Coding optimized', 'FIM support', 'Low latency'],
    icon: MdCode,
    color: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    version: '25.08',
    apiEndpoint: 'codestral-2508',
    supportedAttachments: [],
  },
  'devstral-medium-latest': {
    id: 'devstral-medium-latest',
    name: 'devstral-medium-latest',
    displayName: 'Devstral Medium',
    description: 'Agentic model tuned for tool use and software engineering tasks',
    contextWindow: 128000,
    maxOutput: 12288,
    pricing: {
      input: 1.20,
      output: 3.60,
    },
    features: ['Tool use', 'Codebase navigation', 'Change planning'],
    icon: MdWork,
    color: 'linear-gradient(135deg, #0EA5E9 0%, #22D3EE 100%)',
    version: '25.07',
    apiEndpoint: 'devstral-medium-2507',
    supportedAttachments: [],
  },
};

export const getModelInfo = (modelId: string): ModelInfo | undefined => {
  return MISTRAL_MODELS[modelId];
};

export const formatContextWindow = (tokens: number): string => {
  if (tokens >= 1000) {
    return `${tokens / 1000}K`;
  }
  return `${tokens}`;
};

export const formatPricing = (price: number): string => {
  return `$${price.toFixed(2)}`;
};
