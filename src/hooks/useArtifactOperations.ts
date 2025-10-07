import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { ArtifactData, ArtifactType, ToolCallData } from '@/types/types';
import { parseArtifacts, hasArtifacts } from '@/utils/artifactParser';
import { handleToolCalls } from '@/utils/toolCallHandler';

const MAX_VERSION_HISTORY = 50;

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

  // Get current artifact from the list
  const currentArtifact = artifacts.find(a => a.identifier === currentArtifactId) || null;

  const saveArtifactToDatabase = useCallback(async (artifactData: ArtifactData, conversationId: string | null): Promise<boolean> => {
    try {
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
        throw new Error(await response.text());
      }
      return true;
    } catch (error) {
      console.error('Error saving artifact:', error);
      return false;
    }
  }, []);

  const updateArtifactInDatabase = useCallback(async (artifactData: ArtifactData): Promise<boolean> => {
    try {
      const searchResponse = await fetch(`/api/artifacts?conversationId=${currentConversationId}`);
      if (!searchResponse.ok) {
        throw new Error('Failed to search for artifact');
      }

      const data = await searchResponse.json();
      const existingArtifact = data.artifacts?.find((a: { identifier: string }) => a.identifier === artifactData.identifier);
      
      if (existingArtifact) {
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
          throw new Error(await updateResponse.text());
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating artifact:', error);
      return false;
    }
  }, [currentConversationId]);

  const handleCreate = async (artifact: ArtifactInput): Promise<ArtifactData | null> => {
    const artifactData: ArtifactData = {
      identifier: artifact.identifier || `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: artifact.type,
      title: artifact.title,
      code: artifact.code,
      language: artifact.language,
      createdAt: artifact.createdAt || new Date().toISOString(),
    };

    setArtifacts(prev => [...prev, artifactData]);
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
  };

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

    // Update in artifacts list
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
  }, [artifacts, currentArtifactId, isArtifactPanelOpen, updateArtifactInDatabase, toast, saveArtifactToDatabase, currentConversationId]);

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

    // Update the reverted artifact in the list (setter removed)
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

    // If deleting current artifact, switch to another or close panel
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
            if (artifactData) {
              artifactData = await handleEdit(artifactData) || undefined;
            }
            break;
          case 'revert':
            artifactData = await handleRevert(toolCallData.revertToVersion) || undefined;
            break;
          case 'insert_section':
          case 'update_section':
          case 'delete_section':
          case 'apply_formatting':
            if (artifactData) {
              artifactData = await handleEdit(artifactData) || undefined;
            }
            break;
        }
      }
    }
    else if (hasArtifacts(response)) {
      const { cleanText, artifacts } = parseArtifacts(response);
      cleanContent = cleanText;

      if (artifacts.length > 0) {
        const latestArtifact = artifacts[artifacts.length - 1];

        toolCallData = {
          operation: latestArtifact.operation,
          artifactType: latestArtifact.type,
          artifactTitle: latestArtifact.title,
          revertToVersion: latestArtifact.revertToVersion,
        };

        switch (latestArtifact.operation) {
          case 'delete':
            handleDelete();
            break;

          case 'create':
            artifactData = await handleCreate(latestArtifact) || undefined;
            break;

          case 'edit':
            artifactData = await handleEdit(latestArtifact) || undefined;
            break;

          case 'revert':
            artifactData = await handleRevert(latestArtifact.revertToVersion) || undefined;
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
    // Check if artifact already exists
    setArtifacts(prev => {
      const exists = prev.some(a => a.identifier === artifactData.identifier);
      if (exists) {
        return prev.map(a => a.identifier === artifactData.identifier ? artifactData : a);
      }
      return [...prev, artifactData];
    });
    setCurrentArtifactId(artifactData.identifier);
    setIsArtifactPanelOpen(true);
  }, []);

  const switchArtifact = useCallback((identifier: string) => {
    setCurrentArtifactId(identifier);
  }, []);

  const updateCurrentDocument = useCallback(async (markdown: string) => {
    if (!currentArtifact) return;

    // Update code without creating a new version on every keystroke
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
  };
}
