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
    Builder.createSkybox("skyBox", "./textures/skybox/skybox", 1000, scene);

    // Create light
    const light = new BABYLON.HemisphericLight("light", Game.LIGHT_POS, scene);
    light.intensity = 2.0;

    // Create road and its material
    road = new Road(50, length => length / 20);
    const roadMaterial = new BABYLON.StandardMaterial("roadMaterial", scene);
    roadMaterial.diffuseTexture = new BABYLON.Texture("./models3d/gtr/rough_asphalt2.jpg", scene);
    Builder.createRoadMesh(road, scene, roadMaterial);

    // Create cars
    let importCarPromises = []
    for (let i = 0; i < 3; i++) { importCarPromises.push(Builder.createCar(Game.CARS[inGameCars[i]], Game.CAR_START_POS[i], scene)); }
    await Promise.all(importCarPromises);

    // Create follow camera
    Builder.createFollowCamera("followCam", scene, canvas, "aventador", new Vector3(500, 500, 0),
        12, 7, 170, true, false);

    // create GUI manager and action panel
    const guiManager = new GUI.GUI3DManager(scene);
    const panel = new GUI.StackPanel3D(false);
    guiManager.addControl(panel);
    panel.margin = Game.PANEL_CONFIG.margin;
    panel.position = Game.PANEL_CONFIG.position;

    // Create buttons
    Builder.createRegButton3D("startButton", "Start!", panel, () => {
        // Game start setup
        panel.removeControl(panel.children[0]);
        const cam = scene.getCameraByName("followCam") as BABYLON.FollowCamera;
        cam.radius = 50; cam.heightOffset = 20; cam.rotationOffset = 180;

        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);

        movement.state = Direction.Forward;
        accel();
    });

    // Hide loading screen.
    engine.hideLoadingUI();

    return scene;
}

let scene;
let road: Road;

createScene().then((result) => {
    scene = result;

    engine.runRenderLoop(async function () {
        const aventador_root = scene.getNodeByName("aventador");

        // Game over check
        if (movement.state != Direction.Fall && !road.contains(aventador_root.position, Game.ROAD_CONFIG.width)) {
            movement.state = Direction.Fall;
            window.removeEventListener('keydown', keydown);
            window.removeEventListener('keyup', keyup);
            await fall();
            alert("Game over!")
            location.reload();
        }

        aventador_root.position.z += 1.5 * movement.forward;
        aventador_root.position.x += 1.5 * movement.rightward;
        aventador_root.position.y -= 1.5 * movement.downward;
        aventador_root.rotation = new Vector3(0, Math.PI / 2 + movement.rotationDelta, 0);

        scene.render();
    });
});

/**
 * Start turning right when space key is pressed.
 */
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

/**
 * Start turning left when space key is released.
 */
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

/**
 * Start falling, accelarate at 0.981.
 */
async function fall() {
    for (let i=0; i < 100; i++) {
        movement.downward += 0.00981;
        await sleep(10);
    }
}

/**
 * Start accelerating (movement.forward 0 -> 1).
 */
async function accel() {
    for (let i=0; i < 60; i++) {
        movement.forward += 1/60;
        await sleep(1000/60);
    }
}

/**
 * Sleeps the current thread of the input time.
 *
 * @param ms - sleep time in milisecond
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//--- resize canvas on window resize
window.addEventListener('resize', resize, false);
window.addEventListener('load', resize, false);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
