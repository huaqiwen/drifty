import * as BABYLON from "babylonjs";
import {Engine, Scene, Vector3} from "babylonjs";
import * as GUI from "babylonjs-gui";
import * as Builder from "./builder";
import {Direction} from "./types";
import {Road} from "./models/road";
import {Game} from "./settings";
import {GameLoadingScreen} from "./models/GameLoadingSreen";
// import * as BBMaterials from "babylonjs-materials";


const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
var tireTrack;
var trackArray = [[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],
                  [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],
                  [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)]];
let prevPosition = new Vector3(0, 0, 0);


let actionState = Direction.Still;
let isSpaceKeyDown = false;

let movement = {
    forward: 0,
    rightward: 0,
    downward: 0,
    rotationDelta: 0,
    turningTicks: 0,
    state: Direction.Still
}

async function createScene () {
    let inGameCars = ["viper", "aventador", "shelby1967"];

    // create loading screen
    engine.loadingScreen = new GameLoadingScreen("Loading meshes to scene.");
    engine.displayLoadingUI();

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

    // init tire track
    tireTrack = Builder.initTireTracks(scene);

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

        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);
    });


    // Hide loading screen.
    engine.hideLoadingUI();

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

        let newPosition = new Vector3(aventador_root.position.x, aventador_root.position.y +5 , aventador_root.position.z);
        Builder.createTireTracks(prevPosition, newPosition, trackArray, scene, tireTrack);
        prevPosition = newPosition;

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

async function keydown(e) {
    // Space key pressed.
    if (e.code == 'Space') {

        if (isSpaceKeyDown) return;
        isSpaceKeyDown = true;

        for (let i=movement.turningTicks; i < 60; i++) {
            // Space key released, quit turning action.
            if (!isSpaceKeyDown) return;

            movement.turningTicks = i + 1;
            movement.rightward += 1 / 60;
            movement.forward -= 1 / 60;
            movement.rotationDelta += (1 / 60) * Math.PI / 2;
            await sleep(10);
        }

        movement.state = Direction.Right;
    }
}

async function keyup(e) {
    // Space key released.
    if (e.code == 'Space') {

        isSpaceKeyDown = false;

        for (let i=movement.turningTicks; i > 0; i--) {
            // Space key pressed, quit turning action.
            if (isSpaceKeyDown) return;

            movement.turningTicks = i - 1;
            movement.rightward -= 1 / 60;
            movement.forward += 1 / 60;
            movement.rotationDelta -= (1 / 60) * Math.PI / 2;
            await sleep(10);
        }

        movement.state = Direction.Forward;

    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
