import * as BABYLON from "babylonjs";

export class Car {
    public name: string;
    public fileRootUrl: string;
    public filename: string;
    public scaling: BABYLON.Vector3;
    public rotation: BABYLON.Vector3;

    constructor(
        name: string,
        fileRootUrl: string,
        filename: string,
        scaling: number=1,
        rotation: BABYLON.Vector3=BABYLON.Vector3.Zero(),
    ) {
        this.name = name;
        this.fileRootUrl = fileRootUrl;
        this.filename = filename;
        this.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
        this.rotation = rotation;
    }
}
