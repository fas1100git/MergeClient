import * as PIXI from 'pixi.js';

export default class Gem {

    graphics: PIXI.Graphics = new PIXI.Graphics();

    row: number;
    col: number;
    type: number;

    shiftCapture: PIXI.Point = new PIXI.Point();
}