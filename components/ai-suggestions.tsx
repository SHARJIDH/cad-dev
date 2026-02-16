'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Lightbulb, Loader } from 'lucide-react';

interface ModelData {
    rooms: Array<{
        name: string;
        x: number;
        z: number;
        width: number;
        length: number;
        height: number;
    }>;
}

interface AISuggestionsProps {
    modelData: ModelData;
    projectId: string;
}

export function AISuggestions({ modelData, projectId }: AISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const generateSuggestions = async () => {
        setLoading(true);
        try {
            // Analyze current model
            const roomCount = modelData.rooms.length;
            let totalArea = 0;
            let kitchenCount = 0;
            let bedroomCount = 0;
            let bathroomCount = 0;

            modelData.rooms.forEach(room => {
                totalArea += room.width * room.length;
                if (room.name.includes('Bedroom')) bedroomCount++;
                if (room.name.includes('Bathroom')) bathroomCount++;
                if (room.name.includes('Kitchen')) kitchenCount++;
            });

            // Call AI API to get design suggestions
            const response = await fetch(`/api/projects/${projectId}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelData,
                    stats: { roomCount, totalArea, bedroomCount, bathroomCount, kitchenCount },
                    context: 'Analyze this architectural design and provide 3-5 specific improvement suggestions'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error generating suggestions:', error);
            // Fallback suggestions if API fails
            setSuggestions([
                '🏠 Add a mudroom between entrance and living area for better flow',
                '🚪 Consider adding an ensuite bathroom to the master bedroom',
                '☀️ Increase window placement on south-facing walls for natural light',
                '🍳 Expand kitchen island for better prep space and seating',
                '🛏️ Add a separate guest bedroom or flexible space for home office'
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 p-6">
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Design Suggestions</h3>
                </div>

                {suggestions.length === 0 ? (
                    <Button
                        onClick={generateSuggestions}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing design...
                            </>
                        ) : (
                            <>
                                <Lightbulb className="h-4 w-4 mr-2" />
                                Get AI Suggestions
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="space-y-3">
                        {suggestions.map((suggestion, i) => (
                            <div key={i} className="bg-white rounded-lg p-3 border border-amber-200 text-sm leading-relaxed">
                                <p className="text-gray-700">{suggestion}</p>
                            </div>
                        ))}
                        <Button
                            onClick={generateSuggestions}
                            variant="outline"
                            className="w-full border-amber-200 hover:bg-amber-50"
                            disabled={loading}
                        >
                            {loading ? 'Regenerating...' : 'Get More Suggestions'}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
