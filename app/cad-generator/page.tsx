"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Copy,
    Check,
    Code,
    Wand2,
    Shrink,
    FolderPlus,
    Sparkles,
    Download,
    Layers,
    Box,
    Users,
    DollarSign,
    X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { InputPanel } from "@/components/input-panel";
import { GenerationProgressIndicator } from "@/components/generation-progress";

// Message type
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    modelData?: any;
    sketchData?: string;
}
import { GenerationProgress, StreamMessage } from "@/types/generation";
import { ViewModeToggle, ViewMode } from "@/components/view-mode-toggle";
import { FloorPlan2D } from "@/components/floor-plan-2d";
import { ExportButton } from "@/components/export-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Eye, Shield, Smartphone } from "lucide-react";
import { CostEstimator } from '@/components/cost-estimator';
import { CodeComplianceChecker } from '@/components/code-compliance-checker';
import { ARQRCode } from '@/components/ar-qr-code';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from "@/hooks/use-project";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { Project } from "@/types/database";

export default function CadGeneratorPage() {
    const searchParams = useSearchParams();

    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedModel, setGeneratedModel] = useState<any>(null);
    const [generatedCode, setGeneratedCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('3d');
    const [showCodePanel, setShowCodePanel] = useState(false);
    const [showCostEstimator, setShowCostEstimator] = useState(false);
    const [showComplianceChecker, setShowComplianceChecker] = useState(false);
    const [view2d, setView2d] = useState<'top' | 'front' | 'back' | 'left' | 'right'>('top');

    // Database integration
    const { project, addMessage, createVersion, messages, versions } = useProject(currentProjectId);

    // Load project from URL parameter
    useEffect(() => {
        const projectId = searchParams.get('projectId');
        if (projectId && projectId !== currentProjectId) {
            setCurrentProjectId(projectId);
        }
    }, [searchParams]);

    // Close cost estimator on ESC
    useEffect(() => {
        if (!showCostEstimator) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowCostEstimator(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showCostEstimator]);

    // Close compliance checker on ESC
    useEffect(() => {
        if (!showComplianceChecker) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowComplianceChecker(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showComplianceChecker]);

    // Load conversation history and latest model when project data is available
    useEffect(() => {
        if (messages && messages.length > 0) {
            console.log('Loading messages from database:', messages);
            
            // Convert database messages to conversation format
            const loadedMessages: Message[] = messages.map(msg => {
                let metadata = msg.metadata;
                // Parse metadata if it's a string
                if (typeof metadata === 'string') {
                    try {
                        metadata = JSON.parse(metadata);
                    } catch (e) {
                        console.error('Failed to parse metadata:', e);
                        metadata = null;
                    }
                }
                
                return {
                    id: msg.id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    timestamp: msg.createdAt.toString(),
                    modelData: metadata?.modelData,
                };
            });
            setConversationHistory(loadedMessages);

            // Load the most recent model data
            const lastMessageWithModel = [...messages].reverse().find(msg => {
                let metadata = msg.metadata;
                if (typeof metadata === 'string') {
                    try {
                        metadata = JSON.parse(metadata);
                    } catch (e) {
                        return false;
                    }
                }
                return metadata?.modelData;
            });
            
            if (lastMessageWithModel) {
                let metadata = lastMessageWithModel.metadata;
                if (typeof metadata === 'string') {
                    try {
                        metadata = JSON.parse(metadata);
                    } catch (e) {
                        console.error('Failed to parse metadata:', e);
                    }
                }
                if (metadata?.modelData) {
                    console.log('Loading model from message:', metadata.modelData);
                    setGeneratedModel(metadata.modelData);
                }
            }
        }

        // Load latest version if available
        if (versions && versions.length > 0) {
            console.log('Loading versions from database:', versions);
            const latestVersion = versions[0]; // versions are ordered by version desc
            if (latestVersion.modelData) {
                let modelData = latestVersion.modelData;
                // Parse if string
                if (typeof modelData === 'string') {
                    try {
                        modelData = JSON.parse(modelData);
                    } catch (e) {
                        console.error('Failed to parse modelData:', e);
                    }
                }
                console.log('Loading model from version:', modelData);
                setGeneratedModel(modelData);
            }
        }
    }, [messages, versions]);

    // Default viewer settings (no settings panel — just sensible defaults)
    const viewerSettings = {
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
        showMeasurements: true,
        roomLabels: true,
    };

    const codeRef = useRef<HTMLPreElement>(null);

    const addToConversation = async (role: 'user' | 'assistant', content: string, modelData?: any) => {
        const message: Message = {
            id: `msg_${Date.now()}_${Math.random()}`,
            role,
            content,
            timestamp: new Date().toISOString(),
            modelData,
        };
        setConversationHistory(prev => [...prev, message]);

        // Save to database if project exists
        if (currentProjectId && addMessage) {
            try {
                await addMessage({
                    role,
                    content,
                    type: modelData ? 'model' : 'text',
                    metadata: modelData ? { modelData } : undefined,
                });
            } catch (error) {
                console.error('Failed to save message to database:', error);
            }
        }
    };

    const handleGenerate = async (inputs: {
        prompt?: string;
        sketchData?: string | null;
        speechData?: string | null;
        photoData?: string | null;
    }) => {
        setIsGenerating(true);
        setGenerationProgress({
            stage: 'interpreting',
            currentAgent: 'Starting',
            message: 'Initializing generation...',
            percentage: 0,
        });

        try {
            const { prompt, sketchData, speechData, photoData } = inputs;
            const userPrompt = prompt || speechData || "Generate a CAD model";
            setPrompt(userPrompt);

            addToConversation('user', userPrompt, sketchData ? { hasSketch: true } : undefined);

            const payload: any = { 
                prompt: userPrompt,
                conversationHistory: conversationHistory,
                currentModel: generatedModel
            };
            if (sketchData) payload.sketchData = sketchData;
            if (photoData) payload.photoData = photoData;

            const response = await fetch("/api/cad-generator-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Generation failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response reader');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const message: StreamMessage = JSON.parse(line.slice(6));
                        
                        if (message.type === 'progress') {
                            setGenerationProgress(message.data as GenerationProgress);
                        } else if (message.type === 'complete') {
                            const data = message.data as any;
                            if (data.modelData) {
                                setGeneratedModel(data.modelData);
                                setGeneratedCode(data.code || '');
                                addToConversation('assistant', 'Design generated successfully!', data.modelData);
                                toast.success('CAD model generated!');
                            }
                        } else if (message.type === 'error') {
                            throw new Error((message.data as any).error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Generation error:", error);
            toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Fallback to mock data
            const mockData = generateMockModelData(prompt);
            setGeneratedModel(mockData);
            setGeneratedCode(generateMockCode(prompt));
            addToConversation('assistant', 'Generated model (using fallback data)', mockData);
        } finally {
            setIsGenerating(false);
            setGenerationProgress(null);
        }
    };

    const handleSaveAsProject = async () => {
        if (!generatedModel && !prompt) {
            toast.error("Nothing to save. Generate a model first.");
            return;
        }

        try {
            if (currentProjectId && createVersion) {
                // Save as new version in existing project
                await createVersion({
                    name: `Version ${(project?.versions?.length || 0) + 1}`,
                    description: `Auto-saved version`,
                    modelData: generatedModel,
                });
                toast.success("New version saved!");
            } else {
                // No project selected - prompt user to create one
                toast.info("Create a project first to save your work!", {
                    description: "Click 'New Project' button to get started"
                });
            }
        } catch (error) {
            console.error('Failed to save project:', error);
            toast.error('Failed to save project');
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Code copied to clipboard!");
    };

    // Mock function to generate model data based on prompt
    const generateMockModelData = (prompt: string) => {
        return {
            rooms: [
                { name: "living", width: 5, length: 7, height: 3, x: 0, y: 0, z: 0, connected_to: ["kitchen", "hallway"] },
                { name: "kitchen", width: 4, length: 4, height: 3, x: 5, y: 0, z: 0, connected_to: ["living", "dining"] },
                { name: "dining", width: 4, length: 5, height: 3, x: 5, y: 0, z: 4, connected_to: ["kitchen"] },
                { name: "hallway", width: 2, length: 5, height: 3, x: 0, y: 0, z: 7, connected_to: ["living", "bedroom1", "bedroom2", "bathroom"] },
                { name: "bedroom1", width: 4, length: 4, height: 3, x: -4, y: 0, z: 7, connected_to: ["hallway"] },
                { name: "bedroom2", width: 4, length: 4, height: 3, x: 2, y: 0, z: 7, connected_to: ["hallway"] },
                { name: "bathroom", width: 3, length: 2, height: 3, x: 0, y: 0, z: 12, connected_to: ["hallway"] },
            ],
            windows: [
                { room: "living", wall: "south", width: 2, height: 1.5, position: 0.5 },
                { room: "kitchen", wall: "east", width: 1.5, height: 1.2, position: 0.7 },
                { room: "bedroom1", wall: "west", width: 1.5, height: 1.2, position: 0.5 },
                { room: "bedroom2", wall: "east", width: 1.5, height: 1.2, position: 0.5 },
            ],
            doors: [
                { from: "living", to: "kitchen", width: 1.2, height: 2.1 },
                { from: "living", to: "hallway", width: 1.2, height: 2.1 },
                { from: "kitchen", to: "dining", width: 1.2, height: 2.1 },
                { from: "hallway", to: "bedroom1", width: 0.9, height: 2.1 },
                { from: "hallway", to: "bedroom2", width: 0.9, height: 2.1 },
                { from: "hallway", to: "bathroom", width: 0.8, height: 2.1 },
            ],
        };
    };

    // Mock function to generate code based on prompt
    const generateMockCode = (prompt: string) => {
        return `// Generated Three.js code for: "${prompt}"
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

function createRoom(name, width, length, height, x, y, z) {
  const geometry = new THREE.BoxGeometry(width, height, length);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({ color: 0x000000 });
  const wireframe = new THREE.LineSegments(edges, material);
  wireframe.position.set(x + width/2, y + height/2, z + length/2);
  scene.add(wireframe);

  const floorGeometry = new THREE.PlaneGeometry(width, length);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, side: THREE.DoubleSide, transparent: true, opacity: 0.7
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.set(x + width/2, 0.01, z + length/2);
  floor.receiveShadow = true;
  scene.add(floor);

  return { wireframe, floor };
}

const livingRoom = createRoom("living", 5, 7, 3, 0, 0, 0);
const kitchen = createRoom("kitchen", 4, 4, 3, 5, 0, 0);
const dining = createRoom("dining", 4, 5, 3, 5, 0, 4);
const hallway = createRoom("hallway", 2, 5, 3, 0, 0, 7);
const bedroom1 = createRoom("bedroom1", 4, 4, 3, -4, 0, 7);
const bedroom2 = createRoom("bedroom2", 4, 4, 3, 2, 0, 7);
const bathroom = createRoom("bathroom", 3, 2, 3, 0, 0, 12);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`;
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-gray-50">
            {/* ═══════ LEFT PANEL — Chat Interface ═══════ */}
            <div className="w-[420px] min-w-[360px] flex flex-col border-r border-gray-200/80 bg-white z-10">
                {/* Panel header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-blue-50/60">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">AI Design Chat</h2>
                        <p className="text-[10px] text-gray-400 leading-tight">
                            {project ? project.name : 'Design, refine, and iterate'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <CreateProjectDialog
                            onProjectCreated={(newProject: Project) => {
                                setCurrentProjectId(newProject.id);
                                toast.success('Project created!');
                            }}
                        />
                        {currentProjectId && project && (
                            <InviteMemberDialog projectId={currentProjectId} />
                        )}
                    </div>
                </div>

                {/* Conversation History */}
                <ScrollArea className="flex-1 p-4">
                    {conversationHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-3">
                                <Bot className="h-6 w-6 text-purple-400" />
                            </div>
                            <p className="text-sm text-gray-500 mb-1">Start a conversation</p>
                            <p className="text-xs text-gray-400">
                                Describe your design or refine existing ones
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {conversationHistory.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${
                                        message.role === 'user' ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className={message.role === 'user' ? 'bg-purple-100' : 'bg-blue-100'}>
                                            {message.role === 'user' ? (
                                                <User className="h-4 w-4 text-purple-600" />
                                            ) : (
                                                <Bot className="h-4 w-4 text-blue-600" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`flex-1 ${message.role === 'user' ? 'items-end' : ''}`}>
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 max-w-[85%] ${
                                                message.role === 'user'
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 px-2">
                                            {new Date(message.timestamp).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Progress Indicator */}
                {isGenerating && generationProgress && (
                    <div className="px-4 pb-2">
                        <GenerationProgressIndicator 
                            progress={generationProgress}
                            isGenerating={isGenerating}
                        />
                    </div>
                )}

                {/* Input Panel */}
                <div className="border-t border-gray-100 p-3">
                    <InputPanel
                        onGenerateModel={handleGenerate}
                        isGenerating={isGenerating}
                        hasConversationHistory={conversationHistory.length > 0}
                    />
                </div>
            </div>

            {/* ═══════ CENTER — 3D/2D Viewer ═══════ */}
            <div className="flex-1 relative overflow-hidden">
                {/* Grid background */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px),
                            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
                    }}
                />

                {/* Canvas content */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Toolbar strip */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-gray-200/60">
                        <div className="flex items-center gap-3">
                            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent">
                                Workspace
                            </h1>
                            {generatedModel && (
                                <div className="flex items-center gap-2">
                                    <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
                                    {viewMode === '2d' && (
                                        <ToggleGroup
                                            type="single"
                                            value={view2d}
                                            onValueChange={(value) => value && setView2d(value as any)}
                                            className="ml-2"
                                        >
                                            <ToggleGroupItem value="top" className="text-xs">Top</ToggleGroupItem>
                                            <ToggleGroupItem value="front" className="text-xs">Front</ToggleGroupItem>
                                            <ToggleGroupItem value="back" className="text-xs">Back</ToggleGroupItem>
                                            <ToggleGroupItem value="left" className="text-xs">Left</ToggleGroupItem>
                                            <ToggleGroupItem value="right" className="text-xs">Right</ToggleGroupItem>
                                        </ToggleGroup>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {generatedModel && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs gap-1.5 border-emerald-200 hover:bg-emerald-50"
                                        onClick={() => setShowCostEstimator(!showCostEstimator)}
                                    >
                                        <DollarSign className="h-3.5 w-3.5" />
                                        Cost
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs gap-1.5 border-blue-200 hover:bg-blue-50"
                                        onClick={() => setShowComplianceChecker(!showComplianceChecker)}
                                    >
                                        <Shield className="h-3.5 w-3.5" />
                                        Compliance
                                    </Button>
                                    <ARQRCode modelData={generatedModel} />
                                    <ExportButton 
                                        modelData={generatedModel}
                                        projectName={prompt.slice(0, 30).replace(/\s+/g, '_') || 'cad-model'}
                                        generatedCode={generatedCode}
                                    />
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                        onClick={handleSaveAsProject}
                                    >
                                        <FolderPlus className="h-3.5 w-3.5" />
                                        {currentProjectId ? 'Update' : 'Save'}
                                    </Button>
                                </>
                            )}
                            {generatedCode && (
                                <Button
                                    variant={showCodePanel ? "secondary" : "outline"}
                                    size="sm"
                                    className="h-8 text-xs gap-1.5"
                                    onClick={() => setShowCodePanel(!showCodePanel)}
                                >
                                    <Code className="h-3.5 w-3.5" />
                                    {showCodePanel ? 'Hide Code' : 'Show Code'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main canvas area — 3D/2D Viewer or empty state */}
                    <div className="flex-1 relative">
                        {generatedModel ? (
                            <div className="absolute inset-0">
                                {viewMode === '3d' ? (
                                    <CadModelViewer
                                        modelData={generatedModel}
                                        settings={viewerSettings}
                                    />
                                ) : (
                                    <FloorPlan2D 
                                        modelData={generatedModel}
                                        showDimensions={true}
                                        showGrid={true}
                                        view={view2d}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-md px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-5">
                                        <Wand2 className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Design</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                        Start chatting with the AI to create your architectural design. You can describe, sketch, or use voice input.
                                    </p>
                                    <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-purple-400" />Text
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-blue-400" />Sketch
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-violet-50 px-3 py-1.5 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-violet-400" />Voice
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════ RIGHT PANEL — Code (Toggleable) ═══════ */}
            {showCodePanel && generatedCode && (
                <div className="w-[400px] min-w-[350px] flex flex-col border-l border-gray-200/80 bg-gray-950 z-10">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-semibold text-gray-200">Three.js Code</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                                onClick={handleCopyCode}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3 text-green-400" /> 
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" /> 
                                        Copy
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-gray-500 hover:text-white hover:bg-gray-800"
                                onClick={() => setShowCodePanel(false)}
                            >
                                <Shrink className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Code content */}
                    <ScrollArea className="flex-1">
                        <pre ref={codeRef} className="p-4 text-xs font-mono text-gray-300 leading-relaxed">
                            <code>{generatedCode}</code>
                        </pre>
                    </ScrollArea>
                </div>
            )}

            {/* Cost Estimator Panel */}
            {showCostEstimator && generatedModel && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowCostEstimator(false)}
                    />
                    <div
                        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-[26rem] max-w-[95vw] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-30 pointer-events-auto overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="font-semibold text-gray-900">💰 Cost Estimate</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-gray-100 pointer-events-auto z-40"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setShowCostEstimator(false);
                                }}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setShowCostEstimator(false);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <CostEstimator modelData={generatedModel} />
                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowCostEstimator(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </ScrollArea>
                    </div>
                </>
            )}

            {/* Code Compliance Checker Panel */}
            {showComplianceChecker && generatedModel && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowComplianceChecker(false)}
                    />
                    <div
                        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-[26rem] max-w-[95vw] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-30 pointer-events-auto overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="font-semibold text-gray-900">🛡️ Code Compliance</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-gray-100 pointer-events-auto z-40"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setShowComplianceChecker(false);
                                }}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setShowComplianceChecker(false);
                                }}
                            >
                                Close
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <CodeComplianceChecker modelData={generatedModel} />
                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowComplianceChecker(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </ScrollArea>
                    </div>
                </>
            )}

            {/* Code Panel */}
            {showCodePanel && generatedModel && (
                <div className="absolute right-0 top-0 h-screen w-96 bg-gray-900 border-l border-gray-800 flex flex-col z-30">
                    <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Generated Code</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-200"
                            onClick={() => setShowCodePanel(false)}
                        >
                            <Shrink className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <pre ref={codeRef} className="p-4 text-xs font-mono text-gray-300 leading-relaxed">
                            <code>{generatedCode}</code>
                        </pre>
                    </ScrollArea>
                </div>
            )}

        </div>
    );
}
