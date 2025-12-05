import { ToolCallData } from '@/types/types';

export interface StreamingState {
  isGeneratingArtifact: boolean;
  artifactLoadingInfo: { operation: string; title?: string; type?: string } | null;
  toolCalls?: ToolCallData[];
  streamingArtifactCode?: string;
}

export interface StreamMetrics {
  chars?: number;
  tokens: number;
  elapsedMs: number;
  tps: number;
  ts: number;
  done?: boolean;
  phase?: 'text' | 'tool';
}

export const TOOL_CALL_DELIMITER = '__TOOL_CALLS__:';
export const STREAM_METRICS_MARKER = '__STREAM_METRICS__:';

export function extractStreamMetrics(buffer: string): { metrics: StreamMetrics | null; cleanBuffer: string } {
  const regex = new RegExp(`${STREAM_METRICS_MARKER}(\\{[^}]+\\})\\n?`, 'g');
  let lastMetrics: StreamMetrics | null = null;
  let match;

  while ((match = regex.exec(buffer)) !== null) {
    try {
      lastMetrics = JSON.parse(match[1]);
    } catch {
      // Invalid JSON, skip
    }
  }

  const cleanBuffer = buffer.replace(regex, '');
  return { metrics: lastMetrics, cleanBuffer };
}

export function isToolCallComplete(buffer: string): boolean {
  const delimiterIndex = buffer.indexOf(TOOL_CALL_DELIMITER);
  if (delimiterIndex === -1) return false;

  const jsonPart = buffer.slice(delimiterIndex + TOOL_CALL_DELIMITER.length);
  if (!jsonPart.trim()) return false;

  try {
    JSON.parse(jsonPart);
    return true;
  } catch {
    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (const char of jsonPart) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
    }

    return braceCount === 0 && jsonPart.includes('}');
  }
}

export function extractToolCallData(buffer: string): { toolCallJson: string | null; textContent: string } {
  const delimiterIndex = buffer.indexOf(TOOL_CALL_DELIMITER);

  if (delimiterIndex === -1) {
    return { toolCallJson: null, textContent: buffer };
  }

  const textContent = buffer.slice(0, delimiterIndex);
  const toolCallJson = buffer.slice(delimiterIndex + TOOL_CALL_DELIMITER.length);

  return { toolCallJson, textContent };
}

const OPERATION_MAP: Record<string, string> = {
  'create_artifact': 'create',
  'edit_artifact': 'edit',
  'delete_artifact': 'delete',
  'revert_artifact': 'revert',
  'insert_section': 'insert_section',
  'update_section': 'update_section',
  'delete_section': 'delete_section',
  'apply_formatting': 'apply_formatting',
};

export function detectArtifactInStream(
  accumulatedResponse: string,
  currentState: StreamingState
): StreamingState {
  if (!isToolCallComplete(accumulatedResponse)) {
    if (accumulatedResponse.includes(TOOL_CALL_DELIMITER)) {
      return {
        isGeneratingArtifact: true,
        artifactLoadingInfo: { operation: 'processing' },
        streamingArtifactCode: undefined,
      };
    }
    return {
      isGeneratingArtifact: false,
      artifactLoadingInfo: null,
      streamingArtifactCode: undefined,
    };
  }

  const { toolCallJson } = extractToolCallData(accumulatedResponse);

  if (!toolCallJson) {
    return {
      isGeneratingArtifact: false,
      artifactLoadingInfo: null,
      streamingArtifactCode: undefined,
    };
  }

  try {
    const toolCallData = JSON.parse(toolCallJson);
    const toolCalls = toolCallData.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const firstCall = toolCalls[0];
      const functionName = firstCall.function?.name;
      const operation = OPERATION_MAP[functionName] || 'unknown';

      let title: string | undefined;
      let type: string | undefined;
      let streamingCode: string | undefined;

      try {
        const args = JSON.parse(firstCall.function?.arguments || '{}');

        if (['create_artifact', 'edit_artifact'].includes(functionName)) {
          title = args.title;
          type = args.type;
          streamingCode = args.content;
        } else if (['insert_section', 'update_section'].includes(functionName)) {
          title = args.heading;
          streamingCode = args.content;
        } else if (functionName === 'delete_section') {
          title = args.heading;
        }
      } catch {
        // Arguments parsing failed, continue with defaults
      }

      return {
        isGeneratingArtifact: true,
        artifactLoadingInfo: { operation, title, type },
        toolCalls,
        streamingArtifactCode: streamingCode,
      };
    }
  } catch {
    // Tool call parsing failed
  }

  return {
    isGeneratingArtifact: false,
    artifactLoadingInfo: null,
    streamingArtifactCode: undefined,
  };
}
