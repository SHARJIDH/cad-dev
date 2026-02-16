import { NextResponse } from "next/server";
import { StreamingOrchestrator } from "@/services/streaming-orchestrator";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, sketchData, speechData, photoData, conversationHistory, currentModel } = body;

        if (!prompt && !sketchData && !speechData && !photoData) {
            return NextResponse.json(
                { error: "At least one input is required" },
                { status: 400 }
            );
        }

        const textPrompt = prompt || "Generate a CAD model based on the provided inputs";

        // Create a readable stream for Server-Sent Events
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const orchestrator = new StreamingOrchestrator();
                    const generator = orchestrator.processDesignRequestStream(
                        textPrompt,
                        sketchData,
                        conversationHistory,
                        currentModel
                    );

                    for await (const message of generator) {
                        const data = `data: ${JSON.stringify(message)}\n\n`;
                        controller.enqueue(encoder.encode(data));
                    }

                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
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
        console.error("Error in streaming CAD generator API:", error);
        return NextResponse.json(
            { error: "Failed to start generation stream" },
            { status: 500 }
        );
    }
}
