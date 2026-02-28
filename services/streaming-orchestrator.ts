import { InterpreterAgent } from "./agents/interpreter-agent";
import { DesignerAgent } from "./agents/designer-agent";
import { RendererAgent } from "./agents/renderer-agent";
import { GenerationProgress, StreamMessage } from "@/types/generation";

export class StreamingOrchestrator {
    private interpreterAgent: InterpreterAgent;
    private designerAgent: DesignerAgent;
    private rendererAgent: RendererAgent;

    constructor() {
        this.interpreterAgent = new InterpreterAgent();
        this.designerAgent = new DesignerAgent();
        this.rendererAgent = new RendererAgent();
    }

    async *processDesignRequestStream(
        prompt: string,
        sketchData?: string | null,
        conversationHistory?: any[],
        currentModel?: any
    ): AsyncGenerator<StreamMessage> {
        const startTime = Date.now();

        try {
            // Step 1: Interpret requirements
            yield {
                type: 'progress',
                data: {
                    stage: 'interpreting',
                    currentAgent: 'Interpreter Agent',
                    message: 'Analyzing your design requirements...',
                    percentage: 0,
                }
            };

            let stepStart = Date.now();
            const interpreterResult = await this.interpreterAgent.execute({
                prompt,
                sketchData,
                conversationHistory,
                currentModel,
            });
            console.log(`Interpreter Agent completed in ${Date.now() - stepStart}ms`);

            if (interpreterResult.error) {
                throw new Error(`Interpreter failed: ${interpreterResult.error}`);
            }

            yield {
                type: 'progress',
                data: {
                    stage: 'interpreting',
                    currentAgent: 'Interpreter Agent',
                    message: 'Requirements understood',
                    percentage: 33,
                }
            };

            // Step 2: Generate architectural design
            yield {
                type: 'progress',
                data: {
                    stage: 'designing',
                    currentAgent: 'Designer Agent',
                    message: 'Creating architectural layout...',
                    percentage: 33,
                }
            };

            stepStart = Date.now();
            const designerResult = await this.designerAgent.execute({
                requirements: interpreterResult.requirements,
                currentModel: currentModel,
                isModification: interpreterResult.isModification,
            });
            console.log(`Designer Agent completed in ${Date.now() - stepStart}ms`);

            if (designerResult.error) {
                throw new Error(`Designer failed: ${designerResult.error}`);
            }

            const roomCount = designerResult.design?.rooms?.length || 0;

            yield {
                type: 'progress',
                data: {
                    stage: 'designing',
                    currentAgent: 'Designer Agent',
                    message: `Generated ${roomCount} room${roomCount !== 1 ? 's' : ''}`,
                    percentage: 66,
                    roomsGenerated: roomCount,
                    totalRooms: roomCount,
                }
            };

            // Step 3: Generate visualization code
            yield {
                type: 'progress',
                data: {
                    stage: 'rendering',
                    currentAgent: 'Renderer Agent',
                    message: 'Generating 3D visualization code...',
                    percentage: 66,
                }
            };

            stepStart = Date.now();
            const rendererResult = await this.rendererAgent.execute({
                design: designerResult.design,
                requirements: interpreterResult.requirements,
            });
            console.log(`Renderer Agent completed in ${Date.now() - stepStart}ms`);

            yield {
                type: 'progress',
                data: {
                    stage: 'rendering',
                    currentAgent: 'Renderer Agent',
                    message: 'Finalizing visualization...',
                    percentage: 90,
                }
            };

            const endTime = Date.now();
            const result = {
                requirements: interpreterResult.requirements,
                modelData: designerResult.design,
                code: rendererResult.code,
                originalPrompt: prompt,
                sketchAnalysisPerformed: !!sketchData,
                processingTimeMs: endTime - startTime,
            };

            // Final complete message
            yield {
                type: 'complete',
                data: {
                    stage: 'complete',
                    currentAgent: 'Complete',
                    message: 'Design generation complete!',
                    percentage: 100,
                }
            };

            // Return the full result
            yield {
                type: 'complete',
                data: result
            };

        } catch (error) {
            console.error("Streaming orchestrator error:", error);
            yield {
                type: 'error',
                data: {
                    error: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }
}
