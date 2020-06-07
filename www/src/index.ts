import * as BABYLON from "babylonjs";
import {Engine, Scene, Vector3} from "babylonjs";
import * as GUI from "babylonjs-gui";

import * as Builder from "./builder";
import {Direction} from "./types";
import {Game} from "./settings";

import {Road} from "./models/road";
import {GameLoadingScreen} from "./models/GameLoadingSreen";
import { bonesDeclaration } from "babylonjs/Shaders/ShadersInclude/bonesDeclaration";


const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

let isSpaceKeyDown = false;
let isGameStarted = false;

let movement = {
    forward: 0,
    rightward: 0,
    downward: 0,
    forwardDist: 0,
    rightDist: 0,
    rotationDelta: 0,
    turningTicks: 0,
    state: Direction.Still
}

var tireTrack;
var trackArray = Array(40).fill(Array(2).fill(Vector3.Zero));

async function createScene () {
    let inGameCars = ["aventador"];

    // Create loading screen.
    engine.loadingScreen = new GameLoadingScreen("Loading meshes to scene.");
    engine.displayLoadingUI();

    // Create scene.
    const scene = new Scene(engine);

    // Create skybox.
    Builder.createSkybox("skyBox", "./textures/skybox/skybox", 1000, scene);

    // Create light.
    light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -3, 0), scene);
    light.position = new BABYLON.Vector3(20, 20, 20);
    light.intensity = 1.4;

    // Create road and its material.
    road = new Road(50, length => length / 20);
    const roadMaterial = new BABYLON.StandardMaterial("roadMaterial", scene);
    roadMaterial.diffuseTexture = new BABYLON.Texture("./models3d/gtr/rough_asphalt2.jpg", scene);
    Builder.createRoadMesh(road, scene, roadMaterial);

    // Create cars.
    let importCarPromises = []
    for (let i = 0; i < inGameCars.length; i++) { importCarPromises.push(Builder.createCar(Game.CARS[inGameCars[i]], Game.CAR_START_POS[i], scene)); }
    await Promise.all(importCarPromises);

    // Create shadows for the cars.
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.usePoissonSampling = true;
    // TODO: make shaddow work on all `inGameCars` (without losing performance)
    inGameCars.forEach(carName => {
        shadowGenerator.getShadowMap().renderList.push(...scene.getNodeByName(carName).getChildMeshes(false));
    });

    // Create follow camera.
    Builder.createFollowCamera("followCam", scene, canvas, "aventador", new Vector3(500, 500, 0),
        12, 7, 170, true, false);

    // Create 3D GUI manager and action panel.
    const guiManager = new GUI.GUI3DManager(scene);
    panel = new GUI.StackPanel3D(false);
    guiManager.addControl(panel);
    panel.margin = Game.PANEL_CONFIG.margin;
    panel.position = Game.PANEL_CONFIG.position;

    // Create 2D GUI.
    const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("gui2d", true);
    distLabel = Builder.createGUITextBlock("distLabel", "Distance traveled: 0", 0, 0);
    fpsLabel = Builder.createGUITextBlock("fpsLabel", "FPS: 0", 0, 1);
    distLabel.paddingTop = 5; distLabel.paddingLeft = 10;
    fpsLabel.paddingTop = 5; fpsLabel.paddingRight = 10;
    guiTexture.addControl(distLabel); guiTexture.addControl(fpsLabel);

    // Create buttons and event listeners.
    Builder.createRegButton3D("startButton", "Start!", panel, setupGame);
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    
    // Initialize tire tracks.
    tireTrack = Builder.initTireTracks(scene);

    // Hide loading screen.
    engine.hideLoadingUI();

    return scene;
}

let scene;
let light;
let road: Road;

// GUI elements.
let panel: GUI.StackPanel3D;
let distLabel: GUI.TextBlock;
let fpsLabel: GUI.TextBlock;

createScene().then((result) => {
    scene = result;
    console.log(road.segments)

    engine.runRenderLoop(async function () {
        const aventadorRoot = scene.getNodeByName("aventador");

        if (movement.state != Direction.Fall && !road.contains(aventadorRoot.position, Game.ROAD_CONFIG.width)) {
            movement.state = Direction.Fall;
            if (road.isCarFinished(movement.forwardDist, movement.rightDist)) {
                await Promise.all([endGame("You Win!"), fall()]);
            } else {
                await Promise.all([endGame("Game Over!"), fall()]);
            }
        }
        
        // Update tire tracks
        Builder.updateTireTracks(trackArray, scene, tireTrack);

        // Update car position.
        aventadorRoot.position.z += 1.5 * movement.forward;
        aventadorRoot.position.x += 1.5 * movement.rightward;
        aventadorRoot.position.y -= 1.5 * movement.downward;
        aventadorRoot.rotation = new Vector3(0, Math.PI / 2 + movement.rotationDelta, 0);

        // Accumulate distance traveled *if not fallen*
        if (movement.state != Direction.Fall) {
            movement.forwardDist += 1.5 * movement.forward;
            movement.rightDist += 1.5 * movement.rightward;
        }

        // Update distance label & fps label
        distLabel.text = "Distance traveled: " + ((movement.rightDist + movement.forwardDist) / 10).toFixed();
        fpsLabel.text = "FPS: " + engine.getFps().toFixed();

        // Update light position.
        light.position = aventadorRoot.position.add(new BABYLON.Vector3(20, 20, 20));
        
        scene.render();
    });
});

/**
 * Game start setup.
 */
function setupGame() {
    isGameStarted = true;

    panel.removeControl(panel.children[0]);
    const cam = scene.getCameraByName("followCam") as BABYLON.FollowCamera;
    cam.radius = 50; cam.heightOffset = 20; cam.rotationOffset = 180;

    // For mobile devices.
    window.addEventListener("touchstart", turnForward);
    window.addEventListener("touchend", turnRight);

    movement.state = Direction.Forward;
    // noinspection JSIgnoredPromiseFromCall
    accel();
}

/**
 * End the game, remove event listeners.
 */
async function endGame(message?: string) {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('touchstart', turnRight);
    window.removeEventListener('touchend', turnForward);

    // If `message` is not null, alert it
    await sleep(600);
    if (typeof message !== "undefined") alert(message);
    location.reload();
}

/**
 * Start turning right when space key is pressed.
 */
async function keydown(e) {
    // Space key pressed.
    if (e.code == 'Space') {
        await turnForward();
    }
}

async function turnForward() {
    if (isSpaceKeyDown) return;
    isSpaceKeyDown = true;

    // Game not started
    if (!isGameStarted) {
        setupGame();
        return;
    }

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

/**
 * Start turning left when space key is released.
 */
async function keyup(e) {
    // Space key released.
    if (e.code == 'Space') {
        await turnRight();
    }
}

async function turnRight() {
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
