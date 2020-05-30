import {ILoadingScreen} from "babylonjs";

const loadingScreenDiv = window.document.getElementById("gameLoadingScreen");

export class GameLoadingScreen implements ILoadingScreen {
    public loadingUIBackgroundColor: string;

    constructor(public loadingUIText) {}

    public async displayLoadingUI() {
        const loadingProgressBar = GameLoadingScreen.getElementInsideContainer("gameLoadingScreen", "loading-progress") as HTMLProgressElement;
        for (let i=0; i < 100; i += 5) {
            await this.sleep(1);
            loadingProgressBar.value = i;
        }
    }

    public hideLoadingUI() {
        console.log("Scene is loaded.")
        loadingScreenDiv.style.display = "none";
    }

    private static getElementInsideContainer(containerID: string, childID: string): HTMLElement {
        const elms = document.getElementById(containerID).getElementsByTagName("*");
        for (let i=0; i < elms.length; i++) {
            if (elms[i].id === childID) return <HTMLElement>elms[i];
        }
    }

    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
