import * as BABYLON from "babylonjs";
import { Scene } from "babylonjs";

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
