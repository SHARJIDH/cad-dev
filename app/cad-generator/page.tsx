"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Copy,
    Check,
    Code,
    Wand2,
    Shrink,
    FolderPlus,
    Sparkles,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { InputPanel } from "@/components/input-panel";
import { useProjects } from "@/lib/store";

export default function CadGeneratorPage() {
    const { addProject } = useProjects();

    const handleSaveAsProject = () => {
        if (!generatedModel && !prompt) {
            toast({ title: "Nothing to save", description: "Generate a model first.", variant: "destructive" });
            return;
        }
        addProject({
            title: prompt ? prompt.slice(0, 60) : "Untitled CAD Project",
            description: prompt || "Generated via CAD Model Generator",
            status: "Draft",
            client: "Personal",
            team: [],
            thumbnail: "/placeholder.svg?height=200&width=300",
            tags: ["CAD Generated", "AI Design"],
            favorite: false,
            progress: generatedModel ? 30 : 10,
            modelData: generatedModel || undefined,
            generatedCode: generatedCode || undefined,
        });
        toast({ title: "Saved as project!", description: "Your design has been added to Projects." });
    };
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedModel, setGeneratedModel] = useState<any>(null);
    const [generatedCode, setGeneratedCode] = useState("");
    const [copied, setCopied] = useState(false);

    // Default viewer settings (no settings panel — just sensible defaults)
    const viewerSettings = {
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
        showMeasurements: false,
        roomLabels: true,
    };

    const codeRef = useRef<HTMLPreElement>(null);

    const handleGenerate = async (inputs: {
        prompt?: string;
        sketchData?: string | null;
        speechData?: string | null;
        photoData?: string | null;
    }) => {
        setIsGenerating(true);

        try {
            const { prompt, sketchData, speechData, photoData } = inputs;
            setPrompt(prompt || "");

            const payload: {
                prompt: string;
                sketchData?: string;
                photoData?: string;
            } = {
                prompt: prompt || speechData || "Generate a CAD model based on this input"
            };

            if (sketchData) payload.sketchData = sketchData;
            if (photoData) payload.photoData = photoData;

            console.log("Generating CAD model with Azure services:", {
                hasPrompt: !!payload.prompt,
                hasSketchData: !!payload.sketchData,
                hasPhotoData: !!payload.photoData,
                hasSpeechData: !!speechData,
            });

            const response = await fetch("/api/cad-generator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Failed to generate model with Azure: ${response.status} ${response.statusText}${errorData.details ? ` - ${errorData.details}` : ""}`
                );
            }

            const data = await response.json();
            console.log("Azure API Response:", data);

            if (!data.modelData || !data.code) {
                throw new Error("Invalid response format from Azure API");
            }

            if (!Array.isArray(data.modelData.rooms) || data.modelData.rooms.length === 0) {
                throw new Error("Invalid model data from Azure: no rooms found");
            }

            setGeneratedModel(data.modelData);
            setGeneratedCode(data.code);

            toast({
                title: "Model generated successfully",
                description: "Your CAD model has been created using Azure AI.",
            });
        } catch (error) {
            console.error("Error with Azure services:", error);

            const mockResponse = {
                modelData: generateMockModelData(prompt || "Floor plan from input"),
                code: generateMockCode(prompt || "Floor plan from input"),
            };

            setGeneratedModel(mockResponse.modelData);
            setGeneratedCode(mockResponse.code);

            toast({
                title: "Using fallback data",
                description: "Could not connect to Azure API. Using sample data instead.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: "Code copied",
            description: "The generated code has been copied to your clipboard.",
        });
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

    // State for code panel visibility
    const [showCodePanel, setShowCodePanel] = useState(false);

    return (
        <div className="h-[calc(100vh-5rem)] flex overflow-hidden bg-gray-50">
            {/* ═══════ LEFT PANEL — Chat / Input ═══════ */}
            <div className="w-[340px] min-w-[300px] flex flex-col border-r border-gray-200/80 bg-white z-10">
                {/* Panel header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50/60 to-blue-50/60">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">AI Design Assistant</h2>
                        <p className="text-[10px] text-gray-400 leading-tight">Describe, sketch, or speak your vision</p>
                    </div>
                </div>

                {/* Scrollable input area */}
                <ScrollArea className="flex-1">
                    <div className="p-3">
                        <InputPanel
                            onGenerateModel={handleGenerate}
                            isGenerating={isGenerating}
                        />

                        {isGenerating && (
                            <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50/80 border border-purple-100">
                                <div className="h-3 w-3 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                <span className="text-[11px] text-purple-600 font-medium">Generating model…</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* ═══════ CENTER — Grid Canvas / Workspace ═══════ */}
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
                    <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
                        <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent">
                            Workspace
                        </h1>

                        <div className="flex items-center gap-2">
                            {/* Save as Project */}
                            {generatedModel && (
                                <Button
                                    size="sm"
                                    className="h-7 text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                                    onClick={handleSaveAsProject}
                                >
                                    <FolderPlus className="h-3.5 w-3.5" />
                                    Save Project
                                </Button>
                            )}

                            {/* Toggle code panel */}
                            <Button
                                variant={showCodePanel ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs gap-1.5 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                                onClick={() => setShowCodePanel(!showCodePanel)}
                            >
                                <Code className="h-3.5 w-3.5" />
                                Code
                            </Button>
                        </div>
                    </div>

                    {/* Main canvas area — 3D Viewer or empty state */}
                    <div className="flex-1 relative">
                        {generatedModel ? (
                            <div className="absolute inset-0">
                                <CadModelViewer
                                    modelData={generatedModel}
                                    settings={viewerSettings}
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center max-w-sm">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                                        <Wand2 className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-600 mb-1.5">Your canvas is ready</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Describe your building, upload a sketch, or use voice — then hit <strong className="text-purple-600">Generate</strong>.
                                    </p>
                                    <div className="mt-5 flex items-center justify-center gap-3 text-[10px] text-gray-400">
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />Text</span>
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />Sketch</span>
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" />Voice</span>
                                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-400" />Photo</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════ RIGHT PANEL — Code Only ═══════ */}
            {showCodePanel && (
                <div className="w-[380px] min-w-[320px] flex flex-col border-l border-gray-200/80 bg-gray-950 z-10">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-semibold text-gray-200">Generated Code</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {generatedCode && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                                    onClick={handleCopyCode}
                                >
                                    {copied ? <><Check className="h-3 w-3 text-green-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                                </Button>
                            )}
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
                    <div className="flex-1 overflow-hidden">
                        {generatedCode ? (
                            <ScrollArea className="h-full">
                                <pre ref={codeRef} className="p-4 text-xs font-mono text-gray-300 leading-relaxed">
                                    <code>{generatedCode}</code>
                                </pre>
                            </ScrollArea>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center p-6">
                                    <Code className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">Three.js code will appear here</p>
                                    <p className="text-xs text-gray-600 mt-1">Generate a model to see the code</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
