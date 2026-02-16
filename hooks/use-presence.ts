'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PresenceState } from '@/types/database';

export function usePresence(projectId: string | null) {
  const [presences, setPresences] = useState<Map<string, PresenceState>>(new Map());
  const [myPresence, setMyPresence] = useState<PresenceState | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase.channel(`project:${projectId}:presence`, {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    // Subscribe to presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const presenceMap = new Map<string, PresenceState>();

        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: PresenceState) => {
            presenceMap.set(presence.userId, presence);
          });
        });

        setPresences(presenceMap);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track own presence
          const userPresence: PresenceState = {
            userId: 'current-user-id', // TODO: Get from auth
            userName: 'Current User',
            lastSeen: Date.now(),
          };
          
          await channel.track(userPresence);
          setMyPresence(userPresence);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);

  const updatePresence = async (update: Partial<PresenceState>) => {
    if (!myPresence || !projectId) return;

    const channel = supabase.channel(`project:${projectId}:presence`);
    const updatedPresence = {
      ...myPresence,
      ...update,
      lastSeen: Date.now(),
    };

    await channel.track(updatedPresence);
    setMyPresence(updatedPresence);
  };

  return {
    presences: Array.from(presences.values()),
    myPresence,
    updatePresence,
  };
}
