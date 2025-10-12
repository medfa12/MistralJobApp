import { ArtifactData, ToolCallData } from '@/types/types';
import { ArtifactToolName } from '@/config/artifactTools';

export interface ToolCallResult {
  artifactData?: ArtifactData;
  toolCallData?: any;
  cleanContent: string;
  toolCalls?: ToolCallData[];
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

      case 'update_content':
        if (currentArtifact && (currentArtifact.type === 'markdown' || currentArtifact.type === 'document')) {
          artifactData = {
            ...currentArtifact,
            code: args.content,
            updatedAt: new Date().toISOString(),
          };
          toolCallData = {
            operation: 'update_content',
          };
        }
        break;
    }
  }

  return {
    artifactData,
    toolCallData,
    cleanContent: response,
    toolCalls,
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
