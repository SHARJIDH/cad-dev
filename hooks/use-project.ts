'use client';

import { useState, useEffect } from 'react';
import { Project, ConversationMessage } from '@/types/database';

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectId) {
      setProject(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const data = await response.json();
      setProject(data.project);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const result = await response.json();
      setProject(result.project);
      return result.project;
    } catch (err) {
      throw err;
    }
  };

  const addMessage = async (message: {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'image' | 'code' | 'model';
    metadata?: any;
  }) => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Failed to add message');
      }

      const result = await response.json();
      
      // Update project with new message
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), result.message],
        };
      });

      return result.message;
    } catch (err) {
      throw err;
    }
  };

  const createVersion = async (data: {
    name?: string;
    description?: string;
    modelData: any;
    thumbnailUrl?: string;
  }) => {
    if (!projectId) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create version');
      }

      const result = await response.json();
      
      // Update project with new version
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          versions: [result.version, ...(prev.versions || [])],
        };
      });

      return result.version;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  return {
    project,
    messages: project?.messages || [],
    versions: project?.versions || [],
    isLoading,
    error,
    refetch: fetchProject,
    updateProject,
    addMessage,
    createVersion,
  };
}
