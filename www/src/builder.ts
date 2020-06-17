import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { Scene, Vector3 } from "babylonjs";

import { Road } from './models/road';
import { Car} from "./models/car";
import {Colors, Game} from './settings';


/**
 * Creates and returns a skybox for the input scene.
 *
 * @param skyboxName - a string that defines the name of the created skybox
 * @param imgDir - a string that defines the path of images of the skybox texture
 * @param size - a number that defines the size of the skybox
 * @param scene - the scene that owns the skybox
 */
export function createSkybox(skyboxName: string, imgDir: string, size: number, scene: Scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox(skyboxName, {size: size}, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial(skyboxName, scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(imgDir, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    return skybox;
}


/**
 * Imports meshes in a file and links them to a root `TransformNode` and returns it.
 *
 * @param meshNames - an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
 * @param fileRootUrl - a string that defines the root url for the scene and resources or the concatenation of rootURL and filename
 * @param filename - a string that defines the name of the scene file
 * @param scene - scene the instance of BABYLON.Scene to append to
 * @param rootName - a string that defines the name of the new TransformNode
 * @param position - a Vector3 that defines the initial position of the model
 */
export async function createModelNode(meshNames: string, fileRootUrl: string, filename: string, scene: Scene, rootName: string, position: Vector3=Vector3.Zero())
    : Promise<BABYLON.TransformNode> {
    const data = await BABYLON.SceneLoader.ImportMeshAsync(meshNames, fileRootUrl, filename, scene, (evt) => {
        // Update the progress bar and its label.
        let loadedPercent;
        if (evt.lengthComputable) {
            loadedPercent = evt.loaded * 100 / evt.total;
        } else {
            const dlCount = evt.loaded / (1024 * 1024);
            loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
        }
        // Assuming "loading-progress" of "gameLoadingScreen" is an existing HTML elem.
        const loadingScreen = document.getElementById("game-loading-screen");
        const elms = loadingScreen.getElementsByTagName("*");
        for (let i=0; i < elms.length; i++) {
            if (elms[i].id === "loading-progress") {
                const progress = elms[i] as HTMLProgressElement;
                progress.value = loadedPercent;
            } else if (elms[i].id === "loading-progress-label") {
                const label = elms[i] as HTMLLabelElement;
                label.textContent = "Loading " + rootName;
            }
        }
    });
    const newMeshes = data.meshes;
    const root = new BABYLON.TransformNode(rootName, scene);
    newMeshes.forEach((mesh) => {
        if (!mesh.parent) {
            mesh.parent = root;
        }
    });
    root.position = position;

    return new Promise((resolve => resolve(root)));
}


/**
 * Creates and returns a car node based on given information.
 *
 * @param car - a Car object that defines the information of the to-be-imported car
 * @param position - a Vector3 that defines the starting position of the car
 * @param scene - scene that owns the car
 */
export async function createCar(car: Car, position: Vector3, scene: Scene) : Promise<BABYLON.TransformNode> {
    let carNode: BABYLON.TransformNode;
    await createModelNode("", car.fileRootUrl, car.filename, scene, car.name, position).then((root) => {
        carNode = root;
        carNode.scaling = car.scaling;
        carNode.rotation = car.rotation;
    });

    return new Promise((resolve => resolve(carNode)));
}


/**
 * Creates and returns a BABYLON FollowCamera that follows a given node or mesh.
 *
 * @param camName - a string that defines the name of the created FollowCamera
 * @param scene - scene that owns the camera
 * @param canvas - canvas that controls the camera if `attachCtrl` == true
 * @param targetName - a string that defines the name of the locked target of the camera
 * @param position - a Vector3 that defines the starting position of the camera
 * @param radius - a number that defines the distance the follow camera should follow an object at
 * @param heightOffset - a number that defines a height offset between the camera and the object it follows
 * @param rotationOffset - a number in degrees that define a rotation offset between the camera and the object it follows
 * @param isNode - defines whether the targetName represents a TransformNode (true) or a Mesh(false)
 * @param attachCtrl - defines whether to attach camera's control to `canvas`
 */
export function createFollowCamera(camName: string, scene: Scene, canvas: HTMLCanvasElement, targetName: string, position=new Vector3(500, 500, 0),
                                   radius=50, heightOffset=20, rotationOffset=180, isNode=true, attachCtrl=true) {
    const camera = new BABYLON.FollowCamera(camName, Vector3.Zero(), scene);
    camera.position = position;
    camera.radius = radius;
    camera.heightOffset = heightOffset;
    camera.rotationOffset = rotationOffset;
    if (isNode) {
        camera.lockedTarget = scene.getNodeByName(targetName).getChildMeshes(false)[1];
    } else {
        camera.lockedTarget = scene.getMeshByName(targetName);
    }
    if (attachCtrl) {
        camera.attachControl(canvas, true);
    }

    return camera;
}


/**
 * Creates and returns a 3D button with onPointerUpObservable event.
 *
 * @param name - a string defines the name of the button
 * @param lbText - a string defines the text content of the button
 * @param panel - the panel that owns the button
 * @param buttonMaterial - the material of the button
 * @param onClick - the callback that will be executed when button pressed and released
 * @param fontSize - a number defines the font size of the text content of the button
 * @param textColor - a string defines the color of the text content of the button
 */
export function createRegButton3D(name: string, lbText: string, panel: GUI.StackPanel3D, onClick: () => void,
                                  fontSize: number=80, textColor: string="white", buttonMaterial?: BABYLON.StandardMaterial) {
    let button = new GUI.Button3D(name);
    panel.addControl(button);
    button.onPointerUpObservable.add(onClick);
    console.log(button.mesh);

    // style the button
    if (typeof buttonMaterial === "undefined") {
        button.mesh.material.alpha = 0.83;
    } else {
        button.mesh.material = buttonMaterial;
    }

    // create text label
    const txt = new GUI.TextBlock();
    txt.text = lbText;
    txt.color = textColor;
    txt.fontSize = fontSize;
    button.content = txt;

    return button;
}


/**
 * Creates and returns a 2d GUI text block.
 *
 * @param name - a string that defines the name of the textblock
 * @param text - a string that defines the text of the textblock
 * @param vAlign - a number (either 0, 1, 2) that defines the vertical alignment of the textblock
 * @param hAlign - a number (either 0, 1, 2) that defines the horizontal alignment of the textblock
 * @param fontSize - a number that defines the font size of the textblock
 * @param color - a string that defines the color of the textblock
 *
 * @return the created 2d GUI text block
 */
export function createGUITextBlock(name: string, text: string, vAlign: number, hAlign: number, fontSize: number=30, color: string="white"): GUI.TextBlock {
    const label = new GUI.TextBlock(name, text);
    label.textVerticalAlignment = vAlign;
    label.textHorizontalAlignment = hAlign;
    label.fontSize = fontSize;
    label.color = color;

    return label;
}


/**
 * Create a road mesh in scene from a `Road` in `scene`.
 * 
 * @param road - the road object used to create the mesh
 * @param scene - the scene in which to create the mesh
 * @param roadMaterial - the material of the road mesh
 */
export function createRoadMesh(road: Road, scene: Scene, roadMaterial: BABYLON.StandardMaterial) {
    
    let count = 0;
    let currentX = 0;
    let currentZ = 0;
    let directionIsRight = false;

    // Create road.
    road.segments.forEach(segment => {
        // Create planes for a segment of the road
        const roadName = 'roadSegment' + count;
        
        let zLength, xLength;
        if (directionIsRight) {
            zLength = Game.ROAD_CONFIG.width;
            xLength = Game.ROAD_CONFIG.width * segment;
        } else {
            zLength = Game.ROAD_CONFIG.width * segment;
            xLength = Game.ROAD_CONFIG.width;
        }
        const options = {
            width: xLength,
            height: Game.ROAD_CONFIG.thickness,
            depth: zLength,
        }
        const segmentMesh = BABYLON.MeshBuilder.CreateBox(roadName, options, scene);
        segmentMesh.material = roadMaterial;
        segmentMesh.position = new Vector3(
            currentZ * Game.ROAD_CONFIG.width + xLength / 2,
            -Game.ROAD_CONFIG.thickness / 2,
            currentX * Game.ROAD_CONFIG.width + zLength / 2,
        );
        segmentMesh.receiveShadows = true;
        
        if (directionIsRight) {
            currentZ += segment;
        } else {
            currentX += segment;
        }
        count++;
        directionIsRight = !directionIsRight;
    });

    // Create end flags.
    [road.leftEndFlagPos, road.rightEndFlagPos].forEach(pos => {
        createModelNode("", "./models3d/flag/", "flag.babylon", scene, "flag", pos)
            .then((root) => {
                root.scaling = new Vector3(40, 35, 40);
            });
    })
}


/**
 * Initialize settings to create a tire track mesh, and returns that mesh.
 * 
 * @param scene - the scene in which to create the mesh
 */
export function initTireTracks(scene : Scene) {
    const initArray = Game.INIT_TRACK_ARRAY;
    const tireTrackUVs = Game.TIRETRACK_UVS;
    
    // create a bounding box for tire tracks, attach it to parent node
    const box = BABYLON.MeshBuilder.CreateBox("BoundBox",{width: 2, depth: 2.5, height: 1 }, scene);
    box.visibility = 0;
    box.parent = scene.getNodeByName("aventador");
    box.position.y = 0.65;
    
    // initialize the tire tracks
    let tireTrack = BABYLON.MeshBuilder.CreateRibbon("tireTrack", {pathArray: initArray, sideOrientation: BABYLON.Mesh.FRONTSIDE, uvs: tireTrackUVs, updatable: true}, scene);
    const tireMaterial = new BABYLON.StandardMaterial('tire', scene);
    const tex= new BABYLON.Texture("https://raw.githubusercontent.com/RaggarDK/Baby/baby/dat2.png", this.scene);

    // initialize the material
    tireMaterial.diffuseTexture = tex;
    tireMaterial.diffuseTexture.hasAlpha = true;
    tireMaterial.alpha = 0.6;
    tireMaterial.backFaceCulling = false;
    tireMaterial.opacityTexture = tex;
    //tireMaterial.wireframe = true;
    tireTrack.material = tireMaterial;

    return tireTrack;
}


/**
 * Updates the tire track mesh with new positions of bounding box.
 * 
 * @param trackArray - array of positions of the tire track mesh
 * @param scene - the scene in which to create the mesh
 * @param globalTireTrack - the tire track mesh that is being updated
 */
export function updateTireTracks(trackArray: Vector3[][], scene : Scene, globalTireTrack: BABYLON.Mesh, isFalling: boolean) {
    let path = [];
    
    if(!isFalling) {
    const arr = scene.getMeshByName("BoundBox").getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const vertex1 = BABYLON.Vector3.FromArray(arr, 3*7);
    const vertex2 = BABYLON.Vector3.FromArray(arr, 0);
    const pos1 = BABYLON.Vector3.TransformCoordinates(vertex1, scene.getMeshByName("BoundBox").getWorldMatrix());
    const pos2 = BABYLON.Vector3.TransformCoordinates(vertex2, scene.getMeshByName("BoundBox").getWorldMatrix());

    path.push(pos1, pos2);

    trackArray.shift();
    trackArray.push(path);

    BABYLON.MeshBuilder.CreateRibbon(null, {pathArray: trackArray, instance: globalTireTrack});
    }
}


export function initTireSmoke(scene: Scene) {
     // Create a particle system
     const initParticleSystem = (emitter) => {
        var particleSystem;
        if(BABYLON.GPUParticleSystem.IsSupported) {
            particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity:1000000 }, scene);
            particleSystem.activeParticleCount = 200000;
        }
        particleSystem = new BABYLON.ParticleSystem("particles", 50000, scene);

        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/FFV/smokeParticleTexture.png", scene);

        // lifetime
        particleSystem.minLifeTime = 1;
        particleSystem.maxLifeTime = 2;

        // emit rate
        particleSystem.emitRate = 150;

        // gravity
        particleSystem.gravity = new BABYLON.Vector3(0, 0.1, 0);

        // size gradient
        particleSystem.addSizeGradient(0, 3.5, 4.5);
        particleSystem.addSizeGradient(0.3, 4, 5);
        particleSystem.addSizeGradient(0.5, 3, 4);
        particleSystem.addSizeGradient(0.7, 5, 6);
        particleSystem.addSizeGradient(1.0, 6, 9);

        // color gradient
        particleSystem.addColorGradient(0, new BABYLON.Color4(0.65, 0.65, 0.65, 0.65), new BABYLON.Color4(0.8, 0.8, 0.8, 0.8));
        particleSystem.addColorGradient(0.4, new BABYLON.Color4(0.2, 0.2, 0.2, 0.2), new BABYLON.Color4(0.4, 0.4, 0.4, 0.4));
        particleSystem.addColorGradient(0.7, new BABYLON.Color4(0.05, 0.05, 0.05, 0.05), new BABYLON.Color4(0.1, 0.1, 0.1, 0.1));
        particleSystem.addColorGradient(1.0, new BABYLON.Color4(0, 0, 0, 0), new BABYLON.Color4(0.15, 0.15, 0.15, 0.15));

        // speed gradient
        particleSystem.addVelocityGradient(0, 1, 1.5);
        particleSystem.addVelocityGradient(0.1, 0.8, 0.9);
        particleSystem.addVelocityGradient(0.7, 1, 1.5);
        particleSystem.addVelocityGradient(1, 1.1, 1.2);

        // rotation
        particleSystem.minInitialRotation = 0;
        particleSystem.maxInitialRotation = Math.PI;
        particleSystem.minAngularSpeed = -1;
        particleSystem.maxAngularSpeed = 1;

        // blendmode
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        // assign emitter
        particleSystem.emitter = emitter;

        // Where the particles come from
        particleSystem.minEmitBox = new BABYLON.Vector3(0,0,0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0,0,0);

        // emit power
        particleSystem.minEmitPower = 10;
        particleSystem.maxEmitPower = 10;

        return particleSystem;
    }

    // Create emitter mesh for tires
    const emitterL = BABYLON.MeshBuilder.CreateBox("Emitter_L",{width: 1, depth: 1, height: 0.3 }, scene);
    const emitterR = BABYLON.MeshBuilder.CreateBox("Emitter_R",{width: 1, depth: 1, height: 0.3 }, scene);

    emitterL.parent = scene.getNodeByName("aventador");
    emitterR.parent = scene.getNodeByName("aventador");

    emitterL.position = new Vector3(-1,0.25,-1);
    emitterR.position = new Vector3(-1,0.25,1);

    let particleSystems = [];
    particleSystems.push(initParticleSystem(emitterR));
    particleSystems.push(initParticleSystem(emitterL));

    return particleSystems;
}

export function startTireSmoke(particleSystems: BABYLON.ParticleSystem[]) {
    particleSystems[0].start();
    particleSystems[1].start();
}

export function stopTireSmoke(particleSystems: BABYLON.ParticleSystem[]) {
    particleSystems[0].stop();
    particleSystems[1].stop();
}

/**
 * Creates a signal light panel (config in `settings.ts`),
 * and three signal lights named "sigLight0", "sigLight1", "sigLight2".
 *
 * @param name - name of the panel mesh
 * @param scene - scene that owns the signal light panel and its lights
 */
export function createSignalPanel(name: string, scene: Scene) {
    const sigLightsPanel = BABYLON.MeshBuilder.CreateBox(name, Game.SIGNAL_PANEL_CONFIG.config, scene);
    sigLightsPanel.position = Game.SIGNAL_PANEL_CONFIG.position;
    [0, 1, 2].forEach((i) => {
        // Create different materials for different lights
        const sigMaterial = new BABYLON.StandardMaterial("sigLightMaterial" + i.toString(), scene);
        sigMaterial.emissiveColor = Colors.DARK_RED;

        const sig = BABYLON.MeshBuilder.CreateCylinder("sigLight" + i.toString(), Game.SIGNAL_PANEL_CONFIG.lightsConfig(i).config, scene);
        sig.position = Game.SIGNAL_PANEL_CONFIG.lightsConfig(i).position;
        sig.rotation = new Vector3(Math.PI / 2, 0, 0);
        sig.material = sigMaterial;
    })
}
