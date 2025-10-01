export type ArtifactType = 'react' | 'html' | 'vue' | 'javascript' | 'css';
export type ArtifactTab = 'code' | 'preview';

export interface ArtifactData {
  code: string;
  type: ArtifactType;
  language?: string;
}

export interface InspectedElement {
  tagName: string;
  id?: string;
  className?: string;
  styles?: CSSStyleDeclaration;
  dimensions?: {
    width: number;
    height: number;
  };
  position?: {
    x: number;
    y: number;
  };
  path?: string[];
  attributes?: { [key: string]: string };
}

