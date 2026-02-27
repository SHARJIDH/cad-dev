'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Download, Share2 } from 'lucide-react';
import { CadModelViewer } from '@/components/cad-model-viewer';
import { toast } from 'sonner';

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/public`);
        
        if (!response.ok) {
          setError('Project not found or not public');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProject(data.project);
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-dark-bg dark:to-dark-surface">
      {/* Header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            {project?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{project?.description || 'A shared ArcForge project'}</p>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {project?.latestVersion?.modelData ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div style={{ height: '600px' }}>
              <CadModelViewer 
                modelData={project.latestVersion.modelData}
                settings={{
                  showGrid: true,
                  showAxes: false,
                  backgroundColor: '#f8f9fa',
                  lighting: 'default',
                  wireframe: false,
                  zoom: 1,
                  showMeasurements: false,
                  roomLabels: true,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600">No 3D model available for this project</p>
          </div>
        )}

        {/* Project Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {project?.versions && (
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-none dark:border dark:border-dark-border p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Versions</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{project.versions.length}</p>
            </div>
          )}
          
          {project?._count && (
            <>
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-none dark:border dark:border-dark-border p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Messages</h3>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{project._count.messages}</p>
              </div>
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-none dark:border dark:border-dark-border p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Team Members</h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{project._count.members || 1}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
