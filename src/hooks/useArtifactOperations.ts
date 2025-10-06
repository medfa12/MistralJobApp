import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { ArtifactData } from '@/types/types';
import { parseArtifacts, hasArtifacts } from '@/utils/artifactParser';

interface ArtifactOperationResult {
  artifactData?: ArtifactData;
  toolCallData?: any;
  cleanContent: string;
}

export function useArtifactOperations() {
  const toast = useToast();
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Save artifact to database
  const saveArtifactToDatabase = useCallback(async (artifactData: ArtifactData, conversationId: string | null) => {
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
        console.error('Failed to save artifact:', await response.text());
      }
    } catch (error) {
      console.error('Error saving artifact:', error);
    }
  }, []);

  // Update artifact in database
  const updateArtifactInDatabase = useCallback(async (artifactData: ArtifactData) => {
    try {
      // Find existing artifact by identifier
      const searchResponse = await fetch(`/api/artifacts?conversationId=${currentConversationId}`);
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        const existingArtifact = data.artifacts?.find((a: any) => a.identifier === artifactData.identifier);
        
        if (existingArtifact) {
          // Update existing artifact
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
            console.error('Failed to update artifact:', await updateResponse.text());
          }
        }
      }
    } catch (error) {
      console.error('Error updating artifact:', error);
    }
  }, [currentConversationId]);

  const handleCreate = (artifact: any): ArtifactData | null => {
    if (currentArtifact) {
      toast({
        title: 'Artifact Already Exists',
        description: 'Please edit the existing artifact or ask me to delete it first',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }

    const artifactData: ArtifactData = {
      identifier: artifact.identifier,
      type: artifact.type,
      title: artifact.title,
      code: artifact.code,
      language: artifact.language,
      createdAt: artifact.createdAt,
    };

    setCurrentArtifact(artifactData);
    setIsArtifactPanelOpen(true);

    // Save to database
    saveArtifactToDatabase(artifactData, currentConversationId);

    toast({
      title: 'Artifact Created',
      description: `"${artifactData.title}" is ready to preview`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    return artifactData;
  };

  const handleEdit = (artifact: any): ArtifactData | null => {
    if (!currentArtifact) {
      toast({
        title: 'No Artifact to Edit',
        description: 'Please create an artifact first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }

    const versions = currentArtifact.versions || [];
    const newVersion = {
      code: currentArtifact.code,
      timestamp: currentArtifact.updatedAt || currentArtifact.createdAt,
      description: `Version ${versions.length + 1}`,
    };

    const artifactData: ArtifactData = {
      ...currentArtifact,
      type: artifact.type,
      title: artifact.title,
      code: artifact.code,
      language: artifact.language,
      updatedAt: new Date().toISOString(),
      versions: [...versions, newVersion],
      currentVersion: versions.length + 1,
    };

    setCurrentArtifact(artifactData);
    if (!isArtifactPanelOpen) {
      setIsArtifactPanelOpen(true);
    }

    // Update in database
    updateArtifactInDatabase(artifactData);

    toast({
      title: 'Artifact Updated',
      description: `"${artifactData.title}" - Version ${artifactData.currentVersion}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    return artifactData;
  };

  const handleRevert = (targetVersion: number | undefined): ArtifactData | null => {
    if (!currentArtifact || !currentArtifact.versions || currentArtifact.versions.length === 0) {
      toast({
        title: 'No Version History',
        description: 'No previous versions available to revert to',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }

    if (targetVersion === undefined || targetVersion < 1 || targetVersion > currentArtifact.versions.length) {
      toast({
        title: 'Invalid Version',
        description: `Version ${targetVersion} does not exist. Available: 1-${currentArtifact.versions.length}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return null;
    }

    const revertToVersion = currentArtifact.versions[targetVersion - 1];

    const artifactData: ArtifactData = {
      ...currentArtifact,
      code: revertToVersion.code,
      updatedAt: new Date().toISOString(),
      currentVersion: targetVersion,
    };

    setCurrentArtifact(artifactData);
    if (!isArtifactPanelOpen) {
      setIsArtifactPanelOpen(true);
    }

    // Update in database
    updateArtifactInDatabase(artifactData);

    toast({
      title: 'Artifact Reverted',
      description: `Restored to Version ${targetVersion}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });

    return artifactData;
  };

  const handleDelete = () => {
    setCurrentArtifact(null);
    setIsArtifactPanelOpen(false);

    toast({
      title: 'Artifact Deleted',
      description: 'The artifact has been removed',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };

  const processArtifactResponse = (response: string): ArtifactOperationResult => {
    let artifactData: ArtifactData | undefined;
    let toolCallData: any | undefined;
    let cleanContent = response;

    if (hasArtifacts(response)) {
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
            artifactData = handleCreate(latestArtifact) || undefined;
            break;

          case 'edit':
            artifactData = handleEdit(latestArtifact) || undefined;
            break;

          case 'revert':
            artifactData = handleRevert(latestArtifact.revertToVersion) || undefined;
            break;
        }
      }
    }

    return { artifactData, toolCallData, cleanContent };
  };

  const resetArtifacts = useCallback(() => {
    setCurrentArtifact(null);
    setIsArtifactPanelOpen(false);
  }, []);

  const restoreArtifact = useCallback((artifactData: ArtifactData) => {
    setCurrentArtifact(artifactData);
    setIsArtifactPanelOpen(false);
  }, []);

  return {
    currentArtifact,
    isArtifactPanelOpen,
    setIsArtifactPanelOpen,
    setCurrentConversationId,
    processArtifactResponse,
    resetArtifacts,
    restoreArtifact,
  };
}

