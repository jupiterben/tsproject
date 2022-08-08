import { makeAutoObservable } from 'mobx';
import FPNode from '../Model/FPNode';

export default class FPNodeVM {
    node: FPNode;
    constructor(node: FPNode) {
        this.node = node;
        makeAutoObservable(this);
    }
}