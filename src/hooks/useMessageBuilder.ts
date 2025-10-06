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
  inspectedCodeAttachment?: InspectedCodeAttachment | null;
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
    const { messages, userMessageContent, currentArtifact, inspectedCodeAttachment } = options;

    const artifactContext = buildArtifactContext(currentArtifact);
    const toolSuggestion = getToolSuggestion(!!currentArtifact);
    const systemPromptWithToolContext = artifactSystemPrompt + toolSuggestion;

    let inspectedCodeContext = '';
    if (inspectedCodeAttachment) {
      inspectedCodeContext = `\n\n---\n**Inspected Element (Reference Code - NOT a complete artifact):**\nElement: <${inspectedCodeAttachment.elementTag}>${inspectedCodeAttachment.elementId ? ` #${inspectedCodeAttachment.elementId}` : ''}${inspectedCodeAttachment.elementClasses ? ` .${inspectedCodeAttachment.elementClasses}` : ''}\nSource: ${inspectedCodeAttachment.sourceArtifactId}\n\n\`\`\`${inspectedCodeAttachment.sourceArtifactId.includes('react') ? 'jsx' : 'html'}\n${inspectedCodeAttachment.code}\n\`\`\`${inspectedCodeAttachment.styles ? `\n\n**Styles:** ${inspectedCodeAttachment.styles}` : ''}\n\nNote: This is a code snippet for reference. When creating React artifacts, always include: window.App = YourComponent\n---`;
    }

    const finalUserContent = typeof userMessageContent === 'string' 
      ? userMessageContent + inspectedCodeContext + artifactContext
      : Array.isArray(userMessageContent)
        ? [{ type: 'text', text: userMessageContent[0].text + inspectedCodeContext + artifactContext }, ...userMessageContent.slice(1)]
        : userMessageContent + inspectedCodeContext + artifactContext;

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

