export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  members?: ProjectMember[];
  messages?: ConversationMessage[];
  versions?: ProjectVersion[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
    imageUrl?: string;
  };
}

export interface ConversationMessage {
  id: string;
  projectId: string;
  userId?: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'code' | 'model';
  metadata?: any;
  createdAt: Date;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  name?: string;
  description?: string;
  modelData: any;
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  senderId: string;
  receiverId?: string;
  email: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name?: string;
    imageUrl?: string;
  };
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  userId?: string;
  action: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  user?: {
    name?: string;
    imageUrl?: string;
  };
}

export interface PresenceState {
  userId: string;
  userName?: string;
  userImage?: string;
  cursor?: { x: number; y: number };
  selectedElement?: string;
  lastSeen: number;
}
