import { ToolCallData } from '@/types/types';

export interface StreamingState {
  isGeneratingArtifact: boolean;
  artifactLoadingInfo: { operation: string; title?: string } | null;
  toolCalls?: ToolCallData[];
}

export function detectArtifactInStream(
  accumulatedResponse: string,
  currentState: StreamingState
): StreamingState {
  const toolCallMatch = accumulatedResponse.match(/__TOOL_CALLS__:(.+)/);
  if (toolCallMatch) {
    try {
      const toolCallData = JSON.parse(toolCallMatch[1]);
      const toolCalls = toolCallData.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        const firstCall = toolCalls[0];
        const functionName = firstCall.function?.name;
        
        let operation = 'unknown';
        let title: string | undefined;

        try {
          const args = JSON.parse(firstCall.function?.arguments || '{}');
          
          if (functionName === 'create_artifact') {
            operation = 'create';
            title = args.title;
          } else if (functionName === 'edit_artifact') {
            operation = 'edit';
            title = args.title;
          } else if (functionName === 'delete_artifact') {
            operation = 'delete';
          } else if (functionName === 'revert_artifact') {
            operation = 'revert';
          } else if (functionName === 'insert_section') {
            operation = 'insert_section';
            title = args.heading;
          } else if (functionName === 'update_section') {
            operation = 'update_section';
            title = args.heading;
          } else if (functionName === 'delete_section') {
            operation = 'delete_section';
            title = args.heading;
          } else if (functionName === 'apply_formatting') {
            operation = 'apply_formatting';
          }
        } catch (e) {
          console.warn('Failed to parse tool call arguments:', e);
        }

        return {
          isGeneratingArtifact: true,
          artifactLoadingInfo: { operation, title },
          toolCalls,
        };
      }
    } catch (e) {
      console.warn('Failed to parse tool calls:', e);
    }
  }

  const hasArtifactTag = /<artifact[^>]*>/i.test(accumulatedResponse);

  if (hasArtifactTag) {
    const artifactMatch = accumulatedResponse.match(
      /<artifact\s+operation="([^"]+)"(?:\s+type="([^"]+)")?(?:\s+title="([^"]+)")?/i
    );

    if (artifactMatch && !currentState.isGeneratingArtifact) {
      return {
        isGeneratingArtifact: true,
        artifactLoadingInfo: {
          operation: artifactMatch[1],
          title: artifactMatch[3] || undefined,
        },
      };
    }

    return {
      isGeneratingArtifact: true,
      artifactLoadingInfo: currentState.artifactLoadingInfo,
    };
  }

  return {
    isGeneratingArtifact: false,
    artifactLoadingInfo: null,
  };
}

