import * as BABYLON from "babylonjs";
import {Engine, Scene, Vector3} from "babylonjs";
import * as GUI from "babylonjs-gui";

import * as Builder from "./builder";
import {Direction} from "./types";
import {Colors, Game} from "./settings";

import {Road} from "./models/road";
import {GameLoadingScreen, GameOverData, ScreenType} from "./models/game-loading-screen";


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
    turningProgress: 1,
    state: Direction.Still,
};

let tireTrack;
const trackArray = Array(40).fill(Array(2).fill(Vector3.Zero));

async function createScene () {
    let inGameCars = ["aventador"];

    // Create loading screen.
    engine.loadingScreen = new GameLoadingScreen("Loading meshes to scene.", ScreenType.Loading);
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
    fpsLabel = Builder.createGUITextBlock("fpsLabel", "FPS: 0", 0, 1);
    fpsLabel.paddingTop = 5; fpsLabel.paddingRight = 10;
    guiTexture.addControl(fpsLabel);

    // Initialize tire tracks.
    tireTrack = Builder.initTireTracks(scene);

    // Hide loading screen.
    engine.hideLoadingUI();

    return scene;
}

let scene;
let light;
let road: Road;

let startTime: number;
let endTime: number;

// GUI elements.
let fpsLabel: GUI.TextBlock;

let carSetup = {
    // The time (in ms) that the car needs to make a 90 degree turn
    turningTime: 300,
    // The mass of car in kg. Affects the overall responsiveness of the car when drifting.
    mass: 2,
    // The acceleration force of the car towards the direction that it is facing.
    // When drifting, this affects how quickly the car will start to speed up after turning.
    acceleration: 8,
    // The friction force caused by the wheels when car is not facing the direction it is going.
    // When drifting, this determines how quickly the car slows down in the main direction.
    // Looks most natural when this is equal or less than accelerationForce.
    friction: 6,
};

createScene().then((result) => {
    scene = result;

    engine.runRenderLoop(async function () {
        // Start game if it has not been started.
        if (!isGameStarted) await setupGame();
        const aventadorRoot = scene.getNodeByName("aventador");

        // Road does not contain the car, game over, user lose
        if (movement.state != Direction.Fall && !road.contains(aventadorRoot.position, Game.ROAD_CONFIG.width)) {
            movement.state = Direction.Fall;
            await Promise.all([endGame(false), fall()]);
        }

        // If crossed finish line, decelerate.
        if (movement.state != Direction.Decel && road.isCarFinished(movement.forwardDist, movement.rightDist)) {
            movement.state = Direction.Decel;
            // Zoom in camera.
            const cam = scene.getCameraByName("followCam") as BABYLON.FollowCamera;
            cam.radius = 20; cam.heightOffset = 10; cam.rotationOffset = 140;
            await decel();
            await endGame(true);
        }

        // Update tire tracks
        Builder.updateTireTracks(trackArray, scene, tireTrack);

        if (movement.state !== Direction.Still && movement.state !== Direction.Fall && movement.state !== Direction.Decel) {
            // Update progress with time past
            const progress = Math.min(1, movement.turningProgress + engine.getDeltaTime() / carSetup.turningTime);

            const rotation = progress * Math.PI / 2;
            const forwardComp = Math.cos(rotation);
            const sideComp = Math.sin(rotation);

            const portionOfSecond = engine.getDeltaTime() / 1000;

            const forwardChange = portionOfSecond * (forwardComp * carSetup.acceleration - sideComp * carSetup.friction) / carSetup.mass;
            const sideChange = portionOfSecond * (sideComp * carSetup.acceleration - forwardComp * carSetup.friction) / carSetup.mass;

            /// Limit a number between 0 and 1
            const limit = (n: number) => Math.min(1, Math.max(0, n));

            if (isSpaceKeyDown) {
                // Turning right
                movement.forward = limit(movement.forward + forwardChange);
                movement.rightward = limit(movement.rightward + sideChange);
                movement.rotationDelta = rotation;
            } else {
                // Turning forward
                movement.forward = limit(movement.forward + sideChange);
                movement.rightward = limit(movement.rightward + forwardChange);
                movement.rotationDelta = Math.PI / 2 - rotation;
            }

            // Finished turning
            if (progress === 1) {
                movement.state = isSpaceKeyDown ? Direction.Right : Direction.Forward;
            }

            movement.turningProgress = progress;
        }

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

        // Update fps label
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

    // Start the timer and accelerate.
    startTime = Date.now();
    await accel();
}

/**
 * End the game, remove event listeners.
 */
async function endGame(didPlayerWin: boolean) {
    removeCtrls();

    // End timer, calculate time.
    endTime = Date.now()
    const timeElapsed = (endTime - startTime) / 1000;

    // If the player win, sleep for 1.5 secs (show the car stop),
    // if the player lose, sleep for 0.7 secs (show the car fall).
    await sleep(didPlayerWin ? 1500 : 700);
    engine.stopRenderLoop();

    // Show game over screen, hide the canvas.
    canvas.style.display = "none";
    // Divide the actual distance by 2.5 to get a reasonable speed (around 136 km/h)
    engine.loadingScreen = new GameLoadingScreen(didPlayerWin ? "You Win!" : "You Lose!", ScreenType.GameOver, new GameOverData(didPlayerWin,
        (movement.rightDist + movement.forwardDist) / 2.5,
        timeElapsed));
    engine.displayLoadingUI();
}

/**
 * Start turning right when space key is pressed.
 */
async function keydown(e) {
    // Space key pressed.
    if (e.code == 'Space') {
        turnForward();
    }
}

/**
 * Start turning left when space key is released.
 */
async function keyup(e) {
    // Space key released.
    if (e.code == 'Space') {
        turnRight();
    }
}

function turnRight() {
    if (isSpaceKeyDown) {
        handleTurnDirectionChange();
    }
}

function turnForward() {
    if (!isSpaceKeyDown) {
        handleTurnDirectionChange();
    }
}

function handleTurnDirectionChange() {
    if (movement.state !== Direction.Still) {
        isSpaceKeyDown = !isSpaceKeyDown;
        movement.turningProgress = 1 - movement.turningProgress;
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
    movement.state = Direction.Still;
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
 * Decelerate and rotate in 0.4 seconds.
 */
async function decel() {
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
