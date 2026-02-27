'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Home, Sofa, DollarSign, Palette,  ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCurrentModel } from '@/hooks/use-current-model';

interface FurnitureItem {
    name: string;
    type: string;
    position: { x: number; y: number; z: number };
    dimensions: { width: number; height: number; depth: number };
    color: string;
    price: number;
}

interface DesignStyle {
    name: string;
    description: string;
    colors: string[];
    furniture: FurnitureItem[];
    totalCost: number;
}

export default function InteriorDesignerPage() {
    const searchParams = useSearchParams();
    const { model, updateModel } = useCurrentModel();
    const [modelData, setModelData] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [roomType, setRoomType] = useState<string>('living-room');
    const [isGenerating, setIsGenerating] = useState(false);
    const [designStyles, setDesignStyles] = useState<DesignStyle[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);

    useEffect(() => {
        // Load model from persistent state
        if (model) {
            setModelData(model);
            if (model.rooms && model.rooms.length > 0) {
                setSelectedRoom(model.rooms[0].name);
            }
        }
    }, [model]);

    const generateInteriorDesign = async () => {
        if (!selectedRoom) return;
        
        setIsGenerating(true);
        try {
            const response = await fetch('/api/interior-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: selectedRoom,
                    roomType,
                    dimensions: modelData.rooms.find((r: any) => r.name === selectedRoom),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDesignStyles(data.styles);
                setSelectedStyle(data.styles[0]);
            }
        } catch (error) {
            console.error('Error generating interior design:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-dark-bg dark:to-dark-surface">
            {/* Header */}
            <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/cad-generator">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                AI Interior Designer
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transform your rooms with AI-powered design suggestions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Controls */}
                    <Card className="p-6 lg:col-span-1 h-fit">
                        <h2 className="text-lg font-semibold mb-4">Design Settings</h2>
                        
                        {modelData && modelData.rooms ? (
                            <div className="space-y-4">
                                {/* Room Selection */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Select Room</label>
                                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modelData.rooms.map((room: any) => (
                                                <SelectItem key={room.name} value={room.name}>
                                                    {room.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Room Type */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Room Purpose</label>
                                    <Select value={roomType} onValueChange={setRoomType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="living-room">Living Room</SelectItem>
                                            <SelectItem value="bedroom">Bedroom</SelectItem>
                                            <SelectItem value="kitchen">Kitchen</SelectItem>
                                            <SelectItem value="dining-room">Dining Room</SelectItem>
                                            <SelectItem value="office">Home Office</SelectItem>
                                            <SelectItem value="bathroom">Bathroom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Room Info */}
                                {selectedRoom && modelData.rooms.find((r: any) => r.name === selectedRoom) && (
                                    <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4 space-y-2">
                                        <h3 className="font-medium text-sm dark:text-white">Room Dimensions</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Width:</span>
                                                <span className="font-semibold ml-2">
                                                    {modelData.rooms.find((r: any) => r.name === selectedRoom).width}m
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Length:</span>
                                                <span className="font-semibold ml-2">
                                                    {modelData.rooms.find((r: any) => r.name === selectedRoom).length}m
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Area:</span>
                                                <span className="font-semibold ml-2">
                                                    {(modelData.rooms.find((r: any) => r.name === selectedRoom).width * 
                                                      modelData.rooms.find((r: any) => r.name === selectedRoom).length).toFixed(1)}m²
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Generate Button */}
                                <Button 
                                    onClick={generateInteriorDesign}
                                    disabled={isGenerating || !selectedRoom}
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating Designs...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate AI Designs
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Home className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-600">No model data found</p>
                                <Link href="/cad-generator">
                                    <Button variant="link" className="mt-2">
                                        Create a design first
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card>

                    {/* Right Panel - Design Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {designStyles.length > 0 ? (
                            <Tabs defaultValue="styles" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="styles">
                                        <Palette className="h-4 w-4 mr-2" />
                                        Styles
                                    </TabsTrigger>
                                    <TabsTrigger value="furniture">
                                        <Sofa className="h-4 w-4 mr-2" />
                                        Furniture
                                    </TabsTrigger>
                                    <TabsTrigger value="budget">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Budget
                                    </TabsTrigger>
                                </TabsList>

                                {/* Styles Tab */}
                                <TabsContent value="styles" className="space-y-4">
                                    <h2 className="text-xl font-semibold">Design Styles</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {designStyles.map((style, index) => (
                                            <Card
                                                key={index}
                                                className={`p-4 cursor-pointer transition-all hover:shadow-lg dark:bg-dark-surface ${
                                                    selectedStyle?.name === style.name
                                                        ? 'border-2 border-orange-600 dark:border-orange-400 shadow-lg'
                                                        : 'border border-gray-200 dark:border-dark-border'
                                                }`}
                                                onClick={() => setSelectedStyle(style)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-lg">{style.name}</h3>
                                                    <Badge variant="secondary">${style.totalCost}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                                                <div className="flex gap-2">
                                                    {style.colors.map((color, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>

                                {/* Furniture Tab */}
                                <TabsContent value="furniture" className="space-y-4">
                                    {selectedStyle && (
                                        <>
                                            <h2 className="text-xl font-semibold">Furniture List - {selectedStyle.name}</h2>
                                            <div className="space-y-3">
                                                {selectedStyle.furniture.map((item, index) => (
                                                    <Card key={index} className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium">{item.name}</h4>
                                                                <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {item.dimensions.width} × {item.dimensions.depth} × {item.dimensions.height}m
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div
                                                                    className="w-6 h-6 rounded border mb-1"
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                                <p className="text-sm font-semibold">${item.price}</p>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </TabsContent>

                                {/* Budget Tab */}
                                <TabsContent value="budget" className="space-y-4">
                                    {selectedStyle && (
                                        <Card className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Budget Breakdown</h2>
                                            <div className="space-y-3">
                                                {selectedStyle.furniture.reduce((acc: any[], item) => {
                                                    const existing = acc.find(a => a.type === item.type);
                                                    if (existing) {
                                                        existing.count++;
                                                        existing.total += item.price;
                                                    } else {
                                                        acc.push({ type: item.type, count: 1, total: item.price });
                                                    }
                                                    return acc;
                                                }, []).map((category: any, index: number) => (
                                                    <div key={index} className="flex justify-between items-center border-b pb-2">
                                                        <div>
                                                            <p className="font-medium capitalize">{category.type}</p>
                                                            <p className="text-sm text-gray-600">{category.count} item(s)</p>
                                                        </div>
                                                        <p className="font-semibold">${category.total.toFixed(2)}</p>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-3 text-lg font-bold">
                                                    <span>Total Cost</span>
                                                    <span className="text-orange-600 dark:text-orange-400">${selectedStyle.totalCost.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <Card className="p-12 text-center">
                                <Sparkles className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Designs Yet</h3>
                                <p className="text-gray-500">Select a room and click "Generate AI Designs" to get started</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
