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

        console.log('=== Walkthrough Data ===');
        console.log('Total rooms:', modelData.rooms.length);
        console.log('Room details:', modelData.rooms.map(r => ({
            name: r.name,
            position: `(${r.x}, ${r.z})`,
            size: `${r.width}×${r.length}×${r.height}`
        })));

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

        // Build the building
        const buildingGroup = new THREE.Group();

        modelData.rooms.forEach((room) => {
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: 0xd4a574,
                roughness: 0.6,
                side: THREE.DoubleSide,
            });

            // Floor
            const floor = new THREE.Mesh(
                new THREE.BoxGeometry(room.width, 0.1, room.length),
                new THREE.MeshStandardMaterial({ color: 0x8b7355, side: THREE.DoubleSide })
            );
            floor.position.set(room.x, 0.05, room.z);
            buildingGroup.add(floor);

            // Walls
            const wallThickness = 0.2;

            // Front and back walls
            [
                { z: room.z - room.length / 2 },
                { z: room.z + room.length / 2 },
            ].forEach(({ z }) => {
                const wall = new THREE.Mesh(
                    new THREE.BoxGeometry(room.width, room.height, wallThickness),
                    wallMaterial
                );
                wall.position.set(room.x, room.height / 2, z);
                buildingGroup.add(wall);
            });

            // Left and right walls
            [
                { x: room.x - room.width / 2 },
                { x: room.x + room.width / 2 },
            ].forEach(({ x }) => {
                const wall = new THREE.Mesh(
                    new THREE.BoxGeometry(wallThickness, room.height, room.length),
                    wallMaterial
                );
                wall.position.set(x, room.height / 2, room.z);
                buildingGroup.add(wall);
            });

            // Ceiling
            const ceiling = new THREE.Mesh(
                new THREE.BoxGeometry(room.width, 0.1, room.length),
                new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
            );
            ceiling.position.set(room.x, room.height - 0.05, room.z);
            buildingGroup.add(ceiling);

            // Add a label cube at room center
            const labelCube = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.4, 0.4),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            labelCube.position.set(room.x, 2, room.z);
            buildingGroup.add(labelCube);
        });

        scene.add(buildingGroup);

        // Calculate building bounds including vertical offset
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        let maxHeight = 0;
        
        modelData.rooms.forEach((room, index) => {
            const verticalOffset = index * (room.height + 0.5);
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
        if (modelData.rooms.length > 0) {
            const distance = maxDimension * 1.8;
            const height = maxHeight * 0.8;
            camera.position.set(centerX - distance * 0.3, height * 1.2, centerZ + distance);
            camera.lookAt(centerX, height * 0.5, centerZ);
            console.log('Building bounds:', { minX, maxX, minZ, maxZ, width, length, maxHeight });
            console.log('Camera positioned at:', camera.position);
        }

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
            if (modelData.rooms.length > 0) {
                let centerX = 0, centerZ = 0;
                modelData.rooms.forEach(room => {
                    centerX += room.x;
                    centerZ += room.z;
                });
                centerX /= modelData.rooms.length;
                centerZ /= modelData.rooms.length;
                camera.lookAt(centerX, 0, centerZ);
            }

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
                <div className="text-sm font-medium">3D Building View</div>
                <div className="text-xs opacity-75">
                    <p>Use WASD to move around • ESC to exit</p>
                    <p className="mt-1">Red cubes mark room centers</p>
                </div>
            </div>
        </div>
    );
}
