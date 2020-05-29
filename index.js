import * as BABYLON from "babylonjs";
import { Scene, Engine, Vector3 } from "babylonjs";
const canvas = document.getElementById("main_canvas");
const engine = new Engine(canvas, true);
const createScene = function () {
    const scene = new Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1.0);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(50, 100, 90), scene);
    light.intensity = 3.0;
    BABYLON.SceneLoader.ImportMesh("", "./models3d/shelby1967/", "1967-shelby-ford-mustang.babylon", scene, function (newMeshes) {
        newMeshes[0].name = "shelby1967";
        newMeshes[0].id = 'shelby001';
        newMeshes[0].position = new Vector3(0, 4, 0);
    });
    console.log(scene.getMeshByID("shelby001"));
    console.log(scene.meshes);
    //--- an arc rotate camera
    const camera = new BABYLON.ArcRotateCamera("arcCam", BABYLON.Tools.ToRadians(45), BABYLON.Tools.ToRadians(45), 10.0, new Vector3(0, 0, 0), scene);
    //--- a follow camera TODO: Fix the follow cam
    // const camera = new BABYLON.FollowCamera("followCam",
    //     new BABYLON.Vector3(0, 10, -10),
    //     scene);
    // camera.lockedTarget = box;
    // camera.radius = 30;
    // camera.heightOffset = 10;
    camera.attachControl(canvas, true);
    // Enable WASD controls
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    return scene;
};
const scene = createScene();
engine.runRenderLoop(function () {
    // scene.getMeshByName("shelby1967").position.x += 0.01;
    scene.render();
});
window.addEventListener('resize', resize, false);
window.addEventListener('load', resize, false);
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
