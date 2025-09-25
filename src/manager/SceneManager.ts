import * as PIXI from 'pixi.js';

import DataManager, { GAME_VIRTUAL_SIZE_LONG, GAME_VIRTUAL_SIZE_SHORT } from '../manager/DataManager';
import { IScene } from '../scene/Scene';
import { throttle } from '../other/Throttle';

export const FIXED_DELTA = 1000 / 60;

export default class SceneManager {

    static canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    static app: PIXI.Application = new PIXI.Application();
    static container = new PIXI.Container({
        zIndex: 1,
    });

    static scene: IScene;

    static backgrounSprite: PIXI.Sprite;
    static borderGrapgics: PIXI.Graphics;

    static async init() {

        // Задумка определить фон и отдельно игровую область с виртуальными размерами.
        await this.app.init({
            antialias: true,
            autoDensity: true,
            backgroundAlpha: 0,
            resolution: devicePixelRatio ?? 1,
            canvas: this.canvas,
            resizeTo: window
        });

        this.app.stage.addChild(this.container);

        const backgrounSprite = this.backgrounSprite = new PIXI.Sprite({
            texture: DataManager.backgroundTexture,
            anchor: 0.5,
            roundPixels: false,
            position: new PIXI.Point(this.app.renderer.width / 2, this.app.renderer.height / 2),
        });

        this.app.stage.addChild(backgrounSprite);

        // #!if target === 'debug'
        const border = this.borderGrapgics = new PIXI.Graphics();
        border.visible = false;
        this.container.addChild(border);
        // #!endif

        const throttledResize = throttle((event: Event) => this.resize(), 40);

        addEventListener('resize', throttledResize);
        addEventListener('orientationchange', throttledResize);
        this.resize();

        this.app.ticker.add((ticker) => this.loop(ticker));
    }

    static resize() {

        this.app.resizeTo = window;

        const landscape = DataManager.isLandscape();

        const designWidth = landscape ? GAME_VIRTUAL_SIZE_LONG : GAME_VIRTUAL_SIZE_SHORT;
        const designHeight = landscape ? GAME_VIRTUAL_SIZE_SHORT : GAME_VIRTUAL_SIZE_LONG;

        const gameRatio = designWidth / designHeight;
        const screenRatio = this.app.renderer.width / this.app.renderer.height;

        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;

        const screenWidth = this.app.renderer.width;
        const screenHeight = this.app.renderer.height;

        if (gameRatio < screenRatio) {
            scale = screenHeight / designHeight;
            offsetX = (screenWidth - designWidth * scale) / 2;
            offsetY = 0;
        } else {
            scale = screenWidth / designWidth;
            offsetX = 0;
            offsetY = (screenHeight - designHeight * scale) / 2;
        }

        this.container.setSize(designWidth, designHeight);
        this.container.scale.set(scale);
        this.container.position.set(offsetX, offsetY);

        // BACKGROUND
        const scaleX = this.app.renderer.width / this.backgrounSprite.texture.source.width;
        const scaleY = this.app.renderer.height / this.backgrounSprite.texture.source.height;
        this.backgrounSprite.scale.set(Math.max(scaleX, scaleY));
        this.backgrounSprite.x = this.app.renderer.width / 2;
        this.backgrounSprite.y = this.app.renderer.height / 2;

        // BORDER
        this.resizeBorder();
    }

    static resizeBorder() {

        const landscape = DataManager.isLandscape();

        const borderWidth = landscape ? GAME_VIRTUAL_SIZE_LONG : GAME_VIRTUAL_SIZE_SHORT;
        const borderHeight = landscape ? GAME_VIRTUAL_SIZE_SHORT : GAME_VIRTUAL_SIZE_LONG;

        this.borderGrapgics.clear();
        this.borderGrapgics.rect(0, 0, borderWidth, borderHeight);
        this.borderGrapgics.stroke({ color: 0xff0303, width: 10 });
    }

    static setScene(scene: IScene) {

        if (this.scene)
            this.container.removeChild(this.scene.view);

        this.scene = scene;
        this.scene.ticker = this.app.ticker;

        this.container.addChild(this.scene.view);
    }

    static loop(ticker: PIXI.Ticker) {

        const ms = Math.min(ticker.deltaMS, FIXED_DELTA);

        const delta = ms / 1000;

        if (this.scene)
            this.scene.update(delta);
    }

    // not using
    static createGrid(rows: number, cols: number, cellSize: number): PIXI.Graphics {

        const grid = new PIXI.Graphics();

        //grid.setStrokeStyle({ width: 3, color: 0x666666 });

        for (let x = 0; x <= cols; x++) {
            grid.moveTo(x * cellSize, 0);
            grid.lineTo(x * cellSize, rows * cellSize);
        }

        for (let y = 0; y <= rows; y++) {
            grid.moveTo(0, y * cellSize);
            grid.lineTo(cols * cellSize, y * cellSize);
        }

        grid.stroke({ color: 0x666666, width: 3 });

        return grid;
    }

}