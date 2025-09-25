import * as PIXI from 'pixi.js';

export const GAME_VIRTUAL_SIZE_LONG = 1600;
export const GAME_VIRTUAL_SIZE_SHORT = 800;

export default class DataManager {

    static backgroundTexture: PIXI.Texture;

    static textures = new Map<string, PIXI.Texture>();

    static async init() {

        this.backgroundTexture = await PIXI.Assets.load(`image/background.jpg`);

        //this.textures.set('image.png', await PIXI.Assets.load(`texture/image.png`));
    }

    static getVirtualSize(): { x: number, y: number } {

        const landscape = DataManager.isLandscape();

        const x = landscape ? GAME_VIRTUAL_SIZE_LONG : GAME_VIRTUAL_SIZE_SHORT;
        const y = landscape ? GAME_VIRTUAL_SIZE_SHORT : GAME_VIRTUAL_SIZE_LONG;

        return { x, y };
    }


    static isPortrait() {
        return document.documentElement.clientWidth < document.documentElement.clientHeight;
    }

    static isLandscape() {
        return document.documentElement.clientWidth >= document.documentElement.clientHeight;
    }
}