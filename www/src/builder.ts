import * as BABYLON from "babylonjs";
import { Scene } from "babylonjs";

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
