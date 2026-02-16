"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Download, FileCode, FileJson, Loader2 } from 'lucide-react';
import { modelExporter } from '@/services/export-service';
import { toast } from 'sonner';

interface ExportButtonProps {
    modelData: any;
    projectName?: string;
    generatedCode?: string;
}

export function ExportButton({ modelData, projectName = 'cad-model', generatedCode }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = async (format: string) => {
        if (!modelData) {
            toast.error('No model data to export');
            return;
        }

        setIsExporting(true);
        
        try {
            switch (format) {
                case 'gltf': {
                    const blob = await modelExporter.exportAsGLTF(modelData);
                    downloadBlob(blob, `${projectName}.gltf`);
                    toast.success('GLTF file exported successfully');
                    break;
                }
                
                case 'glb': {
                    const blob = await modelExporter.exportAsGLB(modelData);
                    downloadBlob(blob, `${projectName}.glb`);
                    toast.success('GLB file exported successfully');
                    break;
                }
                
                case 'obj': {
                    const { obj } = modelExporter.exportAsOBJ(modelData);
                    downloadBlob(obj, `${projectName}.obj`);
                    toast.success('OBJ file exported successfully');
                    break;
                }
                
                case 'stl': {
                    const blob = modelExporter.exportAsSTL(modelData);
                    downloadBlob(blob, `${projectName}.stl`);
                    toast.success('STL file exported successfully');
                    break;
                }
                
                case 'svg': {
                    const blob = modelExporter.exportAs2DSVG(modelData);
                    downloadBlob(blob, `${projectName}_floorplan.svg`);
                    toast.success('SVG floor plan exported successfully');
                    break;
                }
                
                case 'json': {
                    const blob = new Blob([JSON.stringify(modelData, null, 2)], { 
                        type: 'application/json' 
                    });
                    downloadBlob(blob, `${projectName}_data.json`);
                    toast.success('JSON data exported successfully');
                    break;
                }
                
                case 'code': {
                    if (!generatedCode) {
                        toast.error('No generated code available');
                        return;
                    }
                    const blob = new Blob([generatedCode], { type: 'text/javascript' });
                    downloadBlob(blob, `${projectName}_code.js`);
                    toast.success('Three.js code exported successfully');
                    break;
                }
                
                case 'html': {
                    if (!generatedCode) {
                        toast.error('No generated code available');
                        return;
                    }
                    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
${generatedCode}
    </script>
</body>
</html>`;
                    const blob = new Blob([htmlTemplate], { type: 'text/html' });
                    downloadBlob(blob, `${projectName}.html`);
                    toast.success('HTML file exported successfully');
                    break;
                }
                
                default:
                    toast.error('Unknown export format');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                    {isExporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>3D Models</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('gltf')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    GLTF (.gltf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('glb')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    GLB (.glb)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('obj')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    OBJ (.obj)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('stl')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    STL (.stl)
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>2D Floor Plans</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('svg')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    SVG Floor Plan
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Code & Data</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('code')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    Three.js Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                    <FileCode className="mr-2 h-4 w-4" />
                    Standalone HTML
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
