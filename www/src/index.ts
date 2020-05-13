import * as BABYLON from "babylonjs";
import { Engine, Scene } from "babylonjs";
import * as BBMaterials from "babylonjs-materials";

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const createScene = async function () {
    const scene = new Scene(engine);
    scene.clearColor = new BABYLON.Color4(0 / 255, 0 / 255, 0 / 255, 1.0);

    const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(50, 100, 90),
        scene);
    light.intensity = 3.0;

    BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 500, height: 500}, scene);
    ground.material = new BBMaterials.GridMaterial("groundMaterial", scene);

    const data = await BABYLON.SceneLoader.ImportMeshAsync("",
        "./models3d/shelby1967/",
        "1967-shelby-ford-mustang.babylon",
        scene);
    const newMeshes = data.meshes;
    const shelby_root = new BABYLON.TransformNode("shelby1967", scene);
    newMeshes.forEach((mesh) => {
        if (!mesh.parent) {
            mesh.parent = shelby_root;
        }
    })

    const camera = new BABYLON.FollowCamera("followCam",
        new BABYLON.Vector3(500, 500, 0),
        scene);
    camera.lockedTarget = scene.getNodeByName("shelby1967").getChildMeshes(false)[2];
    camera.radius = 30;
    camera.heightOffset = 10;

    camera.attachControl(canvas, true);

    return scene;
};

let scene;
createScene().then((result) => {
    scene = result;

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
