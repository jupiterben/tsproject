

function buildSvgPath(polygon: IPoint2d[], close: boolean, style: string) {
    const d = 'M' + polygon.map(pt => `${pt.x},-${pt.y}`).join('L') + (close ? 'Z' : '');
    return `<path ${style} d="${d}"></path>`;
}


function exportSvg(polygon: IPoint2d[], segments: IPoint2d[][], subPolygons: IPoint2d[][]) {
    const bound = Math2d.getBound(polygon, 0.1);
    const style = `fill="none" stroke="#808080" vector-effect="non-scaling-stroke" style="stroke-width: 1.5px; display: block;"`;
    const styleDash = `stroke="#4cb5c7" fill="none" vector-effect="non-scaling-stroke" style="stroke-width: 1.5px; stroke-dasharray: 5, 3; pointer-events: none; display: block;"`;
    const styleFill = `fill="yellow" stroke="#808080" style="stroke-width: 0; display: block;"`;
    const svgPolygon = buildSvgPath(polygon, true, style);
    const svgSegments = segments.map(path => buildSvgPath(path, false, styleDash)).join('');
    const svgSubPolygons = subPolygons.map(p => buildSvgPath(p, true, styleFill)).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="400px" height="400px" viewBox="${bound.x} ${-bound.height - bound.y} ${bound.width} ${bound.height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${svgSubPolygons}
        ${svgPolygon}
        ${svgSegments}
        </svg>`
}

import * as  fs from 'fs';
import { IPoint2d, Math2d, splitPolygon } from './splitpolygon';

function main() {
    const polygon = [
        { x: 0, y: 0 },
        { x: 1.5, y: 0 },
        { x: 1.5, y: 1.8 },
        { x: 4, y: 1.9 },
        { x: 4, y: 3 },
        { x: 1, y: 3.14 },
        { x: 1, y: 2 },
        { x: 0, y: 2 },
    ];
    const results = splitPolygon(polygon);
    const svg = exportSvg(polygon, results.segments, results.subPolygons);
    // console.log(svg);

    fs.writeFileSync('a.svg', svg);
}
main();