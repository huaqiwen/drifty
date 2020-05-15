import * as BABYLON from "babylonjs";
import { Engine, Scene } from "babylonjs";
import * as BBMaterials from "babylonjs-materials";

import * as Builder from "./builder";
import { Road } from './models/road';

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

async function createScene () {
    const scene = new Scene(engine);
    scene.clearColor = new BABYLON.Color4(0 / 255, 0 / 255, 0 / 255, 1.0);

    const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(50, 100, 90),
        scene);
    light.intensity = 3.0;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 500, height: 500}, scene);
    ground.material = new BBMaterials.GridMaterial("groundMaterial", scene);

    // Create road
    const road = new Road(50, length => length / 20);
    Builder.createRoadMesh(road, scene);

    // import meshes on parallel
    await Promise.all([
        Builder.createModelNode("", "./models3d/shelby1967/", "1967-shelby-ford-mustang.babylon", scene, "shelby1967"),
        Builder.createModelNode("", "./models3d/viper/", "dodge-viper-gts.babylon", scene, "viper"),
    ]);

    const camera = new BABYLON.FollowCamera("followCam",
        new BABYLON.Vector3(500, 500, 0),
        scene);
    camera.lockedTarget = scene.getNodeByName("shelby1967").getChildMeshes(false)[2];
    camera.radius = 30;
    camera.heightOffset = 10;camera.attachControl(canvas, true);

    return scene;
}

let scene;
createScene().then((result) => {
    scene = result;

    Builder.scaleTransformNode(scene, "viper", 0.77);

    engine.runRenderLoop(function () {
        const shelby1967_root = scene.getNodeByID("shelby1967");
        shelby1967_root.position.z += 0.05;

        scene.render();
    });
});

//--- resize canvas on window resize
window.addEventListener('resize', resize, false);
window.addEventListener('load', resize, false);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
