import { Vector3 } from "babylonjs";

export class SignalLight {
    lights: boolean[];

    constructor() {
        this.lights = Array(3).fill(false);
    }
}
