import { useState, useCallback } from 'react';
import { ArtifactData, ToolCall } from '@/types/types';

export interface ArtifactInstance {
  artifact: ArtifactData;
  isPinned: boolean;
  lastAccessed: Date;
}

export function useMultipleArtifacts() {
  const [artifacts, setArtifacts] = useState<Map<string, ArtifactInstance>>(new Map());
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);

  const addOrUpdateArtifact = useCallback((artifact: ArtifactData, makeActive: boolean = true) => {
    setArtifacts((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(artifact.identifier);
      
      newMap.set(artifact.identifier, {
        artifact,
        isPinned: existing?.isPinned || false,
        lastAccessed: new Date(),
      });
      
      return newMap;
    });
    
    if (makeActive) {
      setActiveArtifactId(artifact.identifier);
    }
  }, []);

  const removeArtifact = useCallback((identifier: string) => {
    setArtifacts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(identifier);
      return newMap;
    });
    
    if (activeArtifactId === identifier) {
      // Switch to another artifact if available
      const remaining = Array.from(artifacts.keys()).filter(id => id !== identifier);
      setActiveArtifactId(remaining.length > 0 ? remaining[0] : null);
    }
  }, [activeArtifactId, artifacts]);

  const togglePin = useCallback((identifier: string) => {
    setArtifacts((prev) => {
      const newMap = new Map(prev);
      const instance = newMap.get(identifier);
      if (instance) {
        newMap.set(identifier, {
          ...instance,
          isPinned: !instance.isPinned,
        });
      }
      return newMap;
    });
  }, []);

  const setActive = useCallback((identifier: string) => {
    const instance = artifacts.get(identifier);
    if (instance) {
      setActiveArtifactId(identifier);
      setArtifacts((prev) => {
        const newMap = new Map(prev);
        newMap.set(identifier, {
          ...instance,
          lastAccessed: new Date(),
        });
        return newMap;
      });
    }
  }, [artifacts]);

  const clearAll = useCallback(() => {
    setArtifacts(new Map());
    setActiveArtifactId(null);
  }, []);

  const getActiveArtifact = useCallback((): ArtifactData | null => {
    if (!activeArtifactId) return null;
    return artifacts.get(activeArtifactId)?.artifact || null;
  }, [activeArtifactId, artifacts]);

  const getArtifactsList = useCallback((): ArtifactInstance[] => {
    return Array.from(artifacts.values()).sort((a, b) => {
      // Pinned artifacts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by last accessed
      return b.lastAccessed.getTime() - a.lastAccessed.getTime();
    });
  }, [artifacts]);

  const processArtifactOperation = useCallback((
    toolCall: ToolCall,
    artifactData?: ArtifactData
  ) => {
    switch (toolCall.operation) {
      case 'create':
      case 'edit':
        if (artifactData) {
          addOrUpdateArtifact(artifactData, true);
        }
        break;
      
      case 'delete':
        if (artifactData) {
          removeArtifact(artifactData.identifier);
        }
        break;
      
      case 'revert':
        if (artifactData && toolCall.revertToVersion) {
          // Handle version revert
          const version = artifactData.versions?.[toolCall.revertToVersion - 1];
          if (version) {
            const revertedArtifact: ArtifactData = {
              ...artifactData,
              code: version.code,
              currentVersion: toolCall.revertToVersion,
              updatedAt: new Date().toISOString(),
            };
            addOrUpdateArtifact(revertedArtifact, true);
          }
        }
        break;
    }
  }, [addOrUpdateArtifact, removeArtifact]);

  return {
    artifacts,
    activeArtifactId,
    addOrUpdateArtifact,
    removeArtifact,
    togglePin,
    setActive,
    clearAll,
    getActiveArtifact,
    getArtifactsList,
    processArtifactOperation,
  };
}

