import * as PIXI from 'pixi.js';
import { IScene } from "./Scene";
import DataManager from '../manager/DataManager';
import Unit from '../entity/Unit';
import AnimationCommand from '../entity/AnimationCommand';

type OnSignalCallback = () => void;

const GRID_SIZE = 8;
const CELL_SIZE = 60;
const MARGIN = 10;

// TODO: временно, предполагаеться перейти на изображения
const TYPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'heart'];
const COLORS = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0xf984e5, 0xDa2f25, 0x2ecc71];

const UNIT_BACKGROUND_COLOR = 0x58A0FC;
const GAME_BACKGROUND_COLOR = 0x0F1C3D;

const ANIMATION_MOVE_TIME = 0.4;
const ANIMATION_COMEBACK_TIME = 0.1;
const ANIMATION_DISSOLVE_TIME = 0.2;

export default class GameScene implements IScene {

    view = new PIXI.Container();
    ticker: PIXI.Ticker;

    gameContainer = new PIXI.Container({ interactive: true });
    grid: Unit[][] = [];

    currentUnit: Unit = null;

    isProcessing: boolean = false;
    isDragging: boolean = false;

    currentCommand: AnimationCommand = null;
    commands: AnimationCommand[] = [];
    signal: OnSignalCallback = null;

    constructor() {

        const size = DataManager.getVirtualSize();

        const x = size.x / 2;
        const y = size.y / 2;

        // GAME AREA

        this.gameContainer.x = (size.x - (GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * MARGIN)) / 2;
        this.gameContainer.y = (size.y - (GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * MARGIN)) / 2;

        this.gameContainer.pivot.x = x * this.gameContainer.width / this.gameContainer.scale.x;
        this.gameContainer.pivot.y = y * this.gameContainer.height / this.gameContainer.scale.y;

        const background = new PIXI.Graphics();
        background.roundRect(0, 0, 800, 800, 50)
            .fill({ color: GAME_BACKGROUND_COLOR, alpha: 0.7 });
        background.x = 400;

        this.view.addChild(background);

        this.view.addChild(this.gameContainer);


        // HEADER
        const label = new PIXI.Text({ text: 'Три в ряд', style: { fontSize: 90, fill: 0x58A0FC, stroke: { color: 0x1560bd, width: 4, join: 'round' }, fontFamily: 'GlinaScript' } });

        label.anchor.set(0.5);
        label.x = size.x / 2;
        label.y = size.y / 2 - 350;

        this.view.addChild(label);

        this.initializeGrid();
    }

    update(delta: number): void {

        if (this.currentCommand) {

            if (this.currentCommand.type == 'move') {

                for (let unit of this.currentCommand.units) {

                    const speed = unit.distance / this.currentCommand.duration;

                    unit.graphics.position.x += unit.targetVector.x * speed * delta;
                    unit.graphics.position.y += unit.targetVector.y * speed * delta;
                }
            }

            if (this.currentCommand.type == 'dissolve') {

                for (let unit of this.currentCommand.units) {

                    const speed = 1 / ANIMATION_DISSOLVE_TIME;

                    unit.graphics.alpha -= speed * delta;
                    unit.graphics.scale.x -= speed * delta;
                    unit.graphics.scale.y -= speed * delta;
                }
            }

            this.currentCommand.timeout -= delta;
            if (this.currentCommand.timeout < 0)
                this.currentCommand = null;

            return;
        }

        if (this.commands.length == 0) {

            if (this.signal)
                this.signal();

        } else (this.commands.length > 0)
        this.currentCommand = this.commands.shift();

    }

    async runCommand(command: AnimationCommand): Promise<void> {

        this.commands.push(command);

        return new Promise(resolve => {

            this.signal = () => resolve();
        });
    }

    initializeGrid() {

        for (let row = 0; row < GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {

                // Создаем случайный тип, избегая совпадений
                let type;
                do {
                    type = Math.floor(Math.random() * TYPES.length);
                } while (
                    (row >= 2 && this.grid[row - 1][col].type === type && this.grid[row - 2][col].type === type) ||
                    (col >= 2 && this.grid[row][col - 1].type === type && this.grid[row][col - 2].type === type)
                );

                const unit = this.createUnit(row, col, type);
                this.grid[row][col] = unit;
            }
        }

        this.gameContainer.on('pointerup', (event: PIXI.FederatedPointerEvent) => this.onDragEnd(event))
        this.gameContainer.on('pointerupoutside', (event: PIXI.FederatedPointerEvent) => this.onDragEnd(event))
        this.gameContainer.on('pointermove', (event: PIXI.FederatedPointerEvent) => this.onDragMove(event));
    }

    createUnit(row: number, col: number, type: number) {

        const unit = new Unit();
        unit.row = row;
        unit.col = col;
        unit.type = type;

        unit.graphics.interactive = true;

        // Позиционирование
        unit.graphics.x = col * (CELL_SIZE + MARGIN);
        unit.graphics.y = row * (CELL_SIZE + MARGIN);

        // Рисуем фигуру в зависимости от типа
        this.drawUnit(unit);

        // Обработчики событий для перетаскивания
        unit.graphics.on('pointerdown', (event: PIXI.FederatedPointerEvent) => this.onDragStart(event, unit));

        this.gameContainer.addChild(unit.graphics);

        return unit;

    }

    getUnit(row: number, col: number) {

        return this.grid[row][col];
    }

    removeUnit(unit: Unit) {

        unit.graphics.off('pointerdown');

        this.gameContainer.removeChild(unit.graphics);
    }

    drawUnit(unit: Unit) {

        unit.graphics.clear();

        unit.graphics
            .roundRect(0, 0, CELL_SIZE, CELL_SIZE, 10)
            .fill({ color: UNIT_BACKGROUND_COLOR, alpha: 0.5 });

        switch (TYPES[unit.type]) {
            case 'circle':
                unit.graphics.circle(CELL_SIZE / 2, CELL_SIZE / 2, CELL_SIZE / 2 - 5);
                break;
            case 'square':
                unit.graphics.roundRect(5, 5, CELL_SIZE - 10, CELL_SIZE - 10, 5);
                break;
            case 'triangle':
                unit.graphics.poly([
                    CELL_SIZE / 2, 5,
                    CELL_SIZE - 5, CELL_SIZE - 5,
                    5, CELL_SIZE - 5
                ]);
                break;
            case 'diamond':
                unit.graphics.poly([
                    CELL_SIZE / 2, 5,
                    CELL_SIZE - 5, CELL_SIZE / 2,
                    CELL_SIZE / 2, CELL_SIZE - 5,
                    5, CELL_SIZE / 2
                ]);
                break;
            case 'star':
                unit.graphics.star(CELL_SIZE / 2, CELL_SIZE / 2, 5, CELL_SIZE / 2 - 5);
                break;
            case 'heart':
                const width = CELL_SIZE - 10;
                const height = CELL_SIZE - 10;
                const x = 5;
                const y = 5;

                unit.graphics.poly([
                    x + width / 2, y,
                    x + width, y + height / 3,
                    x + width, y + height / 2,
                    x + width / 2, y + height,
                    x, y + height / 2,
                    x, y + height / 3
                ]);
                break;
        }

        unit.graphics.fill(COLORS[unit.type]);
    }

    // EVENT
    onDragStart(event: PIXI.FederatedPointerEvent, unit: Unit) {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.isDragging = true;

        this.currentUnit = unit;
        this.currentUnit.graphics.alpha = 0.7;
        this.currentUnit.shiftCapture = event.getLocalPosition(this.currentUnit.graphics);
    }

    async onDragEnd(event: PIXI.FederatedPointerEvent) {

        if (!this.currentUnit)
            return;

        if (this.isDragging) {

            this.isDragging = false;

            const x = this.currentUnit.col * (CELL_SIZE + MARGIN);
            const y = this.currentUnit.row * (CELL_SIZE + MARGIN);

            this.currentUnit.computeMove(x, y);

            await this.runCommand(new AnimationCommand('move', ANIMATION_COMEBACK_TIME)
                .setUnits([this.currentUnit]));

            this.isProcessing = false;

            this.currentUnit.graphics.alpha = 1;
            this.currentUnit = null;
        }
    }

    async onDragMove(event: PIXI.FederatedPointerEvent) {

        if (!this.isDragging) return;

        console.log(`isProcessing: ${this.isProcessing} isDragging: ${this.isDragging}`);

        // [1] Отображаеи визуально положение захваченного элемента
        const point = event.getLocalPosition(this.gameContainer);

        this.currentUnit.graphics.position.x = point.x - this.currentUnit.shiftCapture.x;
        this.currentUnit.graphics.position.y = point.y - this.currentUnit.shiftCapture.y;

        // [2] Определяем достижения перехода
        const dx = point.x - (this.currentUnit.col * (CELL_SIZE + MARGIN) + CELL_SIZE / 2);
        const dy = point.y - (this.currentUnit.row * (CELL_SIZE + MARGIN) + CELL_SIZE / 2);

        // [3] Если перемещение достаточно большое, пытаемся поменять местами
        if (Math.abs(dx) > (CELL_SIZE >> 1) || Math.abs(dy) > (CELL_SIZE >> 1)) {
            let targetRow = this.currentUnit.row;
            let targetCol = this.currentUnit.col;

            if (Math.abs(dx) > Math.abs(dy)) {
                targetCol += dx > 0 ? 1 : -1;
            } else {
                targetRow += dy > 0 ? 1 : -1;
            }

            // Проверяем, что целевая ячейка существует
            if (targetRow >= 0 && targetRow < GRID_SIZE && targetCol >= 0 && targetCol < GRID_SIZE) {

                this.currentUnit.graphics.alpha = 1;

                this.isDragging = false;

                const swapUnitA = this.currentUnit;
                const swapUnitB = this.getUnit(targetRow, targetCol);

                this.swapUnit(swapUnitA, swapUnitB);

                await this.runCommand(new AnimationCommand('move', ANIMATION_MOVE_TIME)
                    .setUnits([swapUnitA, swapUnitB]));

                let matches = this.getMatches();

                // Проверка обратного свапа в случае отсутствия объединений
                if (matches.length == 0) {
                    this.swapUnit(swapUnitA, swapUnitB);

                    await this.runCommand(new AnimationCommand('move', ANIMATION_MOVE_TIME)
                        .setUnits([swapUnitA, swapUnitB]));

                    this.isProcessing = false;
                } else {

                    do {

                        await this.runCommand(new AnimationCommand('dissolve', ANIMATION_DISSOLVE_TIME)
                            .setUnits(matches));

                        this.removeMatches(matches);

                        let units = this.compactEmptyCells();

                        for (let unit of units)
                            unit.computeMove(unit.col * (CELL_SIZE + MARGIN), unit.row * (CELL_SIZE + MARGIN));

                        await this.runCommand(new AnimationCommand('move', ANIMATION_MOVE_TIME)
                            .setUnits(units));

                        units = this.fillEmptyCells();

                        for (let unit of units)
                            unit.computeMove(unit.col * (CELL_SIZE + MARGIN), unit.row * (CELL_SIZE + MARGIN));

                        await this.runCommand(new AnimationCommand('move', ANIMATION_MOVE_TIME)
                            .setUnits(units));

                        matches = this.getMatches();

                    } while (matches.length > 0);

                    this.isProcessing = false;
                }

            }
        }
    }

    swapUnit(unitA: Unit, unitB: Unit): void {

        const tempRowA = unitA.row;
        const tempColA = unitA.col;
        const tempRowB = unitB.row;
        const tempColB = unitB.col;

        const temp = this.grid[tempRowA][tempColA];
        this.grid[tempRowA][tempColA] = this.grid[tempRowB][tempColB];
        this.grid[tempRowB][tempColB] = temp;

        unitA.row = tempRowB;
        unitA.col = tempColB;
        unitB.row = tempRowA;
        unitB.col = tempColA;

        unitA.computeMove(tempColB * (CELL_SIZE + MARGIN), tempRowB * (CELL_SIZE + MARGIN));
        unitB.computeMove(tempColA * (CELL_SIZE + MARGIN), tempRowA * (CELL_SIZE + MARGIN));
    }

    getMatches(): Unit[] {

        const matches: Unit[] = [];

        // Проверяем горизонтальные совпадения
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 2; col++) {
                const type = this.grid[row][col].type;
                if (type !== -1 && this.grid[row][col + 1].type === type && this.grid[row][col + 2].type === type) {

                    let length = 3;
                    while (col + length < GRID_SIZE && this.grid[row][col + length].type === type) {
                        length++;
                    }

                    for (let i = 0; i < length; i++) {

                        const unit = this.grid[row][col + i];
                        matches.push(unit);
                    }

                    col += length - 1;
                }
            }
        }

        // Проверяем вертикальные совпадения
        for (let col = 0; col < GRID_SIZE; col++) {
            for (let row = 0; row < GRID_SIZE - 2; row++) {
                const type = this.grid[row][col].type;
                if (type !== -1 && this.grid[row + 1][col].type === type && this.grid[row + 2][col].type === type) {

                    let length = 3;
                    while (row + length < GRID_SIZE && this.grid[row + length][col].type === type) {
                        length++;
                    }

                    for (let i = 0; i < length; i++) {
                        const unit = this.grid[row + i][col];
                        matches.push(unit);
                    }

                    row += length - 1;
                }
            }
        }

        // Удаление дубликатов
        const uniqueMatches = matches.filter((match, index, self) =>
            index === self.findIndex(m => m.row === match.row && m.col === match.col)
        );

        return uniqueMatches;
    };

    removeMatches(matches: Unit[]) {

        for (let unit of matches) {

            this.removeUnit(unit);

            this.grid[unit.row][unit.col] = null;
        }
    }

    compactEmptyCells(): Unit[] {

        const result: Unit[] = [];

        for (let col = 0; col < GRID_SIZE; col++) {
            let writeIndex = GRID_SIZE - 1;

            for (let row = GRID_SIZE - 1; row >= 0; row--) {
                if (this.grid[row][col] !== null) {
                    if (writeIndex !== row) {
                        this.grid[writeIndex][col] = this.grid[row][col];
                        this.grid[writeIndex][col].row = writeIndex;

                        result.push(this.grid[writeIndex][col]);

                        this.grid[row][col] = null;
                    }
                    writeIndex--;
                }
            }
        }

        return result;
    }

    fillEmptyCells(): Unit[] {

        const result: Unit[] = [];

        let add = 0;

        for (let col = 0; col < GRID_SIZE; col++) {

            for (let row = GRID_SIZE - 1; row >= 0; row--) {

                if (this.grid[row][col] === null) {

                    add++;

                    const type = Math.floor(Math.random() * TYPES.length);

                    const unit = this.createUnit(row, col, type);
                    this.grid[row][col] = unit;

                    unit.graphics.position.y = -add * (CELL_SIZE + MARGIN);

                    result.push(this.grid[row][col]);


                }
            }
        }

        return result;
    }
}