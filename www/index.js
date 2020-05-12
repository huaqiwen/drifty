import * as BABYLON from "babylonjs";
import { Scene, Engine, Vector3 } from 'babylonjs';

const canvas = document.getElementById("main_canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const engine = new Engine(canvas, true);

const createScene = function () {
    const scene = new Scene(engine);
    // noinspection JSValidateTypes
    scene.clearColor = new BABYLON.Color3.White();

    const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(50, 100, 90),
        scene);
    light.intensity = 3.0;

    // const box = BABYLON.Mesh.CreateBox("Box", 4.0, scene);
    // box.position = Vector3.Zero();
    //
    // const box2 = BABYLON.Mesh.CreateBox("Box2", 4, scene);
    // const material = new BABYLON.StandardMaterial("material1", scene);
    // material.wireframe = true;
    // box2.material = material;
    // box2.position = new Vector3(0, 4, 0);

    BABYLON.SceneLoader.ImportMesh("", "./models3d/shelby1967/", "1967-shelby-ford-mustang.babylon", scene);

    //--- an arc rotate camera
    const camera = new BABYLON.ArcRotateCamera("arcCam",
        BABYLON.Tools.ToRadians(45),
        BABYLON.Tools.ToRadians(45),
        10.0,
        new Vector3(0, 0, 0),
        scene);

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
    scene.render();
});
