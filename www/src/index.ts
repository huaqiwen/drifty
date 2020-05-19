// @ts-ignore
import * as BABYLON from "babylonjs";
// @ts-ignore
import { Scene, Engine, Vector3 } from "babylonjs";

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const engine = new Engine(canvas, true);

const createScene = function () {
    const scene = new Scene(engine);
<<<<<<< Updated upstream
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1.0);

    const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(50, 100, 90),
        scene);
    light.intensity = 3.0;

    BABYLON.SceneLoader.ImportMesh("",
        "./models3d/shelby1967/",
        "1967-shelby-ford-mustang.babylon",
        scene, function(newMeshes) {
            newMeshes[0].name = "shelby1967";
            newMeshes[0].id = 'shelby001';
            newMeshes[0].position = new Vector3(0, 4, 0)
        });

    console.log(scene.getMeshByID("shelby001"));
    console.log(scene.meshes);

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
=======
    scene.clearColor = Game.SCENE_COLOR;

    // create GUI manager and action panel
    const guiManager = new GUI.GUI3DManager(scene);
    const panel = new GUI.StackPanel3D(false);
    guiManager.addControl(panel);
    panel.margin = Game.PANEL_CONFIG.margin;
    panel.position = Game.PANEL_CONFIG.position;

    
    // Create gravity 
    Builder.initPhysics(scene);

    // Create light
    const light = new BABYLON.HemisphericLight("light", Game.LIGHT_POS, scene);
    light.intensity = 2.0;

    // Create cars
    let importCarPromises = []
    for (let i = 0; i < 3; i++) { importCarPromises.push(Builder.createCar(Game.CARS[inGameCars[i]], Game.CAR_START_POS[i], scene)); }
    await Promise.all(importCarPromises);

    
    // Create road
    const road = new Road(50, length => length / 20);
    Builder.createRoadMesh(road, scene);

    // Create follow camera
    Builder.createFollowCamera("followCam", scene, canvas, "aventador", new Vector3(500, 500, 0),
        12, 7, 170, true, false);

    // Create buttons
    Builder.createRegButton3D("startButton", "Start!", panel, () => {
        panel.removeControl(panel.children[0]);
        const cam = scene.getCameraByName("followCam") as BABYLON.FollowCamera;
        cam.radius = 50; cam.heightOffset = 20; cam.rotationOffset = 180;
        actionState = Direction.Forward;
    });
>>>>>>> Stashed changes

    Builder.createGravity(scene);

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
    // scene.getMeshByName("shelby1967").position.x += 0.01;
    scene.render();
});
