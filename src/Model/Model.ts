import { makeAutoObservable } from "mobx";

export default class Model {
    secondsPassed = 0;
    timer?: number;
    constructor() {
        makeAutoObservable(this);
        this.start();
    }
    start() {
        this.timer = setInterval(this.incSeconds.bind(this), 1000);
    }
    stop() {
        clearInterval(this.timer);
    }
    incSeconds() {
        this.secondsPassed++;
    }
}
