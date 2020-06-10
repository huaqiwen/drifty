import {ILoadingScreen} from "babylonjs";

const loadingScreenDiv = window.document.getElementById("game-loading-screen");
const gameOverScreenDiv = window.document.getElementById("game-over-screen");

export const enum ScreenType {
    Loading,
    GameOver
}

export class GameLoadingScreen implements ILoadingScreen {
    public loadingUIBackgroundColor: string;
    screenType: ScreenType;

    constructor(public loadingUIText, screenType: ScreenType) {
        this.screenType = screenType;
        loadingScreenDiv.style.display = "none";
        gameOverScreenDiv.style.display = "none";
    }

    public displayLoadingUI() {
        if (this.screenType === ScreenType.Loading) {
            loadingScreenDiv.style.display = "block";
        } else if (this.screenType === ScreenType.GameOver) {
            gameOverScreenDiv.style.display = "block";

            // Update the content.
            GameLoadingScreen.getElementInsideContainer("game-over-screen", "game-over-heading").innerText = this.loadingUIText;
        }
    }

    public hideLoadingUI() {
        loadingScreenDiv.style.display = "none";
        gameOverScreenDiv.style.display = "none";
    }

    /**
     * Finds and returns a HTML element that is inside a div by its id and its div id.
     *
     * @param containerID - a string defines the id of the containing div
     * @param childID - a string defines the id of the target HTML element
     *
     * @returns the element
     */
    private static getElementInsideContainer(containerID: string, childID: string): HTMLElement {
        const elms = document.getElementById(containerID).getElementsByTagName("*");
        for (let i=0; i < elms.length; i++) {
            if (elms[i].id === childID) return <HTMLElement>elms[i];
        }
    }
}
