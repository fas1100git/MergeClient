import Unit from "./Unit";

export default class AnimationCommand {

    type: 'move' | 'dissolve';
    duration: number = 0;
    timeout: number = 0;
    units: Unit[] = [];

    constructor(type: 'move' | 'dissolve', duration: number) {
        this.type = type;
        this.duration = duration;
        this.timeout = duration;
        return this;
    }

    setUnits(units: Unit[]) {

        this.units.push(...units);
        return this;
    }
}