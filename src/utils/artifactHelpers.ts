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
${'' /* Intentionally omit DELETE from the visible operations to reduce accidental deletions */}
- CREATE: You may also create additional artifacts; do not delete existing ones unless the user explicitly asks.
---`;
}

export function getToolSuggestion(hasArtifact: boolean): string {
  if (hasArtifact) {
    return `\n\n[System Context: User has an active artifact. If they're asking to modify/improve/add features, use <artifact operation=\"edit\">. If they want to undo changes, use <artifact operation=\"revert\" version=\"N\">. Do not delete unless the user explicitly says so (e.g., \"delete\", \"remove\").]`;
  }
  return `\n\n[System Context: No artifact exists. If the user requests a component/widget/document/interactive demo, use <artifact operation=\"create\"> with a supported type.]`;
}
