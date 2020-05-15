import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { Scene, Vector3 } from "babylonjs";


import { Road } from './models/road';

/**
 * Imports meshes in a file and links them to a root `TransformNode`
 *
 * @param meshNames - an array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
 * @param fileRootUrl - a string that defines the root url for the scene and resources or the concatenation of rootURL and filename
 * @param filename - a string that defines the name of the scene file
 * @param scene - scene the instance of BABYLON.Scene to append to
 * @param rootName - a string that defines the name of the new TransformNode
 */
export async function createModelNode(meshNames: string, fileRootUrl: string, filename: string, scene: Scene, rootName: string) {
    const data = await BABYLON.SceneLoader.ImportMeshAsync(meshNames, fileRootUrl, filename, scene);
    const newMeshes = data.meshes;
    const root = new BABYLON.TransformNode(rootName, scene);
    newMeshes.forEach((mesh) => {
        if (!mesh.parent) {
            mesh.parent = root;
        }
    });
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
    const button = new GUI.Button3D(name);
    panel.addControl(button);
    button.onPointerUpObservable.add(onClick);

    // create text label
    const txt = new GUI.TextBlock();
    txt.text = lb_text;
    txt.color = textColor;
    txt.fontSize = fontSize;
    button.content = txt;
}

const ROAD_WIDTH = 50;
const ROAD_THICKNESS = 1;
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
            zLength = ROAD_WIDTH;
            xLength = ROAD_WIDTH * segment;
        } else {
            zLength = ROAD_WIDTH * segment;
            xLength = ROAD_WIDTH;
        }
        const options = {
            width: xLength,
            height: ROAD_THICKNESS,
            depth: zLength,
        }
        const segmentMesh = BABYLON.MeshBuilder.CreateBox(roadName, options, scene);
        segmentMesh.material = roadMaterial;
        segmentMesh.position.x = currentZ * ROAD_WIDTH + xLength / 2;
        segmentMesh.position.z = currentX * ROAD_WIDTH + zLength / 2;
        
        if (directionIsRight) {
            currentZ += segment;
        } else {
            currentX += segment;
        }
        count++;
        directionIsRight = !directionIsRight;
    });
}

/**
 * Scales a TransformNode in its scene by scaling all its children
 *
 * @param scene - scene that owns the input TransformNode
 * @param nodeName - a string that defines the name of the TransformNode
 * @param scale - a number that defines the scaling factor
 */
export function scaleTransformNode(scene: Scene, nodeName: string, scale: number) {
    const node_meshes = scene.getNodeByName(nodeName).getChildMeshes(false);
    node_meshes.forEach((mesh) => {
        mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
    });
}
