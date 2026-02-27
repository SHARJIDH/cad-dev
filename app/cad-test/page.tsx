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
        <div className="container mx-auto py-6 bg-gradient-to-br from-orange-50/30 via-white dark:via-dark-bg to-amber-50/30 dark:from-dark-bg dark:to-dark-surface min-h-screen">
            <Card className="border-2 border-gray-100 dark:border-dark-border shadow-lg dark:bg-dark-surface">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 border-b dark:border-dark-border">
                    <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">CAD Viewer Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px] border dark:border-dark-border rounded-md overflow-hidden">
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
                            className="shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        >
                            Back to CAD Generator
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
