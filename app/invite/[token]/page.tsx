'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'accepted' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    // Validate token exists
    if (token) {
      setStatus('ready');
    } else {
      setStatus('error');
      setError('Invalid invite link');
    }
  }, [token]);

  const handleAccept = async () => {
    setStatus('accepting');
    try {
      const response = await fetch(`/api/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invite');
      }

      setProjectName(data.member?.project?.name || 'the project');
      setStatus('accepted');
      toast.success('Invite accepted!');

      // Redirect to projects page after a moment
      setTimeout(() => {
        router.push('/projects');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-dark-bg dark:to-dark-surface">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-none dark:border dark:border-dark-border p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Validating invite...</p>
          </>
        )}

        {status === 'ready' && (
          <>
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Invitation</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You&apos;ve been invited to collaborate on an ArcForge project. Click below to accept and join the team.
            </p>
            <Button
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 text-lg"
            >
              Accept Invitation
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              You must be signed in with the email the invite was sent to.
            </p>
          </>
        )}

        {status === 'accepting' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Accepting invite...</p>
          </>
        )}

        {status === 'accepted' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re In!</h1>
            <p className="text-gray-600 mb-4">
              Successfully joined <strong>{projectName}</strong>. Redirecting to your projects...
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invite Error</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/projects')}
              >
                Go to Projects
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Return Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
