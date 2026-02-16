// Types for CAD generation and streaming

export type GenerationStage = 'interpreting' | 'designing' | 'rendering' | 'complete' | 'error';

export interface GenerationProgress {
    stage: GenerationStage;
    currentAgent: string;
    message: string;
    percentage: number;
    roomsGenerated?: number;
    totalRooms?: number;
    estimatedTimeRemaining?: number;
}

export interface StreamMessage {
    type: 'progress' | 'complete' | 'error';
    data: GenerationProgress | CADResult | { error: string };
}

export interface CADResult {
    requirements: any;
    modelData: any;
    code: string;
    originalPrompt: string;
    sketchAnalysisPerformed: boolean;
    processingTimeMs?: number;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    modelData?: any;
    sketchData?: string;
}

export interface ConversationHistory {
    projectId: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

export interface RefinementRequest {
    projectId: string;
    currentModel: any;
    conversationHistory: Message[];
    refinementPrompt: string;
    lockedElements?: string[];
}
