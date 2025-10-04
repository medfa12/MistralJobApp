export interface StreamingState {
  isGeneratingArtifact: boolean;
  artifactLoadingInfo: { operation: string; title?: string } | null;
}

export function detectArtifactInStream(
  accumulatedResponse: string,
  currentState: StreamingState
): StreamingState {
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

