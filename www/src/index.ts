import * as BABYLON from "babylonjs";
import {Engine, Scene, Vector3} from "babylonjs";
import * as GUI from "babylonjs-gui";
import * as Builder from "./builder";
import {Direction} from "./types";
import {Road} from "./models/road";
import {Game} from "./settings";
// import * as BBMaterials from "babylonjs-materials";


const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

let actionState = Direction.Still;

let movement = {
    forward: 0,
    rightward: 0,
    downward: 0,
    rotationDelta: 0,
    state: Direction.Still
}

async function createScene () {
    let inGameCars = ["viper", "aventador", "shelby1967"];

    // create scene
    const scene = new Scene(engine);
    scene.clearColor = Game.SCENE_COLOR;

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
    const road = new Road(50, length => length / 20);
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

        movement.forward = 1;
        movement.state = Direction.Forward;
    });

    return scene;
}

let scene;
createScene().then((result) => {
    scene = result;

    engine.runRenderLoop(function () {
        const aventador_root = scene.getNodeByName("aventador");

        aventador_root.position.z += 1.5 * movement.forward;
        aventador_root.position.x += 1.5 * movement.rightward;
        aventador_root.rotation = new Vector3(0, Math.PI / 2 + movement.rotationDelta, 0);

        // console.log(movement.forward, movement.rightward);

        /*
        if (actionState == Direction.Forward) {
            scene.getCameraByName("followCam").rotationOffset = 180;
            aventador_root.rotation = new Vector3(0, Math.PI / 2, 0);
            aventador_root.position.z += 1.5;
        } else if (actionState == Direction.Right ) {
            scene.getCameraByName("followCam").rotationOffset = 240;
            aventador_root.rotation = new Vector3(0, Math.PI, 0);
            aventador_root.position.x += 1.5;
        }

         */

        /*
        scene.actionManager = new BABYLON.ActionManager(scene);
        // when SPACE key pressed, go right, actionState = -1
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: " " },
                () => {
                    actionState = Direction.Right;
                }
            )
        );
        // when SPACE key released, go left, actionState = 1
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: " " },
                () => { actionState = Direction.Forward; }
            )
        );

         */

        scene.render();
    });
});

//--- resize canvas on window resize
window.addEventListener('resize', resize, false);
window.addEventListener('load', resize, false);

window.addEventListener('keydown', keydown)

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

async function keydown(e) {
    // space is pressed
    if (e.code == 'Space') {
        // console.log(movement.state);
        for (let i=0; i < 60; i++) {
            if (movement.state == Direction.Forward) {
                movement.rightward += 1 / 60;
                movement.forward -= 1 / 60;
                movement.rotationDelta += (1 / 60) * Math.PI / 2;
            } else if (movement.state == Direction.Right) {
                movement.rightward -= 1 / 60;
                movement.forward += 1 / 60;
                movement.rotationDelta -= (1 / 60) * Math.PI / 2;
            }
            await sleep(1000 / 60);
        }

        if (movement.state == Direction.Forward) movement.state = Direction.Right;
        else if (movement.state == Direction.Right) movement.state = Direction.Forward;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
