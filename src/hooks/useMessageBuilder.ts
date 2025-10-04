import { useCallback } from 'react';
import { Message as MessageType, InspectedCodeAttachment, ArtifactData } from '@/types/types';
import { buildArtifactContext, getToolSuggestion } from '@/utils/artifactHelpers';
import { artifactSystemPrompt } from '@/utils/enhancedArtifactSystemPrompt';

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
}

export function useMessageBuilder() {
  const buildUserMessageContent = useCallback((
    options: BuildMessageOptions
  ): any => {
    let { currentInput, inspectedCodeAttachment, attachmentContent } = options;
    let userMessageContent: any = currentInput;

    // Add inspected code if available
    if (inspectedCodeAttachment) {
      userMessageContent += `\n\n---\n**Inspected Element:** <${inspectedCodeAttachment.elementTag}>${inspectedCodeAttachment.elementId ? ` #${inspectedCodeAttachment.elementId}` : ''}${inspectedCodeAttachment.elementClasses ? ` .${inspectedCodeAttachment.elementClasses}` : ''}\n\n\`\`\`${inspectedCodeAttachment.sourceArtifactId.includes('react') ? 'jsx' : 'html'}\n${inspectedCodeAttachment.code}\n\`\`\`${inspectedCodeAttachment.styles ? `\n\n**Styles:** ${inspectedCodeAttachment.styles}` : ''}`;
    }

    // If there are attachments, convert to array format
    if (attachmentContent && attachmentContent.length > 0) {
      userMessageContent = [{ type: 'text', text: currentInput }, ...attachmentContent];
    }

    return userMessageContent;
  }, []);

  const buildApiMessages = useCallback((
    options: BuildApiMessagesOptions
  ): any[] => {
    const { messages, userMessageContent, currentArtifact } = options;

    const artifactContext = buildArtifactContext(currentArtifact);
    const toolSuggestion = getToolSuggestion(!!currentArtifact);
    const systemPromptWithToolContext = artifactSystemPrompt + toolSuggestion;

    return [
      { role: 'system' as const, content: systemPromptWithToolContext },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { 
        role: 'user' as const, 
        content: userMessageContent + artifactContext
      }
    ];
  }, []);

  return {
    buildUserMessageContent,
    buildApiMessages,
  };
}

