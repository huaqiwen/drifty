import * as BABYLON from "babylonjs";
import { Vector3 } from "babylonjs";

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
        new BABYLON.Vector3(15, 0, 4.3),
        new BABYLON.Vector3(5, 0, 4.3),
        new BABYLON.Vector3(25, 0, 4.3),
    ]

    /**
     * defines the width and thickness of the game road
     */
    export const ROAD_CONFIG = {
        length: 10,
        width: 30,
        thickness: 1,
    }

    /**
     * defines the config and position of the signal lights panel
     */
    export const SIGNAL_PANEL_CONFIG = {
        position: new BABYLON.Vector3(15, 4, 5),
        config: {
            width: 4,
            height: 1,
            depth: 0.3
        },
        lightsConfig: (i) => {
            return {
                position: new Vector3(15 - (i - 1) * 1.3, 4, 5 - 0.15 - 0.05),
                config: {
                    diameterTop: 0.7,
                    diameterBottom: 0.7,
                    height: 0.1,
                    tessellation: 60
                }
            }
        }
    }

    /**
     * defines the position of light
     */
    export const LIGHT_POS = new BABYLON.Vector3(50, 100, 90);

    /**
     * defines the background color of the game scene
     */
    export const SCENE_COLOR = new BABYLON.Color4(52 / 255, 235 / 255, 216 / 255, 1.0);

    /**
     * initialization array for tire tracks
     */
    export const INIT_TRACK_ARRAY = [[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)], [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],      [new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)],[new Vector3(0, 0 ,0), new Vector3(0, 0 ,0)]];

    /**
     * uv mapping array for tiremark texture
     */
    export const TIRETRACK_UVS = [ new BABYLON.Vector2(0.5328,1.2177), new BABYLON.Vector2(0.5328,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.5328,1.2177), new BABYLON.Vector2(0.5328,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321), new BABYLON.Vector2(0.5328,1.2177), new BABYLON.Vector2(0.5328,1.0321), new BABYLON.Vector2(0.7184,1.2177), new BABYLON.Vector2(0.7184,1.0321) ];
}


/**
 * Colors.
 */
export namespace Colors {
    export const DARK_RED = new BABYLON.Color3(77 / 255, 0, 0);
    export const RED = new BABYLON.Color3(1, 0, 0);
    export const GREEN = new BABYLON.Color3(0, 1, 0);
}
