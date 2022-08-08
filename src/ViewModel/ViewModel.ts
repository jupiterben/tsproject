import { makeAutoObservable } from "mobx";
import Model from "../Model/Model";

export default class ViewModel {
    model: Model;
    constructor(model: Model) {
        this.model = model;
        makeAutoObservable(this);
    }
    get secondsPassed() {
        return this.model.secondsPassed;
    }
}
