import * as BABYLON from "babylonjs";
import {Engine, Scene, Vector3} from "babylonjs";
import * as GUI from "babylonjs-gui";

import * as Builder from "./builder";
import {Direction} from "./types";
import {Game, Colors} from "./settings";

import {Road} from "./models/road";
import {GameLoadingScreen} from "./models/game-loading-screen";


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

let tireTrack;
const trackArray = Array(40).fill(Array(2).fill(Vector3.Zero));

async function createScene () {
    let inGameCars = ["aventador"];

    // Create loading screen.
    engine.loadingScreen = new GameLoadingScreen("Loading meshes to scene.");
    engine.displayLoadingUI();

    // Create scene.
    const scene = new Scene(engine);

    // Create skybox.
    Builder.createSkybox("skyBox", "./textures/skybox/skybox", Game.ROAD_CONFIG.length * Game.ROAD_CONFIG.width + 500, scene);

    // Create light.
    light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -3, 0), scene);
    light.position = new BABYLON.Vector3(20, 20, 20);
    light.intensity = 1.4;

    // Create road and its material.
    road = new Road(Game.ROAD_CONFIG.length, length => length / 20);
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
    inGameCars.forEach(carName => {
        shadowGenerator.getShadowMap().renderList.push(...scene.getNodeByName(carName).getChildMeshes(false));
    });

    // Create follow camera.
    Builder.createFollowCamera("followCam", scene, canvas, "aventador", new Vector3(500, 500, 0),
        12, 7, 170, true, true);

    // Create signal panel and lights.
    Builder.createSignalPanel("sigPanel", scene);

    // Create 2D GUI.
    const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("gui2d", true);
    distLabel = Builder.createGUITextBlock("distLabel", "Distance traveled: 0", 0, 0);
    fpsLabel = Builder.createGUITextBlock("fpsLabel", "FPS: 0", 0, 1);
    distLabel.paddingTop = 5; distLabel.paddingLeft = 10;
    fpsLabel.paddingTop = 5; fpsLabel.paddingRight = 10;
    guiTexture.addControl(distLabel); guiTexture.addControl(fpsLabel);

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
let distLabel: GUI.TextBlock;
let fpsLabel: GUI.TextBlock;

createScene().then((result) => {
    scene = result;

    engine.runRenderLoop(async function () {
        // Start game if it has not been started.
        if (!isGameStarted) await setupGame();
        const aventadorRoot = scene.getNodeByName("aventador");

        if (movement.state != Direction.Fall && !road.contains(aventadorRoot.position, Game.ROAD_CONFIG.width)) {
            movement.state = Direction.Fall;
            if (road.isCarFinished(movement.forwardDist, movement.rightDist)) {
                await Promise.all([endGame("You Win!"), fall()]);
            } else {
                await Promise.all([endGame("Game Over!"), fall()]);
            }
        }

        // If crossed finish line, decelerate.
        if (movement.state != Direction.Decel && road.isCarFinished(movement.forwardDist, movement.rightDist)) {
            movement.state = Direction.Decel;
            // Zoom in camera.
            const cam = scene.getCameraByName("followCam") as BABYLON.FollowCamera;
            cam.radius = 20; cam.heightOffset = 10; cam.rotationOffset = 140;
            await decel();
            alert("You Win!!!"); location.reload();
        }

        // Update tire tracks
        Builder.updateTireTracks(trackArray, scene, tireTrack);

        // Update car position.
        const deltaMultiplier = engine.getDeltaTime() / 50 * 3;

        aventadorRoot.position.z += 1.5 * movement.forward * deltaMultiplier;
        aventadorRoot.position.x += 1.5 * movement.rightward * deltaMultiplier;
        aventadorRoot.position.y -= 1.5 * movement.downward * deltaMultiplier;
        aventadorRoot.rotation = new Vector3(0, Math.PI / 2 + movement.rotationDelta, 0);

        // Accumulate distance traveled *if not fallen*
        if (movement.state != Direction.Fall) {
            movement.forwardDist += 1.5 * movement.forward * deltaMultiplier;
            movement.rightDist += 1.5 * movement.rightward * deltaMultiplier;
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
async function setupGame() {
    isGameStarted = true;

    await sleep(2000);

    // Signal lights turn red (1 sec interval).
    for (let i=2; i >= 0; i--) {
        const sigLightMaterial = scene.getMaterialByName("sigLightMaterial" + i.toString());
        sigLightMaterial.emissiveColor = Colors.RED;
        await sleep(1000);
    }

    // Signal lights turn green.
    for (let i=0; i < 3; i++) {
        const sigLightMaterial = scene.getMaterialByName("sigLightMaterial" + i.toString());
        sigLightMaterial.emissiveColor = Colors.GREEN;
    }

    // Change camera angle.
    const cam = scene.getCameraByName("followCam") as BABYLON.FollowCamera;
    cam.radius = 50; cam.heightOffset = 20; cam.rotationOffset = 180;

    addCtrls();
    movement.state = Direction.Forward;

    await accel();
}

/**
 * End the game, remove event listeners.
 */
async function endGame(message?: string) {
    removeCtrls();

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
 * Accelerate (movement.forward 0 -> 1) in 1 second.
 */
async function accel() {
    for (let i=0; i < 60; i++) {
        movement.forward += 1/60;
        await sleep(1000/60);
    }
}

/**
 * Decelerate and rotate in 0.4 seconds.
 */
async function decel() {
    removeCtrls();

    const fDiff = movement.forward;
    const rDiff = movement.rightward;

    for (let i=0; i < 60; i++) {
        movement.forward -= fDiff / 60;
        movement.rightward -= rDiff / 60;
        movement.rotationDelta += Math.PI / 60;
        await sleep(400/60)
    }
}

/**
 * Add event listeners to the game.
 */
function addCtrls() {
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener("touchstart", turnForward);
    window.addEventListener("touchend", turnRight);
}

/**
 * Remove all event listeners from the game.
 */
function removeCtrls() {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('touchstart', turnRight);
    window.removeEventListener('touchend', turnForward);
}

/**
 * Sleeps the current thread of the input time.
 *
 * @param ms - sleep time in milisecond
 */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//--- resize canvas on window resize
window.addEventListener('resize', resize, false);
window.addEventListener('load', resize, false);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
