import * as BABYLON from "babylonjs";

import { Car } from "./models/car";

export namespace Game {
    /**
     * defines the config of the cars
     */
    export const CARS = {
        viper: new Car(
            "viper",
            "./models3d/viper/",
            "dodge-viper-gts.babylon",
            0.6,
            new BABYLON.Vector3(0, Math.PI, 0),
        ),
        aventador: new Car(
            "aventador",
            "./models3d/aventador/",
            "lamborghini-aventador.babylon",
            1.7,
            new BABYLON.Vector3(0, Math.PI / 2, 0),
        ),
        shelby1967: new Car(
            "shelby1967",
            "./models3d/shelby1967/",
            "1967-shelby-ford-mustang.babylon",
        ),
    }

    /**
     * defines the starting position of the three cars
     */
    export const CAR_START_POS = [
        new BABYLON.Vector3(5, 30, 0),
        new BABYLON.Vector3(15, 30, 0),
        new BABYLON.Vector3(25, 30, 0),
    ]

    /**
     * defines the width and thickness of the game road
     */
    export const ROAD_CONFIG = {
        width: 30,
        thickness: 1,
    }

    /**
     * defines the position and margin of the buttons panel
     */
    export const PANEL_CONFIG = {
        position: new BABYLON.Vector3(CAR_START_POS[1].x, 4, 0),
        margin: 0.03,
    }

    /**
     * defines the position of light
     */
    export const LIGHT_POS = new BABYLON.Vector3(50, 100, 90);

    /**
     * defines the background color of the game scene
     */
    export const SCENE_COLOR = new BABYLON.Color4(255 / 255, 255 / 255, 255 / 255, 1.0);
}
