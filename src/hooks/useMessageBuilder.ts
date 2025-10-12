import { useCallback } from 'react';
import { Message as MessageType, InspectedCodeAttachment, ArtifactData, ToolCall, MistralModel } from '@/types/types';
import { buildArtifactContext, getToolSuggestion } from '@/utils/artifactHelpers';
import { getSystemPromptForModel } from '@/utils/systemPrompt';

interface BuildMessageOptions {
  currentInput: string;
  inspectedCodeAttachment: InspectedCodeAttachment | null;
  currentArtifact: ArtifactData | null;
  attachmentContent?: any[];
}

interface BuildApiMessagesOptions {
  messages: MessageType[];
  userMessageContent: any;
  currentArtifact: ArtifactData | null;
  inspectedCodeAttachment?: InspectedCodeAttachment | null;
  model: MistralModel;
}

export function useMessageBuilder() {
  const buildUserMessageContent = useCallback((
    options: BuildMessageOptions
  ): any => {
    let { currentInput, attachmentContent } = options;
    let userMessageContent: any = currentInput;

    if (attachmentContent && attachmentContent.length > 0) {
      userMessageContent = [{ type: 'text', text: currentInput }, ...attachmentContent];
    }

    return userMessageContent;
  }, []);

  const buildApiMessages = useCallback((
    options: BuildApiMessagesOptions
  ): any[] => {
    const { messages, userMessageContent, currentArtifact, inspectedCodeAttachment, model } = options;

    const basePrompt = getSystemPromptForModel(model);

    const lastAssistantWithTool = [...messages].reverse().find((m) => m.role === 'assistant' && !!m.toolCall) as (MessageType | undefined);
    const lastToolOp = (lastAssistantWithTool?.toolCall as ToolCall | undefined)?.operation;

    const userText = typeof userMessageContent === 'string'
      ? userMessageContent
      : Array.isArray(userMessageContent) && userMessageContent.length > 0 && userMessageContent[0]?.type === 'text'
      ? userMessageContent[0].text || ''
      : '';

    const userMentionsArtifact = /\bartifact(s)?\b/i.test(userText);
    const hadRecentToolCall = !!lastAssistantWithTool;
    const isDeleteOp = lastToolOp === 'delete';

    const shouldAppendToolSuggestion = userMentionsArtifact || hadRecentToolCall;
    const shouldAppendArtifactContext = !!currentArtifact && shouldAppendToolSuggestion && !isDeleteOp;

    const artifactContext = shouldAppendArtifactContext ? buildArtifactContext(currentArtifact) : '';
    const toolSuggestion = shouldAppendToolSuggestion ? getToolSuggestion(!!currentArtifact) : '';
    const systemPromptWithToolContext = basePrompt + toolSuggestion;

    let inspectedCodeContext = '';
    if (inspectedCodeAttachment) {
      inspectedCodeContext = `\n\n---\n**Inspected Element (Reference Code - NOT a complete artifact):**\nElement: <${inspectedCodeAttachment.elementTag}>${inspectedCodeAttachment.elementId ? ` #${inspectedCodeAttachment.elementId}` : ''}${inspectedCodeAttachment.elementClasses ? ` .${inspectedCodeAttachment.elementClasses}` : ''}\nSource: ${inspectedCodeAttachment.sourceArtifactId}\n\n\`\`\`${inspectedCodeAttachment.sourceArtifactId.includes('react') ? 'jsx' : 'html'}\n${inspectedCodeAttachment.code}\n\`\`\`${inspectedCodeAttachment.styles ? `\n\n**Styles:** ${inspectedCodeAttachment.styles}` : ''}\n\nNote: This is a code snippet for reference. When creating React artifacts, always include: window.App = YourComponent\n---`;
    }

    const finalUserContent = typeof userMessageContent === 'string'
      ? userMessageContent + inspectedCodeContext + artifactContext
      : Array.isArray(userMessageContent)
        ? [{ type: 'text', text: (userMessageContent[0].text || '') + inspectedCodeContext + artifactContext }, ...userMessageContent.slice(1)]
        : userMessageContent;

    return [
      { role: 'system' as const, content: systemPromptWithToolContext },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { 
        role: 'user' as const, 
        content: finalUserContent
      }
    ];
  }, []);

  return {
    buildUserMessageContent,
    buildApiMessages,
  };
}
