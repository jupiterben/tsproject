import { makeAutoObservable } from "mobx";
import Model from "../Model/Model";
import StageVM from './FPStageVM';
import { v4 as uuidV4 } from 'uuid';
import FPNodeVM from './FPNodeVM';


export default class ViewModel {
    editorId: string = uuidV4();
    model: Model;
    stageVM: StageVM;
    
    constructor(model: Model) {
        this.model = model;
        this.stageVM = new StageVM();
        makeAutoObservable(this);
    }
    get secondsPassed() {
        return this.model.secondsPassed;
    }
    get nodesVM() {
        return this.model.nodes.map(node => new FPNodeVM(node));
    }
}
