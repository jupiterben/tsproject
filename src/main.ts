

function buildSvgPath(polygon: IPoint2d[], close: boolean, style: string) {
    const d = 'M' + polygon.map(pt => `${pt.x},${-pt.y}`).join('L') + (close ? 'Z' : '');
    return `<path ${style} d="${d}"></path>`;
}


function exportResultsToSvg(results: { polygon: IPoint2d[], segments: IPoint2d[][], subPolygons: IPoint2d[][] }[]) {
    const style = `fill="none" stroke="#808080" vector-effect="non-scaling-stroke" style="stroke-width: 1.5px; display: block;"`;
    const styleDash = `stroke="#4cb5c7" fill="none" vector-effect="non-scaling-stroke" style="stroke-width: 1.5px; stroke-dasharray: 5, 3; pointer-events: none; display: block;"`;
    const styleFill = `fill="yellow" stroke="#808080" style="stroke-width: 0; display: block;"`;

    const allPoints: IPoint2d[] = [];
    results.forEach(result => allPoints.push(...result.polygon));
    const bound = Math2d.getBound(allPoints, 0.1);

    let allPaths = '';
    for (const result of results) {
        const { polygon, segments, subPolygons } = result;
        const svgPolygon = buildSvgPath(polygon, true, style);
        const svgSegments = segments.map(path => buildSvgPath(path, false, styleDash)).join('');
        const svgSubPolygons = subPolygons.map(p => buildSvgPath(p, true, styleFill)).join('');
        allPaths += svgSubPolygons;
        allPaths += svgPolygon;
        allPaths += svgSegments;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="400px" height="400px" viewBox="${bound.x} ${-bound.height - bound.y} ${bound.width} ${bound.height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        ${allPaths}
        </svg>`
}

import * as  fs from 'fs';
import * as Path from 'path';
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
    const svg = exportResultsToSvg([{ polygon, ...results }]);
    fs.writeFileSync('a.svg', svg);
}

function doExport(id: string, polygons: IPoint2d[][]) {
    const results = polygons.map(polygon => {
        const result = splitPolygon(polygon);
        return { polygon, ...result };
    });
    fs.writeFileSync(`output/${id}.svg`, exportResultsToSvg(results));
}

function taskRun(dir: string) {
    fs.readdirSync(dir).forEach(function (file) {
        if (Path.extname(file).toLowerCase() !== '.json') return;
        const rawdata = fs.readFileSync(dir + '/' + file).toString();
        const json = JSON.parse(rawdata);
        const id = Path.basename(file);
        return doExport(id, json.rooms);
    });
    console.log("task complete");
}
taskRun('input');