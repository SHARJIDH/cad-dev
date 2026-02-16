"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Sparkles, Lock, Unlock, Send } from 'lucide-react';
import { toast } from 'sonner';

interface RefinementPanelProps {
    currentModel: any;
    conversationHistory: any[];
    projectId: string;
    onRefinementStart: () => void;
    onRefinementComplete: (result: any) => void;
    onRefinementError: (error: string) => void;
}

export function RefinementPanel({
    currentModel,
    conversationHistory,
    projectId,
    onRefinementStart,
    onRefinementComplete,
    onRefinementError
}: RefinementPanelProps) {
    const [refinementPrompt, setRefinementPrompt] = useState('');
    const [lockedElements, setLockedElements] = useState<string[]>([]);
    const [isRefining, setIsRefining] = useState(false);

    const roomNames = currentModel?.rooms?.map((r: any) => r.name) || [];

    const toggleLock = (roomName: string) => {
        setLockedElements(prev => 
            prev.includes(roomName)
                ? prev.filter(name => name !== roomName)
                : [...prev, roomName]
        );
    };

    const handleRefine = async () => {
        if (!refinementPrompt.trim()) {
            toast.error('Please enter a refinement request');
            return;
        }

        setIsRefining(true);
        onRefinementStart();

        try {
            const response = await fetch('/api/cad-refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    currentModel,
                    conversationHistory,
                    refinementPrompt,
                    lockedElements
                })
            });

            if (!response.ok) {
                throw new Error('Refinement failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response reader');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.type === 'complete' && data.data.modelData) {
                            onRefinementComplete(data.data);
                            toast.success('Refinement complete!');
                            setRefinementPrompt('');
                        } else if (data.type === 'error') {
                            throw new Error(data.data.error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Refinement error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            onRefinementError(errorMsg);
            toast.error(`Refinement failed: ${errorMsg}`);
        } finally {
            setIsRefining(false);
        }
    };

    const suggestions = [
        "Make the living room 2 meters wider",
        "Add a bathroom between bedroom 1 and 2",
        "Move the kitchen next to the dining room",
        "Replace the north window with a door",
        "Increase ceiling height to 3 meters"
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Refine Design
                </CardTitle>
                <CardDescription>
                    Modify your design with natural language commands
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {roomNames.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Lock Elements (won't be modified)</label>
                        <div className="flex flex-wrap gap-2">
                            {roomNames.map((name: string) => (
                                <Badge
                                    key={name}
                                    variant={lockedElements.includes(name) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleLock(name)}
                                >
                                    {lockedElements.includes(name) ? (
                                        <Lock className="h-3 w-3 mr-1" />
                                    ) : (
                                        <Unlock className="h-3 w-3 mr-1" />
                                    )}
                                    {name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">What would you like to change?</label>
                    <Textarea
                        placeholder="e.g., Make the bedroom 20% bigger and add a window..."
                        value={refinementPrompt}
                        onChange={(e) => setRefinementPrompt(e.target.value)}
                        rows={4}
                        disabled={isRefining}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Quick suggestions:</label>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, idx) => (
                            <Button
                                key={idx}
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => setRefinementPrompt(suggestion)}
                                disabled={isRefining}
                            >
                                {suggestion}
                            </Button>
                        ))}
                    </div>
                </div>

                <Button 
                    onClick={handleRefine} 
                    disabled={isRefining || !refinementPrompt.trim()}
                    className="w-full"
                >
                    {isRefining ? (
                        <>Refining...</>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Refine Design
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
