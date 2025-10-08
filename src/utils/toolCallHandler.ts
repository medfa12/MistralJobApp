import { ArtifactData, ToolCallData } from '@/types/types';
import { ArtifactToolName } from '@/config/artifactTools';
import {
  insertSection,
  updateSection,
  deleteSection,
  applyFormatting,
} from './documentSectionParser';

export interface ToolCallResult {
  artifactData?: ArtifactData;
  toolCallData?: any;
  cleanContent: string;
  toolCalls?: ToolCallData[];
  documentModified?: boolean;
  modifiedSections?: string[];
}

export function handleToolCalls(
  response: string,
  toolCalls?: ToolCallData[],
  currentArtifact?: ArtifactData
): ToolCallResult {
  if (!toolCalls || toolCalls.length === 0) {
    return {
      cleanContent: response,
    };
  }

  let artifactData: ArtifactData | undefined;
  let toolCallData: any;
  let documentModified = false;
  let modifiedSections: string[] = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name as ArtifactToolName;
    const args = JSON.parse(toolCall.function.arguments);

    switch (functionName) {
      case 'create_artifact':
        artifactData = {
          identifier: `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: args.type,
          title: args.title,
          code: args.code,
          language: args.language || getLanguageFromType(args.type),
          createdAt: new Date().toISOString(),
        };
        toolCallData = {
          operation: 'create',
          artifactType: args.type,
          artifactTitle: args.title,
        };
        break;

      case 'edit_artifact':
        artifactData = {
          // Allow targeting by provided identifier; otherwise edit current
          identifier: (args.identifier && typeof args.identifier === 'string') ? args.identifier : (currentArtifact?.identifier || 'current-artifact'),
          type: args.type,
          title: args.title,
          code: args.code,
          language: args.language || getLanguageFromType(args.type),
          createdAt: new Date().toISOString(),
        };
        toolCallData = {
          operation: 'edit',
          artifactType: args.type,
          artifactTitle: args.title,
        };
        break;

      case 'delete_artifact':
        toolCallData = {
          operation: 'delete',
        };
        break;

      case 'revert_artifact':
        toolCallData = {
          operation: 'revert',
          revertToVersion: args.version,
        };
        break;

      case 'insert_section':
        if (currentArtifact && (currentArtifact.type === 'markdown' || currentArtifact.type === 'document')) {
          const updatedMarkdown = insertSection(
            currentArtifact.code,
            { heading: args.heading, content: args.content },
            args.position,
            args.afterHeading
          );
          artifactData = {
            ...currentArtifact,
            code: updatedMarkdown,
            updatedAt: new Date().toISOString(),
          };
          documentModified = true;
          modifiedSections.push(args.heading);
          toolCallData = {
            operation: 'insert_section',
            heading: args.heading,
            position: args.position,
          };
        }
        break;

      case 'update_section':
        if (currentArtifact && (currentArtifact.type === 'markdown' || currentArtifact.type === 'document')) {
          const updatedMarkdown = updateSection(
            currentArtifact.code,
            args.heading,
            args.newContent,
            args.mode || 'replace'
          );
          artifactData = {
            ...currentArtifact,
            code: updatedMarkdown,
            updatedAt: new Date().toISOString(),
          };
          documentModified = true;
          modifiedSections.push(args.heading);
          toolCallData = {
            operation: 'update_section',
            heading: args.heading,
            mode: args.mode,
          };
        }
        break;

      case 'delete_section':
        if (currentArtifact && (currentArtifact.type === 'markdown' || currentArtifact.type === 'document')) {
          const updatedMarkdown = deleteSection(currentArtifact.code, args.heading);
          artifactData = {
            ...currentArtifact,
            code: updatedMarkdown,
            updatedAt: new Date().toISOString(),
          };
          documentModified = true;
          toolCallData = {
            operation: 'delete_section',
            heading: args.heading,
          };
        }
        break;

      case 'apply_formatting':
        if (currentArtifact && (currentArtifact.type === 'markdown' || currentArtifact.type === 'document')) {
          const updatedMarkdown = applyFormatting(
            currentArtifact.code,
            args.section,
            args.action,
            args.target
          );
          artifactData = {
            ...currentArtifact,
            code: updatedMarkdown,
            updatedAt: new Date().toISOString(),
          };
          documentModified = true;
          if (args.section !== 'all') {
            modifiedSections.push(args.section);
          }
          toolCallData = {
            operation: 'apply_formatting',
            section: args.section,
            action: args.action,
          };
        }
        break;
    }
  }

  // Add modified sections to artifact data
  if (artifactData && documentModified && modifiedSections.length > 0) {
    artifactData.aiModifiedSections = modifiedSections;
  }

  return {
    artifactData,
    toolCallData,
    cleanContent: response,
    toolCalls,
    documentModified,
    modifiedSections,
  };
}

function getLanguageFromType(type: string): string {
  const languageMap: Record<string, string> = {
    react: 'jsx',
    html: 'html',
    javascript: 'javascript',
    vue: 'javascript',
    markdown: 'markdown',
    document: 'markdown',
  };
  return languageMap[type] || 'javascript';
}
