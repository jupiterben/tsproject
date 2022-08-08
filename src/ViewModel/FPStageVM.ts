import { makeAutoObservable } from 'mobx';

export default class FPStageVM {
    scale = 1;
    translate = {x:0, y:0};
    constructor() {
        makeAutoObservable(this);
    }
    
}