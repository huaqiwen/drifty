import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { Engine, Scene, Vector3 } from "babylonjs";
// import * as BBMaterials from "babylonjs-materials";
import * as ammo from "ammo.js";

import * as Builder from "./builder";
import { Direction } from "./types";
import { Road } from "./models/road";
import { Game } from "./settings";


const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

let actionState = Direction.Still;

async function createScene () {
    let inGameCars = ["viper", "aventador", "shelby1967"];

    // create scene
    const scene = new Scene(engine);
    scene.clearColor = Game.SCENE_COLOR;

    // Enable physics
    const cannonPlugin = new BABYLON.AmmoJSPlugin();
    const gravityVector = new Vector3(0, -9.81, 0);
    scene.enablePhysics(gravityVector, cannonPlugin);

    // create GUI manager and action panel
    const guiManager = new GUI.GUI3DManager(scene);
    const panel = new GUI.StackPanel3D(false);
    guiManager.addControl(panel);
    panel.margin = Game.PANEL_CONFIG.margin;
    panel.position = Game.PANEL_CONFIG.position;

    // Create light
    const light = new BABYLON.HemisphericLight("light", Game.LIGHT_POS, scene);
    light.intensity = 2.0;

    // Create road
    const road = new Road(50, length => 
        // length / 20
        0
    );
    Builder.createRoadMesh(road, scene);

    // Create cars
    let importCarPromises = []
    for (let i = 0; i < 3; i++) { importCarPromises.push(Builder.createCar(Game.CARS[inGameCars[i]], Game.CAR_START_POS[i], scene)); }
    await Promise.all(importCarPromises);

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

    return scene;
}

let scene: Scene;
createScene().then((result) => {
    scene = result;

    engine.runRenderLoop(function () {
        const aventador_root = scene.getMeshByName("aventador");
        const camera = scene.getCameraByName("followCam") as BABYLON.FollowCamera;

        const impulse = 10;

        if (actionState == Direction.Forward) {
            camera.rotationOffset = 180;
            aventador_root.rotation = new Vector3(0, Math.PI / 2, 0);
            // aventador_root.position.z += 1.5;
            aventador_root.physicsImpostor.applyImpulse(new Vector3(0, 0, impulse), aventador_root.getAbsolutePosition().add(new Vector3(0, -0, 0)));
            
        } else if (actionState == Direction.Right ) {
            camera.rotationOffset = 240;
            aventador_root.rotation = new Vector3(0, Math.PI, 0);
            // aventador_root.position.x += 1.5;
            aventador_root.physicsImpostor.applyImpulse(new Vector3(impulse, 0 , 0), aventador_root.getAbsolutePosition().add(new Vector3(0, -0, 0)));
        }

        scene.actionManager = new BABYLON.ActionManager(scene);
        // when SPACE key pressed, go right, actionState = -1
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: " " },
                () => { actionState = Direction.Right; }
            )
        );
        // when SPACE key released, go left, actionState = 1
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: " " },
                () => { actionState = Direction.Forward; }
            )
        );

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
