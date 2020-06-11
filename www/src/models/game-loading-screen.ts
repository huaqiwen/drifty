import {ILoadingScreen} from "babylonjs";

const loadingScreenDiv = window.document.getElementById("game-loading-screen");
const gameOverScreenDiv = window.document.getElementById("game-over-screen");

export const enum ScreenType {
    Loading,
    GameOver
}

export class GameOverData {
    didPlayerWin: boolean;
    totDistance: number;
    timeElapsed: number;

    constructor(didPlayerWin: boolean, totDistance: number, timeElapsed: number) {
        this.didPlayerWin = didPlayerWin;
        this.totDistance = totDistance;
        this.timeElapsed = timeElapsed;
    }
}

export class GameLoadingScreen implements ILoadingScreen {
    public loadingUIBackgroundColor: string;
    screenType: ScreenType;
    gameOverData: GameOverData;

    constructor(public loadingUIText: string, screenType: ScreenType, gameOverData?: GameOverData) {
        this.screenType = screenType;
        if (typeof gameOverData !== "undefined") this.gameOverData = gameOverData;

        loadingScreenDiv.style.display = "none";
        gameOverScreenDiv.style.display = "none";
    }

    public displayLoadingUI() {
        if (this.screenType === ScreenType.Loading) {
            loadingScreenDiv.style.display = "block";
        } else if (this.screenType === ScreenType.GameOver) {
            this.setupGameOverScreen()
        }
    }

    public hideLoadingUI() {
        loadingScreenDiv.style.display = "none";
        gameOverScreenDiv.style.display = "none";
    }

    /**
     * Sets up the loading screen and its content.
     */
    private setupGameOverScreen() {
        gameOverScreenDiv.style.display = "block";

        // Update content.
        const distStr = this.gameOverData.totDistance.toFixed(1).toString();
        const timeStr = this.gameOverData.timeElapsed.toFixed(1).toString();

        document.getElementById("game-over-heading").innerText = this.loadingUIText;
        document.getElementById("game-over-distance-lbl").innerText = `You traveled: ${distStr} m`;
        document.getElementById("game-over-time-lbl").innerText = `Time elapsed: ${timeStr} s`;

        // Set play-again button.
        document.getElementById("play-again-btn").onclick = () => {
            location.reload();
        }
    }
}
