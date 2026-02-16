"use client";

import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Box, Layers } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export type ViewMode = '3d' | '2d';

interface ViewModeToggleProps {
    mode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
    return (
        <Card className="p-2">
            <ToggleGroup type="single" value={mode} onValueChange={(value) => value && onModeChange(value as ViewMode)}>
                <ToggleGroupItem value="3d" aria-label="3D View" className="gap-2">
                    <Box className="h-4 w-4" />
                    <span className="text-xs">3D View</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="2d" aria-label="2D Floor Plan" className="gap-2">
                    <Layers className="h-4 w-4" />
                    <span className="text-xs">2D Floor Plan</span>
                </ToggleGroupItem>
            </ToggleGroup>
        </Card>
    );
}
