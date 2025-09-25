import * as PIXI from 'pixi.js';
import 'pixi.js/math-extras';

export default class Unit {

    graphics: PIXI.Graphics = new PIXI.Graphics();

    shiftCapture: PIXI.Point = new PIXI.Point();
    //targetPosition: PIXI.Point = new PIXI.Point();
    targetVector: PIXI.Point = new PIXI.Point();
    distance: number = 0;

    row: number;
    col: number;
    type: number;

    computeMove(x: number, y: number) {

        this.targetVector.x = x - this.graphics.position.x;
        this.targetVector.y = y - this.graphics.position.y;

        if (this.targetVector.magnitude() == 0)
            return;

        this.distance = Math.sqrt(this.targetVector.x * this.targetVector.x + this.targetVector.y * this.targetVector.y);

        this.targetVector = this.targetVector.normalize();
    }
}