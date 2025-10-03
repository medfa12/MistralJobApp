import { MdAutoAwesome, MdBolt, MdPsychology } from 'react-icons/md';
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
  'mistral-small-latest': {
    id: 'mistral-small-latest',
    name: 'mistral-small-latest',
    displayName: 'Mistral Small',
    description: 'Fast and efficient for simple tasks with vision support',
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: {
      input: 0.20,
      output: 0.60,
    },
    features: ['Fast responses', 'Cost-effective', 'General purpose', 'Vision & Document QnA'],
    icon: MdAutoAwesome,
    color: 'linear-gradient(15.46deg, #FFA500 26.3%, #FFD700 86.4%)',
    version: '25.06',
    apiEndpoint: 'mistral-small-2506',
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
  'mistral-large-latest': {
    id: 'mistral-large-latest',
    name: 'mistral-large-latest',
    displayName: 'Mistral Medium',
    description: 'Most capable multimodal model for complex tasks',
    contextWindow: 128000,
    maxOutput: 16384,
    pricing: {
      input: 2.00,
      output: 6.00,
    },
    features: ['Advanced reasoning', 'Long context', 'High accuracy', 'Vision & Document QnA'],
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
  'magistral-small-latest': {
    id: 'magistral-small-latest',
    name: 'magistral-small-latest',
    displayName: 'Magistral Small',
    description: 'Reasoning model with vision support',
    contextWindow: 128000,
    maxOutput: 8192,
    pricing: {
      input: 0.40,
      output: 1.20,
    },
    features: ['Step-by-step reasoning', 'Transparent thinking', 'Problem solving', 'Vision capable'],
    icon: MdPsychology,
    color: 'linear-gradient(15.46deg, #9B59B6 26.3%, #BB69D6 86.4%)',
    version: '25.09',
    apiEndpoint: 'magistral-small-2509',
    supportedAttachments: ['image'],
    attachmentLimits: {
      image: {
        maxSize: 10,
        maxCount: 8,
        supportedFormats: ['PNG', 'JPEG', 'WEBP', 'GIF'],
        additionalInfo: 'Max resolution: 1540x1540'
      }
    }
  },
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

