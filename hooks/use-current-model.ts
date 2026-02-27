import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'currentModel';

/**
 * Hook for persisting the currently working CAD model across navigation
 * Automatically loads from localStorage on mount and syncs changes
 * Uses the 'currentModel' localStorage key for compatibility
 */
export function useCurrentModel() {
  const [model, setModel] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Support both old format (just the model) and new format (with code)
        if (data.modelData || data.rooms) {
          // Old format or new structured format
          setModel(data);
          setCode('');
        } else if (data.model) {
          // New format with model and code
          setModel(data.model || null);
          setCode(data.code || '');
        } else {
          // Assume it's just the model data directly
          setModel(data);
          setCode('');
        }
      }
    } catch (error) {
      console.error('Failed to load model from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Sync model to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      if (model) {
        // Save just the model directly for compatibility with existing code
        localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
      }
    } catch (error) {
      console.error('Failed to save model to localStorage:', error);
    }
  }, [model, isHydrated]);

  // Update model (syncs to localStorage automatically)
  const updateModel = useCallback((newModel: any) => {
    setModel(newModel);
  }, []);

  // Update code (syncs to localStorage automatically)
  const updateCode = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  // Clear the stored model (when starting a new project)
  const clearModel = useCallback(() => {
    setModel(null);
    setCode('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear model from localStorage:', error);
    }
  }, []);

  return {
    model,
    code,
    updateModel,
    updateCode,
    clearModel,
    isHydrated,
  };
}
