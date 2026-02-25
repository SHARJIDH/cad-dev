import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';

export class ModelExporter {
    // Create realistic brick texture
    private createBrickTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // Mortar background
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(0, 0, 512, 512);
        
        // Bricks
        const brickHeight = 64;
        const brickWidth = 128;
        const mortarSize = 8;
        
        for (let y = 0; y < 512; y += brickHeight + mortarSize) {
            const offset = (Math.floor(y / (brickHeight + mortarSize)) % 2) * (brickWidth / 2);
            for (let x = -brickWidth; x < 512 + brickWidth; x += brickWidth + mortarSize) {
                const r = 160 + Math.random() * 30;
                const g = 70 + Math.random() * 20;
                const b = 50 + Math.random() * 15;
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x + offset, y, brickWidth, brickHeight);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    // Create wood floor texture
    private createWoodTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // Base wood color
        ctx.fillStyle = '#8B6F47';
        ctx.fillRect(0, 0, 512, 512);
        
        // Wood planks
        const plankWidth = 512;
        const plankHeight = 60;
        
        for (let y = 0; y < 512; y += plankHeight) {
            const shade = 139 + Math.random() * 20;
            ctx.fillStyle = `rgb(${shade}, ${shade * 0.8}, ${shade * 0.5})`;
            ctx.fillRect(0, y, plankWidth, plankHeight - 2);
            
            // Add wood grain
            ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.05})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(0, y + Math.random() * plankHeight);
                ctx.lineTo(512, y + Math.random() * plankHeight);
                ctx.stroke();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    // Create roof tile texture
    private createRoofTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        
        // Base roof color (terracotta)
        ctx.fillStyle = '#8B3A00';
        ctx.fillRect(0, 0, 512, 512);
        
        // Roof tiles
        const tileHeight = 40;
        const tileWidth = 80;
        
        for (let y = 0; y < 512; y += tileHeight) {
            const offset = (Math.floor(y / tileHeight) % 2) * (tileWidth / 2);
            for (let x = -tileWidth; x < 512 + tileWidth; x += tileWidth) {
                const r = 139 + Math.random() * 15;
                const g = 58 + Math.random() * 10;
                ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
                
                // Rounded tile
                ctx.beginPath();
                ctx.ellipse(
                    x + offset + tileWidth / 2, 
                    y + tileHeight / 2, 
                    tileWidth / 2 - 2, 
                    tileHeight / 2 - 2,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    private createSceneFromModelData(modelData: any): THREE.Scene {
        const scene = new THREE.Scene();

        if (!modelData.rooms || modelData.rooms.length === 0) {
            console.warn('No rooms in model data');
            return scene;
        }

        // Create textures
        const brickTexture = this.createBrickTexture();
        const woodTexture = this.createWoodTexture();
        const roofTexture = this.createRoofTexture();

        // Calculate building bounds
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        let maxY = 0;

        // Create rooms
        modelData.rooms.forEach((room: any) => {
            const { width, length, height, x, y, z, name } = room;
            
            // Update building bounds
            minX = Math.min(minX, x - width / 2);
            maxX = Math.max(maxX, x + width / 2);
            minZ = Math.min(minZ, z - length / 2);
            maxZ = Math.max(maxZ, z + length / 2);
            maxY = Math.max(maxY, y + height);

            // Floor with wood texture
            const floorGeometry = new THREE.BoxGeometry(width, 0.15, length);
            const floorMaterial = new THREE.MeshStandardMaterial({ 
                map: woodTexture.clone(),
                roughness: 0.9,
                metalness: 0.0
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.set(x, y, z);
            floor.name = `${name}_floor`;
            floor.castShadow = true;
            floor.receiveShadow = true;
            scene.add(floor);

            // Exterior walls with brick texture
            const wallMaterial = new THREE.MeshStandardMaterial({ 
                map: brickTexture.clone(),
                roughness: 0.95,
                metalness: 0.0,
                side: THREE.DoubleSide
            });
            const wallThickness = 0.25;

            // Front wall
            const frontWall = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, wallThickness),
                wallMaterial
            );
            frontWall.position.set(x, y + height / 2, z - length / 2);
            frontWall.name = `${name}_wall_front`;
            frontWall.castShadow = true;
            frontWall.receiveShadow = true;
            scene.add(frontWall);

            // Back wall
            const backWall = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, wallThickness),
                wallMaterial
            );
            backWall.position.set(x, y + height / 2, z + length / 2);
            backWall.name = `${name}_wall_back`;
            backWall.castShadow = true;
            backWall.receiveShadow = true;
            scene.add(backWall);

            // Left wall
            const leftWall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, height, length),
                wallMaterial
            );
            leftWall.position.set(x - width / 2, y + height / 2, z);
            leftWall.name = `${name}_wall_left`;
            leftWall.castShadow = true;
            leftWall.receiveShadow = true;
            scene.add(leftWall);

            // Right wall
            const rightWall = new THREE.Mesh(
                new THREE.BoxGeometry(wallThickness, height, length),
                wallMaterial
            );
            rightWall.position.set(x + width / 2, y + height / 2, z);
            rightWall.name = `${name}_wall_right`;
            rightWall.castShadow = true;
            rightWall.receiveShadow = true;
            scene.add(rightWall);

            // Interior ceiling (white plaster)
            const ceilingGeometry = new THREE.BoxGeometry(width - wallThickness * 2, 0.1, length - wallThickness * 2);
            const ceilingMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xf8f8f8,
                roughness: 0.8,
                metalness: 0.0
            });
            const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
            ceiling.position.set(x, y + height - 0.05, z);
            ceiling.name = `${name}_ceiling`;
            ceiling.receiveShadow = true;
            scene.add(ceiling);
        });

        // Add realistic pitched roof
        const buildingWidth = maxX - minX;
        const buildingLength = maxZ - minZ;
        const buildingCenterX = (minX + maxX) / 2;
        const buildingCenterZ = (minZ + maxZ) / 2;
        const roofHeight = Math.max(buildingWidth, buildingLength) * 0.35; // 35% pitch
        const roofOverhang = 0.5; // Roof extends beyond walls
        
        const roofMaterial = new THREE.MeshStandardMaterial({
            map: roofTexture,
            roughness: 0.85,
            metalness: 0.0
        });

        // Front roof slope
        const roofGeometry1 = new THREE.PlaneGeometry(
            buildingWidth + roofOverhang * 2, 
            Math.sqrt((buildingLength / 2) ** 2 + roofHeight ** 2)
        );
        const frontRoof = new THREE.Mesh(roofGeometry1, roofMaterial);
        frontRoof.rotation.x = -Math.atan2(roofHeight, buildingLength / 2);
        frontRoof.position.set(
            buildingCenterX,
            maxY + roofHeight / 2,
            buildingCenterZ - buildingLength / 4
        );
        frontRoof.castShadow = true;
        frontRoof.receiveShadow = true;
        scene.add(frontRoof);

        // Back roof slope
        const backRoof = new THREE.Mesh(roofGeometry1.clone(), roofMaterial.clone());
        backRoof.rotation.x = Math.atan2(roofHeight, buildingLength / 2);
        backRoof.position.set(
            buildingCenterX,
            maxY + roofHeight / 2,
            buildingCenterZ + buildingLength / 4
        );
        backRoof.castShadow = true;
        backRoof.receiveShadow = true;
        scene.add(backRoof);

        // Roof gable ends (triangular)
        const gableGeometry = new THREE.BufferGeometry();
        const gableVertices = new Float32Array([
            -buildingWidth / 2 - roofOverhang, 0, 0,
            buildingWidth / 2 + roofOverhang, 0, 0,
            0, roofHeight, 0
        ]);
        gableGeometry.setAttribute('position', new THREE.BufferAttribute(gableVertices, 3));
        gableGeometry.computeVertexNormals();
        
        const gableMaterial = new THREE.MeshStandardMaterial({
            map: brickTexture.clone(),
            roughness: 0.9,
            metalness: 0.0,
            side: THREE.DoubleSide
        });
        
        const frontGable = new THREE.Mesh(gableGeometry, gableMaterial);
        frontGable.position.set(buildingCenterX, maxY, minZ - roofOverhang);
        frontGable.castShadow = true;
        scene.add(frontGable);
        
        const backGable = new THREE.Mesh(gableGeometry.clone(), gableMaterial.clone());
        backGable.position.set(buildingCenterX, maxY, maxZ + roofOverhang);
        backGable.rotation.y = Math.PI;
        backGable.castShadow = true;
        scene.add(backGable);

        // Add chimney on the roof
        const chimneyWidth = 0.6;
        const chimneyHeight = roofHeight * 0.7;
        const chimneyGeometry = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyWidth);
        const chimneyMaterial = new THREE.MeshStandardMaterial({
            map: brickTexture.clone(),
            roughness: 0.9,
            metalness: 0.0
        });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(
            buildingCenterX + buildingWidth * 0.3,
            maxY + roofHeight + chimneyHeight / 2 - 0.3,
            buildingCenterZ
        );
        chimney.castShadow = true;
        scene.add(chimney);

        // Chimney cap
        const capGeometry = new THREE.BoxGeometry(chimneyWidth + 0.15, 0.15, chimneyWidth + 0.15);
        const capMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.set(
            buildingCenterX + buildingWidth * 0.3,
            maxY + roofHeight + chimneyHeight,
            buildingCenterZ
        );
        scene.add(cap);

        // Add foundation/basement
        const foundationHeight = 0.4;
        const foundationGeometry = new THREE.BoxGeometry(buildingWidth + 0.4, foundationHeight, buildingLength + 0.4);
        const foundationMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a5a5a,
            roughness: 0.95,
            metalness: 0.0
        });
        const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        foundation.position.set(buildingCenterX, -foundationHeight / 2, buildingCenterZ);
        foundation.receiveShadow = true;
        scene.add(foundation);

        // Add front porch/entrance
        const porchWidth = Math.min(buildingWidth * 0.4, 3);
        const porchDepth = 1.5;
        const porchHeight = 0.15;
        
        // Porch floor
        const porchFloorGeometry = new THREE.BoxGeometry(porchWidth, porchHeight, porchDepth);
        const porchFloorMaterial = new THREE.MeshStandardMaterial({
            map: woodTexture.clone(),
            roughness: 0.8,
            metalness: 0.0
        });
        const porchFloor = new THREE.Mesh(porchFloorGeometry, porchFloorMaterial);
        porchFloor.position.set(buildingCenterX, 0.3, minZ - porchDepth / 2);
        porchFloor.castShadow = true;
        porchFloor.receiveShadow = true;
        scene.add(porchFloor);

        // Porch columns
        const columnRadius = 0.12;
        const columnHeight = 2.5;
        const columnGeometry = new THREE.CylinderGeometry(columnRadius, columnRadius, columnHeight, 12);
        const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.2
        });
        
        const leftColumn = new THREE.Mesh(columnGeometry, columnMaterial);
        leftColumn.position.set(buildingCenterX - porchWidth / 2 + 0.3, columnHeight / 2 + 0.3, minZ - porchDepth + 0.3);
        leftColumn.castShadow = true;
        scene.add(leftColumn);
        
        const rightColumn = new THREE.Mesh(columnGeometry, columnMaterial.clone());
        rightColumn.position.set(buildingCenterX + porchWidth / 2 - 0.3, columnHeight / 2 + 0.3, minZ - porchDepth + 0.3);
        rightColumn.castShadow = true;
        scene.add(rightColumn);

        // Entrance steps
        const stepWidth = porchWidth;
        const stepDepth = 0.35;
        const stepHeight = 0.15;
        const numSteps = 3;
        
        for (let i = 0; i < numSteps; i++) {
            const stepGeometry = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
            const stepMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.9,
                metalness: 0.0
            });
            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            step.position.set(
                buildingCenterX,
                stepHeight / 2 + i * stepHeight,
                minZ - porchDepth - stepDepth / 2 - i * stepDepth
            );
            step.castShadow = true;
            step.receiveShadow = true;
            scene.add(step);
        }

        // Add landscaping - grass base
        const grassRadius = Math.max(buildingWidth, buildingLength) * 1.5;
        const grassGeometry = new THREE.CircleGeometry(grassRadius, 64);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 1.0,
            metalness: 0.0
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.set(buildingCenterX, -foundationHeight - 0.01, buildingCenterZ);
        grass.receiveShadow = true;
        scene.add(grass);

        // Add decorative bushes
        const bushGeometry = new THREE.SphereGeometry(0.5, 12, 12);
        const bushMaterial = new THREE.MeshStandardMaterial({
            color: 0x228b22,
            roughness: 0.95,
            metalness: 0.0
        });
        
        // Bushes along front
        for (let i = 0; i < 4; i++) {
            const bush = new THREE.Mesh(bushGeometry, bushMaterial.clone());
            const xPos = buildingCenterX - buildingWidth / 2 + (buildingWidth / 3) * i;
            bush.position.set(xPos, 0.3, minZ - 0.5);
            bush.castShadow = true;
            scene.add(bush);
        }

        // Add realistic windows with frames
        if (modelData.windows && modelData.windows.length > 0) {
            modelData.windows.forEach((window: any) => {
                const room = modelData.rooms.find((r: any) => r.name === window.room);
                if (!room) return;
                
                // Glass pane
                const glassMaterial = new THREE.MeshPhysicalMaterial({ 
                    color: 0xadd8e6,
                    transparent: true,
                    opacity: 0.4,
                    roughness: 0.05,
                    metalness: 0.1,
                    transmission: 0.9,
                    thickness: 0.01
                });
                
                const windowGeometry = new THREE.BoxGeometry(window.width || 1.2, window.height || 1.5, 0.02);
                const windowGlass = new THREE.Mesh(windowGeometry, glassMaterial);
                
                // Window frame
                const frameThickness = 0.08;
                const frameMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.6,
                    metalness: 0.3
                });
                
                // Vertical frames
                const vFrameGeometry = new THREE.BoxGeometry(frameThickness, window.height || 1.5, frameThickness);
                const leftFrame = new THREE.Mesh(vFrameGeometry, frameMaterial);
                const rightFrame = new THREE.Mesh(vFrameGeometry, frameMaterial.clone());
                
                // Horizontal frames  
                const hFrameGeometry = new THREE.BoxGeometry(window.width || 1.2, frameThickness, frameThickness);
                const topFrame = new THREE.Mesh(hFrameGeometry, frameMaterial.clone());
                const bottomFrame = new THREE.Mesh(hFrameGeometry, frameMaterial.clone());
                
                // Create window group
                const windowGroup = new THREE.Group();
                windowGroup.add(windowGlass);
                
                leftFrame.position.set(-(window.width || 1.2) / 2, 0, frameThickness / 2);
                rightFrame.position.set((window.width || 1.2) / 2, 0, frameThickness / 2);
                topFrame.position.set(0, (window.height || 1.5) / 2, frameThickness / 2);
                bottomFrame.position.set(0, -(window.height || 1.5) / 2, frameThickness / 2);
                
                windowGroup.add(leftFrame, rightFrame, topFrame, bottomFrame);
                
                // Add window sill
                const sillGeometry = new THREE.BoxGeometry((window.width || 1.2) + 0.2, 0.05, 0.15);
                const sillMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.5,
                    metalness: 0.2
                });
                const sill = new THREE.Mesh(sillGeometry, sillMaterial);
                sill.position.set(0, -(window.height || 1.5) / 2 - 0.05, 0.08);
                windowGroup.add(sill);
                
                // Position on wall
                windowGroup.position.set(
                    room.x + (window.position || 0),
                    room.y + (window.height || 1.5) / 2 + 1.2,
                    room.z - room.length / 2 + 0.1
                );
                windowGroup.name = `${window.room}_window`;
                windowGroup.castShadow = true;
                scene.add(windowGroup);
            });
        }

        // Add door(s)
        if (modelData.doors && modelData.doors.length > 0) {
            modelData.doors.forEach((door: any) => {
                const room = modelData.rooms.find((r: any) => r.name === door.room);
                if (!room) return;
                
                const doorWidth = door.width || 0.9;
                const doorHeight = door.height || 2.1;
                
                const doorMaterial = new THREE.MeshStandardMaterial({
                    map: woodTexture.clone(),
                    roughness: 0.7,
                    metalness: 0.1,
                    color: 0x654321
                });
                
                const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.05);
                const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
                
                // Door knob
                const knobGeometry = new THREE.SphereGeometry(0.04, 16, 16);
                const knobMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    roughness: 0.3,
                    metalness: 0.9
                });
                const knob = new THREE.Mesh(knobGeometry, knobMaterial);
                knob.position.set(doorWidth / 2 - 0.15, 0, 0.05);
                doorMesh.add(knob);
                
                doorMesh.position.set(
                    room.x + (door.position || 0),
                    room.y + doorHeight / 2,
                    room.z - room.length / 2 + 0.1
                );
                doorMesh.castShadow = true;
                doorMesh.name = `${room.name}_door`;
                scene.add(doorMesh);
            });
        }

        // Add realistic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Main sun light
        const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
        sunLight.position.set(15, 20, 10);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);

        // Sky hemisphere light for natural ambiance
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.4);
        scene.add(hemisphereLight);

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
