import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export class ModelExporter {
    private createSceneFromModelData(modelData: any): THREE.Scene {
        const scene = new THREE.Scene();

        if (!modelData.rooms || modelData.rooms.length === 0) {
            console.warn('No rooms in model data');
            return scene;
        }

        // Create rooms
        modelData.rooms.forEach((room: any) => {
            const { width, length, height, x, y, z, name } = room;

            // Floor
            const floorGeometry = new THREE.BoxGeometry(width, 0.1, length);
            const floorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xcccccc,
                roughness: 0.8,
                metalness: 0.2
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.set(x, y, z);
            floor.name = `${name}_floor`;
            scene.add(floor);

            // Walls
            const wallMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xf0f0f0,
                side: THREE.DoubleSide,
                roughness: 0.9,
                metalness: 0.1
            });
            const wallThickness = 0.15;

            // Front wall
            const frontWall = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, wallThickness),
                wallMaterial
            );
            frontWall.position.set(x, y + height / 2, z - length / 2);
            frontWall.name = `${name}_wall_front`;
            scene.add(frontWall);

            // Back wall
            const backWall = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, wallThickness),
                wallMaterial
            );
            backWall.position.set(x, y + height / 2, z + length / 2);
            backWall.name = `${name}_wall_back`;
            scene.add(backWall);

            // Left wall
            const leftWall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, height, length),
                wallMaterial
            );
            leftWall.position.set(x - width / 2, y + height / 2, z);
            leftWall.name = `${name}_wall_left`;
            scene.add(leftWall);

            // Right wall
            const rightWall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, height, length),
                wallMaterial
            );
            rightWall.position.set(x + width / 2, y + height / 2, z);
            rightWall.name = `${name}_wall_right`;
            scene.add(rightWall);

            // Ceiling
            const ceilingGeometry = new THREE.BoxGeometry(width, 0.1, length);
            const ceilingMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                roughness: 0.7,
                metalness: 0.1
            });
            const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
            ceiling.position.set(x, y + height, z);
            ceiling.name = `${name}_ceiling`;
            scene.add(ceiling);
        });

        // Add windows
        if (modelData.windows) {
            modelData.windows.forEach((window: any) => {
                const windowMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x87ceeb,
                    transparent: true,
                    opacity: 0.6,
                    roughness: 0.1,
                    metalness: 0.9
                });
                
                const windowGeometry = new THREE.BoxGeometry(window.width, window.height, 0.05);
                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                
                // Position window (simplified - you may need to adjust based on wall)
                const room = modelData.rooms.find((r: any) => r.name === window.room);
                if (room) {
                    windowMesh.position.set(
                        room.x + window.position,
                        room.y + window.height / 2 + 1,
                        room.z - room.length / 2
                    );
                    windowMesh.name = `${window.room}_window`;
                    scene.add(windowMesh);
                }
            });
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        return scene;
    }

    async exportAsGLTF(modelData: any): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const scene = this.createSceneFromModelData(modelData);
            const exporter = new GLTFExporter();

            exporter.parse(
                scene,
                (gltf) => {
                    const output = JSON.stringify(gltf, null, 2);
                    const blob = new Blob([output], { type: 'application/json' });
                    resolve(blob);
                },
                (error) => {
                    reject(error);
                },
                {
                    binary: false,
                    trs: false,
                    onlyVisible: true,
                    truncateDrawRange: true,
                    maxTextureSize: 4096
                }
            );
        });
    }

    async exportAsGLB(modelData: any): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const scene = this.createSceneFromModelData(modelData);
            const exporter = new GLTFExporter();

            exporter.parse(
                scene,
                (gltf) => {
                    const blob = new Blob([gltf as ArrayBuffer], { 
                        type: 'application/octet-stream' 
                    });
                    resolve(blob);
                },
                (error) => {
                    reject(error);
                },
                {
                    binary: true,
                    trs: false,
                    onlyVisible: true,
                    truncateDrawRange: true,
                    maxTextureSize: 4096
                }
            );
        });
    }

    exportAsOBJ(modelData: any): { obj: Blob; mtl?: Blob } {
        const scene = this.createSceneFromModelData(modelData);
        const exporter = new OBJExporter();
        
        const objString = exporter.parse(scene);
        const objBlob = new Blob([objString], { type: 'text/plain' });

        return { obj: objBlob };
    }

    exportAsSTL(modelData: any): Blob {
        // For STL, we'll create a simplified geometry
        const scene = this.createSceneFromModelData(modelData);
        
        let stlString = 'solid model\n';
        
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                const matrix = object.matrixWorld;
                
                if (geometry.index) {
                    const positions = geometry.attributes.position;
                    const indices = geometry.index.array;
                    
                    for (let i = 0; i < indices.length; i += 3) {
                        const v1 = new THREE.Vector3().fromBufferAttribute(positions, indices[i]);
                        const v2 = new THREE.Vector3().fromBufferAttribute(positions, indices[i + 1]);
                        const v3 = new THREE.Vector3().fromBufferAttribute(positions, indices[i + 2]);
                        
                        v1.applyMatrix4(matrix);
                        v2.applyMatrix4(matrix);
                        v3.applyMatrix4(matrix);
                        
                        const normal = new THREE.Vector3()
                            .crossVectors(
                                new THREE.Vector3().subVectors(v2, v1),
                                new THREE.Vector3().subVectors(v3, v1)
                            )
                            .normalize();
                        
                        stlString += `facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
                        stlString += 'outer loop\n';
                        stlString += `vertex ${v1.x} ${v1.y} ${v1.z}\n`;
                        stlString += `vertex ${v2.x} ${v2.y} ${v2.z}\n`;
                        stlString += `vertex ${v3.x} ${v3.y} ${v3.z}\n`;
                        stlString += 'endloop\n';
                        stlString += 'endfacet\n';
                    }
                }
            }
        });
        
        stlString += 'endsolid model\n';
        
        return new Blob([stlString], { type: 'text/plain' });
    }

    exportAs2DSVG(modelData: any, width: number = 800, height: number = 600): Blob {
        if (!modelData.rooms || modelData.rooms.length === 0) {
            throw new Error('No rooms in model data');
        }

        // Calculate bounds
        let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
        
        modelData.rooms.forEach((room: any) => {
            const x1 = room.x - room.width / 2;
            const x2 = room.x + room.width / 2;
            const z1 = room.z - room.length / 2;
            const z2 = room.z + room.length / 2;
            
            minX = Math.min(minX, x1);
            maxX = Math.max(maxX, x2);
            minZ = Math.min(minZ, z1);
            maxZ = Math.max(maxZ, z2);
        });

        const modelWidth = maxX - minX;
        const modelDepth = maxZ - minZ;
        const padding = 60;
        const scale = Math.min(
            (width - padding * 2) / modelWidth,
            (height - padding * 2) / modelDepth
        );

        const offsetX = width / 2 - (minX + modelWidth / 2) * scale;
        const offsetY = height / 2 - (minZ + modelDepth / 2) * scale;

        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <style>
    .room { fill: #f5f5f5; stroke: #333; stroke-width: 2; }
    .room-label { font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; }
    .dimension { font-family: Arial, sans-serif; font-size: 10px; fill: #666; text-anchor: middle; }
  </style>
</defs>
`;

        // Draw grid
        svg += '<g id="grid" opacity="0.2">\n';
        for (let x = Math.floor(minX); x <= Math.ceil(maxX); x += 1) {
            const canvasX = x * scale + offsetX;
            svg += `<line x1="${canvasX}" y1="${padding}" x2="${canvasX}" y2="${height - padding}" stroke="#ccc" stroke-width="0.5"/>\n`;
        }
        for (let z = Math.floor(minZ); z <= Math.ceil(maxZ); z += 1) {
            const canvasY = z * scale + offsetY;
            svg += `<line x1="${padding}" y1="${canvasY}" x2="${width - padding}" y2="${canvasY}" stroke="#ccc" stroke-width="0.5"/>\n`;
        }
        svg += '</g>\n';

        // Draw rooms
        modelData.rooms.forEach((room: any) => {
            const x1 = (room.x - room.width / 2) * scale + offsetX;
            const y1 = (room.z - room.length / 2) * scale + offsetY;
            const rectWidth = room.width * scale;
            const rectHeight = room.length * scale;
            const centerX = room.x * scale + offsetX;
            const centerY = room.z * scale + offsetY;

            svg += `<rect x="${x1}" y="${y1}" width="${rectWidth}" height="${rectHeight}" class="room"/>\n`;
            svg += `<text x="${centerX}" y="${centerY}" class="room-label">${room.name}</text>\n`;
            svg += `<text x="${centerX}" y="${y1 - 10}" class="dimension">${room.width.toFixed(1)}m</text>\n`;
            svg += `<text x="${centerX}" y="${centerY + 20}" class="dimension">${(room.width * room.length).toFixed(1)}m²</text>\n`;
        });

        svg += '</svg>';

        return new Blob([svg], { type: 'image/svg+xml' });
    }
}

export const modelExporter = new ModelExporter();
