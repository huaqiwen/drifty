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
        loadingScreenDiv.style.display = "none";
    }

    /**
     * Gets a HTML element that is inside a div by its id and its div id.
     *
     * @param containerID - a string defines the id of the containing div
     * @param childID - a string defines the id of the target HTML element
     */
    private static getElementInsideContainer(containerID: string, childID: string): HTMLElement {
        const elms = document.getElementById(containerID).getElementsByTagName("*");
        for (let i=0; i < elms.length; i++) {
            if (elms[i].id === childID) return <HTMLElement>elms[i];
        }
    }

    /**
     * Sleeps the current thread of the input time.
     *
     * @param ms - sleep time in milisecond
     */
    private sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
