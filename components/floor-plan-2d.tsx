"use client";

import React, { useRef, useEffect } from "react";

type FloorPlanView = 'top' | 'front' | 'back' | 'left' | 'right';

interface FloorPlan2DProps {
    modelData: {
        rooms: {
            name: string;
            width: number;
            length: number;
            height: number;
            x: number;
            y: number;
            z: number;
            type?: string;
        }[];
        windows?: {
            room: string;
            wall: string;
            width: number;
            position: number;
        }[];
        doors?: {
            from: string;
            to: string;
            width: number;
        }[];
    };
    showDimensions?: boolean;
    showGrid?: boolean;
    view?: FloorPlanView;
}

export function FloorPlan2D({ modelData, showDimensions = true, showGrid = true, view = 'top' }: FloorPlan2DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !modelData.rooms || modelData.rooms.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate bounds and scale based on view
        let minA = Infinity, minB = Infinity, maxA = -Infinity, maxB = -Infinity;

        const getRoomRect = (room: any) => {
            switch (view) {
                case 'front':
                case 'back':
                    return {
                        a1: room.x - room.width / 2,
                        a2: room.x + room.width / 2,
                        b1: room.y,
                        b2: room.y + room.height,
                        sizeA: room.width,
                        sizeB: room.height,
                        centerA: room.x,
                        centerB: room.y + room.height / 2,
                        dimensionA: room.width,
                        dimensionB: room.height,
                    };
                case 'left':
                case 'right':
                    return {
                        a1: room.z - room.length / 2,
                        a2: room.z + room.length / 2,
                        b1: room.y,
                        b2: room.y + room.height,
                        sizeA: room.length,
                        sizeB: room.height,
                        centerA: room.z,
                        centerB: room.y + room.height / 2,
                        dimensionA: room.length,
                        dimensionB: room.height,
                    };
                case 'top':
                default:
                    return {
                        a1: room.x - room.width / 2,
                        a2: room.x + room.width / 2,
                        b1: room.z - room.length / 2,
                        b2: room.z + room.length / 2,
                        sizeA: room.width,
                        sizeB: room.length,
                        centerA: room.x,
                        centerB: room.z,
                        dimensionA: room.width,
                        dimensionB: room.length,
                    };
            }
        };

        modelData.rooms.forEach(room => {
            const rect = getRoomRect(room);
            minA = Math.min(minA, rect.a1);
            maxA = Math.max(maxA, rect.a2);
            minB = Math.min(minB, rect.b1);
            maxB = Math.max(maxB, rect.b2);
        });

        const modelWidth = maxA - minA;
        const modelDepth = maxB - minB;
        const padding = 60;
        const scale = Math.min(
            (width - padding * 2) / modelWidth,
            (height - padding * 2) / modelDepth
        );

        const offsetX = width / 2 - (minA + modelWidth / 2) * scale;
        const offsetY = height / 2 - (minB + modelDepth / 2) * scale;

        // Helper to convert view coords to canvas coords
        const toCanvas = (a: number, b: number) => ({
            x: a * scale + offsetX,
            y: b * scale + offsetY
        });

        // Draw grid
        if (showGrid) {
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 0.5;
            const gridSize = 1; // 1 meter grid
            
            for (let a = Math.floor(minA); a <= Math.ceil(maxA); a += gridSize) {
                const start = toCanvas(a, minB);
                const end = toCanvas(a, maxB);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
            
            for (let b = Math.floor(minB); b <= Math.ceil(maxB); b += gridSize) {
                const start = toCanvas(minA, b);
                const end = toCanvas(maxA, b);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }

        // Draw rooms
        modelData.rooms.forEach(room => {
            const rect = getRoomRect(room);
            const topLeft = toCanvas(rect.a1, rect.b1);
            const rectWidth = rect.sizeA * scale;
            const rectHeight = rect.sizeB * scale;

            // Fill room with light color
            ctx.fillStyle = getRoomColor(room.type);
            ctx.fillRect(topLeft.x, topLeft.y, rectWidth, rectHeight);

            // Draw room outline
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(topLeft.x, topLeft.y, rectWidth, rectHeight);

            // Draw room name
            ctx.fillStyle = '#000';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const center = toCanvas(rect.centerA, rect.centerB);
            ctx.fillText(room.name, center.x, center.y);

            // Draw dimensions
            if (showDimensions) {
                ctx.font = '10px sans-serif';
                ctx.fillStyle = '#666';
                
                // Dimension A (top)
                ctx.fillText(
                    `${rect.dimensionA.toFixed(1)}m`,
                    center.x,
                    topLeft.y - 10
                );
                
                // Dimension B (right)
                ctx.save();
                ctx.translate(topLeft.x + rectWidth + 10, center.y);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(`${rect.dimensionB.toFixed(1)}m`, 0, 0);
                ctx.restore();

                // Area
                ctx.fillStyle = '#999';
                ctx.font = '9px sans-serif';
                ctx.fillText(
                    `${(rect.dimensionA * rect.dimensionB).toFixed(1)}m²`,
                    center.x,
                    center.y + 15
                );
            }
        });

        // Draw doors (simplified) only for top view
        if (view === 'top' && modelData.doors) {
            modelData.doors.forEach(door => {
                const fromRoom = modelData.rooms.find(r => r.name === door.from);
                const toRoom = modelData.rooms.find(r => r.name === door.to);
                
                if (fromRoom && toRoom) {
                    const from = toCanvas(fromRoom.x, fromRoom.z);
                    const to = toCanvas(toRoom.x, toRoom.z);
                    
                    ctx.strokeStyle = '#ff6b6b';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            });
        }

        // Draw north arrow (top view only)
        if (view === 'top') {
            const arrowX = width - 40;
            const arrowY = 40;
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#000';
            ctx.lineWidth = 2;
            
            // Arrow line
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY + 20);
            ctx.lineTo(arrowX, arrowY - 10);
            ctx.stroke();
            
            // Arrow head
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY - 10);
            ctx.lineTo(arrowX - 5, arrowY);
            ctx.lineTo(arrowX + 5, arrowY);
            ctx.closePath();
            ctx.fill();
            
            // N label
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('N', arrowX, arrowY + 35);
        }

    }, [modelData, showDimensions, showGrid, view]);

    const getRoomColor = (type?: string): string => {
        switch (type?.toLowerCase()) {
            case 'bedroom': return '#e3f2fd';
            case 'bathroom': return '#f3e5f5';
            case 'kitchen': return '#fff3e0';
            case 'living room': return '#e8f5e9';
            case 'dining room': return '#fce4ec';
            default: return '#f5f5f5';
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'crisp-edges' }}
        />
    );
}
