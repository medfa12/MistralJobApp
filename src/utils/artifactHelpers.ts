import { ArtifactData } from '@/types/types';

export function buildArtifactContext(artifact: ArtifactData | null): string {
  if (!artifact) return '';

  return `\n\n---
**CURRENT ARTIFACT CONTEXT**
Title: "${artifact.title}"
Type: ${artifact.type}
Version: ${artifact.currentVersion || (artifact.versions ? artifact.versions.length + 1 : 1)}
${artifact.versions && artifact.versions.length > 0 ? `Previous Versions: ${artifact.versions.length}` : ''}

Current Code:
\`\`\`${artifact.language || artifact.type}
${artifact.code}
\`\`\`

Available Operations:
- EDIT: Modify the artifact (provide complete updated code)
${artifact.versions && artifact.versions.length > 0 ? `- REVERT: Go back to version 1-${artifact.versions.length}` : ''}
${'' }
- CREATE: You may also create additional artifacts; do not delete existing ones unless the user explicitly asks.
---`;
}

export function getToolSuggestion(hasArtifact: boolean): string {
  if (hasArtifact) {
    return `\n\n[System Context: User has an active artifact. If they're asking to modify/improve/add features, use the edit_artifact tool. If they want to undo changes, use the revert_artifact tool. For quick markdown/document updates, use update_content. Do not delete unless the user explicitly says so (e.g., "delete", "remove").]`;
  }
  return `\n\n[System Context: No artifact exists. If the user requests a component/widget/document/interactive demo, use the create_artifact tool with a supported type (react, html, javascript, vue, markdown, document).]`;
}
