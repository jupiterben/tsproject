import { Doc, Entity, DummyTransaction } from "./entity";

enum FP_ENT_TY {
    Scene = 'scene',
    Building = 'building',
    Ground = 'ground',
    Wall = 'wall',
    Slab = 'slab',
}

class Scene extends Entity {
    classType = FP_ENT_TY.Scene;
}
class Ground extends Entity {
    classType = FP_ENT_TY.Ground;
}
class Wall extends Entity {
    classType = FP_ENT_TY.Wall;
}
class Slab extends Entity {
    classType = FP_ENT_TY.Slab;
}

class Building extends Entity {
    classType = FP_ENT_TY.Building;

    private _walls: Map<string, Wall> | null = null;

    constructor(id: string, doc: FloorPlan) {
        super(id, doc);
    }

    get walls() {
        if (!this._walls) {
            const state = this.getState();
            //this._walls = getEntityMap<Wall>(this.doc, wallIds, Wall);
        }
        return this._walls!;
    }
    onStateChanged() {
        this._walls = null;
    }
}


class FloorPlan extends Doc {

    static Entity_Factory: Map<FP_ENT_TY, any> = new Map([
        [FP_ENT_TY.Building, Building],
        [FP_ENT_TY.Scene, Scene],
        [FP_ENT_TY.Ground, Ground],
        [FP_ENT_TY.Wall, Wall],
        [FP_ENT_TY.Slab, Slab],
    ]);

    _entityFactory(type: FP_ENT_TY, id: string): Entity | null {
        const constructor = FloorPlan.Entity_Factory.get(type);
        if (!constructor) return null;
        return new constructor(id, this);
    }

    initDefaultDoc() {
        this.activeTransaction = new DummyTransaction();
        let scene = this.createEntity(FP_ENT_TY.Scene);
        
    }
}

function isTypeof<T>(obj: any, type: any): obj is T {
    return obj instanceof type;
}

function getEntityMap<T>(doc: Doc, ids: string[], type: any) {
    let ret = new Map<string, T>();
    for (let id of ids) {
        let ent = doc.getEntityById(id);
        if (ent && isTypeof<T>(ent, type)) {
            ret.set(id, ent);
        }
    }
    return ret;
}


let fp = new FloorPlan();
fp.initDefaultDoc();

let transaction = fp.startTransaction();
if (transaction) {
    try {
        let wall = fp.createEntity(FP_ENT_TY.Wall);
        let req = transaction.commit();

        console.log(fp.toJSON());
    } catch (e) {
        transaction.rollback();
    }
}

