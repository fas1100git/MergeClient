
import DataManager from "./DataManager";
import SceneManager from "./SceneManager";

import MenuScene from "../scene/MenuScene";
import GameScene from "../scene/GameScene";

export type AuthCallbackFunction = () => void;

export default class MainManager {

    static async init() {

        await DataManager.init();

        await SceneManager.init();
        SceneManager.setScene(new MenuScene());
    }

    static clientPlay() {

        SceneManager.setScene(new GameScene());
    }
}
