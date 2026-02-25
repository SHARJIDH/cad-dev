
import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

const client = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
});

export async function POST(request: NextRequest) {
    try {
        const { roomName, roomType, dimensions } = await request.json();

        if (!roomName || !roomType || !dimensions) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = `You are an expert interior designer. Generate 3 different interior design styles for a ${roomType} with dimensions ${dimensions.width}m × ${dimensions.length}m (${(dimensions.width * dimensions.length).toFixed(1)}m²).

For each style, provide:
1. Style name (e.g., "Modern Minimalist", "Cozy Traditional", "Industrial Chic")
2. A brief description (1-2 sentences)
3. A color palette (3-4 hex colors)
4. A list of 5-8 furniture items with:
   - Item name
   - Type (sofa, table, chair, etc.)
   - Approximate dimensions (width, height, depth in meters)
   - Suggested color (hex code)
   - Estimated price in USD
   - Position suggestion (x, y, z coordinates where center of room is 0,0,0)

Return as JSON with this structure:
{
  "styles": [
    {
      "name": "style name",
      "description": "description",
      "colors": ["#hex1", "#hex2", "#hex3"],
      "furniture": [
        {
          "name": "item name",
          "type": "furniture type",
          "dimensions": {"width": 2.0, "height": 0.8, "depth": 0.9},
          "color": "#hex",
          "price": 500,
          "position": {"x": 0, "y": 0, "z": -1.5}
        }
      ],
      "totalCost": 2500
    }
  ]
}

Make designs practical, stylish, and budget-conscious. Ensure furniture fits within room dimensions.`;

        const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert interior designer who creates practical, beautiful, and budget-friendly room designs. Always respond with valid JSON only.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.8,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from AI');
        }

        const designData = JSON.parse(content);

        return NextResponse.json(designData);
    } catch (error) {
        console.error('Error generating interior design:', error);
        return NextResponse.json(
            { error: 'Failed to generate interior design', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
