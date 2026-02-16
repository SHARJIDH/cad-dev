'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from './ui/button';
import { X } from 'lucide-react';

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

interface WalkthroughViewerProps {
    modelData: ModelData;
    onExit: () => void;
}

export function WalkthroughViewerSimple({ modelData, onExit }: WalkthroughViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current || !modelData) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000),
            new THREE.MeshStandardMaterial({ color: 0x228b22 })
        );
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // Build the building with exploded view
        const buildingGroup = new THREE.Group();
        let roomIndex = 0;

        // Color scheme by room type
        const getColorByRoomType = (name: string) => {
            if (name.includes('Bedroom')) return 0x87CEEB; // Sky blue
            if (name.includes('Bathroom')) return 0x90EE90; // Light green
            if (name.includes('Kitchen')) return 0xFFD700; // Gold
            if (name.includes('Living')) return 0xFF69B4; // Hot pink
            if (name.includes('Dining')) return 0xDEB887; // Tan
            return 0xD3D3D3; // Light gray
        };

        modelData.rooms.forEach((room) => {
            // Vertical offset for exploded view
            const verticalOffset = roomIndex * (room.height + 1);
            roomIndex++;

            const roomColor = getColorByRoomType(room.name);
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: roomColor,
                roughness: 0.6,
                metalness: 0.1,
                side: THREE.DoubleSide,
            });

            // Floor
            const floor = new THREE.Mesh(
                new THREE.BoxGeometry(room.width, 0.1, room.length),
                new THREE.MeshStandardMaterial({
                    color: Math.floor(roomColor * 0.7),
                    side: THREE.DoubleSide
                })
            );
            floor.position.set(room.x, verticalOffset + 0.05, room.z);
            buildingGroup.add(floor);

            const wallThickness = 0.2;

            // Front and back walls
            [
                { z: room.z - room.length / 2 },
                { z: room.z + room.length / 2 }
            ].forEach(({ z }) => {
                const wall = new THREE.Mesh(
                    new THREE.BoxGeometry(room.width, room.height, wallThickness),
                    wallMaterial
                );
                wall.position.set(room.x, verticalOffset + room.height / 2, z);
                buildingGroup.add(wall);
            });

            // Left and right walls
            [
                { x: room.x - room.width / 2 },
                { x: room.x + room.width / 2 }
            ].forEach(({ x }) => {
                const wall = new THREE.Mesh(
                    new THREE.BoxGeometry(wallThickness, room.height, room.length),
                    wallMaterial
                );
                wall.position.set(x, verticalOffset + room.height / 2, room.z);
                buildingGroup.add(wall);
            });

            // Ceiling
            const ceiling = new THREE.Mesh(
                new THREE.BoxGeometry(room.width, 0.1, room.length),
                new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
            );
            ceiling.position.set(room.x, verticalOffset + room.height - 0.05, room.z);
            buildingGroup.add(ceiling);

            // Room label
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(room.name, 128, 50);
            ctx.font = '20px Arial';
            ctx.fillText(`${(room.width * room.length).toFixed(0)} sqft`, 128, 90);

            const texture = new THREE.CanvasTexture(canvas);
            const labelMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(room.width * 0.8, 2),
                new THREE.MeshBasicMaterial({ map: texture })
            );
            labelMesh.position.set(room.x, verticalOffset + room.height / 2, room.z - room.length / 2 - 0.3);
            buildingGroup.add(labelMesh);

            // Red sphere marker at room center
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            marker.position.set(room.x, verticalOffset + 1.5, room.z);
            buildingGroup.add(marker);
        });

        scene.add(buildingGroup);

        // Calculate camera position
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        let maxHeight = 0;

        modelData.rooms.forEach((room, index) => {
            const verticalOffset = index * (room.height + 1);
            maxHeight = Math.max(maxHeight, verticalOffset + room.height);
            minX = Math.min(minX, room.x - room.width / 2);
            maxX = Math.max(maxX, room.x + room.width / 2);
            minZ = Math.min(minZ, room.z - room.length / 2);
            maxZ = Math.max(maxZ, room.z + room.length / 2);
        });

        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        const width = maxX - minX;
        const length = maxZ - minZ;
        const maxDimension = Math.max(width, length, maxHeight);

        // Position camera to see entire exploded building
        const distance = maxDimension * 2;
        const height = maxHeight * 1.2;
        camera.position.set(centerX - distance * 0.3, height, centerZ + distance);
        camera.lookAt(centerX, maxHeight * 0.6, centerZ);

        // Movement
        const keys = { w: false, a: false, s: false, d: false };
        const cameraSpeed = 10;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'W') keys.w = true;
            if (e.key === 'a' || e.key === 'A') keys.a = true;
            if (e.key === 's' || e.key === 'S') keys.s = true;
            if (e.key === 'd' || e.key === 'D') keys.d = true;
            if (e.key === 'Escape') onExit();
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'W') keys.w = false;
            if (e.key === 'a' || e.key === 'A') keys.a = false;
            if (e.key === 's' || e.key === 'S') keys.s = false;
            if (e.key === 'd' || e.key === 'D') keys.d = false;
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Animation loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);

            // Move camera based on keys
            if (keys.w) camera.position.z -= cameraSpeed * 0.016;
            if (keys.s) camera.position.z += cameraSpeed * 0.016;
            if (keys.a) camera.position.x -= cameraSpeed * 0.016;
            if (keys.d) camera.position.x += cameraSpeed * 0.016;

            // Always look at building center
            camera.lookAt(centerX, maxHeight * 0.6, centerZ);

            renderer.render(scene, camera);
        };

        animate();

        setTimeout(() => setIsReady(true), 100);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [modelData, onExit]);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <div ref={containerRef} className="absolute inset-0 w-full h-full" />

            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-50"
                onClick={onExit}
            >
                <X className="h-4 w-4" />
            </Button>

            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-3 rounded-lg z-40 space-y-2">
                <div className="text-sm font-medium">🏢 3D Building View (Exploded)</div>
                <div className="text-xs opacity-75">
                    <p>Use WASD to move around • ESC to exit</p>
                    <p className="mt-1">Each floor is a separate room • Colors show room type</p>
                </div>
            </div>
        </div>
    );
}
