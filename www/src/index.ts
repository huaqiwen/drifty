import * as BABYLON from "babylonjs";
import { Engine, Scene, Vector3 } from "babylonjs";
import * as BBMaterials from "babylonjs-materials";

import * as Builder from "./builder";

const canvas = document.getElementById("main_canvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

async function createScene () {
    const scene = new Scene(engine);
    scene.clearColor = new BABYLON.Color4(0 / 255, 0 / 255, 0 / 255, 1.0);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(50, 100, 90), scene);
    light.intensity = 3.0;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 500, height: 500}, scene);
    ground.material = new BBMaterials.GridMaterial("groundMaterial", scene);

    // import meshes on parallel
    await Promise.all([
        Builder.createModelNode("", "./models3d/shelby1967/", "1967-shelby-ford-mustang.babylon", scene, "shelby1967"),
        Builder.createModelNode("", "./models3d/viper/", "dodge-viper-gts.babylon", scene, "viper"),
    ]);

    Builder.createFollowCamera("followCam", scene, canvas, "shelby1967");

    return scene;
}

let scene;
createScene().then((result) => {
    scene = result;

    // scale the models size
    Builder.scaleTransformNode(scene, "viper", 0.77);

    let isForward = true;
    engine.runRenderLoop(function () {
        const shelby1967_root = scene.getNodeByName("shelby1967");

        if (isForward) {
            scene.getCameraByName("followCam").rotationOffset = 180;
            shelby1967_root.rotation = new Vector3(0, BABYLON.Tools.ToRadians(0), 0);
            shelby1967_root.position.z += 0.5;
        } else {
            scene.getCameraByName("followCam").rotationOffset = 240;
            shelby1967_root.rotation = new Vector3(0, BABYLON.Tools.ToRadians(90), 0);
            shelby1967_root.position.x += 0.5;
        }

        scene.actionManager = new BABYLON.ActionManager(scene);
        // when SPACE key pressed, set isForward = false
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyDownTrigger, parameter: " " },
                () => { isForward = false; }
            )
        );
        // when SPACE key released, set isForward = true
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                { trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: " " },
                () => { isForward = true; }
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
