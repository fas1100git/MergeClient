import * as PIXI from 'pixi.js';

export interface IScene {

    view: PIXI.Container;
    ticker: PIXI.Ticker;

    update(delta: number): void;
}