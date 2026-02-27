'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FolderPlus } from 'lucide-react';

interface SaveProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (projectData: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => Promise<void>;
  generatedPrompt: string;
  modelData: any;
}

export function SaveProjectModal({
  open,
  onClose,
  onSave,
  generatedPrompt,
  modelData,
}: SaveProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate name from prompt if empty
  const defaultName = generatedPrompt ? generatedPrompt.slice(0, 50) : 'Untitled Project';

  const handleSave = async () => {
    setError(null);
    const projectName = name.trim() || defaultName;

    if (!projectName) {
      setError('Project name is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: projectName,
        description: description.trim(),
        isPublic,
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIsPublic(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName('');
      setDescription('');
      setIsPublic(false);
      setError(null);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Save Your Design Project
          </DialogTitle>
          <DialogDescription>
            Your AI-generated design is ready! Save it as a project to keep working on it and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Model Preview Info */}
          {modelData && (
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg p-3">
              <p className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-2">Design Summary</p>
              <div className="text-xs text-orange-700 dark:text-orange-400 space-y-1">
                {modelData.rooms && (
                  <p>🏠 <strong>{modelData.rooms.length}</strong> rooms detected</p>
                )}
                {modelData.windows && (
                  <p>🪟 <strong>{modelData.windows.length}</strong> windows</p>
                )}
                {modelData.doors && (
                  <p>🚪 <strong>{modelData.doors.length}</strong> doors</p>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Project Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder={defaultName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Project Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes about this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Public Link Toggle */}
          <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg p-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-orange-600 dark:text-orange-400 rounded cursor-pointer accent-orange-500"
            />
            <div className="flex-1">
              <Label htmlFor="isPublic" className="cursor-pointer font-medium text-sm">
                Make this project public
              </Label>
              <p className="text-xs text-gray-600 mt-0.5">
                Generate a shareable link for collaboration
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving...' : 'Save Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
