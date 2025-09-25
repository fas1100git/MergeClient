import * as PIXI from 'pixi.js';
import { Button } from '@pixi/ui';

import DataManager from '../manager/DataManager';
import MainManager from '../manager/MainManager';
import { IScene } from './Scene';

const buttonSettings = {
    width: 400,
    height: 100,
    round: 12,
    color: 0xa3e24b,
    colorHover: 0xaaee4b,
}

export default class MenuScene implements IScene {

    view = new PIXI.Container();
    ticker: PIXI.Ticker;

    constructor() {

        const size = DataManager.getVirtualSize();

        const x = size.x / 2;
        const y = size.y / 2;

        // ЗАГОЛОВОК
        const label = new PIXI.Text({ text: 'Три в ряд', style: { fontSize: 90, fill: 0x58A0FC, stroke: { color: 0x1560bd, width: 4, join: 'round' }, fontFamily: 'GlinaScript' } });

        label.anchor.set(0.5);
        label.x = size.x / 2;
        label.y = (size.y / 2) - 200;

        this.view.addChild(label);


        // ИГРАТЬ
        const buttonView = new PIXI.Container();
        const buttonBg = new PIXI.Graphics().roundRect(0, 0, buttonSettings.width, buttonSettings.height, buttonSettings.round).fill(buttonSettings.color);

        const text = new PIXI.Text({ text: 'Играть', style: { fontSize: 70, fill: 'white', /*stroke: { color: 0xff0000, width: 2, join: 'round' },*/ fontFamily: 'GlinaScript' } });

        text.anchor.set(0.5);
        text.x = buttonBg.width / 2;
        text.y = buttonBg.height / 2;

        buttonView.addChild(buttonBg, text);
        buttonView.position.set(x - buttonSettings.width / 2, y - buttonSettings.height / 2);

        const button = new Button(buttonView);

        //button.onPress.connect(() => action('onPress'));
        //button.onDown.connect(() => action('onDown'));
        //button.onUp.connect(() => action('onUp'));
        //button.onHover.connect(() => action('onHover'));
        //button.onOut.connect(() => action('onOut'));
        //button.onUpOut.connect(() => action('onUpOut'));

        button.onHover.connect(() => buttonBg.roundRect(0, 0, 400, 100, buttonSettings.round).fill(buttonSettings.colorHover));
        button.onOut.connect(() => buttonBg.roundRect(0, 0, 400, 100, buttonSettings.round).fill(buttonSettings.color));
        button.onPress.connect(() => MainManager.clientPlay());

        this.view.addChild(buttonView);
    }

    resize() {

    }

    update(delta: number) {

    }

}