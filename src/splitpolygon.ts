
enum DirEnum {
    POS_X = '+x',
    POS_Y = '+y',
    NEG_X = '-x',
    NEG_Y = '-y'
};

const DirValue = new Map([
    [DirEnum.POS_X, { x: 1, y: 0 }],
    [DirEnum.POS_Y, { x: 0, y: 1 }],
    [DirEnum.NEG_X, { x: -1, y: 0 }],
    [DirEnum.NEG_Y, { x: 0, y: -1 }]
]);

const ConcaveNext = new Map([
    [DirEnum.POS_X, DirEnum.POS_Y],
    [DirEnum.POS_Y, DirEnum.NEG_X],
    [DirEnum.NEG_X, DirEnum.NEG_Y],
    [DirEnum.NEG_Y, DirEnum.POS_X]
]);

export interface IPoint2d {
    x: number;
    y: number;
}

export const Math2d = {
    dot(v1: IPoint2d, v2: IPoint2d) {
        return v1.x * v2.x + v1.y * v2.y;
    },
    cross(v1: IPoint2d, v2: IPoint2d) {
        return v1.x * v2.y - v1.y * v2.x;
    },
    sub(pt1: IPoint2d, pt2: IPoint2d) {
        return { x: pt1.x - pt2.x, y: pt1.y - pt2.y };
    },
    add(pt1: IPoint2d, pt2: IPoint2d) {
        return { x: pt1.x + pt2.x, y: pt1.y + pt2.y };
    },
    lineLength(pt1: IPoint2d, pt2: IPoint2d) {
        let diff = Math2d.sub(pt1, pt2);
        return Math.sqrt(Math2d.dot(diff, diff));
    },
    isSamePoint(pt1: IPoint2d, pt2: IPoint2d, tol: number) {
        return Math2d.lineLength(pt1, pt2) < tol;
    },
    simplyPolygon(polygon: IPoint2d[], tol: number) {
        const simplePoly: IPoint2d[] = [];
        let polyAdd: IPoint2d | undefined;
        polygon.forEach(pt => {
            if (polyAdd && Math2d.isSamePoint(polyAdd, pt, tol)) return;
            polyAdd = pt;
            simplePoly.push(polyAdd);
        });
        if (polyAdd && Math2d.isSamePoint(polyAdd, simplePoly[0], tol)) simplePoly.pop();
        return simplePoly;
    },
    getPolygonArea(polygon: IPoint2d[]) {
        let sum = 0;
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i >= (polygon.length - 1)) ? 0 : (i + 1)];
            sum += (p1.x * p2.y - p1.y * p2.x);
        }
        return sum * 0.5;
    },
    getBound(polygon: IPoint2d[], offsetFactor = 0) {
        const pt0 = polygon[0]
        let minx = pt0.x;
        let maxx = pt0.x;
        let miny = pt0.y;
        let maxy = pt0.y;
        for (let i = 1; i < polygon.length; i++) {
            const { x, y } = polygon[i];
            minx = Math.min(minx, x);
            maxx = Math.max(maxx, x);
            miny = Math.min(miny, y);
            maxy = Math.max(maxy, y);
        }
        const width = maxx - minx;
        const height = maxy - miny;
        const offsetX = offsetFactor * width;
        const offsetY = offsetFactor * height;
        return { x: minx - offsetX / 2, y: miny - offsetY / 2, width: width + offsetX, height: height + offsetY };
    }
};


function rangeOverlap(value1: number, value2: number, min: number, max: number) {
    return !((value1 <= min && value2 <= min) || (value1 >= max && value2 >= max));
}

function getDirIntersect(fromPt: IPoint2d, dir: IPoint2d, polygon: IPoint2d[], tol: number)
    : { pt: IPoint2d, length: number, index: number, type: string } | undefined {
    const intersects = [];
    const len = polygon.length;
    for (let i = 0, j = len - 1; i < len; j = i++) {
        const p1 = polygon[j];
        const p2 = polygon[i];
        const v1 = Math2d.sub(p1, fromPt);
        const v2 = Math2d.sub(p2, fromPt);
        const dot1 = Math2d.dot(v1, dir);
        const dot2 = Math2d.dot(v2, dir);
        const cross1 = Math2d.cross(v1, dir);
        const cross2 = Math2d.cross(v2, dir);
        if (Math.abs(cross1) < tol && dot1 > 0) {
            intersects.push({ pt: p1, length: dot1, index: j, type: 'point' });
        } else if (Math.abs(cross2) < tol && dot2 > 0) {
            intersects.push({ pt: p2, length: dot2, index: i, type: 'point' });
        } else if (cross1 * cross2 < 0) {
            const r = cross1 / (cross1 - cross2);
            const l = (1 - r) * dot1 + r * dot2;
            if (l > 0) {
                const pt = { x: fromPt.x + dir.x * l, y: fromPt.y + dir.y * l };
                intersects.push({ pt, length: l, index: j, type: 'edge' });
            }
        }
    }
    intersects.sort((a, b) => (a.length - b.length));
    if (intersects.length > 0) {
        return intersects[0];
    }
}

function getSubPolygon(fromIndex: number, toIndex: number, polygon: IPoint2d[]): IPoint2d[] {
    const len = polygon.length;
    if (toIndex < fromIndex) toIndex += len;
    const subPolygon = [];
    for (let i = fromIndex; i <= toIndex; i++) {
        subPolygon.push(polygon[i % len]);
    }
    return subPolygon;
}

// get divide introduced min rectangle width
function getDivideInfo(pointIndex: number, dir: IPoint2d, polygon: IPoint2d[], options: ISplitOptions) {
    const concavePt = polygon[pointIndex];
    const intersect = getDirIntersect(concavePt, dir, polygon, options.tolerance);
    if (!intersect) return;

    const segment: IPoint2d[] = [concavePt, intersect.pt];
    let subPoly1: IPoint2d[];
    let subPoly2: IPoint2d[];
    if (intersect.type === 'edge') {
        subPoly1 = getSubPolygon(pointIndex, intersect.index, polygon);
        subPoly1.push(intersect.pt);
        subPoly2 = getSubPolygon(intersect.index + 1, pointIndex, polygon);
        subPoly2.splice(0, 0, intersect.pt);
    } else {
        subPoly1 = getSubPolygon(pointIndex, intersect.index, polygon);
        subPoly2 = getSubPolygon(intersect.index, pointIndex, polygon);
    }
    const intrLens: number[] = [];
    const getIntrLen = (subPolygon: IPoint2d[]) => {
        for (let i = 1; i < subPolygon.length - 1; i++) {
            const v1 = Math2d.sub(subPolygon[i], concavePt);
            const v2 = Math2d.sub(subPolygon[i + 1], concavePt);
            const len1 = Math2d.dot(v1, dir);
            const len2 = Math2d.dot(v2, dir);
            const cross1 = Math2d.cross(v1, dir);
            const cross2 = Math2d.cross(v2, dir);
            if (cross1 * cross2 > 0 && rangeOverlap(len1, len2, 0, intersect.length)) {
                intrLens.push(Math.abs(cross1));
            }
        }
    }
    getIntrLen(subPoly1);
    getIntrLen(subPoly2);
    intrLens.sort((a, b) => a - b);
    const intrLen = intrLens[0] || 0;
    return { score: intrLen, segment, subPoly1, subPoly2 };
}

function getDirEnum(dir: IPoint2d): DirEnum | undefined {
    for (let [key, value] of DirValue) {
        if (Math2d.dot(value, dir) / Math.sqrt(Math2d.dot(dir, dir)) > Math.cos(45 * Math.PI / 180)) {
            return key;
        }
    }
    return;
}

function dividePolygon(polygon: IPoint2d[], options: ISplitOptions): { segment: IPoint2d[], subPoly1: IPoint2d[], subPoly2: IPoint2d[] } | undefined {
    const { ignoreSmallCorner } = options;
    let divide;
    let bestScore = 0;
    const len = polygon.length;
    for (let i = 0; i < len; i++) {
        const prev = polygon[(i - 1 + len) % len];
        const next = polygon[(i + 1) % len];
        const pt = polygon[i];
        const dir1 = Math2d.sub(pt, prev);
        const dir2 = Math2d.sub(pt, next);
        const enumDir1 = getDirEnum(dir1);
        const enumDir2 = getDirEnum(dir2);
        if (!enumDir1 || !enumDir2) continue;
        if (Math2d.lineLength(pt, prev) < ignoreSmallCorner || Math2d.lineLength(pt, next) < ignoreSmallCorner) continue; //skip small corner
        if (ConcaveNext.get(enumDir1!) !== enumDir2) continue;

        const div1 = getDivideInfo(i, DirValue.get(enumDir1)!, polygon, options);
        if (div1) {
            if (!divide || bestScore < div1.score) {
                bestScore = div1.score;
                divide = div1;
            }
        }

        const div2 = getDivideInfo(i, DirValue.get(enumDir2)!, polygon, options);
        if (div2) {
            if (!divide || bestScore < div2.score) {
                bestScore = div2.score;
                divide = div2;
            }
        }
    }
    return divide;
}

export interface ISplitOptions {
    ignoreSmallCorner: number;
    tolerance: number;
}
const DefaultSplitOption = {
    ignoreSmallCorner: 0.1,
    tolerance: 0.001,
}

export function splitPolygon(polygon: IPoint2d[], options?: ISplitOptions) {
    const splitOptions = Object.assign({}, DefaultSplitOption, options);
    let segments = [];
    const subPolygons = [];
    polygon = Math2d.simplyPolygon(polygon, splitOptions.tolerance);
    if (Math2d.getPolygonArea(polygon) < 0) {
        polygon.reverse();
    }
    const candidates = [polygon];
    let c;
    while (c = candidates.pop()) {
        const divide = dividePolygon(c, splitOptions);
        if (divide) {
            candidates.push(divide.subPoly1, divide.subPoly2);
            segments.push(divide.segment);
        } else {
            subPolygons.push(c);
        }
    }
    return { segments, subPolygons };
}