import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { ArtifactData, ArtifactType, ToolCallData } from '@/types/types';
import { handleToolCalls } from '@/utils/toolCallHandler';

const MAX_VERSION_HISTORY = 50;
const MAX_ARTIFACTS = 5;

interface ArtifactInput {
  identifier?: string;
  type: ArtifactType;
  title: string;
  code: string;
  language?: string;
  createdAt?: string;
  operation?: string;
  revertToVersion?: number;
}

interface ToolCallInfo {
  operation: string;
  artifactType?: ArtifactType;
  artifactTitle?: string;
  revertToVersion?: number;
}

interface ArtifactOperationResult {
  artifactData?: ArtifactData;
  toolCallData?: ToolCallInfo;
  cleanContent: string;
}

export function useArtifactOperations() {
  const toast = useToast();
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([]);
  const [currentArtifactId, setCurrentArtifactId] = useState<string | null>(null);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const currentArtifact = artifacts.find(a => a.identifier === currentArtifactId) || null;

  const pruneArtifacts = useCallback((list: ArtifactData[]): { list: ArtifactData[]; pruned: number } => {
    if (list.length <= MAX_ARTIFACTS) return { list, pruned: 0 };
    const sorted = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const prunedCount = sorted.length - MAX_ARTIFACTS;
    const trimmed = sorted.slice(prunedCount);
    return { list: trimmed, pruned: prunedCount };
  }, []);

  const saveArtifactToDatabase = useCallback(async (artifactData: ArtifactData, conversationId: string | null): Promise<boolean> => {
    try {
      console.log('[Artifact Save] Attempting to save artifact:', {
        identifier: artifactData.identifier,
        type: artifactData.type,
        title: artifactData.title,
        conversationId,
      });

      const response = await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          identifier: artifactData.identifier,
          type: artifactData.type,
          title: artifactData.title,
          code: artifactData.code,
          language: artifactData.language,
          versions: artifactData.versions || null,
          currentVersion: artifactData.currentVersion || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Artifact Save] API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log('[Artifact Save] Success:', result);
      return true;
    } catch (error) {
      console.error('[Artifact Save] Exception:', error);
      return false;
    }
  }, []);

  const updateArtifactInDatabase = useCallback(async (artifactData: ArtifactData): Promise<boolean> => {
    try {
      console.log('[Artifact Update] Searching for existing artifact:', {
        identifier: artifactData.identifier,
        conversationId: currentConversationId,
      });

      if (!currentConversationId) {
        console.error('[Artifact Update] No conversation ID available');
        return false;
      }

      const searchResponse = await fetch(`/api/artifacts?conversationId=${currentConversationId}`);
      if (!searchResponse.ok) {
        console.error('[Artifact Update] Search failed:', searchResponse.status);
        throw new Error('Failed to search for artifact');
      }

      const data = await searchResponse.json();
      console.log('[Artifact Update] Search returned:', {
        totalArtifacts: data.artifacts?.length || 0,
        artifacts: data.artifacts?.map((a: any) => ({ id: a.id, identifier: a.identifier })),
      });

      let existingArtifact = data.artifacts?.find((a: { identifier: string }) => a.identifier === artifactData.identifier);

      if (!existingArtifact) {
        console.log('[Artifact Update] Not found in conversation, searching globally by identifier');
        const globalSearchResponse = await fetch(`/api/artifacts?identifier=${artifactData.identifier}`);
        if (globalSearchResponse.ok) {
          const globalData = await globalSearchResponse.json();
          existingArtifact = globalData.artifacts?.[0];
          if (existingArtifact) {
            console.log('[Artifact Update] Found artifact globally:', existingArtifact.id);
          }
        }
      }

      if (existingArtifact) {
        console.log('[Artifact Update] Found existing artifact, updating:', existingArtifact.id);

        const updateResponse = await fetch(`/api/artifacts/${existingArtifact.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: artifactData.title,
            code: artifactData.code,
            language: artifactData.language,
            versions: artifactData.versions,
            currentVersion: artifactData.currentVersion,
          }),
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('[Artifact Update] Update failed:', {
            status: updateResponse.status,
            error: errorText,
          });
          throw new Error(errorText);
        }

        const result = await updateResponse.json();
        console.log('[Artifact Update] Success:', result);
        return true;
      }

      console.warn('[Artifact Update] No existing artifact found, cannot update');
      return false;
    } catch (error) {
      console.error('[Artifact Update] Exception:', error);
      return false;
    }
  }, [currentConversationId]);

  const handleCreate = useCallback(async (artifact: ArtifactInput): Promise<ArtifactData | null> => {
    const artifactData: ArtifactData = {
      identifier: artifact.identifier || `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: artifact.type,
      title: artifact.title,
      code: artifact.code,
      language: artifact.language,
      createdAt: artifact.createdAt || new Date().toISOString(),
    };

    setArtifacts(prev => {
      const next = [...prev, artifactData];
      const { list, pruned } = pruneArtifacts(next);
      if (pruned > 0) {
        toast({
          title: 'Artifact Limit Reached',
          description: `Keeping newest ${MAX_ARTIFACTS} artifacts. Removed ${pruned} older item(s).`,
          status: 'info',
          duration: 2500,
          isClosable: true,
          position: 'top',
        });
      }
      return list;
    });
    setCurrentArtifactId(artifactData.identifier);
    setIsArtifactPanelOpen(true);

    const saved = await saveArtifactToDatabase(artifactData, currentConversationId);

    toast({
      title: saved ? 'Artifact Created' : 'Artifact Created (Save Failed)',
      description: saved
        ? `"${artifactData.title}" is ready to preview`
        : 'Created locally but failed to save to database',
      status: saved ? 'success' : 'warning',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    return artifactData;
  }, [pruneArtifacts, saveArtifactToDatabase, currentConversationId, toast]);

  const handleEdit = useCallback(async (artifact: ArtifactInput): Promise<ArtifactData | null> => {
    const targetIdentifier = (artifact.identifier && artifact.identifier !== 'current-artifact')
      ? artifact.identifier
      : currentArtifactId;
    const targetArtifact = artifacts.find(a => a.identifier === targetIdentifier);

    if (!targetArtifact) {
      return handleCreate(artifact);
    }

    const versions = targetArtifact.versions || [];
    const newVersion = {
      code: targetArtifact.code,
      timestamp: targetArtifact.updatedAt || targetArtifact.createdAt,
      description: `Version ${versions.length + 1}`,
      language: targetArtifact.language,
    };

    let limitedVersions = [...versions, newVersion];

    if (limitedVersions.length > MAX_VERSION_HISTORY) {
      limitedVersions = [
        limitedVersions[0],
        ...limitedVersions.slice(-(MAX_VERSION_HISTORY - 1))
      ];

      toast({
        title: 'Version History Pruned',
        description: `Keeping latest ${MAX_VERSION_HISTORY} versions`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    }

    const artifactData: ArtifactData = {
      ...targetArtifact,
      type: artifact.type,
      title: artifact.title,
      code: artifact.code,
      language: artifact.language,
      updatedAt: new Date().toISOString(),
      versions: limitedVersions,
      currentVersion: limitedVersions.length,
    };

    setArtifacts(prev => prev.map(a => a.identifier === artifactData.identifier ? artifactData : a));
    if (!isArtifactPanelOpen) {
      setIsArtifactPanelOpen(true);
    }

    const updated = await updateArtifactInDatabase(artifactData);

    toast({
      title: updated ? 'Artifact Updated' : 'Artifact Updated (Save Failed)',
      description: updated
        ? `"${artifactData.title}" - Version ${artifactData.currentVersion}`
        : 'Updated locally but failed to save to database',
      status: updated ? 'success' : 'warning',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    return artifactData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts, currentArtifactId, isArtifactPanelOpen, updateArtifactInDatabase, toast, handleCreate]);

  const handleRevert = async (targetVersion: number | undefined): Promise<ArtifactData | null> => {
    if (!currentArtifact) {
      toast({
        title: 'No Artifact',
        description: 'No artifact to revert',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }

    const versions = currentArtifact.versions || [];
    const totalVersions = versions.length + 1;

    if (targetVersion === undefined || targetVersion < 1 || targetVersion > totalVersions) {
      toast({
        title: 'Invalid Version',
        description: `Version ${targetVersion} does not exist. Available: 1-${totalVersions}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }

    if (targetVersion === totalVersions) {
      toast({
        title: 'Already Latest Version',
        description: 'This is the current version',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return currentArtifact;
    }

    const revertToVersion = versions[targetVersion - 1];

    const artifactData: ArtifactData = {
      ...currentArtifact,
      code: revertToVersion.code,
      language: revertToVersion.language || currentArtifact.language,
      updatedAt: new Date().toISOString(),
      currentVersion: targetVersion,
    };

    setArtifacts(prev => prev.map(a => a.identifier === artifactData.identifier ? artifactData : a));
    if (!isArtifactPanelOpen) {
      setIsArtifactPanelOpen(true);
    }

    const updated = await updateArtifactInDatabase(artifactData);

    toast({
      title: updated ? 'Artifact Reverted' : 'Artifact Reverted (Save Failed)',
      description: updated
        ? `Restored to Version ${targetVersion}`
        : 'Reverted locally but failed to save to database',
      status: updated ? 'info' : 'warning',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    return artifactData;
  };

  const handleDelete = useCallback((identifier?: string) => {
    const targetId = identifier || currentArtifactId;
    if (!targetId) return;

    setArtifacts(prev => prev.filter(a => a.identifier !== targetId));

    if (targetId === currentArtifactId) {
      const remaining = artifacts.filter(a => a.identifier !== targetId);
      if (remaining.length > 0) {
        setCurrentArtifactId(remaining[remaining.length - 1].identifier);
      } else {
        setCurrentArtifactId(null);
        setIsArtifactPanelOpen(false);
      }
    }

    toast({
      title: 'Artifact Deleted',
      description: 'The artifact has been removed',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  }, [artifacts, currentArtifactId, toast]);

  const processArtifactResponse = async (response: string, toolCalls?: ToolCallData[]): Promise<ArtifactOperationResult> => {
    let artifactData: ArtifactData | undefined;
    let toolCallData: ToolCallInfo | undefined;
    let cleanContent = response;

    if (toolCalls && toolCalls.length > 0) {
      const result = handleToolCalls(response, toolCalls, currentArtifact || undefined);
      artifactData = result.artifactData;
      toolCallData = result.toolCallData;
      cleanContent = result.cleanContent;

      if (toolCallData) {
        switch (toolCallData.operation) {
          case 'delete':
            handleDelete();
            break;
          case 'create':
            if (artifactData) {
              artifactData = await handleCreate(artifactData) || undefined;
            }
            break;
          case 'edit':
          case 'update_content':
            if (artifactData) {
              artifactData = await handleEdit(artifactData) || undefined;
            }
            break;
          case 'revert':
            artifactData = await handleRevert(toolCallData.revertToVersion) || undefined;
            break;
        }
      }
    }

    return { artifactData, toolCallData, cleanContent };
  };

  const resetArtifacts = useCallback(() => {
    setArtifacts([]);
    setCurrentArtifactId(null);
    setIsArtifactPanelOpen(false);
  }, []);

  const restoreArtifact = useCallback((artifactData: ArtifactData) => {
    setArtifacts(prev => {
      const exists = prev.some(a => a.identifier === artifactData.identifier);
      const next = exists
        ? prev.map(a => a.identifier === artifactData.identifier ? artifactData : a)
        : [...prev, artifactData];
      const { list, pruned } = pruneArtifacts(next);
      if (pruned > 0) {
        toast({
          title: 'Artifact Limit Reached',
          description: `Keeping newest ${MAX_ARTIFACTS} artifacts. Removed ${pruned} older item(s).`,
          status: 'info',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
      }
      return list;
    });
    setCurrentArtifactId(artifactData.identifier);
    setIsArtifactPanelOpen(true);
  }, [pruneArtifacts, toast]);

  const switchArtifact = useCallback((identifier: string) => {
    setCurrentArtifactId(identifier);
  }, []);

  const updateCurrentDocument = useCallback(async (markdown: string) => {
    if (!currentArtifact) return;

    const updated: ArtifactData = {
      ...currentArtifact,
      code: markdown,
      updatedAt: new Date().toISOString(),
    };

    setArtifacts(prev => prev.map(a => a.identifier === updated.identifier ? updated : a));
    if (!isArtifactPanelOpen) setIsArtifactPanelOpen(true);

    const ok = await updateArtifactInDatabase(updated);
    if (!ok) {
      toast({
        title: 'Autosave Failed',
        description: 'Changes saved locally. Will retry next update.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [currentArtifact, isArtifactPanelOpen, updateArtifactInDatabase, toast]);

  const deleteArtifact = useCallback((identifier: string) => {
    handleDelete(identifier);
  }, [handleDelete]);

  const saveCurrentArtifactVersion = useCallback(async () => {
    if (!currentArtifact) return null;

    const versions = currentArtifact.versions || [];
    const newVersion = {
      code: currentArtifact.code,
      timestamp: new Date().toISOString(),
      description: `Manual snapshot ${versions.length + 1}`,
      language: currentArtifact.language,
    };

    let limitedVersions = [...versions, newVersion];
    if (limitedVersions.length > MAX_VERSION_HISTORY) {
      limitedVersions = [
        limitedVersions[0],
        ...limitedVersions.slice(-(MAX_VERSION_HISTORY - 1)),
      ];
    }

    const updated: ArtifactData = {
      ...currentArtifact,
      versions: limitedVersions,
      currentVersion: limitedVersions.length,
      updatedAt: new Date().toISOString(),
    };

    setArtifacts(prev => prev.map(a => a.identifier === updated.identifier ? updated : a));
    if (!isArtifactPanelOpen) setIsArtifactPanelOpen(true);

    const ok = await updateArtifactInDatabase(updated);
    toast({
      title: ok ? 'Version Saved' : 'Version Saved (DB Failed)',
      description: ok ? `Snapshot v${updated.currentVersion}` : 'Saved locally but failed to persist',
      status: ok ? 'success' : 'warning',
      duration: 2500,
      isClosable: true,
      position: 'top',
    });

    return updated;
  }, [currentArtifact, isArtifactPanelOpen, updateArtifactInDatabase, toast]);

  const peekVersion = useCallback((version: number): ArtifactData | null => {
    if (!currentArtifact) return null;

    const versions = currentArtifact.versions || [];
    const totalVersions = versions.length + 1;

    if (version < 1 || version > totalVersions) return null;

    if (version === totalVersions) {
      return currentArtifact;
    }

    const versionData = versions[version - 1];
    return {
      ...currentArtifact,
      code: versionData.code,
      language: versionData.language || currentArtifact.language,
      currentVersion: version,
    };
  }, [currentArtifact]);
  return {
    currentArtifact,
    artifacts,
    isArtifactPanelOpen,
    setIsArtifactPanelOpen,
    setCurrentConversationId,
    processArtifactResponse,
    resetArtifacts,
    restoreArtifact,
    switchArtifact,
    deleteArtifact,
    revertToVersion: handleRevert,
    updateCurrentDocument,
    saveCurrentArtifactVersion,
    peekVersion,
  };
}
