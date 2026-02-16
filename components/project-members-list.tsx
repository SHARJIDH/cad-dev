'use client';

import { ProjectMember } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

interface ProjectMembersListProps {
  members: ProjectMember[];
}

export function ProjectMembersList({ members }: ProjectMembersListProps) {
  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">No members yet</p>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 pr-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.user?.imageUrl} />
                <AvatarFallback>
                  {member.user?.name?.[0] || member.user?.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {member.user?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.user?.email}
                </p>
              </div>
            </div>
            <Badge variant={getRoleBadgeVariant(member.role)}>
              {member.role}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
