import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import * as Ammo from "ammo.js";
import { Scene, Vector3, AmmoJSPlugin, PhysicsEngine, Mesh, BoxBuilder } from "babylonjs";


import { Road } from './models/road';
import { Car} from "./models/car";
import { Game } from './settings';

/**
 * Imports meshes in a file and links them to a root `TransformNode`
 *
 * @param meshNames - an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
 * @param fileRootUrl - a string that defines the root url for the scene and resources or the concatenation of rootURL and filename
 * @param filename - a string that defines the name of the scene file
 * @param scene - scene the instance of BABYLON.Scene to append to
 * @param rootName - a string that defines the name of the new TransformNode
 * @param position - a Vector3 that defines the initial position of the model
 */
export async function createModelNode(meshNames: string, fileRootUrl: string, filename: string, scene: Scene, rootName: string, position: Vector3=Vector3.Zero()) {
    const data = await BABYLON.SceneLoader.ImportMeshAsync(meshNames, fileRootUrl, filename, scene);
    //const newMeshes = data.meshes;
    const root = new BABYLON.TransformNode(rootName, scene);
    var index = 0;

    var boundBox = BABYLON.MeshBuilder.CreateBox("box", {size: 5}, scene);
    boundBox.parent = root;
    boundBox.physicsImpostor = new BABYLON.PhysicsImpostor(boundBox, BABYLON.PhysicsImpostor.BoxImpostor, {mass : 1}, scene);
    boundBox.isVisible = true;
    
    ///var compoundBody = new BABYLON.Mesh("", scene);
    //compoundBody.position = position;
    
    /*newMeshes.forEach((mesh) => {
        //compoundBody.addChild(mesh);
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass : 2}, scene);
        if (!mesh.parent) {
            mesh.parent = root;
            console.log('filename:' + filename + '  meshname: ' + mesh.name + '  index: ' + index);
        }
        index++;

    });*/
    //compoundBody.addChild(boundBox);
    //boundBox.physicsImpostor = new BABYLON.PhysicsImpostor(boundBox, BABYLON.PhysicsImpostor.BoxImpostor, {mass : 0}, scene);
    //compoundBody.physicsImpostor = new BABYLON.PhysicsImpostor(compoundBody, BABYLON.PhysicsImpostor.BoxImpostor, {mass : 3}, scene);
       
    //newMeshes[3].ellipsoid = new BABYLON.Vector3(1, 1, 1);
    //newMeshes[3].checkCollisions = true;
    //newMeshes[3].physicsImpostor = new BABYLON.PhysicsImpostor(newMeshes[3], BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1, friction: 0, restitution: 0.3});
    root.position = position;

}


export async function createCar(car: Car, position: Vector3, scene: Scene) {
    await createModelNode("", car.fileRootUrl, car.filename, scene, car.name, position);
    const carNode = scene.getNodeByName(car.name) as BABYLON.TransformNode;
    carNode.scaling = car.scaling;
    carNode.rotation = car.rotation;
}


/**
 * Creates a BABYLON FollowCamera that follows a given node or mesh
 *
 * @param camName - a string that defines the name of the created FollowCamera
 * @param scene - scene that owns the camera
 * @param canvas - canvas that controls the camera if `attachCtrl` == true
 * @param targetName - a string that defines the name of the locked target of the camera
 * @param position - a Vector3 that defines the starting position of the camera
 * @param radius - a number that defines the distance the follow camera should follow an object at
 * @param heightOffset - a number that defines a height offset between the camera and the object it follows.
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
}


/**
 * Creates a 3D button with onPointerUpObservable event
 *
 * @param name - a string defines the name of the button
 * @param lb_text - a string defines the text content of the button
 * @param panel - the panel that owns the button
 * @param onClick - the callback that will be executed when button pressed and released
 * @param fontSize - a number defines the font size of the text content of the button
 * @param textColor - a string defines the color of the text content of the button
 */
export function createRegButton3D(name: string, lb_text: string, panel: GUI.StackPanel3D, onClick: () => void, fontSize: number=80, textColor: string="white") {
    let button = new GUI.Button3D(name);
    panel.addControl(button);
    button.onPointerUpObservable.add(onClick);
    console.log(button.mesh);

    // create text label
    const txt = new GUI.TextBlock();
    txt.text = lb_text;
    txt.color = textColor;
    txt.fontSize = fontSize;
    button.content = txt;
}

export function initPhysics(scene: Scene) {

    Ammo().then(function(Ammo) {
        var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
        var ammoPlugin = new AmmoJSPlugin(true, Ammo);
        scene.enablePhysics(new Vector3(0, -9.81, 0), ammoPlugin);
        var physicsEngine = scene.getPhysicsEngine();
    });
}

export function createGravity(scene: Scene) {
    scene.collisionsEnabled = true;
    //for(var i = 0; i < scene.meshes.length; i++) {
        //console.log('Mesh name: ' + scene.meshes[i].name);
        //scene.meshes[i].checkCollisions = true;
        //scene.meshes[i].physicsImpostor = new BABYLON.PhysicsImpostor(scene.meshes[i], BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0, restitution: 0.3});
    //}
    scene.meshes[0].checkCollisions = true;
    scene.meshes[0].physicsImpostor = new BABYLON.PhysicsImpostor(scene.meshes[0], BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0, restitution: 0.3});
}


/**
 * Create a road mesh in scene from a `Road` in `scene`.
 * 
 * @param road - the road object used to create the mesh
 * @param scene - the scene in which to create the mesh
 */
export function createRoadMesh(road: Road, scene: Scene) {
    const roadMaterial = new BABYLON.StandardMaterial('road', scene);
    roadMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    
    let count = 0;
    let currentX = 0;
    let currentZ = 0;
    let directionIsRight = false;

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
        segmentMesh.position.x = currentZ * Game.ROAD_CONFIG.width + xLength / 2;
        segmentMesh.position.z = currentX * Game.ROAD_CONFIG.width + zLength / 2;

        if (directionIsRight) {
            currentZ += segment;
        } else {
            currentX += segment;
        }
        count++;
        directionIsRight = !directionIsRight;
        
    
        segmentMesh.physicsImpostor = new BABYLON.PhysicsImpostor(segmentMesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0, restitution: 0.3});
        segmentMesh.checkCollisions = true;
    });
}
