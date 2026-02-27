'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    
    // Fresh interior design mode (when accessing from navbar, no model)
    const [freshDesignRoomType, setFreshDesignRoomType] = useState<string>('living-room');
    const [freshDesignWidth, setFreshDesignWidth] = useState<string>('5');
    const [freshDesignLength, setFreshDesignLength] = useState<string>('6');
    const [freshDesignPrompt, setFreshDesignPrompt] = useState<string>('');

    // Room type options for dropdown
    const roomTypeOptions = [
        { value: 'living-room', label: 'Living Room' },
        { value: 'bedroom', label: 'Bedroom' },
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'dining-room', label: 'Dining Room' },
        { value: 'office', label: 'Office' },
        { value: 'bathroom', label: 'Bathroom' },
    ];

    // Map room names to design purposes (for project-based flow)
    const roomPurposeMap: { [key: string]: string } = {
        'living room': 'living-room',
        'bedroom': 'bedroom',
        'kitchen': 'kitchen',
        'dining': 'dining-room',
        'dining room': 'dining-room',
        'office': 'office',
        'bathroom': 'bathroom',
        'bed room': 'bedroom',
    };

    useEffect(() => {
        // Load model from persistent state
        if (model) {
            setModelData(model);
            if (model.rooms && model.rooms.length > 0) {
                setSelectedRoom(model.rooms[0].name);
                // Auto-detect room type from room name
                const detectedType = detectRoomType(model.rooms[0].name);
                setRoomType(detectedType);
            }
        }
    }, [model]);

    // Auto-detect room type from room name
    const detectRoomType = (roomName: string): string => {
        const lowerName = roomName.toLowerCase();
        for (const [key, value] of Object.entries(roomPurposeMap)) {
            if (lowerName.includes(key)) {
                return value;
            }
        }
        return 'living-room'; // default
    };

    // Update room type when room selection changes
    const handleRoomChange = (room: string) => {
        setSelectedRoom(room);
        const detectedType = detectRoomType(room);
        setRoomType(detectedType);
    };

    const generateInteriorDesign = async () => {
        // For fresh design (no model): need room type, width, length
        // For model-based design: need selected room
        if (!modelData && !freshDesignRoomType) return;
        if (modelData && !selectedRoom) return;
        
        setIsGenerating(true);
        try {
            let roomData;
            let roomName;
            let rType;
            let userPrompt = '';
            
            if (!modelData) {
                // Fresh interior design mode (navbar entry)
                roomName = `${roomTypeOptions.find(r => r.value === freshDesignRoomType)?.label || 'Room'}`;
                rType = freshDesignRoomType;
                userPrompt = freshDesignPrompt; // Optional user prompt
                roomData = {
                    name: roomName,
                    width: parseFloat(freshDesignWidth) || 5,
                    length: parseFloat(freshDesignLength) || 6,
                };
            } else {
                // Project-based mode
                roomName = selectedRoom;
                rType = roomType;
                roomData = modelData.rooms.find((r: any) => r.name === selectedRoom);
            }
            
            const response = await fetch('/api/interior-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName,
                    roomType: rType,
                    dimensions: roomData,
                    userPrompt: userPrompt || undefined, // Include prompt if provided
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
            <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-2 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    <Link href="/cad-generator">
                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        AI Interior Designer
                    </h1>
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
                                    <Select value={selectedRoom} onValueChange={handleRoomChange}>
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

                                {/* Detected Room Type Badge */}
                                {selectedRoom && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Room Type:</span>
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            {roomType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </Badge>
                                    </div>
                                )}

                                {/* Room Info */}
                                {selectedRoom && modelData.rooms.find((r: any) => r.name === selectedRoom) && (
                                    <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4 space-y-2 border border-orange-100 dark:border-orange-500/20">
                                        <h3 className="font-medium text-sm dark:text-white flex items-center gap-2">
                                            <Home className="h-4 w-4" />
                                            Room Dimensions (from your 3D model)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Width:</span>
                                                <span className="font-semibold ml-2 dark:text-white">
                                                    {modelData.rooms.find((r: any) => r.name === selectedRoom).width}m
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Length:</span>
                                                <span className="font-semibold ml-2 dark:text-white">
                                                    {modelData.rooms.find((r: any) => r.name === selectedRoom).length}m
                                                </span>
                                            </div>
                                            <div className="col-span-2 border-t border-orange-200 dark:border-orange-500/30 pt-2">
                                                <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
                                                <span className="font-semibold ml-2 text-orange-600 dark:text-orange-400">
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
                            <div className="space-y-4">
                                <div className="text-center py-4 mb-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4 border border-orange-200 dark:border-orange-500/20">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Design Setup</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">Create a new interior design from scratch</p>
                                </div>
                                
                                {/* Room Type Dropdown */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Room Type<span className="text-red-500 ml-1">*</span></label>
                                    <Select value={freshDesignRoomType} onValueChange={setFreshDesignRoomType}>
                                        <SelectTrigger className="dark:bg-dark-input dark:border-dark-border">
                                            <SelectValue placeholder="Select room type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roomTypeOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dimensions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Width (m)<span className="text-red-500 ml-1">*</span></label>
                                        <Input 
                                            type="number"
                                            placeholder="5"
                                            value={freshDesignWidth}
                                            onChange={(e) => setFreshDesignWidth(e.target.value)}
                                            className="dark:bg-dark-input dark:border-dark-border"
                                            step="0.5"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Length (m)<span className="text-red-500 ml-1">*</span></label>
                                        <Input 
                                            type="number"
                                            placeholder="6"
                                            value={freshDesignLength}
                                            onChange={(e) => setFreshDesignLength(e.target.value)}
                                            className="dark:bg-dark-input dark:border-dark-border"
                                            step="0.5"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Optional Text Prompt */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Design Prompt<span className="text-gray-500 ml-2 text-xs">(Optional)</span></label>
                                    <Input 
                                        type="text"
                                        placeholder="e.g., Modern style with warm lighting, Minimalist aesthetic, Cozy rustic theme"
                                        value={freshDesignPrompt}
                                        onChange={(e) => setFreshDesignPrompt(e.target.value)}
                                        className="dark:bg-dark-input dark:border-dark-border"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Describe the style, mood, or specific preferences for your design</p>
                                </div>

                                {/* Room Summary */}
                                {freshDesignRoomType && freshDesignWidth && freshDesignLength && (
                                    <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-4 space-y-2 border border-orange-100 dark:border-orange-500/20">
                                        <h3 className="font-medium text-sm dark:text-white flex items-center gap-2">
                                            <Home className="h-4 w-4" />
                                            Room Summary
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                                <span className="font-semibold ml-2">
                                                    <Badge variant="outline" className="bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30">
                                                        {roomTypeOptions.find(r => r.value === freshDesignRoomType)?.label}
                                                    </Badge>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 dark:text-gray-400">Area:</span>
                                                <span className="font-semibold ml-2 text-orange-600 dark:text-orange-400">
                                                    {(parseFloat(freshDesignWidth) * parseFloat(freshDesignLength)).toFixed(1)}m²
                                                </span>
                                            </div>
                                            {freshDesignPrompt && (
                                                <div className="col-span-2 border-t border-orange-200 dark:border-orange-500/30 pt-2">
                                                    <span className="text-gray-600 dark:text-gray-400">Style:</span>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{freshDesignPrompt}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Generate Button */}
                                <Button 
                                    onClick={generateInteriorDesign}
                                    disabled={isGenerating || !freshDesignRoomType || !freshDesignWidth || !freshDesignLength}
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

                                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                                    Or{' '}
                                    <Link href="/cad-generator">
                                        <Button variant="link" className="p-0 h-auto text-xs">
                                            create a CAD model first
                                        </Button>
                                    </Link>
                                </div>
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
