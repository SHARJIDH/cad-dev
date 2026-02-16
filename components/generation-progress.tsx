"use client";

import React from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Loader2 } from 'lucide-react';
import { GenerationProgress } from '@/types/generation';

interface GenerationProgressIndicatorProps {
    progress: GenerationProgress | null;
    isGenerating: boolean;
}

export function GenerationProgressIndicator({ 
    progress, 
    isGenerating 
}: GenerationProgressIndicatorProps) {
    if (!isGenerating || !progress) return null;

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'interpreting':
                return '🔍';
            case 'designing':
                return '🏗️';
            case 'rendering':
                return '🎨';
            case 'complete':
                return '✅';
            default:
                return '⚙️';
        }
    };

    return (
        <Card className="p-6 space-y-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-3">
                <span className="text-2xl animate-pulse">{getStageIcon(progress.stage)}</span>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{progress.currentAgent}</p>
                        <span className="text-xs text-muted-foreground">{progress.percentage}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{progress.message}</p>
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            
            <Progress value={progress.percentage} className="h-2" />
            
            {progress.roomsGenerated !== undefined && (
                <div className="text-xs text-muted-foreground">
                    Rooms generated: {progress.roomsGenerated} / {progress.totalRooms || progress.roomsGenerated}
                </div>
            )}
        </Card>
    );
}
