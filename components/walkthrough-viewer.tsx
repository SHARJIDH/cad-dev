"use client";

import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Button } from "@/components/ui/button";
import { X, Maximize2, Info } from "lucide-react";

interface ModelData {
    rooms: {
        name: string;
        width: number;
        length: number;
        height: number;
        x: number;
        y: number;
        z: number;
        connected_to: string[];
        type?: string;
    }[];
    windows: {
        room: string;
        wall: string;
        width: number;
        height: number;
        position: number;
    }[];
    doors: {
        from: string;
        to: string;
        width: number;
        height: number;
    }[];
}

interface WalkthroughViewerProps {
    modelData: ModelData;
    onExit: () => void;
}

export function WalkthroughViewer({ modelData, onExit }: WalkthroughViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<PointerLockControls | null>(null);
    const isLockedRef = useRef(false);
    const [isLocked, setIsLocked] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [currentRoom, setCurrentRoom] = useState<string>("");
    const [isReady, setIsReady] = useState(false);
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });
    
    // Sync isLocked with ref
    useEffect(() => {
        isLockedRef.current = isLocked;
    }, [isLocked]);

    useEffect(() => {
        if (!containerRef.current || !modelData) return;

        console.log('Initializing walkthrough viewer...');
        console.log('Model data:', modelData);
        console.log('Rooms count:', modelData.rooms?.length || 0);
        setIsReady(false);

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb); // Sky blue
        scene.fog = new THREE.Fog(0x87ceeb, 0, 100);
        console.log('Scene created with sky blue background');

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,  // Very close near plane to see nearby walls
            1000
        );
        camera.position.y = 1.6; // Eye height (meters)

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        containerRef.current.appendChild(renderer.domElement);
        console.log('Renderer created and attached to DOM');

        // Lighting - Much brighter for interior view
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x228b22,
            roughness: 0.8,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Build the model
        const buildingGroup = new THREE.Group();
        const roomBounds: { name: string; min: THREE.Vector3; max: THREE.Vector3 }[] = [];

        modelData.rooms.forEach((room) => {
            if (room.width <= 0 || room.length <= 0 || room.height <= 0) return;

            // Floor
            const floorGeometry = new THREE.BoxGeometry(room.width, 0.1, room.length);
            const floorMaterial = new THREE.MeshStandardMaterial({
                color: 0x8b7355, // Darker wood brown
                roughness: 0.7,
                side: THREE.DoubleSide,
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.set(room.x, 0.05, room.z);
            floor.receiveShadow = true;
            buildingGroup.add(floor);

            // Walls with visible patterns
            const wallThickness = 0.2;
            
            // Create a canvas texture with stripes for walls
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#d4a574';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#a87d4e';
            for (let i = 0; i < 256; i += 32) {
                ctx.fillRect(i, 0, 16, 256);
            }
            const wallTexture = new THREE.CanvasTexture(canvas);
            wallTexture.wrapS = THREE.RepeatWrapping;
            wallTexture.wrapT = THREE.RepeatWrapping;
            wallTexture.repeat.set(2, 2);
            
            const wallMaterial = new THREE.MeshStandardMaterial({
                map: wallTexture,
                roughness: 0.6,
                side: THREE.DoubleSide,
            });

            // Front wall
            const frontWall = new THREE.Mesh(
                new THREE.BoxGeometry(room.width, room.height, wallThickness),
                wallMaterial
            );
            frontWall.position.set(room.x, room.height / 2, room.z - room.length / 2);
            frontWall.castShadow = true;
            buildingGroup.add(frontWall);

            // Back wall
            const backWall = new THREE.Mesh(
                new THREE.BoxGeometry(room.width, room.height, wallThickness),
                wallMaterial
            );
            backWall.position.set(room.x, room.height / 2, room.z + room.length / 2);
            backWall.castShadow = true;
            buildingGroup.add(backWall);

            // Left wall
            const leftWall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, room.height, room.length),
                wallMaterial
            );
            leftWall.position.set(room.x - room.width / 2, room.height / 2, room.z);
            leftWall.castShadow = true;
            buildingGroup.add(leftWall);

            // Right wall
            const rightWall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, room.height, room.length),
                wallMaterial
            );
            rightWall.position.set(room.x + room.width / 2, room.height / 2, room.z);
            rightWall.castShadow = true;
            buildingGroup.add(rightWall);

            // Ceiling
            const ceilingGeometry = new THREE.BoxGeometry(room.width, 0.1, room.length);
            const ceilingMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.9,
                side: THREE.DoubleSide,
            });
            const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
            ceiling.position.set(room.x, room.height - 0.05, room.z);
            buildingGroup.add(ceiling);

            // Add interior point light for each room
            const roomLight = new THREE.PointLight(0xffffff, 1.5, room.width * 3);
            roomLight.position.set(room.x, room.height - 0.5, room.z);
            buildingGroup.add(roomLight);

            // Add colorful corner markers to help navigation
            const markerGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red
            
            // 4 corner markers
            const corners = [
                [room.x - room.width/2, room.z - room.length/2],
                [room.x + room.width/2, room.z - room.length/2],
                [room.x - room.width/2, room.z + room.length/2],
                [room.x + room.width/2, room.z + room.length/2],
            ];
            
            corners.forEach(([x, z]) => {
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(x, 1.6, z);
                buildingGroup.add(marker);
            });
            
            // Add a bright directional arrow in the room so user knows they can look around
            const arrowShape = new THREE.ConeGeometry(0.3, 1, 8);
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const arrow = new THREE.Mesh(arrowShape, arrowMaterial);
            arrow.position.set(room.x, 1, room.z - room.length/4);
            arrow.rotation.x = Math.PI / 2;
            buildingGroup.add(arrow);

            // Store room bounds for collision detection
            roomBounds.push({
                name: room.name,
                min: new THREE.Vector3(
                    room.x - room.width / 2,
                    0,
                    room.z - room.length / 2
                ),
                max: new THREE.Vector3(
                    room.x + room.width / 2,
                    room.height,
                    room.z + room.length / 2
                ),
            });
        });

        // Position camera outside the building for overview
        if (modelData.rooms.length > 0) {
            const firstRoom = modelData.rooms[0];
            // Position camera far back and high up to see entire building
            camera.position.set(firstRoom.x, 8, firstRoom.z + 20);
            camera.lookAt(firstRoom.x, 0, firstRoom.z);
            setCurrentRoom('Building Overview');
            console.log('Camera positioned for overview at:', camera.position);
        }

        // Add a test cube to verify rendering
        const testCube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        testCube.position.set(0, 1, 0);
        scene.add(testCube);
        console.log('Test cube added at origin');

        scene.add(buildingGroup);
        console.log('Building added to scene, total objects:', scene.children.length);
        console.log('Building group children:', buildingGroup.children.length);

        // Simple mouse look without pointer lock
        let mouseX = 0;
        let mouseY = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        
        const onMouseMove = (event: MouseEvent) => {
            if (!isLockedRef.current) return;
            
            const deltaX = event.movementX || 0;
            const deltaY = event.movementY || 0;
            
            targetRotY += deltaX * 0.002;
            targetRotX += deltaY * 0.002;
            
            // Clamp vertical rotation
            targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotX));
        };
        
        document.addEventListener('mousemove', onMouseMove);

        // Mark as ready after a short delay to ensure everything is rendered
        setTimeout(() => {
            console.log('Walkthrough viewer is ready!');
            setIsReady(true);
            // Do an initial render
            renderer.render(scene, camera);
            console.log('Initial render complete');
        }, 100);

        // Movement variables
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();
        const moveSpeed = 5.0;
        const keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };

        // Keyboard controls
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    keys.right = true;
                    break;
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    keys.right = false;
                    break;
                case 'Escape':
                    onExit();
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Detect current room
        const detectCurrentRoom = (position: THREE.Vector3) => {
            for (const room of roomBounds) {
                if (
                    position.x >= room.min.x &&
                    position.x <= room.max.x &&
                    position.z >= room.min.z &&
                    position.z <= room.max.z
                ) {
                    setCurrentRoom(room.name);
                    return;
                }
            }
            setCurrentRoom("");
        };

        // Animation loop
        const clock = new THREE.Clock();
        let prevTime = performance.now();
        let animationId: number;

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            const time = performance.now();
            const delta = (time - prevTime) / 1000;

            if (isLockedRef.current) {
                // Apply friction
                velocity.x -= velocity.x * 10.0 * delta;
                velocity.z -= velocity.z * 10.0 * delta;

                // Get movement direction
                direction.z = Number(keys.forward) - Number(keys.backward);
                direction.x = Number(keys.right) - Number(keys.left);
                direction.normalize();

                // Apply movement
                if (keys.forward || keys.backward) {
                    velocity.z -= direction.z * moveSpeed * delta;
                }
                if (keys.left || keys.right) {
                    velocity.x -= direction.x * moveSpeed * delta;
                }

                // Simple movement without camera rotation
                camera.position.x += velocity.x * delta;
                camera.position.z += velocity.z * delta;
                
                // Keep camera at fixed height looking down at building
                camera.position.y = 8;
                const centerX = modelData.rooms[0]?.x || 0;
                const centerZ = modelData.rooms[0]?.z || 0;
                camera.lookAt(centerX, 0, centerZ);

                // Detect current room
                detectCurrentRoom(camera.position);
                
                // Update position display
                setCameraPos({
                    x: Math.round(camera.position.x * 10) / 10,
                    y: Math.round(camera.position.y * 10) / 10,
                    z: Math.round(camera.position.z * 10) / 10
                });
            }

            prevTime = time;
            // Always render, even when not locked
            renderer.render(scene, camera);
        };

        console.log('Starting animation loop...');
        animate();
        
        // Force an immediate render
        renderer.render(scene, camera);
        console.log('First render executed');

        // Handle window resize
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize);

        // Cleanup
        return () => {
            console.log('Cleaning up walkthrough viewer...');
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onWindowResize);
            controlsRef.current = null;
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [modelData]);

    const handleStartWalkthrough = () => {
        console.log('Starting walkthrough...');
        setIsLocked(true);
        setShowInstructions(false);
        // Request pointer lock for hiding cursor
        containerRef.current?.requestPointerLock?.();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Canvas container - always visible */}
            <div 
                ref={containerRef} 
                className="absolute inset-0 w-full h-full"
                style={{ width: '100vw', height: '100vh' }}
            />

            {/* Exit button - always on top */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-50"
                onClick={onExit}
            >
                <X className="h-4 w-4" />
            </Button>

            {/* Crosshair - shows you're in first-person mode */}
            {isLocked && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
                    <div className="w-4 h-4 border-2 border-white rounded-full opacity-50"></div>
                </div>
            )}

            {/* Current room indicator */}
            {isLocked && currentRoom && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg z-40 space-y-1">
                    <div className="text-sm font-medium">{currentRoom}</div>
                    <div className="text-xs opacity-75">
                        Position: ({cameraPos.x}, {cameraPos.y}, {cameraPos.z})
                    </div>
                    <div className="text-xs opacity-75">
                        Move mouse to look around • WASD to move
                    </div>
                </div>
            )}

            {/* Instructions overlay */}
            {!isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-40">
                    <div className="bg-white dark:bg-dark-surface rounded-xl p-8 max-w-md text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mx-auto">
                            <Maximize2 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Virtual Walkthrough
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Explore your architectural design in first-person view
                        </p>
                        <div className="bg-gray-50 dark:bg-dark-accent rounded-lg p-4 space-y-2 text-left">
                            <div className="flex items-start gap-2">
                                <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-gray-900 dark:text-white">Controls:</p>
                                    <ul className="text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                                        <li>• <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs font-mono">W A S D</kbd> or Arrow keys to move</li>
                                        <li>• <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs font-mono">Mouse</kbd> to look around</li>
                                        <li>• <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs font-mono">ESC</kbd> to pause</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            onClick={handleStartWalkthrough}
                            disabled={!isReady}
                        >
                            {isReady ? 'Start Walkthrough' : 'Loading...'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
