import * as BABYLON from "babylonjs";
import { Scene } from "babylonjs";

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
            mesh.parent = root
        }
    })
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
 * Scale a TransformNode in its scene by scaling all its children
 *
 * @param scene - scene that owns the input TransformNode
 * @param nodeName - a string that defines the name of the TransformNode
 * @param scale - a number that defines the scaling factor
 */
export function scaleTransformNode(scene: Scene, nodeName: string, scale: number) {
    const node_meshes = scene.getNodeByName(nodeName).getChildMeshes(false);
    node_meshes.forEach((mesh) => {
        mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
    })
}
