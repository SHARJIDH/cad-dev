"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Wand2,
    Mic,
    Camera,
    Pencil,
    Square,
    Trash,
    Check,
    X,
    Maximize2,
    Upload,
} from "lucide-react";
import { DesignCanvas } from "@/components/design-canvas";
import { toast } from "@/components/ui/use-toast";

interface InputPanelProps {
    onGenerateModel: (inputs: {
        prompt: string;
        sketchData: string | null;
        speechData: string | null;
        photoData: string | null;
    }) => void;
    isGenerating: boolean;
    hasConversationHistory?: boolean;
}

export function InputPanel({ onGenerateModel, isGenerating, hasConversationHistory = false }: InputPanelProps) {
    // Input state
    const [textPrompt, setTextPrompt] = useState("");
    const [speechTranscript, setSpeechTranscript] = useState("");
    const [photoData, setPhotoData] = useState<string | null>(null);
    const [hasPrompted, setHasPrompted] = useState(false);

    // Active tab state
    const [activeTab, setActiveTab] = useState<
        "text" | "sketch" | "speech" | "photo"
    >("text");

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Sketch state
    const canvasRef = useRef<any>(null);

    // Cleanup recording timer on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    // Text prompt handlers
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = e.target.value;
        setTextPrompt(nextValue);
        if (!hasPrompted && nextValue.trim().length > 0) {
            setHasPrompted(true);
        }
    };

    // Speech recording handlers
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });
                await processAudioRecording(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            toast({
                title: "Recording started",
                description:
                    "Speak clearly to describe your architectural design requirements.",
            });
        } catch (error) {
            console.error("Error starting recording:", error);
            toast({
                title: "Recording failed",
                description:
                    "Could not access microphone. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Clear timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const processAudioRecording = async (audioBlob: Blob) => {
        try {
            // Prepare form data
            const formData = new FormData();
            formData.append("audio", audioBlob);

            // Call speech-to-text API
            const response = await fetch("/api/speech-to-text", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process speech");
            }

            const data = await response.json();
            setSpeechTranscript(data.text);

            toast({
                title: "Speech processed",
                description: "Your speech has been converted to text.",
            });
        } catch (error) {
            console.error("Error processing speech:", error);
            toast({
                title: "Speech processing failed",
                description:
                    "Could not convert audio to text. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Camera handlers
    const activateCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsCameraActive(true);
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast({
                title: "Camera activation failed",
                description:
                    "Could not access camera. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const deactivateCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !isCameraActive) return;

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(
                    videoRef.current,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
                const dataUrl = canvas.toDataURL("image/png");
                setPhotoData(dataUrl);
                deactivateCamera();

                toast({
                    title: "Photo captured",
                    description:
                        "Your space photo has been captured for analysis.",
                });
            }
        } catch (error) {
            console.error("Error capturing photo:", error);
            toast({
                title: "Photo capture failed",
                description: "Could not capture photo. Please try again.",
                variant: "destructive",
            });
        }
    };

    const clearPhoto = () => {
        setPhotoData(null);
    };

    // File upload handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith("image/")) {
                processImageFile(file);
            } else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an image file (JPG, PNG, etc.)",
                    variant: "destructive",
                });
            }
        }
    };

    const processImageFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setPhotoData(e.target.result as string);
                toast({
                    title: "Image loaded",
                    description:
                        "Your floor plan image has been loaded for analysis.",
                });
            }
        };
        reader.readAsDataURL(file);
    };

    // Sketch capture
    const captureSketchData = (): string | null => {
        if (!canvasRef.current) return null;

        try {
            // Get canvas element from the DesignCanvas component
            const canvasElement = canvasRef.current.getCanvasElement();
            if (!canvasElement) {
                console.warn("Canvas element not available");
                return null;
            }

            // Convert canvas to data URL
            return canvasElement.toDataURL("image/png");
        } catch (error) {
            console.error("Error capturing sketch data:", error);
            return null;
        }
    };

    const clearSketch = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
        }
    };

    // Form submission
    const handleSubmit = () => {
        const sketchData = activeTab === "sketch" ? captureSketchData() : null;

        // Ensure at least one input is provided
        if (!textPrompt && !sketchData && !speechTranscript && !photoData) {
            toast({
                title: "No input provided",
                description:
                    "Please provide at least one input (text, sketch, speech, or photo).",
                variant: "destructive",
            });
            return;
        }

        // Call the parent function with all inputs
        setHasPrompted(true);
        onGenerateModel({
            prompt: textPrompt || speechTranscript || "", // Use speech transcript as fallback if no text
            sketchData,
            speechData: speechTranscript || null,
            photoData,
        });

        // Clear text input after submission
        setTextPrompt("");
        setSpeechTranscript("");
    };

    // Format time for recording display
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""
            }${remainingSeconds}`;
    };

    // Example prompts
    const examplePrompts = [
        "Design a modern single-story house with an open floor plan, 3 bedrooms, 2 bathrooms, and a large kitchen island.",
        "Create an office space with 5 private offices, a conference room, open workspace, and a kitchen area.",
        "Generate a small retail store layout with display areas, fitting rooms, checkout counter, and storage room.",
        "Design a restaurant with seating for 60 people, a bar area, kitchen, and restrooms.",
    ];

    const handleExampleClick = (example: string) => {
        setTextPrompt(example);
        setActiveTab("text");
        setHasPrompted(true);
    };

    // Input method help content
    const inputMethodHelp = {
        text: "Describe your building or space in detail. Include room types, dimensions, layout preferences, and any special features.",
        sketch: "Draw a floor plan or sketch of your design. Use the drawing tools to create walls, doors, windows, and other elements.",
        speech: "Speak clearly and describe your building requirements in detail. Include room types, dimensions, layout preferences, and any special features.",
        photo: "Take a photo of an existing space for reference or inspiration. Our AI will analyze the architectural elements and incorporate them into the design.",
    };

    return (
        <div className="flex flex-col h-full">
            {/* Compact tab pills */}
            <div className="flex gap-1 mb-3 p-1 rounded-lg bg-gray-100/80">
                {[
                    { key: "text", icon: <Wand2 className="h-3 w-3" />, label: "Text" },
                    { key: "sketch", icon: <Pencil className="h-3 w-3" />, label: "Sketch" },
                    { key: "speech", icon: <Mic className="h-3 w-3" />, label: "Voice" },
                    { key: "photo", icon: <Camera className="h-3 w-3" />, label: "Photo" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium transition-all ${activeTab === tab.key
                            ? "bg-white text-purple-700 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab(tab.key as any)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Text Input */}
            {activeTab === "text" && (
                <div className="flex-grow flex flex-col gap-3">
                    <Textarea
                        placeholder="Describe your building or space in detail..."
                        className="flex-grow resize-none min-h-[140px] text-sm border-gray-200 focus:border-purple-300 focus:ring-purple-200/50 rounded-lg placeholder:text-gray-400"
                        value={textPrompt}
                        onChange={handleTextChange}
                    />

                    {/* Example prompts */}
                    {!hasConversationHistory && !hasPrompted && textPrompt.trim().length === 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Try an example</p>
                            <div className="space-y-1.5">
                                {examplePrompts.map((example, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left text-xs p-2 rounded-lg border border-gray-100 bg-gray-50/50 text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all leading-relaxed group"
                                        onClick={() => handleExampleClick(example)}
                                    >
                                        <span className="opacity-80 group-hover:opacity-100">{example}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sketch Input */}
            {activeTab === "sketch" && (
                <div className="space-y-3 flex-grow flex flex-col">
                    <div className="flex justify-end items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (canvasRef.current) {
                                    const canvasElement =
                                        canvasRef.current.getCanvasElement();
                                    if (canvasElement && canvasElement.parentElement) {
                                        canvasElement.parentElement.requestFullscreen();
                                    }
                                }
                            }}
                            className="h-6 text-[10px] px-2 text-gray-500"
                        >
                            <Maximize2 className="h-3 w-3 mr-1" />
                            Expand
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSketch}
                            className="h-6 text-[10px] px-2 text-gray-500"
                        >
                            <Trash className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white flex-grow min-h-[250px]">
                        <DesignCanvas
                            projectId="multimodal-input"
                            ref={canvasRef}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400">
                        Draw your floor plan sketch. Use the tools to create walls, doors, and windows.
                    </p>
                </div>
            )}

            {/* Speech Input */}
            {activeTab === "speech" && (
                <div className="space-y-3 flex-grow flex flex-col">
                    <div className="flex justify-center py-4">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-105"
                            >
                                <Mic className="h-6 w-6" />
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    onClick={stopRecording}
                                    className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse"
                                >
                                    <Square className="h-5 w-5" />
                                </button>
                                <span className="text-xs text-red-500 font-mono">{formatTime(recordingTime)}</span>
                            </div>
                        )}
                    </div>

                    {speechTranscript ? (
                        <div className="relative rounded-lg border border-green-200 bg-green-50/50 p-3 flex-grow">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1.5 right-1.5 h-5 w-5"
                                onClick={() => setSpeechTranscript("")}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            <p className="text-[10px] font-semibold text-green-700 mb-1">Transcription:</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{speechTranscript}</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[100px] rounded-lg border border-dashed border-gray-200 flex-grow">
                            <p className="text-xs text-gray-400 text-center px-4">
                                {isRecording ? "Listening..." : "Tap the microphone and describe your design"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Photo Input */}
            {activeTab === "photo" && (
                <div className="space-y-3 flex-grow flex flex-col">
                    <div className="flex justify-end items-center gap-2">
                        {!isCameraActive && !photoData && (
                            <>
                                <Button
                                    onClick={activateCamera}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-[10px] px-2"
                                >
                                    <Camera className="h-3 w-3 mr-1" />
                                    Camera
                                </Button>
                                <label htmlFor="floor-plan-upload" className="cursor-pointer">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 text-[10px] px-2"
                                        type="button"
                                    >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Upload
                                    </Button>
                                    <input
                                        id="floor-plan-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </>
                        )}
                        {isCameraActive && (
                            <div className="flex gap-1.5">
                                <Button onClick={capturePhoto} size="sm" className="h-6 text-[10px] px-2 bg-purple-600">
                                    <Camera className="h-3 w-3 mr-1" />
                                    Capture
                                </Button>
                                <Button onClick={deactivateCamera} variant="outline" size="sm" className="h-6 text-[10px] px-2">
                                    Cancel
                                </Button>
                            </div>
                        )}
                        {photoData && (
                            <Button onClick={clearPhoto} variant="outline" size="sm" className="h-6 text-[10px] px-2">
                                <Trash className="h-3 w-3 mr-1" />
                                Remove
                            </Button>
                        )}
                    </div>

                    <div
                        className={`relative rounded-lg overflow-hidden bg-gray-900 flex-grow min-h-[200px] flex items-center justify-center ${!photoData && !isCameraActive ? "border-2 border-dashed border-gray-300" : "border border-gray-200"
                            }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {isCameraActive && (
                            <video ref={videoRef} autoPlay playsInline className="max-h-full max-w-full object-contain" />
                        )}
                        {photoData && (
                            <img src={photoData || "/placeholder.svg"} alt="Floor plan" className="max-h-full max-w-full object-contain" />
                        )}
                        {!isCameraActive && !photoData && (
                            <div className="text-center p-4">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-xs text-gray-400">Drag & drop an image or use the buttons above</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Input summary chips + Generate button */}
            <div className="mt-3 pt-3 border-t border-gray-100">
                {(textPrompt || speechTranscript || photoData || activeTab === "sketch") && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {textPrompt && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] py-0.5 px-2 rounded-full flex items-center gap-1">
                                <Wand2 className="h-2.5 w-2.5" /> Text
                                <Check className="h-2.5 w-2.5 text-green-600" />
                            </span>
                        )}
                        {activeTab === "sketch" && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] py-0.5 px-2 rounded-full flex items-center gap-1">
                                <Pencil className="h-2.5 w-2.5" /> Sketch
                                <Check className="h-2.5 w-2.5 text-green-600" />
                            </span>
                        )}
                        {speechTranscript && (
                            <span className="bg-violet-100 text-violet-700 text-[10px] py-0.5 px-2 rounded-full flex items-center gap-1">
                                <Mic className="h-2.5 w-2.5" /> Voice
                                <Check className="h-2.5 w-2.5 text-green-600" />
                            </span>
                        )}
                        {photoData && (
                            <span className="bg-pink-100 text-pink-700 text-[10px] py-0.5 px-2 rounded-full flex items-center gap-1">
                                <Camera className="h-2.5 w-2.5" /> Photo
                                <Check className="h-2.5 w-2.5 text-green-600" />
                            </span>
                        )}
                    </div>
                )}

                <Button
                    className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all font-semibold"
                    onClick={handleSubmit}
                    disabled={
                        isGenerating ||
                        (!textPrompt && !speechTranscript && activeTab !== "sketch" && !photoData)
                    }
                >
                    {isGenerating ? (
                        <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="h-4 w-4" />
                            Generate CAD Model
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
