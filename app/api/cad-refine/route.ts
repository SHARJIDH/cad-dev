import { NextResponse } from "next/server";
import { StreamingOrchestrator } from "@/services/streaming-orchestrator";
import { RefinementRequest } from "@/types/generation";

export async function POST(req: Request) {
    try {
        const body: RefinementRequest = await req.json();
        const { 
            projectId, 
            currentModel, 
            conversationHistory, 
            refinementPrompt,
            lockedElements 
        } = body;

        if (!refinementPrompt) {
            return NextResponse.json(
                { error: "Refinement prompt is required" },
                { status: 400 }
            );
        }

        if (!currentModel) {
            return NextResponse.json(
                { error: "Current model data is required" },
                { status: 400 }
            );
        }

        // Build context from conversation history
        const contextMessages = conversationHistory?.map(msg => 
            `${msg.role}: ${msg.content}`
        ).join('\n') || '';

        // Build locked elements message
        const lockedElementsMsg = lockedElements && lockedElements.length > 0
            ? `\n\nIMPORTANT: Do not modify these elements: ${lockedElements.join(', ')}`
            : '';

        // Create comprehensive prompt for refinement
        const fullPrompt = `You are refining an existing CAD floor plan design.

CURRENT DESIGN:
${JSON.stringify(currentModel, null, 2)}

CONVERSATION HISTORY:
${contextMessages}

USER'S REFINEMENT REQUEST:
${refinementPrompt}
${lockedElementsMsg}

INSTRUCTIONS:
1. Analyze the current design and the user's refinement request
2. Make ONLY the changes requested while preserving everything else
3. Maintain spatial relationships and realistic proportions
4. Ensure doors and windows still make sense with any modifications
5. Update connected_to relationships if room positions change
6. Return a complete updated floor plan with the modifications applied

RESPOND WITH ONLY THE MODIFIED FLOOR PLAN DATA IN THE SAME FORMAT AS THE CURRENT DESIGN.`;

        // Create a readable stream for Server-Sent Events
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const orchestrator = new StreamingOrchestrator();
                    const generator = orchestrator.processDesignRequestStream(
                        fullPrompt,
                        null // No sketch for refinement
                    );

                    for await (const message of generator) {
                        const data = `data: ${JSON.stringify(message)}\n\n`;
                        controller.enqueue(encoder.encode(data));
                    }

                    controller.close();
                } catch (error) {
                    console.error("Refinement stream error:", error);
                    const errorMessage = {
                        type: 'error',
                        data: { 
                            error: error instanceof Error ? error.message : String(error) 
                        }
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error("Error in refinement API:", error);
        return NextResponse.json(
            { error: "Failed to start refinement" },
            { status: 500 }
        );
    }
}
