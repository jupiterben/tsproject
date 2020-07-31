
/**
 * 
 */
export abstract class GeomObject {

}

export class Point3D extends GeomObject {

}

export class Point2D extends GeomObject {

}

export class Curve2D extends GeomObject {

}

export class Curve3D extends GeomObject {

}

export class Surface3D extends GeomObject {

}



/**
 * 
 */
export abstract class TopoShape {
    public name: string = "";
}


export class Vertex extends TopoShape {
    constructor(public readonly point: Point2D | Point3D) {
        super();
    }
}

export class Edge extends TopoShape {
    constructor(public readonly curve: Curve2D | Curve3D) {
        super();
    }
}



export class Wire extends TopoShape {
    constructor(public edges: Edge[]) {
        super();
    }
}

export class Face extends TopoShape {
    external = false;
    constructor(public readonly wires: Wire[], public readonly surface?: Surface3D) {
        super();
    }
}



export class Shell extends TopoShape {
    constructor(public readonly faces: Face[]) {
        super();
    }
}



export class Solid extends TopoShape {
    constructor(public shells: Shell[]) {
        super();
    }
}


