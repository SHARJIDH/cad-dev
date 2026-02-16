'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Maximize2, RotateCw, Share2 } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { modelExporter } from '@/services/export-service';

export default function ARViewerPage() {
    const searchParams = useSearchParams();
    const [modelData, setModelData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const modelViewerRef = useRef<any>(null);

    useEffect(() => {
        const loadModelData = async () => {
            // Get model ID from URL params
            const modelId = searchParams.get('id');
            const dataParam = searchParams.get('data'); // Keep backward compatibility
            
            if (modelId) {
                // Fetch from API
                try {
                    const response = await fetch(`/api/ar-session?id=${modelId}`);
                    
                    if (!response.ok) {
                        const error = await response.json();
                        setError(error.error || 'Failed to load model data');
                        return;
                    }
                    
                    const { modelData: data } = await response.json();
                    setModelData(data);
                } catch (err) {
                    setError('Failed to load model data. Please check your connection.');
                    console.error('Error loading model data:', err);
                }
            } else if (dataParam) {
                // Fallback: direct data in URL (for backward compatibility)
                try {
                    const decoded = JSON.parse(decodeURIComponent(dataParam));
                    setModelData(decoded);
                } catch (err) {
                    setError('Failed to load model data');
                    console.error('Error parsing model data:', err);
                }
            } else {
                setError('No model data provided');
            }
        };

        loadModelData();
    }, [searchParams]);

    // Generate 3D model when modelData is loaded
    useEffect(() => {
        if (modelData && !modelUrl && !isGenerating) {
            generateModel();
        }
    }, [modelData]);

    const generateModel = async () => {
        setIsGenerating(true);
        try {
            const blob = await modelExporter.exportAsGLB(modelData);
            const url = URL.createObjectURL(blob);
            setModelUrl(url);
        } catch (err) {
            console.error('Error generating 3D model:', err);
            setError('Failed to generate 3D model');
        } finally {
            setIsGenerating(false);
        }
    };

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (modelUrl) {
                URL.revokeObjectURL(modelUrl);
            }
        };
    }, [modelUrl]);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="p-6 max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                    <Link href="/cad-generator">
                        <Button className="mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Generator
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (!modelData || !modelUrl) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {isGenerating ? 'Generating 3D model...' : 'Loading AR viewer...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/cad-generator">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-lg font-semibold">AR Viewer</h1>
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* AR Viewer */}
            <div className="max-w-7xl mx-auto p-4">
                <Card className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">View in Augmented Reality</h2>
                        <p className="text-gray-600">
                            Point your device camera at a flat surface to place the 3D model
                        </p>
                    </div>

                    {/* AR Viewer Container */}
                    <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
                        {/* Model Viewer with AR Support */}
                        <model-viewer
                            ref={modelViewerRef}
                            className="w-full h-full"
                            src={modelUrl}
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            camera-controls
                            shadow-intensity="1"
                            auto-rotate
                            style={{ width: '100%', height: '100%' }}
                        >
                            <button 
                                slot="ar-button" 
                                style={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#7C3AED',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                👆 Tap to place in AR
                            </button>
                        </model-viewer>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <Button variant="outline" className="w-full">
                            <RotateCw className="h-4 w-4 mr-2" />
                            Reset View
                        </Button>
                        <Button variant="outline" className="w-full">
                            <Maximize2 className="h-4 w-4 mr-2" />
                            Fullscreen
                        </Button>
                        <Button variant="outline" className="w-full">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Link
                        </Button>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">How to use AR:</h3>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Open this page on your smartphone or tablet</li>
                            <li>Tap the "View in AR" button</li>
                            <li>Point your camera at a flat surface (floor, table, ground)</li>
                            <li>Tap to place the model in your space</li>
                            <li>Walk around to view from all angles</li>
                        </ol>
                    </div>

                    {/* Model Info */}
                    {modelData && (
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {modelData.rooms?.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Rooms</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {modelData.windows?.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Windows</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {modelData.doors?.length || 0}
                                </div>
                                <div className="text-xs text-gray-600">Doors</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-purple-600">1:1</div>
                                <div className="text-xs text-gray-600">Scale</div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Add model-viewer script */}
            <Script
                type="module"
                src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
            />
        </div>
    );
}
