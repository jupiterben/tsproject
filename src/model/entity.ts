

import produce, { immerable } from "immer"
import * as Immutable from "immutable";

type IState = number;

export abstract class Entity {
    public readonly id: string;
    public readonly doc: Doc;
    abstract readonly classType: string;

    private _state: IState | null = null;

    constructor(id: string, doc: Doc) {
        this.id = id;
        this.doc = doc;
    }

    public getState() { return this._state; }

    destroy() {
        if (!this.doc.activeTransaction) {
            throw new Error("destroy entity outside transaction is forbidden !");
        }
        const beforeState = this._state;
        this.doc.activeTransaction.saveBeforeChangeState(this, beforeState);
        this._state = null;
        this.onStateChanged(beforeState, null);
    }

    protected _modify(modifyFunc: (draftState: IState) => void) {
        if (!this._state) {
            throw new Error("entity did not have state");
        }
        if (!this.doc.activeTransaction) {
            throw new Error("modify entity outside transaction is forbidden !");
        }
        const beforeState = this._state;
        this.doc.activeTransaction.saveBeforeChangeState(this, beforeState);
        const afterState = produce(this._state, modifyFunc);
        this._state = afterState;
        this.onStateChanged(beforeState, afterState);
    }

    public restoreState(state: IState | null) {
        if (this._state === state) return;
        const beforeState = this._state;
        this._state = state;
        this.onStateChanged(beforeState, state);
    }

    protected onStateChanged(beforeState: IState | null, afterState: IState | null) { }
}

interface IStateStore {
    beforeState: IState | null;
    afterState: IState | null;
}

interface ITransaction {
    saveBeforeChangeState(entity: Entity, state: IState | null): void;
    commit(): Request | null;
    rollback(): void;
}

export class Transaction implements ITransaction {
    private entityBeforeState: Map<Entity, IState | null> = new Map();
    private beforeEntities: Immutable.Map<string, Entity>;
    private doc: Doc;

    constructor(doc: Doc) {
        this.beforeEntities = doc.entities;
        this.doc = doc;
    }

    public saveBeforeChangeState(entity: Entity, state: IState | null) {
        if (this.entityBeforeState.has(entity)) {
            return;
        }
        this.entityBeforeState.set(entity, state);
    }

    public commit(): Request | null {
        const beforeEntities = this.beforeEntities;
        const afterEntities = this.doc.entities;
        const entityBeforeState = this.entityBeforeState;

        if (entityBeforeState.size < 1 && beforeEntities === afterEntities) {
            return null;
        }

        const entityStateStore: Map<Entity, IStateStore> = new Map();
        entityBeforeState.forEach((beforeState, entity) => {
            const afterState = entity.getState();
            if (beforeState && beforeState !== afterState) {
                entityStateStore.set(entity, { beforeState, afterState });
            }
        });
        return new Request(this.doc, entityStateStore, beforeEntities, afterEntities);
    }

    public rollback() {
        this.doc.restore(this.beforeEntities);
        this.entityBeforeState.forEach((beforeState, entity: Entity) => {
            entity.restoreState(beforeState);
        });
    }
}

//transaction during document loading
export class DummyTransaction implements ITransaction {
    public saveBeforeChangeState(entity: Entity, state: IState | null) {
        //do nothing
    }
    public commit(): Request | null {
        return null;
    }
    public rollback() {
    }
}

class IDGenerator {
    _nextId: number;
    constructor(startId?: number) {
        this._nextId = startId || 1;
    }

    generate(): string {
        return String(this._nextId++);
    }

    syncId(currentId: string) {
        const newId = Number(currentId);
        if (newId > this._nextId) {
            this._nextId = newId;
        }
    }
}

export abstract class Doc {
    public entities: Immutable.Map<string, Entity> = Immutable.Map();
    public activeTransaction: null | ITransaction = null;
    public entityIdGenerator = new IDGenerator();

    restore(entities: Immutable.Map<string, Entity>) {
        this.entities = entities;
    }

    public createEntity(classType: string): Entity | null {
        if (!this.activeTransaction) {
            console.log("create entity outside transaction is forbidden !");
            return null;
        }

        let id = this.entityIdGenerator.generate();
        let entity = this._entityFactory(classType, id);
        if (!entity) {
            return null;
        }
        this.entities = this.entities.set(entity.id, entity);
        return entity;
    }

    public destroyEntity(entity: Entity) {
        this.entities = this.entities.delete(entity.id);
    }

    protected _entityFactory(classType: string, id: string): Entity | null { return null; }

    public startTransaction(): ITransaction | null {
        if (this.activeTransaction) {
            return null;
        }
        this.activeTransaction = new Transaction(this);
        return this.activeTransaction;
    }

    toJSON() {
        let entitiesDump: any[] = [];
        this.entities.forEach((ent: Entity, id) => {
            entitiesDump.push({ id, type: ent.classType, state: ent.getState() });
        });
        return { entities: entitiesDump };
    }

    fromJSON(json: any) {
        let entities: { [key: string]: Entity } = {};
        json.entities.forEach((entityDump: any) => {
            let { id, type, state } = entityDump;
            let entity = this._entityFactory(type, id);
            if (!entity) return;
            this.entityIdGenerator.syncId(id);
            entity.restoreState(state);
            entities[id] = entity;
        });
        this.entities = Immutable.Map(entities);
    }

    getEntityById(id: string): Entity | undefined {
        return this.entities.get(id);
    }
}

export class Request {
    constructor(private readonly doc: Doc,
        private readonly entityStateStore: Map<Entity, IStateStore>,
        private readonly beforeEntities: Immutable.Map<string, Entity>,
        private readonly afterEntities: Immutable.Map<string, Entity>) {
    }

    public redo() {
        this.doc.restore(this.afterEntities);
        this.entityStateStore.forEach((store, entity) => {
            store.afterState && entity.restoreState(store.afterState);
        });
    }

    public undo() {
        this.doc.restore(this.beforeEntities);
        this.entityStateStore.forEach((store, entity) => {
            store.beforeState && entity.restoreState(store.beforeState);
        });
    }

    public static merge(requests: Request[]): Request | null {
        if (requests.length < 1) return null;
        if (requests.length < 2) return requests[0];
        const beforeEntities = requests[0].beforeEntities;
        const afterEntities = requests[requests.length - 1].afterEntities;
        const doc = requests[0].doc;

        const mergedStore: Map<Entity, IStateStore> = new Map();
        for (let request of requests) {
            request.entityStateStore.forEach((store, entity) => {
                let mStore = mergedStore.get(entity);
                if (mStore) {
                    mStore.afterState = store.afterState;
                } else {
                    mStore = { beforeState: store.beforeState, afterState: store.afterState };
                    mergedStore.set(entity, mStore);
                }
            });
        }
        return new Request(doc, mergedStore, beforeEntities, afterEntities);
    }
}
/**
 * undo/redo 
 */
class UndoRedoSession {
    private _undoStack: Request[] = [];
    private _redoStack: Request[] = [];

    canUndo() {
        return this._undoStack.length > 0;
    };

    canRedo() {
        return this._redoStack.length > 0;
    };

    undo() {
        let req = this._undoStack.pop();
        if (!req) return;
        req.undo();
        this._redoStack.push(req);
    };

    redo() {
        let req = this._redoStack.pop();
        if (!req) return;
        req.redo();
        this._undoStack.push(req);
    };

    commit(request: Request) {
        this._undoStack.push(request);
    }

    toRequests(merge: boolean) {
        if (merge) {
            let request = Request.merge(this._undoStack);
            return request ? [request] : [];
        }
        return this._undoStack;
    }
}

export class UndoRedoManager {
    private _defaultSession: UndoRedoSession = new UndoRedoSession();
    private _sessionStack: UndoRedoSession[] = [];

    startSession() {
        let newSession = new UndoRedoSession();
        this._sessionStack.push(newSession);
        return newSession;
    }

    private get _activeSession() {
        if (this._sessionStack.length > 0) {
            return this._sessionStack[this._sessionStack.length - 1];
        }
        return this._defaultSession;
    }

    _terminateActiveSession() {
        this._sessionStack.pop();
    }

    commit(request: Request) {
        let session = this._activeSession;
        session.commit(request);
    }

    /**
     * 
     * @param session 
     * @param merge 将session merge成一个request
     */
    commitSession(session: UndoRedoSession, merge: boolean = true) {
        if (this._activeSession !== session) {
            console.log('can not commit an inactive session');
            return;
        }
        let requests = session.toRequests(merge);
        this._terminateActiveSession();
        for (let request of requests) {
            this.commit(request);
        }
    }

    abortSession(session: UndoRedoSession) {
        if (this._activeSession !== session) {
            console.log('can not abort an inactive session');
            return;
        }
        while (session.canUndo()) {
            session.undo();
        }
        this._terminateActiveSession();
    }
}