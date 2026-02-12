"use client";

import { useState } from "react";
import { CadModelViewer } from "@/components/cad-model-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CadTestPage() {
    const [viewerSettings] = useState({
        showGrid: true,
        showAxes: true,
        backgroundColor: "#f0f0f0",
        lighting: "day",
        wireframe: false,
        zoom: 1,
        showMeasurements: false,
        roomLabels: true,
    });

    const sampleModelData = {
        rooms: [
            {
                name: "Living Room",
                width: 5,
                length: 4,
                height: 2.8,
                x: 0,
                y: 0,
                z: 0,
                connected_to: [],
            },
        ],
        windows: [
            {
                room: "Living Room",
                wall: "south",
                width: 2,
                height: 1.5,
                position: 0.5,
            },
        ],
        doors: [],
    };

    return (
        <div className="container mx-auto py-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
            <Card className="border-2 border-gray-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                    <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">CAD Viewer Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px] border rounded-md overflow-hidden">
                        <CadModelViewer
                            modelData={sampleModelData}
                            settings={viewerSettings}
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={() =>
                                (window.location.href = "/cad-generator")
                            }
                            className="shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                        >
                            Back to CAD Generator
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
