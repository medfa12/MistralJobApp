import { artifactSystemPrompt } from './enhancedArtifactSystemPrompt';
import { reasoningArtifactSystemPrompt } from './reasoningArtifactSystemPrompt';

export function getSystemPromptForModel(model: string): string {
  const isReasoning = model.includes('magistral');
  const basePrompt = isReasoning ? reasoningArtifactSystemPrompt : artifactSystemPrompt;
  return `${basePrompt}\n\n[Model Identity] ${model}`;
}
